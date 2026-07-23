// ============================================================
// Notification Logger
// SBBT CRM Next.js Project
//
// Logs every notification delivery attempt to the
// notification_logs table for audit trail and monitoring.
//
// This is a helper, not a provider — it writes the log entry
// after a provider attempts delivery.
// ============================================================

import { createClient } from "@/lib/supabase/server";
import type { NotificationPayload, NotificationResult } from "../notification-service";

/**
 * Logs a notification delivery attempt to the database.
 * Called after a provider attempts to send a notification.
 *
 * @param payload The original notification payload
 * @param result The result from the provider
 */
export async function logNotificationDelivery(
  payload: NotificationPayload,
  result: NotificationResult
): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("notification_logs").insert({
      site_id: "00000000-0000-0000-0000-000000000001",
      notification_id: payload.id,
      channel: payload.channel,
      provider: result.provider,
      priority: payload.priority,
      recipient: payload.recipient,
      subject: payload.subject,
      body: payload.body,
      status: result.success ? "sent" : "failed",
      message_id: result.message_id || null,
      error_message: result.error || null,
      lead_id: payload.lead_id || null,
      lead_number: payload.lead_number || null,
      metadata: payload.metadata || {},
    });

    if (error) {
      console.error("Failed to log notification delivery:", error.message);
    }
  } catch (error) {
    console.error("Failed to log notification delivery:", error);
  }
}

/**
 * Logs multiple notification delivery results.
 * Convenience wrapper for broadcasting to multiple channels.
 */
export async function logNotificationDeliveries(
  payload: NotificationPayload,
  results: NotificationResult[]
): Promise<void> {
  for (const result of results) {
    await logNotificationDelivery(payload, result);
  }
}