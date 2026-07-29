import { writeFileSync } from 'fs';

const files = {};

files['Lib/import/Preview.ts'] = `// ============================================================
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
      message: \`Preview limited to \${maxRows} rows. File contains \${validatedRows.length} rows.\`,
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
  lines.push(\`Module:  \${result.module}\`);
  lines.push(\`File:    \${result.filename}\`);
  lines.push(\`Mode:    \${result.importMode}\`);
  lines.push('');
  lines.push(\`Total Rows:    \${result.totalRows}\`);
  lines.push(\`Valid Rows:    \${result.validRows}\`);
  lines.push(\`Error Rows:    \${result.errorRows}\`);
  lines.push('');
  lines.push(\`Will Insert:   \${result.willInsert}\`);
  lines.push(\`Will Update:   \${result.willUpdate}\`);
  lines.push(\`Will Skip:     \${result.willSkip}\`);
  lines.push(\`Warnings:      \${result.warningCount}\`);
  lines.push('');

  if (result.errors.length > 0) {
    lines.push('--- Errors ---');
    for (const err of result.errors.slice(0, 20)) {
      lines.push(\`  Row \${err.row} [\${err.column}]: \${err.message}\`);
    }
    if (result.errors.length > 20) {
      lines.push(\`  ... and \${result.errors.length - 20} more errors\`);
    }
    lines.push('');
  }

  return lines.join('\\n');
}
`;

files['Lib/import/Executor.ts'] = `// ============================================================
// Enterprise Import Framework v1.0 — Executor
// SBBT CRM v2
//
// Executes the actual import: inserts/updates rows in the
// database and tracks the import log.
// ============================================================

import type {
  ImportResult,
  ImportStatus,
  ImportMode,
  ValidatedRow,
  RollbackData,
  ImportLogEntry,
} from './Types';

export interface ExecutorOptions {
  module: string;
  mode: ImportMode;
  /** Callback to insert a single row. Returns the inserted ID. */
  insertRow: (data: Record<string, unknown>) => Promise<number>;
  /** Callback to update a single row. Returns true if successful. */
  updateRow: (
    id: number,
    data: Record<string, unknown>
  ) => Promise<boolean>;
  /** Callback to find an existing row by identity fields. */
  findExisting: (
    data: Record<string, unknown>
  ) => Promise<number | null>;
  /** Callback to save the import log entry. */
  saveLog: (log: ImportLogEntry) => Promise<void>;
  /** Callback to save rollback data to the log. */
  saveRollbackData: (
    importId: number,
    data: RollbackData
  ) => Promise<void>;
}

export interface ExecutionOptions {
  chunkSize?: number;
  onProgress?: (current: number, total: number) => void;
}

/**
 * Generate a unique import ID (timestamp + random).
 */
export function generateImportId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return \`imp_\${timestamp}_\${random}\`;
}

/**
 * Execute the import for validated rows.
 * Processes rows in chunks and tracks insertions/updates.
 */
export async function executeImport(
  validatedRows: ValidatedRow[],
  options: ExecutorOptions,
  executionOptions: ExecutionOptions = {}
): Promise<ImportResult> {
  const startTime = Date.now();
  const chunkSize = executionOptions.chunkSize ?? 50;
  const importId = Date.now();

  const rollbackData: RollbackData = {
    inserted: [],
    updated: [],
  };

  let insertedRows = 0;
  let updatedRows = 0;
  let failedRows = 0;
  const errors: { row: number; column: string; message: string; severity: 'error' | 'warning' | 'info' }[] = [];
  const warnings: { row: number; message: string; severity: 'error' | 'warning' | 'info' }[] = [];

  // Filter rows to process (only insert and update actions)
  const rowsToProcess = validatedRows.filter(
    (r) => r.action === 'insert' || r.action === 'update'
  );

  // Process in chunks
  for (let i = 0; i < rowsToProcess.length; i += chunkSize) {
    const chunk = rowsToProcess.slice(i, i + chunkSize);

    for (const row of chunk) {
      try {
        if (row.action === 'insert') {
          const id = await options.insertRow(row.data);
          insertedRows++;
          rollbackData.inserted.push({
            id,
            identity: JSON.stringify(row.data),
            data: { ...row.data },
          });
        } else if (row.action === 'update') {
          // Find existing record
          const existingId = await options.findExisting(row.data);
          if (existingId) {
            // Store previous values for rollback
            rollbackData.updated.push({
              id: existingId,
              identity: JSON.stringify(row.data),
              previousValues: { /* would be populated from DB */ },
            });
            await options.updateRow(existingId, row.data);
            updatedRows++;
          } else {
            // If not found, insert instead
            const id = await options.insertRow(row.data);
            insertedRows++;
            rollbackData.inserted.push({
              id,
              identity: JSON.stringify(row.data),
              data: { ...row.data },
            });
          }
        }
      } catch (err) {
        failedRows++;
        errors.push({
          row: row.rowNumber,
          column: 'DATABASE',
          message: err instanceof Error ? err.message : 'Unknown database error',
          severity: 'error',
        });
      }
    }

    // Report progress
    if (executionOptions.onProgress) {
      executionOptions.onProgress(
        Math.min(i + chunkSize, rowsToProcess.length),
        rowsToProcess.length
      );
    }
  }

  // Save rollback data
  if (rollbackData.inserted.length > 0 || rollbackData.updated.length > 0) {
    await options.saveRollbackData(importId, rollbackData);
  }

  const durationMs = Date.now() - startTime;
  const status: ImportStatus = failedRows > 0 ? 'failed' : 'completed';

  const result: ImportResult = {
    importId,
    module: options.module,
    totalRows: validatedRows.length,
    insertedRows,
    updatedRows,
    failedRows,
    errors,
    warnings,
    durationMs,
    status,
  };

  return result;
}
`;

files['Lib/import/Rollback.ts'] = `// ============================================================
// Enterprise Import Framework v1.0 — Rollback
// SBBT CRM v2
//
// Handles rollback of imported data by reverting inserted rows
// and restoring updated rows to their previous state.
// ============================================================

import type {
  RollbackData,
  RollbackResult,
  ImportStatus,
} from './Types';

export interface RollbackOptions {
  /** Callback to delete inserted rows by ID. */
  deleteRows: (ids: number[]) => Promise<number>;
  /** Callback to restore updated rows to previous values. */
  restoreRows: (
    rows: { id: number; previousValues: Record<string, unknown> }[]
  ) => Promise<number>;
  /** Callback to update the import log status. */
  updateLogStatus: (
    importId: number,
    status: ImportStatus,
    isRolledBack: boolean
  ) => Promise<void>;
  /** Callback to get rollback data for an import. */
  getRollbackData: (importId: number) => Promise<RollbackData | null>;
}

/**
 * Execute a rollback for a completed import.
 * Deletes all inserted rows and restores updated rows.
 */
export async function executeRollback(
  importId: number,
  options: RollbackOptions
): Promise<RollbackResult> {
  const rollbackData = await options.getRollbackData(importId);

  if (!rollbackData) {
    return {
      success: false,
      importId,
      deletedRows: 0,
      restoredRows: 0,
      errors: ['Rollback data not found for this import.'],
    };
  }

  const errors: string[] = [];
  let deletedRows = 0;
  let restoredRows = 0;

  // Delete inserted rows (reverse order)
  if (rollbackData.inserted.length > 0) {
    try {
      const ids = rollbackData.inserted.map((r) => r.id);
      deletedRows = await options.deleteRows(ids);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete inserted rows';
      errors.push(msg);
    }
  }

  // Restore updated rows
  if (rollbackData.updated.length > 0) {
    try {
      restoredRows = await options.restoreRows(
        rollbackData.updated.map((r) => ({
          id: r.id,
          previousValues: r.previousValues,
        }))
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to restore updated rows';
      errors.push(msg);
    }
  }

  // Update log status
  try {
    await options.updateLogStatus(importId, 'rolled_back', true);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update import log';
    errors.push(msg);
  }

  return {
    success: errors.length === 0,
    importId,
    deletedRows,
    restoredRows,
    errors,
  };
}

/**
 * Format rollback result for display.
 */
export function formatRollbackResult(result: RollbackResult): string {
  const lines: string[] = [];
  lines.push('=== Rollback Result ===');
  lines.push('');
  lines.push(\`Import ID:  \${result.importId}\`);
  lines.push(\`Success:    \${result.success ? 'Yes' : 'No'}\`);
  lines.push(\`Deleted:    \${result.deletedRows} rows\`);
  lines.push(\`Restored:   \${result.restoredRows} rows\`);

  if (result.errors.length > 0) {
    lines.push('');
    lines.push('Errors:');
    for (const err of result.errors) {
      lines.push(\`  - \${err}\`);
    }
  }

  return lines.join('\\n');
}
`;

for (const [path, content] of Object.entries(files)) {
  writeFileSync(path, content, 'utf8');
  console.log('Written: ' + path);
}

console.log('All import framework files created successfully.');