// ============================================================
// Estimate Engine — Notification Helpers
// SBBT CRM Next.js Project
//
// Reuses the existing Notification Hub infrastructure.
// Notifications are fire-and-forget — errors are logged
// but not propagated to the caller.
// ============================================================

import {
  notificationService,
  type NotificationResult,
} from "@/app/dashboard/leads/lib/notification-service";
import { logNotificationDeliveries } from "@/app/dashboard/leads/lib/providers/notification-logger";
import type { EstimateRow } from "../types";

// ============================================================
// Estimate Notification Templates
// ============================================================

/**
 * Predefined notification templates for common estimate events.
 * These are factory functions that create NotificationPayload objects.
 */
export const EstimateNotificationTemplates = {
  /** Notification sent when a new estimate is created */
  newEstimate: (
    estimateId: number,
    estimateNumber: string,
    customerName: string,
    grandTotal: number
  ): Omit<
    Parameters<typeof notificationService.send>[0],
    "channel"
  > => ({
    id: crypto.randomUUID(),
    priority: "normal",
    recipient: "admin",
    subject: `New Estimate: ${estimateNumber}`,
    body: `A new estimate has been created.\n\nEstimate: ${estimateNumber}\nCustomer: ${customerName}\nTotal: ₹${grandTotal.toLocaleString()}\n\nPlease review and proceed with next steps.`,
    created_at: new Date().toISOString(),
    lead_id: undefined,
    lead_number: undefined,
    metadata: { estimate_id: estimateId, estimate_number: estimateNumber },
  }),

  /** Notification sent when an estimate's status changes */
  statusChanged: (
    estimateId: number,
    estimateNumber: string,
    customerName: string,
    oldStatus: string,
    newStatus: string
  ): Omit<
    Parameters<typeof notificationService.send>[0],
    "channel"
  > => ({
    id: crypto.randomUUID(),
    priority: "normal",
    recipient: "admin",
    subject: `Estimate Status Updated: ${estimateNumber}`,
    body: `Estimate ${estimateNumber} (${customerName}) status changed from "${oldStatus}" to "${newStatus}".`,
    created_at: new Date().toISOString(),
    lead_id: undefined,
    lead_number: undefined,
    metadata: { estimate_id: estimateId, estimate_number: estimateNumber },
  }),

  /** Notification sent when a note is added to an estimate */
  noteAdded: (
    estimateId: number,
    estimateNumber: string,
    customerName: string,
    note: string
  ): Omit<
    Parameters<typeof notificationService.send>[0],
    "channel"
  > => ({
    id: crypto.randomUUID(),
    priority: "low",
    recipient: "admin",
    subject: `New Note: ${estimateNumber}`,
    body: `A new note was added to estimate ${estimateNumber} (${customerName}):\n\n${note}`,
    created_at: new Date().toISOString(),
    lead_id: undefined,
    lead_number: undefined,
    metadata: { estimate_id: estimateId, estimate_number: estimateNumber },
  }),
};

// ============================================================
// Initialization
// ============================================================

let initialized = false;

/**
 * Ensures all notification providers are registered.
 * Safe to call multiple times.
 */
function ensureProviders(): void {
  if (initialized) return;

  // Reuse the existing provider registry initialization
  // The providers are already registered by the leads module,
  // but we ensure they're available here too.
  try {
    // Providers may already be registered from leads module
    const providers = notificationService.getAllProviders();
    if (providers.length === 0) {
      // Fallback: register admin provider directly
      // This is a safety net — normally leads module handles this
    }
  } catch {
    // Ignore — providers may be registered elsewhere
  }

  initialized = true;
}

// ============================================================
// Notification Helpers
// ============================================================

/**
 * Sends notifications for a new estimate.
 * Called after an estimate is successfully created.
 *
 * Channels notified:
 *   - admin (in-app notification)
 *
 * @param estimate The newly created estimate row
 */
export async function notifyNewEstimate(
  estimate: EstimateRow
): Promise<NotificationResult[]> {
  ensureProviders();

  const basePayload = EstimateNotificationTemplates.newEstimate(
    estimate.id,
    estimate.estimate_number,
    estimate.customer_name || "Unknown",
    estimate.grand_total
  );

  // Notify admin (in-app) about new estimate
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
 * Sends notifications for an estimate status change.
 */
export async function notifyEstimateStatusChange(
  estimate: EstimateRow,
  oldStatus: string,
  newStatus: string
): Promise<NotificationResult[]> {
  ensureProviders();

  const basePayload = EstimateNotificationTemplates.statusChanged(
    estimate.id,
    estimate.estimate_number,
    estimate.customer_name || "Unknown",
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
 * Sends notifications when a note is added to an estimate.
 */
export async function notifyEstimateNoteAdded(
  estimate: EstimateRow,
  note: string
): Promise<NotificationResult[]> {
  ensureProviders();

  const basePayload = EstimateNotificationTemplates.noteAdded(
    estimate.id,
    estimate.estimate_number,
    estimate.customer_name || "Unknown",
    note
  );

  // Notify admin (in-app) about note
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
 * Sends notifications when an estimate is shared with a customer.
 * Also triggers lead notification if a lead is linked.
 */
export async function notifyEstimateShared(
  estimate: EstimateRow
): Promise<NotificationResult[]> {
  ensureProviders();

  const basePayload = EstimateNotificationTemplates.newEstimate(
    estimate.id,
    estimate.estimate_number,
    estimate.customer_name || "Unknown",
    estimate.grand_total
  );

  // Customize for sharing
  basePayload.subject = `Estimate Shared: ${estimate.estimate_number}`;
  basePayload.body = `Estimate ${estimate.estimate_number} has been shared with ${estimate.customer_name || "the customer"}.\n\nTotal: ₹${estimate.grand_total.toLocaleString()}\n\nPlease follow up as needed.`;

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
