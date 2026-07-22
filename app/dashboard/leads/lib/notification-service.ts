// ============================================================
// Lead Notification Service (Preparation Only)
// SBBT CRM Next.js Project
//
// This module provides a reusable notification interface for the
// Lead Management system. No providers are hardcoded — providers
// are registered dynamically and can be added/removed without
// modifying this file.
//
// Future integrations:
//   - Email Notification
//   - WhatsApp Notification
//   - Admin Notification (in-app)
//   - Google Sheets
//   - CRM APIs (e.g. HubSpot, Salesforce)
// ============================================================

// ============================================================
// Types
// ============================================================

/**
 * The channel through which a notification is delivered.
 * Used for routing and filtering.
 */
export type NotificationChannel =
  | "email"
  | "whatsapp"
  | "sms"
  | "admin"
  | "webhook"
  | "google_sheets"
  | "crm_api";

/**
 * Priority level for notifications.
 * Higher priority notifications are sent first.
 */
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

/**
 * The payload sent to a notification provider.
 * Contains all information needed to deliver the notification.
 */
export interface NotificationPayload {
  /** Unique identifier for this notification */
  id: string;
  /** Channel to deliver on */
  channel: NotificationChannel;
  /** Priority level */
  priority: NotificationPriority;
  /** Recipient identifier (email, phone, user ID, etc.) */
  recipient: string;
  /** Notification subject / title */
  subject: string;
  /** Notification body / message content */
  body: string;
  /** Additional metadata for the provider */
  metadata?: Record<string, unknown>;
  /** When the notification was created */
  created_at: string;
  /** Related lead ID (for tracking) */
  lead_id?: number;
  /** Related lead number (for human readability) */
  lead_number?: string;
}

/**
 * Result of a notification delivery attempt.
 */
export interface NotificationResult {
  /** Whether the notification was sent successfully */
  success: boolean;
  /** Provider that handled the notification */
  provider: string;
  /** Message ID or reference from the provider */
  message_id?: string;
  /** Error message if delivery failed */
  error?: string;
}

/**
 * Interface that all notification providers must implement.
 * Providers are registered dynamically via NotificationService.registerProvider().
 */
export interface NotificationProvider {
  /** Unique name for this provider */
  name: string;
  /** Channel this provider handles */
  channel: NotificationChannel;
  /** Whether this provider is enabled */
  enabled: boolean;
  /**
   * Send a notification.
   * @param payload The notification payload
   * @returns Result of the delivery attempt
   */
  send(payload: NotificationPayload): Promise<NotificationResult>;
}

// ============================================================
// Notification Service
// ============================================================

/**
 * Central notification service for the Lead Management system.
 *
 * Providers are registered dynamically — no provider is hardcoded.
 * This allows future integrations to be added without modifying
 * the service itself.
 *
 * Usage:
 *   const service = new NotificationService();
 *   service.registerProvider(emailProvider);
 *   service.registerProvider(whatsappProvider);
 *   await service.send({ channel: "email", ... });
 */
export class NotificationService {
  private providers: Map<string, NotificationProvider> = new Map();

  /**
   * Register a notification provider.
   * If a provider with the same name already exists, it will be replaced.
   */
  registerProvider(provider: NotificationProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Unregister a notification provider by name.
   */
  unregisterProvider(name: string): boolean {
    return this.providers.delete(name);
  }

  /**
   * Get all registered providers for a specific channel.
   */
  getProvidersForChannel(channel: NotificationChannel): NotificationProvider[] {
    return Array.from(this.providers.values()).filter(
      (p) => p.channel === channel && p.enabled
    );
  }

  /**
   * Get all registered providers.
   */
  getAllProviders(): NotificationProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Send a notification through all enabled providers for the
   * specified channel.
   *
   * @param payload The notification payload
   * @returns Array of results from each provider that attempted delivery
   */
  async send(payload: NotificationPayload): Promise<NotificationResult[]> {
    const providers = this.getProvidersForChannel(payload.channel);

    if (providers.length === 0) {
      return [
        {
          success: false,
          provider: "none",
          error: `No enabled providers registered for channel: ${payload.channel}`,
        },
      ];
    }

    const results: NotificationResult[] = [];

    for (const provider of providers) {
      try {
        const result = await provider.send(payload);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          provider: provider.name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  /**
   * Send a notification to all channels (broadcast).
   * Useful for admin notifications that should be delivered
   * via multiple channels simultaneously.
   */
  async broadcast(
    basePayload: Omit<NotificationPayload, "channel">
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    const channels = new Set(
      Array.from(this.providers.values())
        .filter((p) => p.enabled)
        .map((p) => p.channel)
    );

    for (const channel of channels) {
      const result = await this.send({ ...basePayload, channel });
      results.push(...result);
    }

    return results;
  }
}

// ============================================================
// Singleton Instance
// ============================================================

/**
 * Global notification service instance.
 * Import and use this directly, or create your own instance
 * if you need isolated provider registries.
 */
export const notificationService = new NotificationService();

// ============================================================
// Lead-Specific Notification Helpers
// ============================================================

/**
 * Predefined notification templates for common lead events.
 * These are factory functions that create NotificationPayload objects.
 */
export const LeadNotificationTemplates = {
  /** Notification sent when a new lead is created */
  newLead: (
    leadId: number,
    leadNumber: string,
    fullName: string,
    source: string
  ): Omit<NotificationPayload, "channel"> => ({
    id: crypto.randomUUID(),
    priority: "normal",
    recipient: "admin",
    subject: `New Lead: ${leadNumber}`,
    body: `A new lead has been submitted.\n\nLead: ${leadNumber}\nName: ${fullName}\nSource: ${source}\n\nPlease review and assign to a team member.`,
    created_at: new Date().toISOString(),
    lead_id: leadId,
    lead_number: leadNumber,
  }),

  /** Notification sent when a lead's status changes */
  statusChanged: (
    leadId: number,
    leadNumber: string,
    fullName: string,
    oldStatus: string,
    newStatus: string
  ): Omit<NotificationPayload, "channel"> => ({
    id: crypto.randomUUID(),
    priority: "normal",
    recipient: "admin",
    subject: `Lead Status Updated: ${leadNumber}`,
    body: `Lead ${leadNumber} (${fullName}) status changed from "${oldStatus}" to "${newStatus}".`,
    created_at: new Date().toISOString(),
    lead_id: leadId,
    lead_number: leadNumber,
  }),

  /** Notification sent when a remark is added to a lead */
  remarkAdded: (
    leadId: number,
    leadNumber: string,
    fullName: string,
    remark: string
  ): Omit<NotificationPayload, "channel"> => ({
    id: crypto.randomUUID(),
    priority: "low",
    recipient: "admin",
    subject: `New Remark: ${leadNumber}`,
    body: `A new remark was added to lead ${leadNumber} (${fullName}):\n\n${remark}`,
    created_at: new Date().toISOString(),
    lead_id: leadId,
    lead_number: leadNumber,
  }),

  /** Notification sent to the lead (customer) */
  customerNotification: (
    leadId: number,
    leadNumber: string,
    recipient: string,
    subject: string,
    body: string
  ): Omit<NotificationPayload, "channel"> => ({
    id: crypto.randomUUID(),
    priority: "normal",
    recipient,
    subject,
    body,
    created_at: new Date().toISOString(),
    lead_id: leadId,
    lead_number: leadNumber,
  }),
};
