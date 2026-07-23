// ============================================================
// WhatsApp Notification Provider
// SBBT CRM Next.js Project
//
// Implements the NotificationProvider interface for WhatsApp
// message delivery using the WhatsApp Cloud API (Meta).
//
// Configuration:
//   - whatsapp_api_number from cms_internal_settings
//   - WHATSAPP_TOKEN environment variable (Meta API token)
//   - WHATSAPP_PHONE_NUMBER_ID environment variable
//
// Note: WhatsApp Cloud API requires a Meta Business Account
// and a configured WhatsApp Business profile.
// ============================================================

import type {
  NotificationProvider,
  NotificationPayload,
  NotificationResult,
} from "../notification-service";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// WhatsApp Provider
// ============================================================

export class WhatsAppNotificationProvider implements NotificationProvider {
  name = "whatsapp_cloud";
  channel = "whatsapp" as const;
  enabled = true;

  /**
   * Fetches the WhatsApp API number from internal settings.
   */
  private async getApiNumber(): Promise<string | null> {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("cms_internal_settings")
        .select("whatsapp_api_number")
        .eq("site_id", "00000000-0000-0000-0000-000000000001")
        .maybeSingle();

      return data?.whatsapp_api_number || null;
    } catch {
      return null;
    }
  }

  /**
   * Formats a phone number for WhatsApp Cloud API (remove +, spaces).
   */
  private formatPhoneNumber(phone: string): string {
    return phone.replace(/[^0-9]/g, "");
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const token = process.env.WHATSAPP_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (!token || !phoneNumberId) {
        return {
          success: false,
          provider: this.name,
          error: "WhatsApp Cloud API not configured. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables.",
        };
      }

      const apiNumber = await this.getApiNumber();
      if (!apiNumber) {
        return {
          success: false,
          provider: this.name,
          error: "WhatsApp API number not configured in Internal Settings.",
        };
      }

      // Format the recipient phone number
      const to = this.formatPhoneNumber(payload.recipient);

      // Build the message body
      const messageBody = `*${payload.subject}*\n\n${payload.body}`;

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: {
              preview_url: false,
              body: messageBody,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "Unknown error");
        return {
          success: false,
          provider: this.name,
          error: `WhatsApp API error (${response.status}): ${errorBody}`,
        };
      }

      const result = (await response.json()) as { messages?: { id: string }[] };

      return {
        success: true,
        provider: this.name,
        message_id: result.messages?.[0]?.id || undefined,
      };
    } catch (error) {
      return {
        success: false,
        provider: this.name,
        error: error instanceof Error ? error.message : "Unknown WhatsApp error",
      };
    }
  }
}