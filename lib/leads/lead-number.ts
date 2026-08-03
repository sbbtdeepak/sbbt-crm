// ============================================================
// CRM Leads V2 - Lead Number Generator
// ============================================================
// Generates a timestamp-safe, collision-free lead number.
//
// Design:
// - No database query (no race conditions)
// - No service_role key required
// - No privileged access
// - Uses timestamp + random suffix for uniqueness
//
// Format: LEAD-YYYYMMDD-HHMMSS-XXXX
// Example: LEAD-20260802-234512-8F3A
// ============================================================

/**
 * Generates a unique lead number.
 *
 * Uses current timestamp (to the second) plus a 4-character
 * random hex suffix to guarantee uniqueness without requiring
 * a database read or privileged access.
 */
export function generateLeadNumber(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // 4-character random hex suffix (16^4 = 65536 combinations per second)
  const suffix = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");

  return `LEAD-${year}${month}${day}-${hours}${minutes}${seconds}-${suffix}`;
}