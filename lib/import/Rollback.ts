// ============================================================
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
  lines.push(`Import ID:  ${result.importId}`);
  lines.push(`Success:    ${result.success ? 'Yes' : 'No'}`);
  lines.push(`Deleted:    ${result.deletedRows} rows`);
  lines.push(`Restored:   ${result.restoredRows} rows`);

  if (result.errors.length > 0) {
    lines.push('');
    lines.push('Errors:');
    for (const err of result.errors) {
      lines.push(`  - ${err}`);
    }
  }

  return lines.join('\n');
}
