// ============================================================
// Enterprise Import Framework v1.0 — Types
// SBBT CRM v2
//
// All shared TypeScript interfaces for the import/export engine.
// ============================================================

// ============================================================
// Core Enums
// ============================================================

export type ImportMode = "insert_only" | "update_only" | "upsert";

export type ImportStatus =
  | "pending"
  | "dry_run"
  | "importing"
  | "completed"
  | "failed"
  | "rolled_back";

export type ColumnType =
  | "text"
  | "number"
  | "integer"
  | "boolean"
  | "date"
  | "url"
  | "email"
  | "enum";

export type Severity = "error" | "warning" | "info";

// ============================================================
// Template Header
// ============================================================

export interface TemplateHeader {
  templateVersion: string;
  module: string;
  templateDate: string;
  crmVersion: string;
}

// ============================================================
// Column Configuration
// ============================================================

export interface ColumnConfig {
  field: string;
  label: string;
  required: boolean;
  type: ColumnType;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  default?: unknown;
}

// ============================================================
// Row Data
// ============================================================

export interface RawRow {
  rowNumber: number;
  data: Record<string, unknown>;
  isValid: boolean;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ValidatedRow {
  rowNumber: number;
  data: Record<string, unknown>;
  action: "insert" | "update" | "skip";
  reason: string;
  errors: ImportError[];
  warnings: ImportWarning[];
  existingId?: number;
}

// ============================================================
// Validation Results
// ============================================================

export interface ImportError {
  row: number;
  column: string;
  message: string;
  severity: Severity;
}

export interface ImportWarning {
  row: number;
  message: string;
  severity: Severity;
}

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  rows: ValidatedRow[];
}

// ============================================================
// Dry Run / Preview
// ============================================================

export interface DryRunResult {
  importId: string;
  module: string;
  filename: string;
  importMode: ImportMode;

  totalRows: number;
  validRows: number;
  errorRows: number;

  willInsert: number;
  willUpdate: number;
  willSkip: number;
  warningCount: number;

  rows: DryRunRow[];
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface DryRunRow {
  rowNumber: number;
  data: Record<string, unknown>;
  action: "insert" | "update" | "skip";
  reason: string;
  errors: ImportError[];
  warnings: ImportWarning[];
  existingId?: number;
}

// ============================================================
// Import Execution
// ============================================================

export interface ImportResult {
  importId: number;
  module: string;
  totalRows: number;
  insertedRows: number;
  updatedRows: number;
  failedRows: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  durationMs: number;
  status: ImportStatus;
}

// ============================================================
// Rollback
// ============================================================

export interface RollbackData {
  inserted: RollbackInsertedRow[];
  updated: RollbackUpdatedRow[];
}

export interface RollbackInsertedRow {
  id: number;
  identity: string;
  data: Record<string, unknown>;
}

export interface RollbackUpdatedRow {
  id: number;
  identity: string;
  previousValues: Record<string, unknown>;
}

export interface RollbackResult {
  success: boolean;
  importId: number;
  deletedRows: number;
  restoredRows: number;
  errors: string[];
}

// ============================================================
// Import Log (Database Record)
// ============================================================

export interface ImportLogEntry {
  id: number;
  module: string;
  templateVersion: string;
  filename: string;
  importMode: ImportMode;
  status: ImportStatus;

  totalRows: number;
  validRows: number;
  errorRows: number;
  skippedRows: number;

  insertedRows: number;
  updatedRows: number;
  failedRows: number;

  dryRunResult: DryRunResult | Record<string, never>;
  errors: ImportError[];
  warnings: ImportWarning[];

  previousData: RollbackData | Record<string, never>;
  isRolledBack: boolean;
  rolledBackAt: string | null;
  rolledBackBy: string | null;

  durationMs: number;
  createdAt: string;
  completedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

// ============================================================
// Engine Options
// ============================================================

export interface ImportEngineOptions {
  module: string;
  importMode: ImportMode;
  columnConfigs: ColumnConfig[];
  identityFields: string[];
  maxFileSize?: number;
  maxRows?: number;
  allowedMimeTypes?: string[];
}