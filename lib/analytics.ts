/**
 * Google Analytics 4 utility library.
 *
 * Uses NEXT_PUBLIC_GA_MEASUREMENT_ID from environment variables.
 * Provides typed helper functions for common tracking events.
 */

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Whether Google Analytics is available (ID configured and running in browser)
 */
function isGaAvailable(): boolean {
  return !!GA_MEASUREMENT_ID && typeof window !== "undefined" && typeof window.gtag === "function";
}

/**
 * Track a page view.
 * Call this manually when the route changes to avoid duplicate views.
 */
export function pageview(url: string) {
  if (!isGaAvailable()) return;
  window.gtag("config", GA_MEASUREMENT_ID!, {
    page_path: url,
  });
}

/**
 * Track a generic event.
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (!isGaAvailable()) return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

/**
 * Track an outbound link click.
 */
export function trackOutboundClick(url: string) {
  trackEvent("click", "outbound", url);
}

/**
 * Track a contact form submission.
 */
export function trackContactFormSubmit() {
  trackEvent("form_submit", "engagement", "contact_form");
}

/**
 * Track a "Get Quote" button/link click.
 */
export function trackGetQuoteClick() {
  trackEvent("click", "engagement", "get_quote");
}

/**
 * Track a WhatsApp link click.
 */
export function trackWhatsAppClick() {
  trackEvent("click", "engagement", "whatsapp");
}

/**
 * Track a phone number link click.
 */
export function trackPhoneClick() {
  trackEvent("click", "engagement", "phone");
}