// ============================================================
// Notification Provider Registry
// SBBT CRM Next.js Project
//
// Central registry for all notification providers.
// Registers all providers with the notification service
// and provides helper functions for lead event notifications.
//
// Usage:
//   import { notifyNewLead } from "./providers/provider-registry";
//   await notifyNewLead(leadRow);
// ============================================================

import {
  notificationService,
  LeadNotificationTemplates,
  type NotificationResult,
} from "../notification-service";
import { EmailNotificationProvider } from "./email-provider";
import { AdminNotificationProvider } from "./admin-notification-provider";
import { GoogleSheetsNotificationProvider } from "./google-sheets-provider";
import { logNotificationDeliveries } from "./notification-logger";
import type { LeadRow } from "../../types";

// ============================================================
// Initialize Providers
// ============================================================

let initialized = false;

/**
 * Registers all notification providers with the service.
 * This is safe to call multiple times (only runs once).
 */
export function initializeProviders(): void {
  if (initialized) return;

  notificationService.registerProvider(new EmailNotificationProvider());
  notificationService.registerProvider(new AdminNotificationProvider());
  notificationService.registerProvider(new GoogleSheetsNotificationProvider());

  initialized = true;
}

// ============================================================
// Lead Notification Helpers
// ============================================================

/**
 * Sends notifications for a new lead.
 * Called after a lead is successfully created.
 * Notifications are fire-and-forget — errors are logged but
 * not propagated to the caller.
 *
 * Channels notified:
 *   - email (to configured admin/sales email)
 *   - admin (in-app notification)
 *   - google_sheets (if webhook configured)
 *
 * @param lead The newly created lead row
 * @param source The lead source (e.g. "hero_popup", "contact_form")
 */
export async function notifyNewLead(
  lead: LeadRow,
  source: string
): Promise<NotificationResult[]> {
  initializeProviders();

  const fullName = lead.full_name || lead.name || "Unknown";
  const leadSource = lead.source || source || "website";

  const basePayload = LeadNotificationTemplates.newLead(
    lead.id,
    lead.lead_number || `LEAD-${lead.id}`,
    fullName,
    leadSource
  );

  // Send to email and admin channels
  const emailResults = await notificationService.send({
    ...basePayload,
    channel: "email",
  });

  const adminResults = await notificationService.send({
    ...basePayload,
    channel: "admin",
  });

  const sheetsResults = await notificationService.send({
    ...basePayload,
    channel: "google_sheets",
  });

  const allResults = [...emailResults, ...adminResults, ...sheetsResults];

  // Log all delivery results for audit trail
  for (const result of allResults) {
    await logNotificationDeliveries(
      {
        ...basePayload,
        channel: result.provider === "resend" ? "email" :
                 result.provider === "admin_db" ? "admin" :
                 result.provider === "google_sheets" ? "google_sheets" : "webhook",
      },
      [result]
    );
  }

  return allResults;
}

/**
 * Sends notifications for a lead status change.
 */
export async function notifyLeadStatusChange(
  lead: LeadRow,
  oldStatus: string,
  newStatus: string
): Promise<NotificationResult[]> {
  initializeProviders();

  const fullName = lead.full_name || lead.name || "Unknown";

  const basePayload = LeadNotificationTemplates.statusChanged(
    lead.id,
    lead.lead_number || `LEAD-${lead.id}`,
    fullName,
    oldStatus,
    newStatus
  );

  // Notify admin (in-app) about status change
  const adminResults = await notificationService.send({
    ...basePayload,
    channel: "admin",
  });

  // Log results
  for (const result of adminResults) {
    await logNotificationDeliveries(
      { ...basePayload, channel: "admin" },
      [result]
    );
  }

  return adminResults;
}

/**
 * Sends notifications when a remark is added to a lead.
 */
export async function notifyLeadRemarkAdded(
  lead: LeadRow,
  remark: string
): Promise<NotificationResult[]> {
  initializeProviders();

  const fullName = lead.full_name || lead.name || "Unknown";

  const basePayload = LeadNotificationTemplates.remarkAdded(
    lead.id,
    lead.lead_number || `LEAD-${lead.id}`,
    fullName,
    remark
  );

  // Notify admin (in-app) about remark
  const adminResults = await notificationService.send({
    ...basePayload,
    channel: "admin",
  });

  // Log results
  for (const result of adminResults) {
    await logNotificationDeliveries(
      { ...basePayload, channel: "admin" },
      [result]
    );
  }

  return adminResults;
}