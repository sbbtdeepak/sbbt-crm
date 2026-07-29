// ============================================================
// Enterprise Import Framework v1.0 — Constants
// SBBT CRM v2
// ============================================================

/** Maximum file size in bytes (10 MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Maximum number of rows per import */
export const MAX_ROWS = 10000;

/** Maximum number of rows per dry run */
export const MAX_DRY_RUN_ROWS = 10000;

/** Allowed MIME types for upload */
export const ALLOWED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

/** Allowed file extensions */
export const ALLOWED_EXTENSIONS = [".xlsx"];

/** Default chunk size for processing */
export const CHUNK_SIZE = 100;

/** Min chunk size */
export const MIN_CHUNK_SIZE = 10;

/** Max chunk size */
export const MAX_CHUNK_SIZE = 500;

/** Levenshtein distance threshold for near-duplicate detection */
export const MAX_LEVENSHTEIN_DISTANCE = 3;

/** Dry run expiration in milliseconds (1 hour) */
export const DRY_RUN_EXPIRATION_MS = 60 * 60 * 1000;

/** Template header keys */
export const TEMPLATE_HEADER_KEYS = {
  VERSION: "TEMPLATE_VERSION",
  MODULE: "MODULE",
  DATE: "TEMPLATE_DATE",
  CRM_VERSION: "CRM_VERSION",
} as const;

/** Standard status transitions */
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["dry_run", "failed"],
  dry_run: ["importing", "completed", "failed"],
  importing: ["completed", "failed"],
  completed: ["rolled_back"],
  failed: [],
  rolled_back: [],
} as const;

/** Import mode labels for UI */
export const IMPORT_MODE_LABELS: Record<string, string> = {
  insert_only: "Insert Only (New Records)",
  update_only: "Update Only (Existing Records)",
  upsert: "Upsert (Insert + Update)",
};

/** Validation error messages */
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: (column: string) => `"${column}" is required`,
  INVALID_TYPE: (column: string, expected: string) =>
    `"${column}" must be a valid ${expected}`,
  MAX_LENGTH: (column: string, max: number) =>
    `"${column}" exceeds maximum length of ${max} characters`,
  MIN_LENGTH: (column: string, min: number) =>
    `"${column}" must be at least ${min} characters`,
  OUT_OF_RANGE: (column: string, min: number, max: number) =>
    `"${column}" must be between ${min} and ${max}`,
  INVALID_URL: (column: string) => `"${column}" must be a valid URL starting with http:// or https://`,
  INVALID_EMAIL: (column: string) => `"${column}" must be a valid email address`,
  INVALID_DATE: (column: string) => `"${column}" must be a valid date in DD/MM/YYYY format`,
  INVALID_ENUM: (column: string, allowed: string[]) =>
    `"${column}" must be one of: ${allowed.join(", ")}`,
  INVALID_BOOLEAN: (column: string) =>
    `"${column}" must be "yes" or "no" (case-insensitive)`,
  INVALID_INTEGER: (column: string) => `"${column}" must be a whole number`,
  INVALID_NUMBER: (column: string) => `"${column}" must be a valid number`,
  DUPLICATE_IN_FILE: (value: string) => `Duplicate "${value}" detected within the file`,
  EMPTY_ROW: "Blank row detected and skipped",
  FILE_TOO_LARGE: (maxMB: number) => `File exceeds ${maxMB} MB limit`,
  INVALID_EXTENSION: () => "Only .xlsx files are supported",
  TEMPLATE_VERSION_MISMATCH: (expected: string, actual: string) =>
    `Template version ${actual} is incompatible. Expected ${expected}.`,
  MODULE_MISMATCH: (expected: string, actual: string) =>
    `Template is for module "${actual}", expected "${expected}".`,
  MISSING_REQUIRED_COLUMN: (column: string) =>
    `Required column "${column}" is missing from the template.`,
  EXTRA_UNKNOWN_COLUMN: (column: string) =>
    `Column "${column}" is not recognized for this module.`,
} as const;