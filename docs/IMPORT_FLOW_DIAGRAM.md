# Data Import Framework — Flow Diagram

## SBBT CRM v2 — Universal Import/Export Engine

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    DATA IMPORT FRAMEWORK                            │
│                    Universal Import/Export Engine                   │
│                                                                     │
│  NOT CMS-specific. Designed for any data module.                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

========================================================================
 COMPLETE FLOW: Download Template → Export → Import → Rollback
========================================================================

┌──────────────────┐
│   ADMIN LOGS IN   │
│   /dashboard      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│                    MODULE PAGE (e.g. Packages)                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Packages                                  [DOWNLOAD] [IMPORT] [EXPORT] [HISTORY] │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │  Existing CMS Data Table (CRUD remains untouched)    │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

         │
         ├───────────────────┬───────────────────┬──────────────────┐
         ▼                   ▼                   ▼                  ▼
  ┌──────────────┐   ┌──────────────┐    ┌──────────────┐   ┌──────────────┐
  │  DOWNLOAD    │   │   IMPORT     │    │   EXPORT     │   │   HISTORY    │
  │  TEMPLATE    │   │              │    │              │   │              │
  └──────┬───────┘   └──────┬───────┘    └──────┬───────┘   └──────┬───────┘
         │                  │                    │                  │
         ▼                  ▼                    ▼                  ▼
  ┌────────────────┐ ┌──────────────────┐ ┌────────────────┐ ┌──────────────────┐
  │ Generate .xlsx  │ │  Step 1: Upload  │ │ Query all      │ │ Show import logs │
  │ from config     │ │  .xlsx file     │ │ active records  │ │ table            │
  │                 │ │  Drag & Drop    │ │ from DB         │ │                  │
  │ Sheet 1:        │ │                 │ │                 │ │ Each row shows:  │
  │   Instructions  │ ▼                 │ │ Flatten nested  │ │ - Import ID      │
  │ Sheet 2:        │ ┌──────────────┐  │ │ data to Excel   │ │ - Date           │
  │   Template      │ │  Validate    │  │ │ format           │ │ - User           │
  │ (empty)         │ │  File Type   │  │ │                 │ │ - Mode           │
  │                 │ │  File Size   │  │ │ Generate .xlsx  │ │ - Rows           │
  │ Response:       │ │  Template    │  │ │ with template   │ │ - Status         │
  │ Blob → Download │ │  Version     │  │ │ format           │ │ - Rollback btn   │
  └────────────────┘ │  Module Match │  │ │                 │ │                  │
                      │  Columns      │  │ Response:        │ │ Click row:       │
                      └──────┬───────┘  │ Blob → Download  │ │ View details     │
                             │          └────────────────┘  │ Rollback option   │
                             ▼                              └──────────────────┘
                      ┌──────────────────┐
                      │  Step 2: Parse   │
                      │  Read cells      │
                      │  Convert types   │
                      │  Check required  │
                      │  Check length    │
                      └──────┬───────────┘
                             │
                             ▼
               ╔══════════════════════════════╗
               ║   Step 3: VALIDATE (per row) ║
               ╠══════════════════════════════╣
               ║                              ║
               ║  ┌─ Data Types              ║
               ║  ├─ Required Fields         ║
               ║  ├─ Length/Range            ║
               ║  ├─ Enum/Pattern            ║
               ║  ├─ Duplicate (file)        ║
               ║  │  ├─ Exact                ║
               ║  │  ├─ Near                 ║
               ║  │  ├─ Case-insensitive     ║
               ║  │  ├─ Whitespace           ║
               ║  │  └─ Slug                ║
               ║  ├─ Duplicate (database)    ║
               ║  ├─ Image filename resolve  ║
               ║  ├─ Format injection check  ║
               ║  └─ XSS/Formula/CSV inj.   ║
               ║                              ║
               ║  Errors → line-numbered     ║
               ║  Warnings → collected       ║
               ╚══════════════════╤═══════════╝
                                  │
                                  ▼
               ╔══════════════════════════════╗
               ║   Step 4: DRY RUN           ║
               ║   (Nothing written to DB)   ║
               ╠══════════════════════════════╣
               ║                              ║
               ║  For each valid row:         ║
               ║  ┌─ Query identity in DB    ║
               ║  ├─ Apply importMode filter  ║
               ║  ├─ Check image existence    ║
               ║  └─ Classify:               ║
               ║      NEW / UPDATED / SKIPPED ║
               ║                              ║
               ║  Save to import_logs         ║
               ║  (status = 'dry_run')        ║
               ║                              ║
               ╚══════════════════╤═══════════╝
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                    DRY RUN PREVIEW SCREEN                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Mode: [○ Insert Only] [○ Update Only] [● Upsert]         │ │
│  │                                                            │ │
│  │  Summary:                                                  │ │
│  │  Total: 25 │ Insert: 20 │ Update: 3 │ Skip: 2 │ Errors: 0 │ │
│  │                                                            │ │
│  │  ⚠ Warnings: 1 missing image, 3 case-insensitive dupes    │ │
│  │                                                            │ │
│  │  Row Details Table:                                        │ │
│  │  ┌─────┬──────────────┬──────────┬──────────────────────┐  │ │
│  │  │ Row │ Name         │ Action   │ Reason               │  │ │
│  │  ├─────┼──────────────┼──────────┼──────────────────────┤  │ │
│  │  │  2  │ Premium Pkg  │ 🔄 UPD   │ Name exists #15      │  │ │
│  │  │  3  │ Basic Pkg    │ 🟢 INS   │ New record           │  │ │
│  │  │  4  │ Basic Pkg    │ ⚠️ DUP  │ Near duplicate row 3  │  │ │
│  │  └─────┴──────────────┴──────────┴──────────────────────┘  │ │
│  │                                                            │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  Images: 5 found, 1 missing (premium-logo.png)     │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                            │ │
│  │  [← Back] [Cancel] [⚠ Import 25 Rows]                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
         │
         │ Admin clicks "Import"
         ▼
               ╔══════════════════════════════╗
               ║   Step 5: IMPORT            ║
               ║   (Writing to database)     ║
               ╠══════════════════════════════╣
               ║                              ║
               ║  ┌─ Chunk processing         ║
               ║  │  (100 rows per chunk)     ║
               ║  ├─ Batch upsert per chunk   ║
               ║  ├─ Snapshot for rollback    ║
               ║  ├─ Track progress           ║
               ║  │  ┌─ Progress bar          ║
               ║  │  ├─ Estimated time        ║
               ║  │  └─ Live counters         ║
               ║  ├─ Handle nested data       ║
               ║  │  (sections/items cascade) ║
               ║  ├─ Resolve image URLs       ║
               ║  ├─ revalidatePath()         ║
               ║  └─ Update import_logs       ║
               ║      status = 'completed'    ║
               ║                              ║
               ╚══════════════════╤═══════════╝
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                     IMPORT RESULT SCREEN                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ✅ Import Complete — Import ID: #2847                     │ │
│  │                                                            │ │
│  │  Duration: 4.2s                                           │ │
│  │  Inserted: 20 │ Updated: 3 │ Skipped: 2 │ Failed: 0       │ │
│  │                                                            │ │
│  │  ⚠ Warnings:                                               │ │
│  │  • Row 4: Near duplicate "Basic Pkg" skipped               │ │
│  │  • Row 12: Image "premium-logo.png" not found              │ │
│  │                                                            │ │
│  │  [📥 Download Report (PDF)]  [📥 Download Report (Excel)]  │ │
│  │  [↩ Rollback Import]  [✅ Done]                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
         │
         │ If admin clicks "Rollback" later
         ▼
┌──────────────────────────────────────────────────────────────────┐
│                      ROLLBACK CONFIRMATION                       │
│                                                                  │
│  ⚠ You are about to rollback Import #2847                       │
│                                                                  │
│  This will:                                                      │
│  • Delete 20 newly inserted records                             │
│  • Restore 3 updated records to previous values                 │
│  • NOT affect records manually edited after import              │
│  • NOT delete uploaded images (only DB references)              │
│                                                                  │
│  This action cannot be undone.                                   │
│                                                                  │
│  [Confirm Rollback]  [Cancel]                                   │
└──────────────────────────────────────────────────────────────────┘

========================================================================
                    EXPORT FLOW
========================================================================

┌──────────────────┐
│  Admin clicks    │
│  "Export"        │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│                       EXPORT ENGINE                              │
│                                                                  │
│  1. Look up module config from registry                          │
│  2. Query ALL active records from DB (no pagination limit)       │
│  3. For each record:                                             │
│     ┌─ Transform to template column order                       │
│     ├─ Flatten nested data (pipe-delimited format)              │
│     ├─ Format booleans → "yes"/"no"                             │
│     ├─ Format dates → DD/MM/YYYY                                │
│     └─ Sort by display_order                                    │
│  4. Generate .xlsx:                                              │
│     ┌─ Sheet 1: Instructions (from config.instructions)         │
│     └─ Sheet 2: Data (template header + metadata row + rows)    │
│  5. Return Blob                                                 │
│                                                                  │
│  Round-trip guaranteed:                                          │
│  Export → Edit in Excel → Import → Zero data loss               │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│  Browser downloads file: packages_export_2026-07-28.xlsx        │
│                                                                  │
│  Open in Excel → Edit → Save → Upload back → Import            │
│  Everything matches. No custom formats.                         │
└──────────────────────────────────────────────────────────────────┘

========================================================================
                 MODULE REGISTRATION (Adding a New Module)
========================================================================

┌──────────────────────────────────────────────────────────────────┐
│  Adding a new module requires ONLY:                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  1. CONFIG (lib/import/configs/{module}.ts)                │  │
│  │     ┌─ module name, displayName, version                   │  │
│  │     ├─ tableName, identityFields                            │  │
│  │     ├─ columns[] with types, validation rules               │  │
│  │     ├─ relations[] for nested data                          │  │
│  │     ├─ imageFields[] for image mapping                      │  │
│  │     └─ instructions[] for template sheet                    │  │
│  │                                                              │  │
│  │  2. TRANSFORMER (lib/import/transformers/{module}.ts)       │  │
│  │     Optional. Only for complex nested data.                  │  │
│  │     ┌─ Parses custom Excel cell format                      │  │
│  │     └─ Returns structured data for import                    │  │
│  │                                                              │  │
│  │  3. REGISTER (lib/import/configs/_index.ts)                 │  │
│  │     Add one line: {module}: {module}Config                   │  │
│  │                                                              │  │
│  │  No changes to: engine.ts, excel.ts, template-generator.ts, │  │
│  │  export.ts, rollback.ts, error-collector.ts, image-resolver │  │
│  │                                                              │  │
│  │  Adding Brands import = 45 lines total.                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

========================================================================
              CHUNK PROCESSING & PERFORMANCE
========================================================================

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Chunk Size: 100 rows                                      │  │
│  │  Max Rows: 10,000 (configurable)                           │  │
│  │  Max File: 10 MB                                            │  │
│  │  Timeout: 5 minutes (configurable)                          │  │
│  │                                                              │  │
│  │  Process:                                                    │  │
│  │                                                              │  │
│  │  Rows 1-100   → Batch upsert → Track → Next                │  │
│  │  Rows 101-200 → Batch upsert → Track → Next                │  │
│  │  ...                                                         │  │
│  │                                                              │  │
│  │  Each chunk is atomic (one transaction).                    │  │
│  │  If chunk fails → log error → continue to next chunk.       │  │
│  │  Failed chunks are reported in final result.                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Memory Safe: Streaming parser reads rows one at a time.        │
│  Never loads entire file into memory.                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘