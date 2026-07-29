// ============================================================
// Enterprise Import Framework v1.0 — Error Collector
// SBBT CRM v2
//
// Collects and formats validation errors with line numbers.
// ============================================================

import type { ImportError, ImportWarning } from "./Types";

/**
 * Collects errors and warnings during import processing.
 * Maintains separate lists for errors and warnings.
 */
export class ErrorCollector {
  private errors: ImportError[] = [];
  private warnings: ImportWarning[] = [];

  /** Add a validation error */
  addError(row: number, column: string, message: string): void {
    this.errors.push({
      row,
      column,
      message,
      severity: "error",
    });
  }

  /** Add a validation warning */
  addWarning(row: number, message: string): void {
    this.warnings.push({
      row,
      message,
      severity: "warning",
    });
  }

  /** Add an info message */
  addInfo(row: number, message: string): void {
    this.warnings.push({
      row,
      message,
      severity: "info",
    });
  }

  /** Add multiple errors at once */
  addErrors(errors: ImportError[]): void {
    this.errors.push(...errors);
  }

  /** Add multiple warnings at once */
  addWarnings(warnings: ImportWarning[]): void {
    this.warnings.push(...warnings);
  }

  /** Get all errors */
  getErrors(): ImportError[] {
    return [...this.errors];
  }

  /** Get all warnings */
  getWarnings(): ImportWarning[] {
    return [...this.warnings];
  }

  /** Get error count */
  get errorCount(): number {
    return this.errors.length;
  }

  /** Get warning count */
  get warningCount(): number {
    return this.warnings.length;
  }

  /** Check if there are any errors */
  get hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /** Check if there are any warnings */
  get hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  /** Get unique rows that have errors */
  getErrorRows(): number[] {
    const rows = new Set(this.errors.map((e) => e.row));
    return Array.from(rows).sort((a, b) => a - b);
  }

  /** Get errors for a specific row */
  getErrorsForRow(row: number): ImportError[] {
    return this.errors.filter((e) => e.row === row);
  }

  /** Get warnings for a specific row */
  getWarningsForRow(row: number): ImportWarning[] {
    return this.warnings.filter((w) => w.row === row);
  }

  /** Format all errors into a readable string */
  formatErrors(): string {
    if (this.errors.length === 0) {
      return "No errors found.";
    }

    const lines: string[] = [
      `Found ${this.errors.length} error(s):`,
      "",
    ];

    for (const error of this.errors) {
      lines.push(`  Row ${error.row} [${error.column}]: ${error.message}`);
    }

    return lines.join("\n");
  }

  /** Format all warnings into a readable string */
  formatWarnings(): string {
    if (this.warnings.length === 0) {
      return "No warnings found.";
    }

    const lines: string[] = [
      `Found ${this.warnings.length} warning(s):`,
      "",
    ];

    for (const warning of this.warnings) {
      lines.push(`  Row ${warning.row}: ${warning.message}`);
    }

    return lines.join("\n");
  }

  /** Format all errors and warnings into a summary */
  formatSummary(): string {
    const parts: string[] = [];

    parts.push("=== Validation Summary ===");
    parts.push(`Errors:   ${this.errors.length}`);
    parts.push(`Warnings: ${this.warnings.length}`);
    parts.push("");

    if (this.hasErrors) {
      parts.push(this.formatErrors());
    }

    if (this.hasWarnings) {
      parts.push("");
      parts.push(this.formatWarnings());
    }

    return parts.join("\n");
  }

  /** Clear all errors and warnings */
  clear(): void {
    this.errors = [];
    this.warnings = [];
  }
}