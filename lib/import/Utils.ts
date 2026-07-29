// ============================================================
// Enterprise Import Framework v1.0 — Utilities
// SBBT CRM v2
//
// Shared utility functions for the import engine.
// ============================================================

import type { ColumnConfig } from "./Types";
import { MAX_LEVENSHTEIN_DISTANCE } from "./Constants";

/**
 * Normalize a string value: trim whitespace, collapse multiple spaces.
 */
export function normalizeString(value: unknown): string {
  if (typeof value !== "string") return String(value ?? "");
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Parse a boolean from Excel "yes"/"no" format.
 * Case-insensitive. Returns undefined if not parseable.
 */
export function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return undefined;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["yes", "y", "true", "1"].includes(normalized)) return true;
    if (["no", "n", "false", "0"].includes(normalized)) return false;
  }
  return undefined;
}

/**
 * Parse a date from DD/MM/YYYY format.
 * Returns a Date object or null if invalid.
 */
export function parseDateDDMMYYYY(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  const parts = trimmed.split("/");

  if (parts.length !== 3) return null;

  const [dayStr, monthStr, yearStr] = parts;
  if (!dayStr || !monthStr || !yearStr) return null;

  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1900 || year > 2100) return null;

  const date = new Date(year, month - 1, day);
  // Verify the date components match (catches invalid dates like Feb 30)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Format a Date to DD/MM/YYYY string.
 */
export function formatDateDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Validate if a string is a valid URL (http or https).
 */
export function isValidUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed === "") return true; // empty is valid (optional field)
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validate if a string is a valid email address.
 */
export function isValidEmail(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed === "") return true; // empty is valid (optional field)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

/**
 * Validate if a value is a valid number.
 */
export function isValidNumber(value: unknown): boolean {
  if (typeof value === "number") return !isNaN(value);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return false;
    return !isNaN(Number(trimmed));
  }
  return false;
}

/**
 * Validate if a value is a valid integer.
 */
export function isValidInteger(value: unknown): boolean {
  if (typeof value === "number") return Number.isInteger(value);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return false;
    const num = Number(trimmed);
    return !isNaN(num) && Number.isInteger(num);
  }
  return false;
}

/**
 * Parse a number from various input formats.
 * Removes currency symbols, commas, etc.
 */
export function parseNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[₹$,]/g, "").trim();
    if (cleaned === "") return null;
    const num = Number(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Levenshtein distance between two strings.
 * Used for near-duplicate detection.
 */
export function levenshteinDistance(a: string, b: string): number {
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  const matrix: number[][] = [];

  for (let i = 0; i <= lenA; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[lenA][lenB];
}

/**
 * Check if two strings are near-duplicates.
 * Uses case comparison, whitespace normalization, and Levenshtein distance.
 */
export function areNearDuplicates(a: string, b: string): {
  isDuplicate: boolean;
  type: "exact" | "case" | "whitespace" | "near" | "none";
} {
  const trimmedA = a.trim();
  const trimmedB = b.trim();

  // Exact match
  if (trimmedA === trimmedB) {
    return { isDuplicate: true, type: "exact" };
  }

  // Case-insensitive match
  if (trimmedA.toLowerCase() === trimmedB.toLowerCase()) {
    return { isDuplicate: true, type: "case" };
  }

  // Whitespace-normalized match
  const normalizedA = trimmedA.replace(/\s+/g, " ");
  const normalizedB = trimmedB.replace(/\s+/g, " ");
  if (normalizedA === normalizedB) {
    return { isDuplicate: true, type: "whitespace" };
  }

  // Slug match
  if (slugify(trimmedA) === slugify(trimmedB)) {
    return { isDuplicate: true, type: "near" };
  }

  // Levenshtein distance
  const maxLen = Math.max(normalizedA.length, normalizedB.length);
  if (maxLen > 0) {
    const distance = levenshteinDistance(
      normalizedA.toLowerCase(),
      normalizedB.toLowerCase()
    );
    const threshold = Math.min(MAX_LEVENSHTEIN_DISTANCE, Math.floor(maxLen * 0.3));
    if (distance <= threshold) {
      return { isDuplicate: true, type: "near" };
    }
  }

  return { isDuplicate: false, type: "none" };
}

/**
 * Get the file extension from a filename.
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Get the MIME type label for display.
 */
export function getMimeTypeLabel(mimeType: string): string {
  const labels: Record<string, string> = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "Excel (.xlsx)",
    "application/vnd.ms-excel": "Excel (.xls)",
  };
  return labels[mimeType] ?? mimeType;
}

/**
 * Get a column config by field name.
 */
export function getColumnConfig(
  columns: ColumnConfig[],
  field: string
): ColumnConfig | undefined {
  return columns.find((c) => c.field === field);
}

/**
 * Get all required column fields.
 */
export function getRequiredFields(columns: ColumnConfig[]): string[] {
  return columns.filter((c) => c.required).map((c) => c.field);
}

/**
 * Get all expected column labels (Excel headers).
 */
export function getExpectedHeaders(columns: ColumnConfig[]): string[] {
  return columns.map((c) => c.label);
}