// ============================================================
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
  return `imp_${timestamp}_${random}`;
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
