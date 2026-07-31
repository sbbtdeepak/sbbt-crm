"use client";

import { trackOutboundClick, trackGetQuoteClick, trackWhatsAppClick, trackPhoneClick } from "@/lib/analytics";
import type { ReactNode } from "react";

type TrackEvent = "getQuote" | "outbound" | "whatsapp" | "phone";

/**
 * Client-side wrapper for anchor tags with analytics tracking.
 *
 * Use this in Server Components whenever you need to track clicks
 * without converting the entire parent into a Client Component.
 *
 * Usage:
 *   <TrackedLink href="/quote" event="getQuote">Get Quote</TrackedLink>
 *   <TrackedLink href="https://..." event="outbound" target="_blank">Link</TrackedLink>
 *   <TrackedLink href="https://wa.me/..." event="whatsapp">WhatsApp</TrackedLink>
 */
export function TrackedLink({
  href,
  event,
  children,
  className,
  target,
  rel,
  "aria-label": ariaLabel,
}: {
  href: string;
  event: TrackEvent;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  "aria-label"?: string;
}) {
  const handleClick = () => {
    switch (event) {
      case "getQuote":
        trackGetQuoteClick();
        break;
      case "outbound":
        trackOutboundClick(href);
        break;
      case "whatsapp":
        trackWhatsAppClick();
        break;
      case "phone":
        trackPhoneClick();
        break;
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}