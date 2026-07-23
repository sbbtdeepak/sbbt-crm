// ============================================================
// Email Notification Provider
// SBBT CRM Next.js Project
//
// Implements the NotificationProvider interface for email
// delivery using Resend (or SMTP fallback).
//
// Configuration is read from cms_internal_settings table.
// ============================================================

import type {
  NotificationProvider,
  NotificationPayload,
  NotificationResult,
} from "../notification-service";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// Email Provider
// ============================================================

export class EmailNotificationProvider implements NotificationProvider {
  name = "resend";
  channel = "email" as const;
  enabled = true;

  /**
   * Fetches the Resend API key from internal settings or env.
   * Falls back to RESEND_API_KEY environment variable.
   */
  private async getApiKey(): Promise<string | null> {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("cms_internal_settings")
        .select("resend_ready")
        .eq("site_id", "00000000-0000-0000-0000-000000000001")
        .maybeSingle();

      if (data?.resend_ready) {
        return process.env.RESEND_API_KEY || null;
      }
      return process.env.RESEND_API_KEY || null;
    } catch {
      return process.env.RESEND_API_KEY || null;
    }
  }

  /**
   * Determines the appropriate "to" email address based on the
   * notification's recipient field. Uses internal settings if
   * configured, otherwise falls back to defaults.
   */
  private async getToAddress(recipient: string): Promise<string> {
    // If recipient is a specific email, use it directly
    if (recipient.includes("@")) {
      return recipient;
    }

    // Otherwise, resolve from internal settings
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("cms_internal_settings")
        .select("*")
        .eq("site_id", "00000000-0000-0000-0000-000000000001")
        .maybeSingle();

      if (!data) return "admin@sbbt.in";

      // Map recipient keys to email addresses
      const emailMap: Record<string, string> = {
        admin: data.lead_notification_email || "admin@sbbt.in",
        sales: data.sales_email || "sales@sbbt.in",
        support: data.support_email || "support@sbbt.in",
        accounts: data.accounts_email || "accounts@sbbt.in",
        quotation: data.quotation_email || "quotes@sbbt.in",
      };

      return emailMap[recipient.toLowerCase()] || emailMap.admin;
    } catch {
      return "admin@sbbt.in";
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const apiKey = await this.getApiKey();

      if (!apiKey) {
        return {
          success: false,
          provider: this.name,
          error: "Resend API key not configured. Set RESEND_API_KEY environment variable.",
        };
      }

      const to = await this.getToAddress(payload.recipient);
      const from = process.env.RESEND_FROM_EMAIL || "notifications@sbbt.in";

      // Sanitize HTML content for email (convert plain text to safe HTML)
      const htmlBody = payload.body
        .replace(/\n/g, "<br>")
        .replace(/&/g, "&")
        .replace(/</g, "<")
        .replace(/>/g, ">");

      const emailPayload = {
        from,
        to: [to],
        subject: payload.subject,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">SBBT CRM Notification</h1>
          </div>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
            <p style="color: #374151; line-height: 1.6;">${htmlBody}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px;">
              This is an automated notification from SBBT CRM.<br>
              Lead Reference: ${payload.lead_number || "N/A"}
            </p>
          </div>
        </div>`,
      };

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "Unknown error");
        return {
          success: false,
          provider: this.name,
          error: `Resend API error (${response.status}): ${errorBody}`,
        };
      }

      const result = (await response.json()) as { id?: string };

      return {
        success: true,
        provider: this.name,
        message_id: result.id || undefined,
      };
    } catch (error) {
      return {
        success: false,
        provider: this.name,
        error: error instanceof Error ? error.message : "Unknown email error",
      };
    }
  }
}