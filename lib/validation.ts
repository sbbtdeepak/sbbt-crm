// ============================================================
// Shared Form Validation Utilities
// ============================================================

/** Minimum project budget in rupees (₹21 Lakhs) */
export const MIN_BUDGET = 2100000;

/** Maximum project budget in rupees */
export const MAX_BUDGET = 999999999;

/** Indian mobile number: exactly 10 digits, first digit 6/7/8/9 */
export function isValidIndianMobile(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10) return false;
  return /^[6-9]/.test(digits);
}

/** Name: only A-Z, a-z, and spaces, minimum 2 characters */
export function isValidName(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 2 && /^[A-Za-z ]+$/.test(trimmed);
}

/** Budget: must be >= MIN_BUDGET and <= MAX_BUDGET */
export function isValidBudget(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (!digits) return false;
  const num = Number(digits);
  return !isNaN(num) && num >= MIN_BUDGET && num <= MAX_BUDGET;
}

/** Email: basic format check */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Strip non-digit characters and limit to 10 digits */
export function sanitizeMobileInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

/** Strip characters not in A-Z, a-z, or space */
export function sanitizeNameInput(value: string): string {
  return value.replace(/[^A-Za-z ]/g, "");
}

/** Strip non-digit characters with optional max length */
export function sanitizeNumericInput(value: string, maxLength = 10): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

/** Format a numeric string as Indian currency (₹21,00,000) */
export function formatIndianCurrency(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const num = Number(digits);
  return "₹" + num.toLocaleString("en-IN");
}