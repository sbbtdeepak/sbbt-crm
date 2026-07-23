// ============================================================
// Rate Limiting Utility
// SBBT CRM Next.js Project
//
// Simple in-memory rate limiter for public API endpoints.
// For production with multiple instances, replace with Redis-based
// rate limiting (e.g. @upstash/ratelimit).
// ============================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory store: key -> { count, resetTime }
const store = new Map<string, RateLimitEntry>();

// Cleanup interval — remove expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetTime <= now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Rate limiter configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

/**
 * Default configurations for different endpoint types
 */
export const RATE_LIMIT_CONFIGS = {
  /** Public lead/contact form submissions — 5 per minute */
  publicForm: { limit: 5, windowMs: 60 * 1000 },
  /** Estimate submission — 10 per minute */
  estimate: { limit: 10, windowMs: 60 * 1000 },
  /** General public API — 60 per minute */
  publicApi: { limit: 60, windowMs: 60 * 1000 },
} as const;

/**
 * Checks if a request should be rate limited.
 *
 * @param key Unique identifier (IP address, email, etc.)
 * @param config Rate limit configuration
 * @returns Result with success status and rate limit headers
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();

  const existing = store.get(key);

  if (existing && existing.resetTime > now) {
    // Within the same window
    if (existing.count >= config.limit) {
      return {
        success: false,
        limit: config.limit,
        remaining: 0,
        reset: existing.resetTime,
      };
    }
    existing.count++;
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - existing.count,
      reset: existing.resetTime,
    };
  }

  // New window
  store.set(key, { count: 1, resetTime: now + config.windowMs });
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - 1,
    reset: now + config.windowMs,
  };
}

/**
 * Generates rate limit headers for HTTP responses.
 */
export function getRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(Math.max(0, result.remaining)),
    "X-RateLimit-Reset": String(result.reset),
  };
}

/**
 * Extracts client IP from request headers.
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  return "unknown";
}
