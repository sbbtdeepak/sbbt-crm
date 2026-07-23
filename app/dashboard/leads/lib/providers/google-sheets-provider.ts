// ============================================================
// Google Sheets Notification Provider
// SBBT CRM Next.js Project
//
// Implements the NotificationProvider interface to append
// new lead data to a Google Sheet for tracking and reporting.
//
// Configuration:
//   - google_sheet_url from cms_internal_settings (the sheet URL)
//   - Uses a webhook-style approach: sends data to the sheet's
//     Apps Script Web App URL if configured, or logs for manual export.
//
// Note: Direct Google Sheets API requires service account auth.
// This implementation uses a webhook pattern that works with
// a simple Google Apps Script deployment.
// ============================================================

import type {
  NotificationProvider,
  NotificationPayload,
  NotificationResult,
} from "../notification-service";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// Google Sheets Provider
// ============================================================

export class GoogleSheetsNotificationProvider implements NotificationProvider {
  name = "google_sheets";
  channel = "google_sheets" as const;
  enabled = true;

  /**
   * Fetches the Google Sheet webhook URL from internal settings.
   * This should point to a deployed Google Apps Script Web App
   * that accepts POST requests and writes to the sheet.
   */
  private async getWebhookUrl(): Promise<string | null> {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("cms_internal_settings")
        .select("google_sheet_url")
        .eq("site_id", "00000000-0000-0000-0000-000000000001")
        .maybeSingle();

      return data?.google_sheet_url || null;
    } catch {
      return null;
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const webhookUrl = await this.getWebhookUrl();

      if (!webhookUrl) {
        return {
          success: false,
          provider: this.name,
          error: "Google Sheet URL not configured in Internal Settings.",
        };
      }

      // Extract lead data from payload metadata or body
      const metadata = payload.metadata || {};
      const leadData = {
        timestamp: payload.created_at,
        lead_number: payload.lead_number || "",
        subject: payload.subject,
        body: payload.body,
        lead_id: payload.lead_id,
        ...metadata,
      };

      // Send to the Google Sheets webhook URL
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "lead_notification",
          data: leadData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        return {
          success: false,
          provider: this.name,
          error: `Google Sheets webhook error (${response.status}): ${errorText}`,
        };
      }

      return {
        success: true,
        provider: this.name,
        message_id: `sheet-${payload.id}`,
      };
    } catch (error) {
      return {
        success: false,
        provider: this.name,
        error: error instanceof Error ? error.message : "Unknown Google Sheets error",
      };
    }
  }
}