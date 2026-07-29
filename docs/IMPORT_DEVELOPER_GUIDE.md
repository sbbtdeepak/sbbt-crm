# Developer Guide

## SBBT CRM v2 — Universal Import/Export Engine

This guide is for developers who need to work with the Data Import Framework. It covers architecture, API reference, extending the engine, and troubleshooting.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Reference](#2-api-reference)
3. [Engine Internals](#3-engine-internals)
4. [Extending the Engine](#4-extending-the-engine)
5. [Testing Guide](#5-testing-guide)
6. [Error Handling](#6-error-handling)
7. [Performance Tuning](#7-performance-tuning)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Architecture Overview

### 1.1 Layers

```
┌─────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER                                              │
│ React Components (components/shared/)                           │
│   ImportModal, ImportButtonGroup, ImportDryRunPreview, etc.     │
│ All reusable. No module-specific code.                          │
├─────────────────────────────────────────────────────────────────┤
│ SERVER ACTION LAYER                                             │
│ app/dashboard/import/actions.ts                                 │
│ Orchestrates: validate → dry run → confirm → rollback           │
├─────────────────────────────────────────────────────────────────┤
│ ENGINE LAYER (lib/import/)                                       │
│ Pure logic. No React. No Next.js specific imports.              │
│ engine.ts, excel.ts, rollback.ts, duplicate-detector.ts, etc.   │
├─────────────────────────────────────────────────────────────────┤
│ CONFIGURATION LAYER (lib/import/configs/)                        │
│ ModuleConfig objects. One file per module.                      │
│ This is the ONLY layer that grows when adding new modules.      │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

```
Client                       Server                         Database
  │                            │                               │
  ├─ Upload .xlsx ────────────►│                               │
  │                            ├─ security-validator.ts        │
  │                            ├─ excel.ts (parse)             │
  │                            ├─ duplicate-detector.ts        │
  │                            ├─ engine.dryRun()              │
  │◄─── DryRunResult ──────────┤                               │
  │                            │                               │
  ├─ Confirm Import ──────────►│                               │
  │                            ├─ engine.execute()             │
  │                            │  ├─ chunk-processor.ts        │
  │                            │  ├─ batchUpsert() ──────────► │
  │                            │  ├─ image-resolver.ts         │
  │                            │  └─ rollback.ts (snapshot)    │
  │◄─── ImportResult ──────────┤                               │
  │                            │                               │
  ├─ Rollback ────────────────►│                               │
  │                            ├─ engine.rollback() ─────────► │
  │◄─── RollbackResult ────────┤                               │
```

### 1.3 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Config-driven, not code-driven | Adding a module = adding a config file. No engine changes ever. |
| Streaming Excel parser | Memory safe for 10,000+ rows. Never loads entire file. |
| Dry run before write | Admin sees exactly what will happen. Zero surprises. |
| Chunk-based processing | 100 rows per chunk. Failed chunks don't block remaining. |
| Transaction per chunk | Each chunk is atomic. Partial imports are valid. |
| Rollback via snapshot | Previous state captured before any write. Safe restore. |
| Round-trip export | Export → Edit → Import = zero data loss. Same template format. |

---

## 2. API Reference

### 2.1 Public API (`lib/import/index.ts`)

All external code should import from this single entry point.

```typescript
// ── Engine ──
importEngine.parseExcel(buffer: Buffer): ParsedRow[]
importEngine.validate(rows: ParsedRow[], config: ModuleConfig): ValidatedRows
importEngine.dryRun(validated: ValidatedRows, config: ModuleConfig, mode: ImportMode): DryRunResult
importEngine.execute(dryRunResult: DryRunResult, userId: string): Promise<ImportResult>
importEngine.rollback(importId: number, userId: string): Promise<RollbackResult>

// ── Excel ──
generateTemplate(config: ModuleConfig): Buffer
exportModuleData(module: string): Promise<Buffer>
exportReport(importId: number, format: "pdf" | "xlsx"): Promise<Buffer>

// ── Config Registry ──
getConfig(module: string): ModuleConfig
getAllModules(): ModuleConfig[]
validateModule(module: string): boolean
getModuleNames(): string[]

// ── Types ──
ModuleConfig, ColumnConfig, ImageFieldConfig, RelationConfig
ImportMode, ImportStatus, ImportError, ImportWarning
DryRunResult, ImportResult, RollbackResult, ImportLogEntry
ProgressInfo, ChunkResult, DuplicateResult, MissingImage
```

### 2.2 Server Actions (`app/dashboard/import/actions.ts`)

```typescript
// All server actions are "use server"

// ── Template Download ──
async function downloadTemplate(module: string): Promise<Blob>
// Returns .xlsx buffer. Sheet 1: Instructions. Sheet 2: Empty template.
// Throws: ModuleNotFoundError

// ── Upload & Dry Run ──
async function uploadAndDryRun(formData: FormData): Promise<DryRunResult>
// formData: { file: File, module: string, importMode: string }
// Validates file → parses → validates rows → detects duplicates → dry run
// Saves to import_logs with status='dry_run'
// Returns complete DryRunResult with classifications

// ── Confirm Import ──
async function confirmImport(importId: number): Promise<ImportResult>
// Loads dry run result → verifies ownership → executes import
// Chunked processing with progress tracking
// Returns ImportResult with insert/update/skip/fail counts

// ── Rollback ──
async function rollbackImport(importId: number): Promise<RollbackResult>
// Verifies it's latest non-rolled-back import → executes rollback
// Returns RollbackResult with restored count

// ── Export ──
async function exportModuleData(module: string): Promise<Blob>
// Queries all records → transforms to template format → generates .xlsx

// ── Import History ──
async function getImportHistory(module: string): Promise<ImportLogEntry[]>
async function getImportDetail(importId: number): Promise<ImportLogEntry>

// ── Reports ──
async function downloadReport(importId: number, format: "pdf" | "xlsx"): Promise<Blob>
```

---

## 3. Engine Internals

### 3.1 `engine.ts` — parseExcel()

```typescript
function parseExcel(buffer: Buffer): ParsedRow[] {
  // 1. Read metadata row (Row 1)
  //    Extract: TEMPLATE_VERSION, MODULE, TEMPLATE_DATE, CRM_VERSION
  //
  // 2. Validate metadata
  //    - TEMPLATE_VERSION must exist
  //    - Major version must match (e.g. 1.x.x compatible with 1.x.x)
  //    - Throw VersionMismatchError if incompatible
  //
  // 3. Read header row (Row 2)
  //    - Map columns by label → field name
  //    - Check all required columns present
  //    - Warn on extra unknown columns
  //    - Throw MissingColumnError if required missing
  //
  // 4. Read data rows (Row 3+)
  //    - Skip completely blank rows
  //    - Read each cell, convert to typed value
  //    - Collect row-level parse errors
  //    - Stop at first completely empty row (end of data)
  //
  // 5. Return ParsedRow[]
  //    ParsedRow = { rowNumber, cells: Record<string, CellValue>, errors?: string[] }
}
```

### 3.2 `engine.ts` — validate()

```typescript
function validate(rows: ParsedRow[], config: ModuleConfig): ValidatedRows {
  // For each row:
  //   1. Required fields: non-empty check
  //   2. Type validation: text, integer, number, boolean, date, url, email, enum
  //   3. Length validation: minLength, maxLength
  //   4. Range validation: min, max for numbers
  //   5. Pattern validation: regex pattern
  //   6. Enum validation: must be one of allowed values
  //   7. Image validation: check extension, check storage existence
  //
  // Collect all errors with line numbers.
  // Row passes if zero errors.
  //
  // Also run duplicate-detector.ts:
  //   - Exact duplicates within file (error, skip)
  //   - Case-insensitive duplicates (warning)
  //   - Whitespace duplicates (warning)
  //   - Near duplicates via Levenshtein distance (warning)
  //   - Slug duplicates (warning)
  //
  // Return: { valid: Row[], errors: RowError[], warnings: Warning[] }
}
```

### 3.3 `engine.ts` — dryRun()

```typescript
function dryRun(
  validated: ValidatedRows,
  config: ModuleConfig,
  mode: ImportMode
): DryRunResult {
  // For each valid row:
  //   1. Query database for identity match
  //      identityFields from config (e.g. ["name"])
  //      Normalize: case-insensitive, trim, slug comparison
  //
  //   2. Classify based on mode:
  //      Mode            | Identity Match | Identity No Match
  //      ───────────────┼────────────────┼───────────────────
  //      INSERT_ONLY    | ⏭️ SKIP        | 🟢 INSERT
  //      UPDATE_ONLY    | 🔄 UPDATE      | ⏭️ SKIP
  //      UPSERT         | 🔄 UPDATE      | 🟢 INSERT
  //
  //   3. If UPDATE: fetch existing data for rollback snapshot
  //   4. If image field: check storage for filename
  //      - Found: store public URL (for actual import)
  //      - Missing: add warning, row marked as partial
  //
  //   5. For nested data (if relations exist):
  //      - Apply transformer.parse() on nested cell
  //      - Validate nested structure
  //      - Collect nested errors
  //
  //   6. Generate DryRunResult
  //      - Summary: total, valid, error, willInsert, willUpdate, willSkip
  //      - Row details: rowNumber, action, reason, errors, warnings
  //      - Image summary: found, missing, missingImages[]
  //      - Duplicate summary: total, details[]
  //
  //   7. Save to import_logs (status = 'dry_run')
  //      - Store DryRunResult as JSONB
  //      - Generate importId for confirm step
  //
  //   8. Return DryRunResult
}
```

### 3.4 `engine.ts` — execute()

```typescript
function execute(
  dryRunResult: DryRunResult,
  userId: string
): Promise<ImportResult> {
  // 1. Verify import_logs status is 'dry_run'
  // 2. Verify import is not expired (> 1 hour = expired)
  // 3. Verify current user is the creator
  //
  // 4. Prepare rollback snapshot:
  //    - For each row classified as UPDATE: capture current DB values
  //    - Store in previous_data
  //
  // 5. Process in chunks (chunk-processor.ts):
  //    ChunkConfig { chunkSize: 100, maxRows: 10000, timeoutMs: 300000 }
  //
  //    For each chunk:
  //    a. Begin transaction
  //    b. For INSERT rows: INSERT INTO table, capture returned IDs
  //    c. For UPDATE rows: UPDATE WHERE identity matches
  //    d. For nested data: INSERT/UPDATE child tables with parent FK
  //    e. For images: UPDATE image_url fields with resolved URLs
  //    f. Commit transaction
  //    g. Report progress via callback
  //    h. Log errors for failed rows (do not stop chunk)
  //
  //    Progress callback receives: ProgressInfo = {
  //      chunk, totalChunks, rowsProcessed, totalRows,
  //      inserted, updated, failed, estimatedMsRemaining
  //    }
  //
  // 6. Update import_logs:
  //    - status = 'completed'
  //    - inserted_rows, updated_rows, failed_rows
  //    - previous_data = rollback snapshot
  //    - duration_ms
  //    - completed_at = now()
  //
  // 7. revalidatePath() for module
  //
  // 8. Return ImportResult
}
```

### 3.5 `engine.ts` — rollback()

```typescript
function rollback(importId: number, userId: string): Promise<RollbackResult> {
  // 1. Load import_logs record
  // 2. Verify status is 'completed'
  // 3. Verify is_rolled_back is false
  // 4. Verify it's the latest non-rolled-back import for this module
  // 5. Verify current user has permission
  //
  // 6. Execute rollback:
  //    a. For INSERTED rows:
  //       - DELETE FROM table WHERE id IN (insertedIds)
  //       - For nested data: CASCADE DELETE handles children
  //    b. For UPDATED rows:
  //       - UPDATE table SET previousValues WHERE id = updatedId
  //       - Only restore fields that were changed by import
  //       - Preserve fields manually edited AFTER import
  //         (check updated_at > import completed_at)
  //    c. Do NOT delete uploaded images (only DB references)
  //
  // 7. Mark import_logs:
  //    - is_rolled_back = true
  //    - rolled_back_at = now()
  //    - rolled_back_by = userId
  //
  // 8. revalidatePath() for module
  //
  // 9. Return RollbackResult: { deleted, restored, skipped, message }
}
```

---

## 4. Extending the Engine

### 4.1 Adding a new validation type

1. Add new `ColumnType` value in `types.ts` (e.g. `"phone"`)
2. Add validation logic in `engine.ts` validate() switch statement
3. Add Excel cell conversion in `excel.ts` if needed

Example:

```typescript
// types.ts
type ColumnType = "text" | "integer" | "number" | "boolean" | "date" | "url" | "email" | "enum" | "nested" | "image" | "phone";

// engine.ts — validate()
case "phone": {
  const phoneRegex = /^\+?[\d\s\-\(\)]{7,15}$/;
  if (value && !phoneRegex.test(String(value))) {
    errors.push({ row, column, message: "Phone number format is invalid" });
  }
  break;
}
```

### 4.2 Adding a new import mode

1. Add value to `ImportMode` type in `types.ts`
2. Add classification logic in `engine.ts` dryRun()
3. Add UI option in `ImportModeSelector.tsx`

### 4.3 Adding a new duplicate detection type

1. Add detection function in `duplicate-detector.ts`
2. Add type to `DuplicateType` union
3. Call new function in `engine.ts` validation phase

### 4.4 Customizing template format

Override `template-generator.ts` behavior per module by adding optional methods to `ModuleConfig`:

```typescript
interface ModuleConfig {
  // ... existing fields ...
  customTemplate?: {
    sheetName?: string;
    headerStyle?: "default" | "minimal";
    additionalSheets?: Array<{ name: string; data: unknown[] }>;
  };
}
```

---

## 5. Testing Guide

### 5.1 Unit Tests

Test each engine function independently:

```typescript
// test/lib/import/engine.test.ts

describe("parseExcel()", () => {
  it("parses valid template", () => { /* ... */ });
  it("rejects missing template version", () => { /* ... */ });
  it("rejects wrong module name", () => { /* ... */ });
  it("rejects missing required columns", () => { /* ... */ });
  it("skips blank rows", () => { /* ... */ });
  it("handles streaming large files", () => { /* ... */ });
});

describe("validate()", () => {
  it("validates required fields", () => { /* ... */ });
  it("validates text maxLength", () => { /* ... */ });
  it("validates integer min/max", () => { /* ... */ });
  it("validates boolean yes/no", () => { /* ... */ });
  it("validates date format", () => { /* ... */ });
  it("validates URL format", () => { /* ... */ });
  it("validates enum values", () => { /* ... */ });
  it("collects all errors per row", () => { /* ... */ });
});

describe("dryRun()", () => {
  it("classifies INSERT_ONLY correctly", () => { /* ... */ });
  it("classifies UPDATE_ONLY correctly", () => { /* ... */ });
  it("classifies UPSERT correctly", () => { /* ... */ });
  it("detects duplicates within file", () => { /* ... */ });
  it("detects duplicates against database", () => { /* ... */ });
  it("resolves image filenames", () => { /* ... */ });
});

describe("execute()", () => {
  it("inserts new records", () => { /* ... */ });
  it("updates existing records", () => { /* ... */ });
  it("handles nested data", () => { /* ... */ });
  it("creates rollback snapshot", () => { /* ... */ });
  it("reports progress correctly", () => { /* ... */ });
  it("handles chunk failures gracefully", () => { /* ... */ });
});

describe("rollback()", () => {
  it("deletes inserted rows", () => { /* ... */ });
  it("restores updated rows", () => { /* ... */ });
  it("preserves manual edits after import", () => { /* ... */ });
  it("rejects rollback of non-latest import", () => { /* ... */ });
  it("prevents double rollback", () => { /* ... */ });
});
```

### 5.2 Integration Tests

```typescript
// test/lib/import/integration.test.ts

describe("Full Import Flow", () => {
  it("download → fill → upload → dry run → confirm → verify", () => { /* ... */ });
  it("export → edit → reimport → round trip", () => { /* ... */ });
  it("import → rollback → verify restored state", () => { /* ... */ });
  it("import 10,000 rows within performance budget", () => { /* ... */ });
});
```

### 5.3 Test Fixtures

Create test Excel files in `test/fixtures/import/`:

```
test/fixtures/import/
├── valid-template.xlsx
├── missing-version.xlsx
├── wrong-module.xlsx
├── missing-columns.xlsx
├── formula-injection.xlsx
├── 10000-rows.xlsx
├── nested-data.xlsx
└── duplicate-names.xlsx
```

---

## 6. Error Handling

### 6.1 Error Types

```typescript
// lib/import/types.ts

class ImportError extends Error {
  constructor(
    message: string,
    public code: ImportErrorCode,
    public severity: "critical" | "error" | "warning",
    public row?: number,
    public column?: string
  ) {
    super(message);
    this.name = "ImportError";
  }
}

type ImportErrorCode =
  // File-level (critical — block entire import)
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "FORMULA_INJECTION_DETECTED"
  | "CSV_INJECTION_DETECTED"
  | "MALICIOUS_CONTENT"
  
  // Template-level (critical — block entire import)
  | "TEMPLATE_VERSION_MISMATCH"
  | "MODULE_MISMATCH"
  | "MISSING_REQUIRED_COLUMN"
  | "UNKNOWN_COLUMN"
  
  // Row-level (error — skip row)
  | "REQUIRED_FIELD_EMPTY"
  | "INVALID_DATA_TYPE"
  | "TEXT_TOO_LONG"
  | "NUMBER_OUT_OF_RANGE"
  | "INVALID_ENUM_VALUE"
  | "INVALID_DATE_FORMAT"
  | "INVALID_URL"
  | "INVALID_EMAIL"
  | "DUPLICATE_WITHIN_FILE"
  | "INVALID_IMAGE_FORMAT"
  
  // Row-level (warning — import with caution)
  | "DUPLICATE_CASE_INSENSITIVE"
  | "DUPLICATE_WHITESPACE"
  | "DUPLICATE_NEAR"
  | "DUPLICATE_SLUG"
  | "IMAGE_NOT_FOUND"
  | "TRUNCATED_FIELD"
  
  // Import-level (error — partial import)
  | "CHUNK_FAILED"
  | "DATABASE_ERROR"
  | "TIMEOUT"
  
  // Rollback-level
  | "NOT_LATEST_IMPORT"
  | "ALREADY_ROLLED_BACK"
  | "IMPORT_STILL_IN_PROGRESS"
  | "IMPORT_EXPIRED";
```

### 6.2 Error Collection Logic

```typescript
// All errors collected per-row, per-column
// Import continues even with errors
// Admin sees complete error report before deciding

const errorCollection = {
  critical: [],    // Blocks entire import (template mismatch, etc.)
  errors: [],      // Row-level (skips that row)
  warnings: [],    // Row-level (imports but warns admin)
};

// If any critical errors exist → import is blocked
// If only errors → import proceeds, error rows skipped
// If only warnings → import proceeds with warnings
```

---

## 7. Performance Tuning

### 7.1 Configuration

```typescript
// lib/import/chunk-processor.ts

export const DEFAULT_CHUNK_CONFIG: ChunkConfig = {
  chunkSize: 100,        // Rows per chunk (tune based on row complexity)
  maxRows: 10000,        // Maximum rows per import
  timeoutMs: 300000,     // 5 minutes max
  retryAttempts: 2,      // Retry failed chunks
  retryDelayMs: 1000,    // Delay between retries
};

// For complex modules (nested data), reduce chunk size:
// chunkSize: 50 — better for Packages with sections/items
// For simple modules, increase:
// chunkSize: 200 — safe for Brands, Testimonials
```

### 7.2 Batch Upsert Strategy

```typescript
// Instead of one query per row, batch queries:
// 1. Collect all rows for chunk
// 2. Query existing records in one SELECT (WHERE identity IN (...))
// 3. Split into INSERT batch and UPDATE batch
// 4. Execute INSERT batch (one query with multiple rows)
// 5. Execute UPDATE batch (one query per field set, or bulk UPDATE)
// 6. Handle nested data per parent ID

// For Supabase:
// INSERT: supabase.from(table).insert(rows) — supports array
// UPDATE: supabase.from(table).upsert(rows, { onConflict: identityFields })
```

### 7.3 Memory Management

```typescript
// Streaming Excel parser (excel.ts):
// - Never calls .toArray() on entire sheet
// - Uses row-by-row iterator
// - Processes and releases each row
// - JSON parse/stringify only for current chunk

// For 10,000 rows:
// - Parse phase: ~50MB memory (streaming)
// - Validation phase: ~100MB (all rows in memory for cross-row checks)
// - Dry run phase: ~150MB (with existing DB records)
// - Import phase: ~80MB (chunk-by-chunk)
```

### 7.4 Database Indexes

```sql
-- Required indexes for performance
CREATE INDEX IF NOT EXISTS idx_import_logs_module ON import_logs(module);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_by ON import_logs(created_by);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at ON import_logs(created_at DESC);

-- Module identity indexes (for duplicate detection)
-- One per module for identityFields
-- Example for brands:
CREATE INDEX IF NOT EXISTS idx_cms_brands_name ON cms_brands(name);
CREATE INDEX IF NOT EXISTS idx_cms_brands_name_lower ON cms_brands(LOWER(name));
```

---

## 8. Troubleshooting

### 8.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Import blocked: "Template version mismatch" | Admin uploaded template from older CRM version | Download fresh template from current CRM |
| Import blocked: "Missing required column" | Excel column header renamed or missing | Compare with official template headers |
| Rows skipped: "Duplicate within file" | Two identical rows in same file | Remove duplicate rows from Excel |
| Rows skipped: "Mode mismatch" | Row identity matches DB but mode is INSERT_ONLY | Switch to Upsert mode |
| Images not found: "Image file not found" | Wrong storage folder or filename | Upload images to correct folder, match filenames exactly |
| Import slow: "Processing chunks" | Large dataset with complex nesting | Adjust chunk size, check DB indexes |
| Rollback fails: "Not latest import" | Another import happened after this one | Rollback the latest import first |
| Memory error: "Out of memory" | File too large or too many rows | Reduce file size, increase chunk_size |

### 8.2 Debug Logging

```typescript
// Enable debug logging by setting environment variable:
// NEXT_PUBLIC_IMPORT_DEBUG=true

// Debug output (console.log in development, logger in production):
[Import] parseExcel: Reading file (size=2.4MB, rows=1500)
[Import] validate: Row 12 — field "price" = "free" → INVALID_NUMBER
[Import] validate: Row 12 — 2 errors, skipping row
[Import] dryRun: Row 2 — "Premium Package" → UPDATE (match ID=15)
[Import] dryRun: Row 3 — "Basic Package" → INSERT
[Import] dryRun: Summary — Insert: 20, Update: 3, Skip: 2, Error: 1
[Import] execute: Starting chunk 1/15 (rows 1-100)
[Import] execute: Chunk 1 — Insert: 18, Update: 2, Failed: 0 (1.2s)
[Import] execute: Completed in 4.2s. Inserted: 20, Updated: 3, Failed: 0
```

### 8.3 Rollback Debug

```typescript
[Rollback] Requested: Import #2847
[Rollback] Status check: completed, not rolled back ✅
[Rollback] Latest check: #2847 is latest for 'packages' ✅
[Rollback] Permission check: user owns import ✅
[Rollback] Executing: DELETE 20 inserted rows
[Rollback] Executing: RESTORE 3 updated rows
[Rollback] Completed: Deleted 20, Restored 3, Skipped 0
```

### 8.4 File Structure Checklist

When adding a new module, verify these files exist:

```
Required (engine unchanged):
✅ lib/import/configs/{module}.ts
✅ lib/import/configs/_index.ts (registration line added)

Optional (if needed):
⬜ lib/import/transformers/{module}.ts (nested data)

UI Components:
✅ app/dashboard/{module}/components/{Module}ImportBar.tsx

Existing (must NOT be modified):
✅ lib/import/engine.ts
✅ lib/import/excel.ts
✅ lib/import/types.ts
✅ lib/import/template-generator.ts
✅ lib/import/export.ts
✅ lib/import/rollback.ts
✅ lib/import/image-resolver.ts
✅ lib/import/chunk-processor.ts
✅ lib/import/duplicate-detector.ts
✅ lib/import/security-validator.ts
✅ lib/import/error-collector.ts
✅ components/shared/ImportModal.tsx
✅ components/shared/ImportButtonGroup.tsx
✅ components/shared/ImportDryRunPreview.tsx
✅ components/shared/ImportProgressBar.tsx
✅ components/shared/ImportResultScreen.tsx
✅ components/shared/ImportLogHistory.tsx
✅ components/shared/ImportModeSelector.tsx
✅ components/shared/ImportImagePreview.tsx
✅ components/shared/ImportMissingImagesList.tsx
✅ app/dashboard/import/actions.ts
```

---

## Appendix: Quick Reference

### Module Config Checklist

```typescript
export const myModuleConfig: ModuleConfig = {
  module: "myModule",                              // ✅ Unique identifier
  displayName: "My Module",                        // ✅ Human-readable
  version: "1.0.0",                                // ✅ Semantic version
  templateVersion: "1.0.0",                        // ✅ Match version major
  tableName: "cms_my_module",                      // ✅ Supabase table
  identityFields: ["name"],                        // ✅ Unique key fields
  defaultSiteId: "00000000-...",                   // ✅ Site UUID
  columns: [                                       // ✅ All DB columns
    { field: "name", label: "name*", required: true, type: "text" },
    // ...
  ],
  imageFields: [],                                 // ✅ If has images
  relations: [],                                   // ✅ If has nested data
  instructions: [{ key: "Module", value: "My Module Import" }], // ✅ Help text
};
```

### Column Type Quick Reference

```
ColumnType  Excel Format           Example               Validation
──────────  ─────────────────────  ────────────────────  ──────────────────
text        Free text              "Portland Cement"     maxLength, minLength
integer     Whole number           "42"                  0, 1, 2, ...
number      Decimal number         "1500000.50"          1500000.50
boolean     "yes" or "no"          "yes"                 yes/no, 1/0
date        DD/MM/YYYY             "26/07/2026"          Valid calendar date
url         http(s):// URL         "https://example.com" Starts with http(s)
email       email@domain.com       "info@sbbt.in"        Standard email regex
enum        One of list            "Cement"              Must be in config.enum[]
nested      Pipe-delimited         "Section|Item|..."    Uses transformer
image       Filename only          "logo.png"            Check extension + storage