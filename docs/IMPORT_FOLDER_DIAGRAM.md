# Data Import Framework — Folder Diagram

## SBBT CRM v2 — Universal Import/Export Engine

```
sbbt-crm/
│
├── Docs/
│   ├── BULK_IMPORT_ARCHITECTURE.md       # Main architecture document
│   ├── IMPORT_FLOW_DIAGRAM.md            # Visual flow diagram
│   ├── IMPORT_FOLDER_DIAGRAM.md          # This file
│   ├── IMPORT_MODULE_REGISTRATION.md      # Module registration guide
│   ├── IMPORT_DEVELOPER_GUIDE.md          # Developer guide
│   └── IMPORT_ADMIN_GUIDE.md              # Admin user guide
│
├── Supabase_v2/
│   └── 080_import_logs.sql               # Import audit trail table
│
├── Lib/
│   └── import/                            # ★ CORE IMPORT ENGINE
│       ├── index.ts                       # Public API — re-exports everything
│       │                                   # External code imports from here only
│       │                                   # import { importEngine, ... } from "@/lib/import"
│       │
│       ├── types.ts                       # All shared TypeScript interfaces
│       │   # ImportConfig, ModuleConfig, ColumnConfig, RelationConfig
│       │   # DryRunResult, ImportResult, ImportLogEntry, RollbackData
│       │   # ImportMode, ImportStatus, ImportError, ImportWarning
│       │   # ParsedRow, ValidatedRow, DryRunRow
│       │   # TemplateMetadata, VersionInfo, ImageFieldConfig
│       │   # ChunkResult, ProgressInfo
│       │
│       ├── engine.ts                      # ★ THE universal import engine
│       │   # Entry points:
│       │   #   importEngine.parseExcel(buffer)          → ParsedRow[]
│       │   #   importEngine.validate(rows, config)      → ValidatedRows
│       │   #   importEngine.dryRun(validated, config, mode) → DryRunResult
│       │   #   importEngine.execute(dryRunResult, userId)  → ImportResult
│       │   #   importEngine.rollback(importId, userId)     → RollbackResult
│       │   #
│       │   # Internal:
│       │   #   processChunk(rows, config, mode, snapshot)
│       │   #   batchUpsert(table, rows, identityFields)
│       │   #   handleNestedData(parentId, relations, data)
│       │   #   applyImportMode(row, mode, existing)
│       │   #   takeSnapshot(rows, existing) → RollbackData
│       │   #
│       │   # NOT CMS-specific. Works with any module config.
│       │
│       ├── excel.ts                       # Excel parser/generator
│       │   # parseExcel(buffer)              → ParsedWorkbook
│       │   #   - Reads metadata row (template version, module)
│       │   #   - Reads header row → column names
│       │   #   - Reads data rows → typed cells
│       │   #   - Streaming parser (memory safe)
│       │   #
│       │   # generateExcel(config, data)     → Buffer
│       │   #   - Sheet 1: Instructions from config
│       │   #   - Sheet 2: Metadata row + headers + data
│       │   #   - Applies column widths, styles
│       │   #
│       │   # Uses 'xlsx' or 'exceljs' library
│       │
│       ├── template-generator.ts           # Creates official .xlsx templates
│       │   # generateTemplate(config)       → Buffer
│       │   #   - Uses excel.ts internally
│       │   #   - Sheet 1: Instructions (from config.instructions)
│       │   #   - Sheet 2: Empty template with metadata + headers
│       │   #   - Returns downloadable file
│       │   #
│       │   # Template structure (Sheet 2, Row 1):
│       │   #   TEMPLATE_VERSION:1.0.0 | MODULE:packages | TEMPLATE_DATE:2026-07-28 | CRM_VERSION:v2.0.0
│       │   # Row 2: Column headers
│       │   # Row 3+: Empty (for admin to fill)
│       │
│       ├── export.ts                       # Exports CMS data → .xlsx
│       │   # exportModuleData(module)      → Buffer
│       │   #   - Queries all active records
│       │   #   - Transforms to template format
│       │   #   - Generates .xlsx with data
│       │   #
│       │   # Round-trip guaranteed:
│       │   # Export → Edit → Upload → Import = zero data loss
│       │
│       ├── image-resolver.ts               # Image filename → Storage URL
│       │   # resolveImage(filename, bucket, folder) → { url, found, warning }
│       │   # resolveMultipleImages(rows, imageFields) → resolved rows + missing list
│       │   # checkStorageFolder(folder) → { existing[], unused[], duplicates[] }
│       │   #
│       │   # Searches Supabase Storage for filename
│       │   # Returns public URL if found, warning if not
│       │
│       ├── rollback.ts                     # Import rollback logic
│       │   # rollbackImport(importId, userId) → RollbackResult
│       │   #   - Loads import_logs with previous_data
│       │   #   - Verifies it's the latest non-rolled-back import
│       │   #   - For INSERT_ONLY: DELETE rows by captured IDs
│       │   #   - For UPDATE_ONLY: RESTORE from previousValues
│       │   #   - For UPSERT: DELETE inserted + RESTORE updated
│       │   #   - Preserves manual edits (rows modified after import)
│       │   #   - Marks import_log as rolled_back
│       │   #   - revalidatePath()
│       │   #
│       │   # getRollbackInfo(importId) → { canRollback, reason, preview }
│       │
│       ├── error-collector.ts              # Error collection + formatting
│       │   # collectError(errors, row, column, message, severity)
│       │   # collectWarning(warnings, row, message)
│       │   # formatErrorReport(errors, warnings) → formatted string
│       │   # generateReport(dryRunResult, importResult) → ReportData
│       │   # exportReportAsPdf(reportData) → Buffer
│       │   # exportReportAsExcel(reportData) → Buffer
│       │
│       ├── duplicate-detector.ts           # ★ Smart duplicate detection
│       │   # detectDuplicates(rows, identityFields, existingRecords)
│       │   #   Returns: DuplicateResult[]
│       │   #     { row, matchedRow, field, type, severity }
│       │   #
│       │   # Detection types:
│       │   #   EXACT:     "Premium Package" === "Premium Package"
│       │   #   CASE:      "premium package" ≈ "Premium Package"
│       │   #   WHITESPACE:"Premium  Package" ≈ "Premium Package"
│       │   #   NEAR:      "Premium Pkg"     ≈ "Premium Package" (levenshtein)
│       │   #   SLUG:      "premium-package" ≈ "Premium Package"
│       │   #   FILENAME:  "logo.png"        ≈ "Logo.PNG"
│       │
│       ├── security-validator.ts            # File security validation
│       │   # validateFile(file) → { valid, error }
│       │   #   - Check MIME type (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
│       │   #   - Check file extension (.xlsx)
│       │   #   - Check file size (< 10MB)
│       │   #   - Check for formula injection (=, +, -, @ in cells)
│       │   #   - Check for CSV injection
│       │   #   - Check for XSS in cell values
│       │   #   - Reject before parsing if invalid
│       │   #
│       │   # sanitizeCellValue(value) → sanitized string
│       │   #  Strips leading =, +, -, @ that could be formula injection
│       │
│       ├── chunk-processor.ts              # Performance: chunk processing
│       │   # ChunkConfig { chunkSize: 100, maxRows: 10000, timeoutMs: 300000 }
│       │   # processInChunks(rows, config, mode, userId, onProgress)
│       │   #   - Splits rows into chunks of 100
│       │   #   - Processes each chunk in transaction
│       │   #   - Reports progress via callback
│       │   #   - Estimates remaining time
│       │   #   - Supports cancel via AbortController
│       │   #   - Failed chunks don't stop remaining
│       │   #
│       │   # ProgressInfo:
│       │   #   { chunk, totalChunks, rowsProcessed, totalRows,
│       │   #     inserted, updated, failed, estimatedMsRemaining }
│       │
│       └── configs/                        # ★ MODULE CONFIGURATIONS
│           ├── _index.ts                   # Module registry
│           │   # Maps module name → ModuleConfig
│           │   #   export const moduleRegistry = {
│           │   #     packages: packagesConfig,
│           │   #     testimonials: testimonialsConfig,
│           │   #     projects: projectsConfig,
│           │   #     // Future modules added here
│           │   #   };
│           │   #
│           │   #   export function getConfig(module: string): ModuleConfig
│           │   #   export function getAllModules(): ModuleConfig[]
│           │   #   export function validateModule(module: string): boolean
│           │
│           ├── packages.ts                 # Package module config
│           ├── testimonials.ts             # Testimonial module config
│           ├── projects.ts                 # Project module config
│           ├── brands.ts                   # (future)
│           ├── blogs.ts                    # (future)
│           ├── team.ts                     # (future)
│           ├── services.ts                 # (future)
│           ├── faq.ts                      # (future)
│           ├── gallery.ts                  # (future)
│           ├── awards.ts                   # (future)
│           ├── videos.ts                   # (future)
│           ├── careers.ts                  # (future)
│           ├── seo.ts                      # (future)
│           ├── homepage.ts                 # (future)
│           ├── company.ts                  # (future)
│           ├── leads.ts                    # (future)
│           ├── vendors.ts                  # (future)
│           ├── customers.ts                # (future)
│           └── inventory.ts               # (future)
│
├── components/
│   └── shared/
│       ├── ImportModal.tsx                 # ★ Reusable import modal
│       │   # Multi-step: Upload → Validate → Dry Run → Confirm → Result
│       │   # Props: { module, config, onComplete }
│       │   # States: idle, validating, dry_run, confirming, importing, complete, error
│       │   # Handles all modules — driven by config
│       │
│       ├── ImportButtonGroup.tsx           # ★ Reusable button group
│       │   # Props: { module, config }
│       │   # Buttons: [Download Template] [Import] [Export] [History]
│       │   # Used by all module pages
│       │
│       ├── ImportDryRunPreview.tsx         # Dry run results display
│       │   # Props: { dryRunResult, mode, onConfirm, onCancel }
│       │   # Shows: summary, errors, warnings, images, row table
│       │
│       ├── ImportProgressBar.tsx           # Real-time progress
│       │   # Props: { progress, onCancel }
│       │   # Shows: bar, % complete, estimated time, counters
│       │
│       ├── ImportResultScreen.tsx          # Post-import result
│       │   # Props: { result, onDone, onRollback }
│       │   # Shows: summary, download report (PDF/Excel), rollback btn
│       │
│       ├── ImportLogHistory.tsx            # Import history + rollback
│       │   # Props: { module }
│       │   # Shows: table of past imports, click for details
│       │   # Each row: ID, date, user, mode, rows, status, rollback btn
│       │
│       ├── ImportModeSelector.tsx          # Mode selection UI
│       │   # Props: { mode, onChange }
│       │   # Radio: Insert Only | Update Only | Upsert
│       │   # Description for each mode
│       │
│       ├── ImportImagePreview.tsx          # Image preview before import
│       │   # Props: { images }
│       │   # Shows: found images, missing images, unused images, duplicates
│       │
│       └── ImportMissingImagesList.tsx     # Missing images report
│           # Props: { missingImages }
│           # Shows: list of missing images with expected folder
│
├── app/
│   └── dashboard/
│       ├── import/
│       │   └── actions.ts                 # Server actions
│       │       # downloadTemplate(module)          → Blob
│       │       # uploadAndDryRun(formData)         → DryRunResult
│       │       # confirmImport(importId)           → ImportResult
│       │       # rollbackImport(importId)          → RollbackResult
│       │       # exportModuleData(module)          → Blob
│       │       # getImportHistory(module)          → ImportLogEntry[]
│       │       # getImportDetail(importId)         → ImportLogEntry
│       │       # downloadReport(importId, format)  → Blob (PDF or Excel)
│       │
│       ├── packages/
│       │   └── components/
│       │       └── PackageImportBar.tsx    # Module-specific wrapper
│       │           # <ImportButtonGroup module="packages" config={packagesConfig} />
│       │
│       ├── testimonials/
│       │   └── components/
│       │       └── TestimonialImportBar.tsx
│       │
│       └── projects/
│           └── components/
│               └── ProjectImportBar.tsx
│
└─── (Existing CMS module pages remain untouched)
```

## Key Design Principles

```
┌────────────────────────────────────────────────────────────────┐
│  LAYERED ARCHITECTURE                                          │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PRESENTATION LAYER                                      │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐           │  │
│  │  │ ImportModal│ │ImportBar.tsx│ │ImportHistory│           │  │
│  │  └────────────┘ └────────────┘ └────────────┘           │  │
│  │  (React components — All reusable)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SERVER ACTION LAYER                                    │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  app/dashboard/import/actions.ts                    │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ENGINE LAYER (lib/import/)                               │  │
│  │  ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │ engine.ts  │ │excel.ts  │ │rollback  │ │image-res.│  │  │
│  │  └────────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  │  ┌────────────┐ ┌──────────────┐ ┌────────────────────┐ │  │
│  │  │   types.ts │ │chunk-proc.ts │ │security-validator  │ │  │
│  │  └────────────┘ └──────────────┘ └────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CONFIGURATION LAYER (lib/import/configs/)               │  │
│  │  ┌──────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │  │
│  │  │_idx  │ │packages  │ │testimon. │ │ projects        │  │  │
│  │  └──────┘ └──────────┘ └──────────┘ └────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Future: brands, blogs, team, seo, company, ...    │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘

  ENGINE LAYER NEVER CHANGES when new modules are added.
  Only CONFIGURATION LAYER grows with each new module.
```

## File Count Summary

```
Layer                    Files          Lines (est.)
────────────────────────────────────────────────────
Config                   3 + N          ~30 + ~20N
Engine                   8              ~1,200
Shared Components        8              ~800
Server Actions           1              ~400
Module Wrappers          3              ~30
Migration                1              ~50
Documentation            6              ~1,500
────────────────────────────────────────────────────
Total Core (Phase 1)     ~20 files      ~3,000 lines
Per New Module           ~1 file        ~20 lines
```

## Import/Export Rules

```
Rule                               Violation
─────────────────────────────────────────────────────────────
Never edit engine.ts               ❌ Adding module-specific if/else
                                    ✅ Always use config-driven approach

Never edit excel.ts                ❌ Adding hardcoded column mapping
                                    ✅ Use config.columns[]

Never edit template-generator.ts   ❌ Adding custom template layout
                                    ✅ Use config.instructions + config.columns

Only add files in configs/         ❌ Duplicating validation for new module
                                    ✅ Create new config file only

Shared components never change     ❌ Adding module-specific props
                                    ✅ Use config object for all differences