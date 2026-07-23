// ============================================================
// Admin Notification Provider
// SBBT CRM Next.js Project
//
// Implements the NotificationProvider interface for in-app
// admin notifications. Stores notifications in the
// admin_notifications table for display in the dashboard.
// ============================================================

import type {
  NotificationProvider,
  NotificationPayload,
  NotificationResult,
} from "../notification-service";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// Admin Notification Provider
// ============================================================

export class AdminNotificationProvider implements NotificationProvider {
  name = "admin_db";
  channel = "admin" as const;
  enabled = true;

  /**
   * Maps notification priority to admin notification type.
   */
  private mapType(priority: string): string {
    switch (priority) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      case "low":
        return "info";
      default:
        return "info";
    }
  }

  /**
   * Generates a link to the lead details page if a lead_id is present.
   */
  private getLink(payload: NotificationPayload): string | null {
    if (payload.lead_id) {
      return `/dashboard/leads?lead_id=${payload.lead_id}`;
    }
    return null;
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const supabase = await createClient();

      const { error } = await supabase.from("admin_notifications").insert({
        site_id: "00000000-0000-0000-0000-000000000001",
        title: payload.subject,
        body: payload.body,
        type: this.mapType(payload.priority),
        link: this.getLink(payload),
        lead_id: payload.lead_id || null,
        lead_number: payload.lead_number || null,
        target_user_id: null, // broadcast to all admins
      });

      if (error) {
        return {
          success: false,
          provider: this.name,
          error: error.message,
        };
      }

      return {
        success: true,
        provider: this.name,
      };
    } catch (error) {
      return {
        success: false,
        provider: this.name,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}