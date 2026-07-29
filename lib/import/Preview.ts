// ============================================================
// Enterprise Import Framework v1.0 — Preview (Dry Run)
// SBBT CRM v2
//
// Generates a preview/dry-run result showing what would happen
// during import without actually modifying the database.
// ============================================================

import type {
  DryRunResult,
  DryRunRow,
  ValidatedRow,
  ImportMode,
} from './Types';
import { MAX_DRY_RUN_ROWS } from './Constants';
import { generateImportId } from './Executor';

export interface DryRunOptions {
  module: string;
  mode: ImportMode;
  filename: string;
  maxRows?: number;
}

/**
 * Generate a dry-run result from validated rows.
 * Shows what would be inserted/updated/skipped without touching the database.
 */
export function generateDryRun(
  validatedRows: ValidatedRow[],
  options: DryRunOptions
): DryRunResult {
  const maxRows = options.maxRows ?? MAX_DRY_RUN_ROWS;
  const truncated = validatedRows.length > maxRows;
  const rowsToProcess = truncated
    ? validatedRows.slice(0, maxRows)
    : validatedRows;

  const dryRunRows: DryRunRow[] = [];
  let willInsert = 0;
  let willUpdate = 0;
  let willSkip = 0;
  let warningCount = 0;

  for (const row of rowsToProcess) {
    const dryRunRow: DryRunRow = {
      rowNumber: row.rowNumber,
      data: row.data,
      action: row.action,
      reason: row.reason,
      errors: row.errors,
      warnings: row.warnings,
    };

    if (row.existingId) {
      dryRunRow.existingId = row.existingId;
    }

    dryRunRows.push(dryRunRow);

    switch (row.action) {
      case 'insert':
        willInsert++;
        break;
      case 'update':
        willUpdate++;
        break;
      case 'skip':
        willSkip++;
        break;
    }

    warningCount += row.warnings.length;
  }

  const totalErrors = rowsToProcess.reduce(
    (sum, r) => sum + r.errors.length,
    0
  );

  const result: DryRunResult = {
    importId: generateImportId(),
    module: options.module,
    filename: options.filename,
    importMode: options.mode,
    totalRows: validatedRows.length,
    validRows: rowsToProcess.filter(
      (r) => r.action !== 'skip' || r.reason !== 'Validation errors'
    ).length,
    errorRows: rowsToProcess.filter(
      (r) => r.errors.length > 0
    ).length,
    willInsert,
    willUpdate,
    willSkip,
    warningCount,
    rows: dryRunRows,
    errors: rowsToProcess.flatMap((r) => r.errors),
    warnings: rowsToProcess.flatMap((r) => r.warnings),
  };

  if (truncated) {
    result.warnings.push({
      row: 0,
      message: `Preview limited to ${maxRows} rows. File contains ${validatedRows.length} rows.`,
      severity: 'info',
    });
  }

  return result;
}

/**
 * Format a dry-run result for display.
 */
export function formatDryRunPreview(result: DryRunResult): string {
  const lines: string[] = [];
  lines.push('=== Import Preview ===');
  lines.push('');
  lines.push(`Module:  ${result.module}`);
  lines.push(`File:    ${result.filename}`);
  lines.push(`Mode:    ${result.importMode}`);
  lines.push('');
  lines.push(`Total Rows:    ${result.totalRows}`);
  lines.push(`Valid Rows:    ${result.validRows}`);
  lines.push(`Error Rows:    ${result.errorRows}`);
  lines.push('');
  lines.push(`Will Insert:   ${result.willInsert}`);
  lines.push(`Will Update:   ${result.willUpdate}`);
  lines.push(`Will Skip:     ${result.willSkip}`);
  lines.push(`Warnings:      ${result.warningCount}`);
  lines.push('');

  if (result.errors.length > 0) {
    lines.push('--- Errors ---');
    for (const err of result.errors.slice(0, 20)) {
      lines.push(`  Row ${err.row} [${err.column}]: ${err.message}`);
    }
    if (result.errors.length > 20) {
      lines.push(`  ... and ${result.errors.length - 20} more errors`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
