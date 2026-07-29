# Enterprise Import Framework v1.0

## SBBT CRM v2 — CMS Import/Export Engine

**Status:** Architecture Frozen — **NO CODE WRITTEN YET**
**Version:** Enterprise Import Framework v1.0
**Target Modules:** Packages, Testimonials, Projects (Phase 1)
**Future Modules:** Blogs, Brands, Team, Services, FAQ, Gallery, Awards, Videos, Careers, SEO, Homepage, Company
**Architecture:** Configuration-driven shared engine — zero per-module duplication
**Architecture Freeze:** This document is frozen. Do not change unless a new feature requires it.

---

# Table of Contents

1. [Updated Architecture](#1-updated-architecture)
2. [Updated Folder Structure](#2-updated-folder-structure)
3. [Updated Excel Template Specifications](#3-updated-excel-template-specifications)
4. [Updated Validation Rules](#4-updated-validation-rules)
5. [Image Mapping](#5-image-mapping)
6. [Import Modes](#6-import-modes)
7. [Dry Run Engine](#7-dry-run-engine)
8. [Rollback System](#8-rollback-system)
9. [Versioning System](#9-versioning-system)
10. [Enterprise Logging](#10-enterprise-logging)
11. [Server Actions](#11-server-actions)
12. [Security Review](#12-security-review)
13. [Smart Duplicate Detection](#13-smart-duplicate-detection)
14. [Nested Data Import/Export](#14-nested-data-importexport)
15. [Module Registration Guide](#15-module-registration-guide)
16. [Documentation Index](#16-documentation-index)
17. [Import Queue (Future Ready)](#17-import-queue-future-ready)
18. [Storage Manager](#18-storage-manager)
19. [Audit History (Per-Record)](#19-audit-history-per-record)
20. [Module Health Diagnostics](#20-module-health-diagnostics)
21. [Success Criteria](#21-success-criteria)

---

## 1. Updated Architecture

### 1.1 Core Principle: ONE Shared Engine, Configuration Per Module

There is **ONE** import engine. Each module is a **pure configuration object** — no per-module import code.

Adding a new module = adding a new config file (20 lines). Zero engine changes.

### 1.2 Engine Components

```
lib/
└── import/
    ├── index.ts                 # Public API re-exports
    ├── types.ts                 # All shared TypeScript interfaces
    ├── engine.ts                # THE shared engine (parse → validate → preview → import)
    ├── excel.ts                 # xlsx read/write (using 'xlsx' or 'exceljs' library)
    ├── image-resolver.ts        # Maps image_filename → Supabase Storage URL
    ├── template-generator.ts    # Creates official .xlsx from module config
    ├── export.ts                # Exports CMS data → .xlsx from module config
    ├── rollback.ts              # Import rollback logic
    ├── error-collector.ts       # Line-numbered error collection
    └── configs/
        ├── packages.ts          # Package module configuration
        ├── testimonials.ts      # Testimonial module configuration
        ├── projects.ts          # Project module configuration
        ├── blogs.ts             # (future)
        ├── brands.ts            # (future)
        ├── team.ts              # (future)
        └── _index.ts            # Module registry (maps module → config)
```

### 1.3 Module Configuration Object

Each module defines **everything** the engine needs via a single config:

```ts
// Example: lib/import/configs/packages.ts

export const packagesConfig: ModuleConfig = {
  // ── Identity ──
  module: "packages",
  displayName: "Packages",
  version: "1.0.0",                   // Module schema version
  templateVersion: "1.0.0",           // Template format version

  // ── Database ──
  tableName: "cms_packages",
  identityFields: ["name"],           // Fields that determine insert vs update
  defaultSiteId: "00000000-0000-0000-0000-000000000001",

  // ── Column Definitions ──
  columns: [
    { field: "name",            label: "package_name*",  required: true,  type: "text",    maxLength: 255 },
    { field: "price",           label: "price*",         required: true,  type: "number",  min: 0 },
    { field: "description",     label: "description",    required: false, type: "text",    maxLength: 5000 },
    { field: "display_order",   label: "display_order",  required: false, type: "integer", min: 0 },
    { field: "is_active",       label: "is_active",      required: false, type: "boolean", default: true },
    // Nested data handled by transformer (not a real DB column)
    { field: "_sections",       label: "sections",       required: false, type: "nested",  transformer: "packages.sections" },
  ],

  // ── Nested Data ──
  relations: [
    {
      type: "one_to_many",
      parentTable: "cms_packages",
      childTable: "cms_package_sections",
      childFK: "package_id",
      childColumns: ["title", "display_order"],
      grandchildTable: "cms_package_items",
      grandchildFK: "section_id",
      grandchildColumns: ["item", "brand", "specification", "remarks", "display_order"],
    },
  ],

  // ── Image Mapping ──
  imageFields: [],                   // Packages don't have logo fields

  // ── Duplicate Detection ──
  duplicateStrategy: "field_match",  // Use identityFields for match

  // ── Template Metadata ──
  instructions: [
    { key: "Module",        value: "Package Import" },
    { key: "Required",      value: "Fields marked with * are mandatory" },
    { key: "Duplicates",    value: "If package name exists → Update. Else → Create." },
    { key: "Sections",      value: "Semicolon-separated. Each: section|item|brand|spec|remarks" },
  ],
};
```

### 1.4 Shared Engine Flow (Same for ALL Modules)

```
engine.processUpload(file, moduleConfig, importMode)
│
├── PHASE 1: PARSE
│   ├── Read .xlsx
│   ├── Validate template version header
│   ├── Validate module name matches
│   ├── Validate all required columns exist
│   ├── Parse rows into typed objects
│   └── Return: ParsedRow[]
│
├── PHASE 2: VALIDATE
│   ├── Apply per-column validation rules from config
│   ├── Check duplicates within file (by identityFields)
│   ├── Check duplicates against database
│   ├── Resolve image filenames (image-resolver.ts)
│   ├── Collect errors with line numbers
│   └── Return: ValidatedRows (split into valid + errors)
│
├── PHASE 3: DRY RUN (Preview)
│   ├── For each valid row, simulate import:
│   │   ├── Check if identity exists in DB
│   │   ├── Classify: NEW / UPDATED / SKIPPED (mode mismatch)
│   │   └── Transform nested data
│   ├── Show preview to admin
│   └── Return: DryRunResult { new[], updated[], skipped[], errors[], warnings[] }
│
├── PHASE 4: IMPORT (on confirm)
│   ├── Apply importMode filter (INSERT_ONLY / UPDATE_ONLY / UPSERT)
│   ├── For each row:
│   │   ├── Upsert/Insert/Update parent row
│   │   ├── Handle nested relations (for packages)
│   │   ├── Resolve and attach image URLs
│   │   └── Track result
│   ├── Write to import_logs
│   ├── revalidatePath()
│   └── Return: ImportResult
│
└── PHASE 5: ROLLBACK (optional, later)
    └── engine.rollback(importId) → restores previous state
```

### 1.5 Adding a New Module (Future)

To add Brands import:

```ts
// lib/import/configs/brands.ts — That's it!

export const brandsConfig: ModuleConfig = {
  module: "brands",
  displayName: "Brands",
  version: "1.0.0",
  templateVersion: "1.0.0",
  tableName: "cms_brands",
  identityFields: ["name"],
  defaultSiteId: "00000000-0000-0000-0000-000000000001",
  columns: [
    { field: "name",          label: "name*",          required: true,  type: "text",    maxLength: 255 },
    { field: "category",      label: "category*",      required: true,  type: "text",    maxLength: 100 },
    { field: "website_url",   label: "website_url",    required: false, type: "url" },
    { field: "display_order", label: "display_order",  required: false, type: "integer", min: 0 },
    { field: "is_active",     label: "is_active",      required: false, type: "boolean", default: true },
  ],
  relations: [],
  imageFields: [
    { field: "logo_url", storageFolder: "brands", imageColumn: "logo_image_filename" },
  ],
  instructions: [
    { key: "Module",     value: "Brand Import" },
    { key: "Required",   value: "Fields marked with * are mandatory" },
    { key: "Duplicates", value: "If brand name exists → Update. Else → Create." },
    { key: "Images",     value: "Place logo files in 'imports/brands/' folder. Use filename in logo_image_filename column." },
  ],
};
```

Then register in `configs/_index.ts`:
```ts
export const moduleRegistry: Record<string, ModuleConfig> = {
  packages:     packagesConfig,
  testimonials: testimonialsConfig,
  projects:     projectsConfig,
  brands:       brandsConfig,     // Added
};
```

**No engine changes required. Ever.**

### 1.6 Database Plan

**Existing tables (no changes):**

| Module | Table | Identity Fields |
|--------|-------|-----------------|
| Packages | `cms_packages` + `cms_package_sections` + `cms_package_items` | `name` |
| Testimonials | `cms_testimonials` | `client_name` + `location` |
| Projects | `cms_projects` | `name` |
| Brands | `cms_brands` | `name` |
| Blogs | `cms_blogs` | `title` |

**One new table — `import_logs`:**

```sql
CREATE TABLE IF NOT EXISTS import_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',

  -- Module identity
  module TEXT NOT NULL,
  template_version TEXT NOT NULL DEFAULT '1.0.0',

  -- File info
  filename TEXT NOT NULL DEFAULT '',
  import_mode TEXT NOT NULL DEFAULT 'upsert',  -- insert_only | update_only | upsert

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  -- pending → validated → dry_run → importing → completed → failed → rolled_back

  -- Pre-import counts (from dry run)
  total_rows INTEGER NOT NULL DEFAULT 0,
  valid_rows INTEGER NOT NULL DEFAULT 0,
  error_rows INTEGER NOT NULL DEFAULT 0,
  skipped_rows INTEGER NOT NULL DEFAULT 0,

  -- Post-import counts
  inserted_rows INTEGER NOT NULL DEFAULT 0,
  updated_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,

  -- Dry run snapshot (JSON of what would happen)
  dry_run_result JSONB NOT NULL DEFAULT '{}',

  -- Error details
  errors JSONB NOT NULL DEFAULT '[]',
  -- [{ row: 5, column: "price", message: "Must be a number", severity: "error" }]

  warnings JSONB NOT NULL DEFAULT '[]',
  -- [{ row: 3, message: "Image file 'logo.png' not found in storage" }]

  -- Rollback support
  previous_data JSONB NOT NULL DEFAULT '{}',
  -- For UPSERT: snapshot of rows that were updated (before state)
  -- For INSERT_ONLY: list of inserted IDs
  -- For UPDATE_ONLY: nothing needed

  is_rolled_back BOOLEAN NOT NULL DEFAULT false,
  rolled_back_at TIMESTAMPTZ,
  rolled_back_by UUID,

  -- Performance
  duration_ms INTEGER NOT NULL DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID
);

CREATE INDEX IF NOT EXISTS idx_import_logs_module ON import_logs(module);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_by ON import_logs(created_by);
```

---

## 2. Updated Folder Structure

```
lib/
└── import/
    ├── index.ts                    # Public re-exports
    ├── types.ts                    # All TypeScript interfaces
    ├── engine.ts                   # THE shared engine
    ├── excel.ts                    # xlsx parser/generator
    ├── image-resolver.ts           # image_filename → Storage URL mapping
    ├── template-generator.ts       # Creates .xlsx from config
    ├── export.ts                   # CMS data → .xlsx from config
    ├── rollback.ts                 # Import rollback
    ├── error-collector.ts          # Error collection + formatting
    └── configs/
        ├── _index.ts               # Module registry
        ├── packages.ts             # Package module config
        ├── testimonials.ts         # Testimonial module config
        ├── projects.ts             # Project module config
        ├── brands.ts               # (future)
        ├── blogs.ts                # (future)
        ├── team.ts                 # (future)
        ├── services.ts             # (future)
        ├── faq.ts                  # (future)
        ├── gallery.ts              # (future)
        └── careers.ts              # (future)

app/dashboard/
├── packages/
│   └── components/
│       ├── PackageForm.tsx         # (existing — untouched)
│       ├── PackageList.tsx         # (existing — untouched)
│       └── PackageImportBar.tsx    # NEW — Download/Import/Export buttons + preview modal
│
├── testimonials/
│   └── components/
│       ├── TestimonialForm.tsx     # (existing — untouched)
│       ├── TestimonialList.tsx     # (existing — untouched)
│       └── TestimonialImportBar.tsx # NEW
│
├── projects/
│   └── components/
│       ├── ProjectForm.tsx         # (existing — untouched)
│       ├── ProjectList.tsx         # (existing — untouched)
│       └── ProjectImportBar.tsx    # NEW

components/shared/
├── ImportModal.tsx                 # Reusable import preview + confirm modal
├── ImportButtonGroup.tsx           # Reusable Download Template / Bulk Import / Export buttons
├── ImportDryRunPreview.tsx         # Dry run results display component
├── ImportLogHistory.tsx            # Import history + rollback UI
└── ImageUploader.tsx               # (existing — untouched)

Supabase_v2/
└── 080_import_logs.sql             # import_logs table migration
```

### Component Responsibility

| Component | Purpose | Reused? |
|-----------|---------|---------|
| `ImportButtonGroup` | Renders 3 buttons (Download / Import / Export) for any module | ✅ All modules |
| `ImportModal` | Multi-step modal: Upload → Dry Run Preview → Confirm → Result | ✅ All modules |
| `ImportDryRunPreview` | Shows new/updated/skipped/errors/warnings from dry run | ✅ All modules |
| `ImportLogHistory` | Shows past imports with rollback button | ✅ All modules |
| `PackageImportBar` | Wraps ImportButtonGroup with package-specific props | ❌ Module-specific |
| `TestimonialImportBar` | Wraps ImportButtonGroup with testimonial-specific props | ❌ Module-specific |
| `ProjectImportBar` | Wraps ImportButtonGroup with project-specific props | ❌ Module-specific |

---

## 3. Updated Excel Template Specifications

### 3.1 Template Header Row (All Modules)

Every template's Sheet 2 ("Template") has a **metadata row** in row 1 (before the column headers):

| Cell | Value | Purpose |
|------|-------|---------|
| A1 | `TEMPLATE_VERSION:1.0.0` | Engine checks this matches |
| B1 | `MODULE:packages` | Engine verifies correct template |
| C1 | `TEMPLATE_DATE:2026-07-28` | Shows when template was generated |
| D1 | `CRM_VERSION:v2.0.0` | Shows compatible CRM version |

Row 2 = Column headers (as specified below)
Row 3+ = Data rows

The engine **rejects** uploads if:
- `TEMPLATE_VERSION` is missing or incompatible
- `MODULE` doesn't match the target module
- Required columns are missing

### 3.2 Package_Template.xlsx

#### Sheet 1: "Instructions"

```
SBBT CRM — Package Import Template
───────────────────────────────────

Module:           Packages
Template Version: 1.0.0
CRM Version:      v2.0.0

REQUIRED FIELDS:  Fields marked with * are mandatory
DUPLICATE RULE:   If Package Name exists → Update. Else → Create.
IMAGES:           Place logo files in Supabase Storage "imports/brands/" folder.
                  Use filenames in the logo_image_filename column.

COLUMN GUIDE:
─────────────────────────────────────────────────────────────────────
package_name*       Unique package name. Max 255 characters.
price*              Numeric value. No currency symbols. E.g. 1500000
description         Text description. Max 5000 characters.
display_order       Numeric. Lower numbers appear first. Default: 0
is_active           "yes" or "no" (case-insensitive). Default: yes
sections            Nested data. Format below.

SECTIONS FORMAT:
Semicolon-separated. Each section: section|item|brand|specification|remarks
Multiple items in same section: repeat section name.

Example:
Structure|AAC Blocks|Magicrete|4"/6"|Included; Structure|Steel|JSW|Fe500|Included; Flooring|Vitrified Tiles|Kajaria|2x2ft|Included
```

#### Sheet 2: "Template"

| _metadata_row_ | TEMPLATE_VERSION:1.0.0 | MODULE:packages | TEMPLATE_DATE:2026-07-28 | CRM_VERSION:v2.0.0 |
|---|---|---|---|---|
| **package_name*** | **price*** | **description** | **display_order** | **is_active** | **sections** |
| Premium Package | 2500000 | Complete premium construction package. | 1 | yes | Structure\|AAC Blocks\|Magicrete\|4"/6"\|Included; Structure\|Steel\|JSW\|Fe500\|Included; Flooring\|Vitrified Tiles\|Kajaria\|2x2\|Included |
| Basic Package | 1500000 | Essential package for budget homes. | 2 | yes | Structure\|Bricks\|Local\|Standard\|Included; Flooring\|Vitrified Tiles\|Kajaria\|2x2\|Upgrade |
| (Example) Luxury Villa | 5000000 | High-end villa construction. | 0 | yes | Structure\|RCC\|UltraTech\|M25\|Included; Kitchen\|Modular\|Sleek\|Custom\|Premium |

### 3.3 Testimonial_Template.xlsx

#### Sheet 1: "Instructions"

```
SBBT CRM — Testimonial Import Template
───────────────────────────────────────

Module:           Testimonials
Template Version: 1.0.0
CRM Version:      v2.0.0

REQUIRED FIELDS:  Fields marked with * are mandatory
DUPLICATE RULE:   If Client Name + City exists → Update. Else → Create.

COLUMN GUIDE:
─────────────────────────────────────────────────────────────────────
client_name*       Name of the client. Max 100 characters.
location*          City/location. Max 100 characters.
rating*            Number between 1 and 5.
testimonial        Testimonial text. Max 2000 characters.
designation        Client's professional title. Max 100 characters.
project_name       Referred project name. Max 200 characters.
image_filename     Place photo in Supabase Storage "imports/testimonials/" folder.
                   Use this filename to auto-attach.
is_featured        "yes" or "no". Default: no.
display_order      Numeric. Lower numbers first.
```

#### Sheet 2: "Template"

| _metadata_row_ | TEMPLATE_VERSION:1.0.0 | MODULE:testimonials | TEMPLATE_DATE:2026-07-28 | CRM_VERSION:v2.0.0 |
|---|---|---|---|---|
| **client_name*** | **location*** | **rating*** | **testimonial** | **designation** | **project_name** | **image_filename** | **is_featured** | **display_order** |
| Rajesh Kumar | Bangalore | 5 | Excellent quality and timely delivery. | Homeowner | Green Valley Project | rajesh.png | yes | 1 |
| Priya Sharma | Mumbai | 4 | Good workmanship overall. | Architect | Ocean View Apartments | priya.jpg | no | 2 |
| (Example) Amit Singh | Pune | 5 | Highly professional team. | Builder | Luxury Villa Project | amit.png | yes | 0 |

### 3.4 Project_Template.xlsx

#### Sheet 1: "Instructions"

```
SBBT CRM — Project Import Template
───────────────────────────────────

Module:           Projects
Template Version: 1.0.0
CRM Version:      v2.0.0

REQUIRED FIELDS:  Fields marked with * are mandatory
DUPLICATE RULE:   If Project Name exists → Update. Else → Create.

COLUMN GUIDE:
─────────────────────────────────────────────────────────────────────
name*              Unique project name. Max 255 characters.
slug               URL-friendly. Auto-generated from name if empty.
client_name*       Client name. Max 100 characters.
location*          Project location. Max 200 characters.
project_type*      Residential | Commercial | Interior | Renovation
status*            planning | ongoing | completed | on_hold
short_description  Max 300 characters.
description        Max 10000 characters.
completion_date    DD/MM/YYYY format.
plot_area          E.g. "2400 sqft"
built_up_area      E.g. "1800 sqft"
floors             E.g. "2"
customer_rating    0-5, max 1 decimal.
project_value      E.g. "25 Lakh" or "2500000"
duration           E.g. "12 months"
team_size          E.g. "15"
cover_image_filename  Place image in "imports/projects/" folder.
is_active          "yes" or "no". Default: yes.
is_featured        "yes" or "no". Default: no.
display_order      Numeric. Lower numbers first.
```

#### Sheet 2: "Template"

| _metadata_row_ | TEMPLATE_VERSION:1.0.0 | MODULE:projects | TEMPLATE_DATE:2026-07-28 | CRM_VERSION:v2.0.0 |
|---|---|---|---|---|
| **name*** | **slug** | **client_name*** | **location*** | **project_type*** | **status*** | **short_description** | **completion_date** | **plot_area** | **built_up_area** | **floors** | **customer_rating** | **cover_image_filename** | **is_active** | **display_order** |
| Green Valley | green-valley | Rajesh Kumar | Bangalore | Residential | completed | Premium residential project | 15/01/2026 | 2400 sqft | 1800 sqft | 2 | 4.5 | green-valley.jpg | yes | 1 |
| Ocean Tower | ocean-tower | Priya Sharma | Mumbai | Commercial | ongoing | State-of-the-art commercial tower | | 5000 sqft | 12000 sqft | 10 | 0 | ocean-tower.png | yes | 2 |

---

## 4. Updated Validation Rules

### 4.1 Validation is Config-Driven

All validation comes from the `ModuleConfig.columns[]` definitions. The engine applies rules generically:

```ts
interface ColumnConfig {
  field: string;           // DB field name
  label: string;           // Excel column header
  required: boolean;       // Must not be empty
  type: ColumnType;        // Determines validation
  maxLength?: number;      // Text length limit
  minLength?: number;      // Min text length
  min?: number;            // Numeric minimum
  max?: number;            // Numeric maximum
  pattern?: RegExp;        // Regex pattern
  enum?: string[];         // Allowed values
  default?: unknown;       // Default value if empty
  transformer?: string;    // Pre-processing function name
  imageColumn?: string;    // For image fields: which Excel column has filename
  storageFolder?: string;  // For image fields: Supabase Storage folder
}
```

### 4.2 Global Validation Rules (Engine-Level)

| Rule | Error Message | Severity |
|------|--------------|----------|
| Blank row | Row X: Blank row detected. Skipped. | Warning |
| Template version mismatch | Template version X is incompatible. Expected Y. | Critical (block file) |
| Module name mismatch | Template is for module X, expected Y. | Critical (block file) |
| Missing required column | Required column "X" is missing. | Critical (block file) |
| Extra unknown column | Column "X" is not recognized for this module. | Warning |
| Duplicate within file | Row X: Duplicate "Y" detected in row Z (same file). | Error (skip row) |
| Duplicate in database | Row X: "Y" already exists in database (row ID: Z). | Info (will update) |

### 4.3 Per-Column Validation Rules (Config-Level)

| ColumnType | Validation Applied |
|------------|-------------------|
| `text` | Non-empty if required, maxLength check |
| `integer` | Must be whole number, min/max check |
| `number` | Must be numeric, min/max check, decimal precision |
| `boolean` | Must be "yes"/"no" or 1/0 (case-insensitive) |
| `date` | Must be DD/MM/YYYY format, must be valid calendar date |
| `url` | Must be valid URL format (http/https) |
| `email` | Must be valid email format |
| `enum` | Must be one of the allowed values |
| `nested` | Passed to transformer for custom parsing |
| `image` | Checks filename in storage, returns warning if missing |

### 4.4 Package-Specific Rules

| Field | Required | Type | Validation |
|-------|----------|------|------------|
| package_name | ✅ | text | Non-empty, max 255, unique |
| price | ✅ | number | Numeric, ≥ 0 |
| description | ❌ | text | Max 5000 |
| display_order | ❌ | integer | ≥ 0 |
| is_active | ❌ | boolean | "yes"/"no" default: yes |
| sections | ❌ | nested | Parsed via transformer. Each item: 5 pipe-separated parts |

**Sections Nested Validation:**
```
Format: section_name|item_name|brand|specification|remarks
Rules:
  - Each group must have exactly 5 pipe-separated parts
  - Groups separated by semicolon
  - section_name cannot be empty
  - item_name cannot be empty
  - brand can be empty (for generic items)
  - specification can be empty
  - remarks can be empty
  - Warning if section has only 1 item (might be incomplete)
```

### 4.5 Testimonial-Specific Rules

| Field | Required | Type | Validation |
|-------|----------|------|------------|
| client_name | ✅ | text | Non-empty, max 100 |
| location | ✅ | text | Non-empty, max 100 |
| rating | ✅ | integer | 1-5 |
| testimonial | ❌ | text | Max 2000 |
| designation | ❌ | text | Max 100 |
| project_name | ❌ | text | Max 200 |
| image_filename | ❌ | image | Checks Supabase Storage `imports/testimonials/` folder |
| is_featured | ❌ | boolean | "yes"/"no" default: no |
| display_order | ❌ | integer | ≥ 0 |

### 4.6 Project-Specific Rules

| Field | Required | Type | Validation |
|-------|----------|------|------------|
| name | ✅ | text | Non-empty, max 255, unique |
| slug | ❌ | text | Auto-generated from name if empty |
| client_name | ✅ | text | Non-empty, max 100 |
| location | ✅ | text | Non-empty, max 200 |
| project_type | ✅ | enum | Residential / Commercial / Interior / Renovation |
| status | ✅ | enum | planning / ongoing / completed / on_hold |
| short_description | ❌ | text | Max 300 |
| description | ❌ | text | Max 10000 |
| completion_date | ❌ | date | DD/MM/YYYY |
| plot_area | ❌ | text | Max 100 |
| built_up_area | ❌ | text | Max 100 |
| floors | ❌ | text | Max 50 |
| customer_rating | ❌ | number | 0-5, max 1 decimal |
| project_value | ❌ | text | Max 100 |
| duration | ❌ | text | Max 100 |
| team_size | ❌ | text | Max 100 |
| cover_image_filename | ❌ | image | Checks `imports/projects/` folder |
| is_active | ❌ | boolean | default: yes |
| is_featured | ❌ | boolean | default: no |
| display_order | ❌ | integer | ≥ 0 |
| meta_title | ❌ | text | Max 200 |
| meta_description | ❌ | text | Max 500 |

---

## 5. Image Mapping

### 5.1 Principle

Excel NEVER contains image files. Instead, a **filename reference** column maps to Supabase Storage.

### 5.2 Workflow

```
1. Admin places images in Supabase Storage folder:
   cms/imports/{module}/
   e.g. cms/imports/testimonials/
   e.g. cms/imports/projects/
   e.g. cms/imports/brands/

2. In Excel, admin references the filename:
   image_filename column: "rajesh.png"

3. During upload, engine resolves:
   "rajesh.png" → searches cms/imports/testimonials/rajesh.png
   → if found: stores public URL
   → if missing: adds warning, marks row as "partial"

4. After import:
   - Found images: automatically attached to record
   - Missing images: listed in warnings, admin can upload manually
```

### 5.3 Image Resolution Logic (image-resolver.ts)

```ts
async function resolveImage(
  filename: string,
  bucket: string,
  folder: string
): Promise<{ url: string | null; found: boolean; warning?: string }> {
  if (!filename || filename.trim() === "") {
    return { url: null, found: true }; // Optional — no warning
  }

  // Check if file exists in Supabase Storage
  const { data: files } = await supabase.storage
    .from(bucket)
    .list(`${folder}`, { search: filename });

  const match = files?.find(f => f.name === filename);

  if (match) {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(`${folder}/${filename}`);
    return { url: publicUrl, found: true };
  }

  return {
    url: null,
    found: false,
    warning: `Image file "${filename}" not found in storage folder "${folder}"`
  };
}
```

### 5.4 Image Column Configuration (in ModuleConfig)

```ts
imageFields: [
  {
    field: "logo_url",                // DB column to store the resolved URL
    storageFolder: "brands",          // Supabase Storage subfolder
    imageColumn: "logo_image_filename", // Excel column with filename
    required: false,                  // Images are optional
  },
  {
    field: "cover_image_url",
    storageFolder: "projects",
    imageColumn: "cover_image_filename",
    required: false,
  },
],
```

### 5.5 Missing Images Report (After Import)

```
⚠️  3 images could not be resolved:

Row 2: "rajesh.png" → not found in cms/imports/testimonials/
Row 5: "ocean-tower.jpg" → not found in cms/imports/projects/
Row 8: "logo.png" → not found in cms/imports/brands/

Upload these files to cms/imports/{module}/ and re-import to attach.
```

---

## 6. Import Modes

Admin chooses one of 3 modes before import:

### 6.1 INSERT_ONLY

```ts
{
  mode: "insert_only",
  behavior: "Only create new records. Skip rows that match existing records.",
  rules: [
    "If identityFields match existing row → SKIP (add to skipped list)",
    "If no match → INSERT new row",
    "Never modify existing data",
  ],
  ui: {
    button: "Insert Only (New Records)",
    icon: "➕",
    description: "Only add new records. Existing records are untouched.",
  },
}
```

### 6.2 UPDATE_ONLY

```ts
{
  mode: "update_only",
  behavior: "Only update existing records. Skip rows that don't match.",
  rules: [
    "If identityFields match existing row → UPDATE",
    "If no match → SKIP (add to skipped list)",
    "Never create new records",
  ],
  ui: {
    button: "Update Only (Existing Records)",
    icon: "✏️",
    description: "Only modify existing records. New rows are ignored.",
  },
}
```

### 6.3 UPSERT (Default)

```ts
{
  mode: "upsert",
  behavior: "Update if exists, create if not.",
  rules: [
    "If identityFields match existing row → UPDATE",
    "If no match → INSERT new row",
    "Standard merge behavior",
  ],
  ui: {
    button: "Upsert (Insert + Update)",
    icon: "🔄",
    description: "Create new records and update existing ones.",
  },
}
```

### 6.4 Mode Selection UI

```
┌──────────────────────────────────────────────────┐
│  Import Mode:                                     │
│                                                    │
│  ○ Insert Only   — Only new records               │
│  ○ Update Only   — Only existing records           │
│  ● Upsert        — Insert new + update existing   │
│                                                    │
│  [Next: Dry Run →]                                │
└──────────────────────────────────────────────────┘
```

### 6.5 Mode Applied in Dry Run

The dry run classifies each row based on the selected mode:

| Mode | Identity Match | Identity No Match |
|------|---------------|-------------------|
| INSERT_ONLY | ⏭️ Skipped (exists) | 🟢 Will Insert |
| UPDATE_ONLY | 🔄 Will Update | ⏭️ Skipped (new) |
| UPSERT | 🔄 Will Update | 🟢 Will Insert |

---

## 7. Dry Run Engine

### 7.1 Purpose

**Nothing is written to the database during dry run.** Admin sees exactly what will happen before confirming.

### 7.2 Dry Run Flow

```
engine.dryRun(file, moduleConfig, importMode)
│
├── 1. Parse Excel (same as Phase 1)
├── 2. Validate rows (same as Phase 2)
├── 3. Classify each valid row:
│     ├── Query database for identity match
│     ├── Apply importMode logic
│     ├── Transform nested data
│     ├── Resolve image filenames
│     └── Classify as: NEW / UPDATED / SKIPPED / ERROR / WARNING
└── 4. Return DryRunResult
```

### 7.3 Dry Run Result

```ts
interface DryRunResult {
  importId: string;           // Pre-generated ID for confirm step
  module: string;
  filename: string;
  importMode: "insert_only" | "update_only" | "upsert";

  // Summary counts
  totalRows: number;
  validRows: number;
  errorRows: number;

  // Classification
  willInsert: number;         // Rows that will be created
  willUpdate: number;         // Rows that will be modified
  willSkip: number;           // Rows that won't be touched
  warningCount: number;       // Non-blocking warnings

  // Row-level details
  rows: DryRunRow[];

  // Image resolution
  imagesFound: number;
  imagesMissing: number;
  missingImages: MissingImage[];

  // Nested data (for packages)
  nestedData?: NestedDataSummary;
}

interface DryRunRow {
  rowNumber: number;
  data: Record<string, unknown>;
  action: "insert" | "update" | "skip";
  reason: string;             // Why this action
  errors: string[];           // Row-level errors
  warnings: string[];         // Row-level warnings
  existingId?: number;        // If update: the existing row ID
}

interface MissingImage {
  rowNumber: number;
  filename: string;
  expectedFolder: string;
}

interface NestedDataSummary {
  totalSections: number;
  totalItems: number;
  sectionDetails: {
    packageName: string;
    sectionCount: number;
    itemCount: number;
  }[];
}
```

### 7.4 Dry Run Display (ImportDryRunPreview.tsx)

```
┌────────────────────────────────────────────────────────────────┐
│  DRY RUN PREVIEW — Packages Import                            │
│  Mode: Upsert │ File: packages.xlsx │ Import ID: #2847        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Summary:                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Total Rows:     25                                      │  │
│  │  ─────────────────────────                               │  │
│  │  🟢 Will Insert:  20 (new packages)                      │  │
│  │  🔄 Will Update:  3 (existing packages)                  │  │
│  │  ⏭️  Will Skip:    2 (mode mismatch)                     │  │
│  │  ❌ Errors:        0                                     │  │
│  │  ⚠️  Warnings:      1                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Images: 3 found, 1 missing                                   │
│  Nested: 45 sections, 180 items                               │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ⚠️  Warnings:                                             │  │
│  │  • Row 12: Image "premium-logo.png" not found            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Row Details:                                                  │
│  ┌─────┬──────────────────────┬─────────┬──────────────────┐  │
│  │ Row │ Package Name         │ Action  │ Reason           │  │
│  ├─────┼──────────────────────┼─────────┼──────────────────┤  │
│  │  2  │ Premium Package      │ 🔄 UPD  │ Name exists #15  │  │
│  │  3  │ Basic Package        │ 🟢 INS  │ New package      │  │
│  │  5  │ Luxury Villa         │ 🟢 INS  │ New package      │  │
│  │ ...│ ...                  │ ...     │ ...              │  │
│  └─────┴──────────────────────┴─────────┴──────────────────┘  │
│                                                                │
│  [Back] [Cancel] [⚠️ Import 25 Rows]                          │
└────────────────────────────────────────────────────────────────┘
```

---

## 8. Rollback System

### 8.1 Principles

- Every completed import creates a `previous_data` snapshot
- Admin can rollback the **LAST import only** per module
- Rollback restores previous state without affecting manually edited data
- Only the rows touched by the import are restored

### 8.2 Previous Data Snapshot

```ts
// Stored in import_logs.previous_data JSONB

// For INSERT_ONLY: snapshot = list of inserted IDs
{
  "inserted": [
    { "id": 45, "name": "Premium Package", "data": { ... full row data ... } },
    { "id": 46, "name": "Basic Package", "data": { ... } },
  ],
  "updated": [],
}

// For UPDATE_ONLY: snapshot = original values before update
{
  "inserted": [],
  "updated": [
    {
      "id": 15,
      "identity": { "name": "Premium Package" },
      "previousValues": { "price": 2000000, "description": "Old description", ... },
    },
  ],
}

// For UPSERT: snapshot = both inserted + updated
{
  "inserted": [
    { "id": 45, "name": "Basic Package", "data": { ... } },
  ],
  "updated": [
    {
      "id": 15,
      "identity": { "name": "Premium Package" },
      "previousValues": { "price": 2000000, ... },
    },
  ],
}
```

### 8.3 Rollback Flow

```
rollback.lastImport(module)
│
├── 1. Find latest completed import for module
│     SELECT * FROM import_logs
│     WHERE module = 'packages'
│     AND status = 'completed'
│     AND is_rolled_back = false
│     ORDER BY created_at DESC LIMIT 1
│
├── 2. Check eligibility
│     ├── Is it the latest non-rolled-back import? Yes
│     ├── Was it an INSERT_ONLY? → DELETE inserted rows
│     ├── Was it an UPDATE_ONLY? → Restore previousValues
│     └── Was it UPSERT? → DELETE inserted + restore updated
│
├── 3. Execute rollback
│     ├── For INSERTED rows: DELETE by ID
│     ├── For UPDATED rows: UPDATE with previousValues
│     ├── Do NOT touch rows edited AFTER the import
│     └── Track which rows were modified after import
│
├── 4. Mark as rolled back
│     UPDATE import_logs SET
│       is_rolled_back = true,
│       rolled_back_at = now(),
│       rolled_back_by = userId
│     WHERE id = importId
│
└── 5. revalidatePath()
```

### 8.4 Rollback Safety Rules

| Rule | Description |
|------|-------------|
| **Last import only** | Can only rollback the most recent completed import |
| **Manual edits preserved** | If a row was manually edited AFTER the import, that manual edit is preserved |
| **No double rollback** | Once rolled back, cannot rollback again |
| **Nested rollback** | For packages: rollback cascades to sections + items |
| **Image cleanup** | Rollback does NOT delete uploaded images (only DB references) |

### 8.5 Rollback UI (ImportLogHistory.tsx)

```
┌──────────────────────────────────────────────────────────────┐
│  Import History — Packages                                    │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  #2847 │ 28/07/2026 14:30 │ Upsert │ 25 rows │ ✅ Complete   │
│  #2842 │ 28/07/2026 10:15 │ Insert │ 12 rows │ 🔄 Rolled Back│
│  #2838 │ 27/07/2026 16:45 │ Upsert │ 8 rows  │ ✅ Complete   │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Selected: #2847                                      │      │
│  │  Inserted: 20 │ Updated: 3 │ Skipped: 2              │      │
│  │                                                        │      │
│  │  [📋 View Details]  [⚠️ Rollback This Import]        │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                │
│  ⚠️  Rollback will:                                            │
│  • Delete 20 newly inserted packages                          │
│  • Restore 3 packages to their previous values                │
│  • Cannot be undone                                            │
│                                                                │
│  [Confirm Rollback]  [Cancel]                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Versioning System

### 9.1 Template Version Header

Every .xlsx template has 4 metadata cells in row 1:

| Cell | Key | Value Example | Purpose |
|------|-----|---------------|---------|
| A1 | `TEMPLATE_VERSION` | `1.0.0` | Format version (changes if column structure changes) |
| B1 | `MODULE` | `packages` | Module identifier |
| C1 | `TEMPLATE_DATE` | `2026-07-28` | When template was generated |
| D1 | `CRM_VERSION` | `v2.0.0` | Compatible CRM version |

### 9.2 Version Compatibility Rules

```ts
interface VersionCheck {
  templateVersion: string;    // From cell A1
  moduleVersion: string;      // From config
  crmVersion: string;         // From package.json
  
  isCompatible(): boolean {
    // Template version must match module version (major version check)
    // e.g. 1.0.0 is compatible with 1.x.x
    // e.g. 2.0.0 is NOT compatible with 1.x.x (breaking change)
    return this.templateVersion.split('.')[0] === this.moduleVersion.split('.')[0];
  }
}
```

### 9.3 Version Rejection

If template version is incompatible:

```
❌ IMPORT BLOCKED

Template version mismatch:
  Template:    TEMPLATE_VERSION:0.5.0
  Expected:    1.x.x (compatible with current module)

This template was created for an older version of the CRM.
Please download a fresh template from the CMS.
```

### 9.4 Version Bump Triggers

| Change | Version Impact | Example |
|--------|---------------|---------|
| Add optional column | Minor bump | 1.0.0 → 1.1.0 |
| Add required column | Major bump | 1.0.0 → 2.0.0 |
| Remove column | Major bump | 1.0.0 → 2.0.0 |
| Change column type | Major bump | 1.0.0 → 2.0.0 |
| Change duplicate logic | Major bump | 1.0.0 → 2.0.0 |
| Fix instruction text only | Patch bump | 1.0.0 → 1.0.1 |

---

## 10. Enterprise Logging

### 10.1 Import Log Entry

Every import creates a complete audit record:

```ts
interface ImportLogEntry {
  // Identity
  id: number;
  siteId: string;

  // Module
  module: string;                    // "packages"
  templateVersion: string;           // "1.0.0"

  // File
  filename: string;                  // "packages_2026-07-28.xlsx"
  importMode: ImportMode;            // "insert_only" | "update_only" | "upsert"

  // Status
  status: ImportStatus;              // pending | validated | dry_run | importing | completed | failed | rolled_back

  // Pre-import counts
  totalRows: number;
  validRows: number;
  errorRows: number;
  skippedRows: number;

  // Post-import counts
  insertedRows: number;
  updatedRows: number;
  failedRows: number;

  // Dry run snapshot
  dryRunResult: DryRunResult;

  // Error tracking
  errors: ImportError[];             // [{ row, column, message, severity }]
  warnings: ImportWarning[];         // [{ row, message }]

  // Rollback
  previousData: RollbackData;        // Snapshot for rollback
  isRolledBack: boolean;
  rolledBackAt: Date | null;
  rolledBackBy: string | null;

  // Performance
  durationMs: number;                // Import duration in milliseconds

  // Audit
  createdAt: Date;
  completedAt: Date | null;
  createdBy: string;                 // User UUID
  updatedBy: string | null;
}
```

### 10.2 Import History View

Admin can view import history per module:

```
┌────────────────────────────────────────────────────────────────────────┐
│  IMPORT HISTORY — Packages                                             │
├──────┬───────────┬────────┬───────┬──────┬──────┬───────┬─────────────┤
│ #ID  │ Date      │ Mode   │ Total │ Ins  │ Upd  │ Dur.  │ Status      │
├──────┼───────────┼────────┼───────┼──────┼──────┼───────┼─────────────┤
│ 2847 │ 28/07 14:30│ Upsert│ 25   │ 20   │ 3    │ 2.1s  │ ✅ Complete │
│ 2842 │ 28/07 10:15│ Insert│ 12   │ 12   │ 0    │ 1.3s  │ 🔄 Rollback │
│ 2838 │ 27/07 16:45│ Upsert│ 8    │ 5    │ 2    │ 0.8s  │ ✅ Complete │
│ 2835 │ 27/07 11:20│ Insert│ 30   │ 0    │ 0    │ 0.2s  │ ❌ Failed   │
├──────┴───────────┴────────┴───────┴──────┴──────┴───────┴─────────────┤
│                                                                        │
│  Select an import to view details or rollback.                         │
│  [📥 Export History]  [📋 View #2847]  [↩️ Rollback #2847]            │
└────────────────────────────────────────────────────────────────────────┘
```

### 10.3 Import Log Fields for Query

| Query | Purpose |
|-------|---------|
| `WHERE module = 'packages'` | Filter by module |
| `WHERE status = 'completed'` | Find successful imports |
| `WHERE created_by = userId` | My imports only |
| `ORDER BY created_at DESC` | Recent first |
| `WHERE is_rolled_back = false` | Active (non-rolled-back) imports |

---

## 11. Server Actions

### 11.1 downloadTemplate(module: string)

```
Input:  module name
Flow:
  1. Look up config from moduleRegistry
  2. Validate user is authenticated
  3. Generate .xlsx via template-generator.ts
     - Sheet 1: Instructions (from config.instructions)
     - Sheet 2: Column headers + metadata row
  4. Return file buffer as Blob
Security:
  - Auth required
  - Module must exist in registry
```

### 11.2 uploadAndDryRun(formData: FormData)

```
Input:  formData { file, module, importMode }
Flow:
  1. Validate file (.xlsx, max 10MB)
  2. Parse Excel
  3. Validate template version header
  4. Validate module name matches
  5. Validate columns from config
  6. For each row:
     - Validate data types
     - Check duplicates (file + DB)
     - Resolve image filenames
     - Apply importMode classification
  7. Generate DryRunResult
  8. Save to import_logs (status = 'dry_run')
  9. Return DryRunResult to UI
Security:
  - Auth required
  - Import mode must be valid
  - No data written to CMS tables
```

### 11.3 confirmImport(importId: number)

```
Input:  importId (from dry run)
Flow:
  1. Load import_logs record
  2. Verify status = 'dry_run'
  3. Verify created_by = current user
  4. Verify age < 1 hour
  5. Execute import:
     - For INSERT: insert new rows, capture IDs for rollback
     - For UPDATE: snapshot previous values, then update
     - For UPSERT: combine both
     - For packages: handle nested sections/items
  6. Update import_logs:
     - status = 'completed'
     - inserted_rows, updated_rows, failed_rows
     - previous_data = rollback snapshot
     - duration_ms
  7. revalidatePath() for module
  8. Return ImportResult
Security:
  - Auth required
  - Import ownership check
  - Re-validate all rows before writing
```

### 11.4 rollbackImport(importId: number)

```
Input:  importId
Flow:
  1. Load import_logs record
  2. Verify status = 'completed' AND is_rolled_back = false
  3. Verify it's the latest non-rolled-back import for module
  4. Execute rollback:
     - DELETE inserted rows (capture IDs)
     - RESTORE updated rows from previousData
     - Handle nested data rollback
  5. Mark as rolled back:
     - is_rolled_back = true
     - rolled_back_at = now()
     - rolled_back_by = userId
  6. revalidatePath() for module
  7. Return rollback result
Security:
  - Auth required
  - Only latest import can be rolled back
```

### 11.5 exportModuleData(module: string)

```
Input:  module name
Flow:
  1. Look up config
  2. Query all active records from table
  3. Flatten nested data (packages → sections → items as pipe-delimited)
  4. Generate .xlsx with template format + data
  5. Return file buffer
Security:
  - Auth required
```

### 11.6 getImportHistory(module: string)

```
Input:  module name
Flow:
  1. Query import_logs WHERE module = module
  2. Order by created_at DESC
  3. Limit 50
  4. Return logs (without previousData for list view)
Security:
  - Auth required
```

### 11.7 getImportDetail(importId: number)

```
Input:  importId
Flow:
  1. Query import_logs WHERE id = importId
  2. Include full previousData for rollback UI
  3. Return full record
Security:
  - Auth required
```

---

## 12. Security Review

### 12.1 Threats Mitigated

| Threat | Mitigation |
|--------|-----------|
| Malicious Excel | Template version check, column validation, MIME check, max 10MB |
| XLSX macros | xlsx library reads only data cells |
| SQL injection | Supabase client (parameterized queries) |
| Unauthorized access | All actions require `supabase.auth.getUser()` |
| Mass data deletion | Import never DELETEs existing data (only INSERT/UPDATE) |
| Duplicate abuse | Identity deduplication prevents mass duplication |
| File DoS | Max 10MB, max 10,000 rows per import |
| Import tampering | Dry run shows exact changes before confirmation |
| Rollback abuse | Only latest import can be rolled back |
| Image injection | Filenames resolved from pre-defined Storage folder only |
| Version tampering | Template version header validated against module config |

### 12.2 Validation Layers

```
Layer 1: Client-Side (before upload)
├── File type (.xlsx only)
├── File size (< 10MB)
└── Optional: preview columns

Layer 2: Engine — Parse Phase
├── Template version compatibility
├── Module name validation
├── Column header validation (required/optional)
└── Row count limit

Layer 3: Engine — Validate Phase
├── Per-column type validation (from config)
├── Required field validation
├── Length/range validation
├── Pattern/enum validation
├── Duplicate detection (in-file)
├── Duplicate detection (against DB)
├── Image filename resolution
└── Nested data parsing

Layer 4: Engine — Import Phase (re-validate)
├── Re-check all rows before writing
├── Transactional per-row (error doesn't stop other rows)
├── Snapshot for rollback
└── Error collection with line numbers
```

### 12.3 Audit Trail (import_logs)

Every import creates:
- User who imported
- Timestamp
- Filename
- Module + version
- Import mode
- All counts (total/valid/error/inserted/updated/skipped/failed)
- Dry run snapshot
- Error details with row numbers
- Duration
- Rollback status

---

## 13. Smart Duplicate Detection

### 13.1 Purpose

Prevent data pollution by detecting near-duplicate records that differ only by case, whitespace, or typos. All detection is **configurable per module** via the `duplicateCheck` flag on column definitions.

### 13.2 Detection Types

| Type | Example A | Example B | Severity | Action |
|------|-----------|-----------|----------|--------|
| **EXACT** | "Premium Package" | "Premium Package" | Error | Skip row entirely |
| **CASE** | "premium package" | "Premium Package" | Warning | Import with warning |
| **WHITESPACE** | "Premium  Package" | "Premium Package" | Warning | Import with warning |
| **NEAR** | "Premium Pkg" | "Premium Package" | Warning | Import with warning |
| **SLUG** | "premium-package" | "Premium Package" | Warning | Import with warning |

### 13.3 Duplicate Classification

When a duplicate is detected, the system classifies it based on the import mode:

```
┌─────────────────────────────────────────────────────────────────┐
│  MODE            │ EXACT         │ NEAR/WARNING                │
├──────────────────┼───────────────┼─────────────────────────────┤
│  INSERT_ONLY     │ ⏭️ SKIP       │ ⏭️ SKIP (with warning)      │
│  UPDATE_ONLY     │ 🔄 UPDATE     │ 🔄 UPDATE (with warning)    │
│  UPSERT          │ 🔄 UPDATE     │ 🔄 UPDATE (with warning)    │
└─────────────────────────────────────────────────────────────────┘
```

### 13.4 Levenshtein Distance

The engine uses the Levenshtein distance algorithm for near-duplicate detection:

- **Distance 0** = EXACT match → Error (skip row)
- **Distance 1-3** = Very close → Warning (admin decides)
- **Distance 4+** = Different enough → No duplicate detected

The threshold is configurable: `MAX_LEVENSHTEIN_DISTANCE = 3` (default).

### 13.5 Duplicate Configuration

```typescript
// lib/import/configs/packages.ts
columns: [
  {
    field: "name",
    label: "package_name*",
    required: true,
    type: "text",
    maxLength: 255,
    duplicateCheck: true,  // ← Enables all duplicate detection
  },
  {
    field: "price",
    label: "price*",
    required: true,
    type: "number",
    duplicateCheck: false, // ← No duplicate check (numeric field)
  },
],
```

### 13.6 In-File Duplicate Detection

Before comparing against the database, the engine checks for duplicates **within the uploaded file itself**:

```
File uploaded:
  Row 3: "Premium Package"
  Row 4: "PREMIUM PACKAGE"       ← In-file duplicate (case)
  Row 5: "Premium  Package"      ← In-file duplicate (whitespace)
  Row 6: "Premium Package"       ← In-file exact duplicate
  Row 7: "Basic Package"

Results:
  Row 3: ✅ OK (first occurrence)
  Row 4: ⚠️ In-file duplicate: CASE difference with Row 3
  Row 5: ⚠️ In-file duplicate: WHITESPACE difference with Row 3
  Row 6: ❌ In-file exact duplicate with Row 3 (skip)
  Row 7: ✅ OK (unique)
```

### 13.7 Database Duplicate Detection

After in-file checks, remaining rows are compared against existing database records:

```
Database has:
  ID 12: "ACC Cement" (existing brand)

File row: "acc cement"

Detection:
  1. EXACT: "acc cement" !== "ACC Cement" → Not exact
  2. CASE: "acc cement" === toLowerCase("ACC Cement") → CASE duplicate
  3. Severity: Warning (not error)
  4. Action: Will UPDATE existing record #12 (if UPSERT mode)
```

### 13.8 Duplicate Report

The Dry Run shows all duplicates:

```
┌──────────────────────────────────────────────────────────────┐
│  DUPLICATE ANALYSIS                                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  In-File Duplicates:                                        │
│  • Row 4: "PREMIUM PACKAGE" — CASE match with Row 3        │
│  • Row 5: "Premium  Package" — WHITESPACE match with Row 3 │
│  • Row 6: "Premium Package" — EXACT match with Row 3        │
│    → Row 6 will be SKIPPED                                  │
│                                                              │
│  Database Duplicates:                                       │
│  • Row 8: "ACC Cement" — CASE match with DB record #12     │
│    → Will UPDATE record #12 (Upsert mode)                   │
│  • Row 12: "premium-pkg" — SLUG match with DB record #15   │
│    → Will UPDATE record #15 (Upsert mode)                   │
│                                                              │
│  Summary:                                                   │
│  In-file: 2 exact (skip), 2 warnings                        │
│  Database: 2 updates, 0 skips                               │
│                                                              │
│  [Download Duplicate Report]                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 14. Nested Data Import/Export

### 14.1 The Problem

Packages have a complex hierarchy: **Packages → Sections → Items**. An Excel cell must contain nested data that maps to multiple database tables.

### 14.2 Cell Format

Nested data uses pipe-delimited and semicolon-delimited format:

```
Section|Item|Brand|Spec|Remarks; Section|Item|Brand|Spec|Remarks; ...
```

**Example cell value:**

```
Structure|AAC Blocks|Magicrete|4"/6"|Included;
Flooring|Vitrified Tiles|Kajaria|2x2|Included;
Paint|Asian Paints|Apex|Exterior|Included;
Doors|Flush Doors|Century|7ft|Included
```

### 14.3 Parsing Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│  Raw Excel Cell                                                    │
│  "Structure|AAC Blocks|Magicrete|4\"/6\"|Included;                │
│   Flooring|Vitrified Tiles|Kajaria|2x2|Included"                  │
│                                                                    │
│  Step 1: Split by semicolons → groups                              │
│  ["Structure|AAC Blocks|Magicrete|4\"/6\"|Included",              │
│   "Flooring|Vitrified Tiles|Kajaria|2x2|Included"]               │
│                                                                    │
│  Step 2: Split each group by pipe → columns                        │
│  Group 1: ["Structure", "AAC Blocks", "Magicrete", "4\"/6\"", "Included"]
│  Group 2: ["Flooring", "Vitrified Tiles", "Kajaria", "2x2", "Included"]
│                                                                    │
│  Step 3: Map to structure                                          │
│  {                                                                 │
│    section: "Structure",                                          │
│    items: [                                                       │
│      { item: "AAC Blocks", brand: "Magicrete", spec: "4\"/6\"", remarks: "Included" }
│    ]                                                              │
│  },                                                               │
│  {                                                                 │
│    section: "Flooring",                                           │
│    items: [                                                       │
│      { item: "Vitrified Tiles", brand: "Kajaria", spec: "2x2", remarks: "Included" }
│    ]                                                              │
│  }                                                                 │
│                                                                    │
│  Step 4: Validate each section/item                               │
│  ✅ Section name: required                                        │
│  ✅ Item name: required                                           │
│  ⚠️ Brand: optional                                               │
│  ⚠️ Spec: optional                                                │
│  ⚠️ Remarks: optional                                             │
│                                                                    │
│  Step 5: Generate INSERT statements                               │
│  INSERT INTO cms_package_sections (package_id, title, display_order)
│    VALUES (pkg_id, 'Structure', 1)                                │
│    RETURNING id → section_id                                       │
│                                                                    │
│  INSERT INTO cms_package_items (section_id, item, brand, spec, remarks)
│    VALUES (section_id, 'AAC Blocks', 'Magicrete', '4\"/6\"', 'Included')
└─────────────────────────────────────────────────────────────────────┘
```

### 14.4 Transformer Registration

```typescript
// lib/import/configs/_index.ts

import { packagesSectionTransformer } from "../transformers/packages";

export const transformerRegistry: Record<string, Transformer> = {
  "packages.sections": packagesSectionTransformer,
  // Future transformers:
  // "testimonials.awards": testimonialsAwardsTransformer,
};

export function getTransformer(name: string): Transformer {
  const transformer = transformerRegistry[name];
  if (!transformer) {
    throw new Error(`Transformer "${name}" not found in registry`);
  }
  return transformer;
}
```

### 14.5 Validation Rules for Nested Data

```
┌──────────────────────────────────────────────────────────────┐
│  Nested Data Validation                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Section Level:                                             │
│  • Section name: required, non-empty                        │
│  • Section name must be unique within the package           │
│  • Invalid section → entire section skipped                 │
│                                                              │
│  Item Level:                                                │
│  • Item name: required, non-empty                           │
│  • Item name must be unique within the section              │
│  • Brand: optional                                          │
│  • Spec: optional                                           │
│  • Remarks: optional                                        │
│  • Invalid item → entire item skipped (section continues)   │
│                                                              │
│  Cross-Section:                                             │
│  • Same item can appear in different sections               │
│  • Same brand can appear across sections                    │
│  • Maximum 20 sections per package                          │
│  • Maximum 50 items per section                             │
└──────────────────────────────────────────────────────────────┘
```

### 14.6 Nested Data in Import Modes

| Mode | Parent | Sections | Items |
|------|--------|----------|-------|
| INSERT_ONLY | INSERT if new | INSERT all | INSERT all |
| UPDATE_ONLY | UPDATE if exists | DELETE old + INSERT new | DELETE old + INSERT new |
| UPSERT | INSERT/UPDATE | DELETE old + INSERT new | DELETE old + INSERT new |

**For nested data, the engine uses a "replace all" strategy:**
- Existing sections and items are deleted
- New sections and items are inserted
- This ensures consistency and avoids orphan records

### 14.7 Round-Trip Export

```
Export: DB → Excel cell

DB: cms_package_sections.title = "Structure"
    cms_package_items.item = "AAC Blocks"
    cms_package_items.brand = "Magicrete"
    cms_package_items.spec = "4\"/6\""
    cms_package_items.remarks = "Included"

→ Excel cell: "Structure|AAC Blocks|Magicrete|4\"/6\"|Included"

Import: Excel cell → DB

"Structure|AAC Blocks|Magicrete|4\"/6\"|Included"
→ cms_package_sections.title = "Structure"
  cms_package_items.item = "AAC Blocks"
  cms_package_items.brand = "Magicrete"
  cms_package_items.spec = "4\"/6\""
  cms_package_items.remarks = "Included"

✅ Zero data loss in round-trip
```

---

## 15. Module Registration Guide

### 15.1 Adding a New Module

Adding a new module requires exactly **3 code files** and **1 registration line**:

```
Step 1: Create config file
        lib/import/configs/{module}.ts

Step 2: Create transformer (only if nested data needed)
        lib/import/transformers/{module}.ts

Step 3: Register in _index.ts
        lib/import/configs/_index.ts

Step 4: Create wrapper component
        app/dashboard/{module}/components/{Module}ImportBar.tsx
```

### 15.2 Minimal Config Example

```typescript
// lib/import/configs/brands.ts
import { ModuleConfig } from "../types";

export const brandsConfig: ModuleConfig = {
  module: "brands",
  displayName: "Brands",
  version: "1.0.0",
  templateVersion: "1.0.0",
  tableName: "cms_brands",
  identityFields: ["name"],
  defaultSiteId: "00000000-0000-0000-0000-000000000001",
  columns: [
    { field: "name", label: "name*", required: true, type: "text", maxLength: 255, duplicateCheck: true },
    { field: "category", label: "category*", required: true, type: "text", maxLength: 100 },
    { field: "website_url", label: "website_url", required: false, type: "url", maxLength: 500 },
    { field: "display_order", label: "display_order", required: false, type: "integer", min: 0, default: 0 },
    { field: "is_active", label: "is_active", required: false, type: "boolean", default: true },
  ],
  imageFields: [
    {
      field: "logo_url",
      storageFolder: "brands",
      imageColumn: "logo_image_filename",
      required: false,
      supportedFormats: ["png", "jpg", "jpeg", "svg", "webp"],
      maxFileSize: 5 * 1024 * 1024,
    },
  ],
  relations: [],
  instructions: [
    { key: "Module", value: "Brand Import" },
    { key: "Required", value: "Fields marked with * are mandatory" },
  ],
  export: { maxRows: 10000, sortBy: "display_order", sortOrder: "asc" },
  import: { maxRows: 5000, chunkSize: 100 },
};
```

### 15.3 Registration

```typescript
// lib/import/configs/_index.ts
import { brandsConfig } from "./brands";

export const moduleRegistry: Record<string, ModuleConfig> = {
  packages: packagesConfig,
  testimonials: testimonialsConfig,
  projects: projectsConfig,
  brands: brandsConfig,  // ← Added
};
```

### 15.4 Effort Per Module

| Module | Config Lines | Transformer | Image Fields | Total Effort |
|--------|-------------|-------------|--------------|-------------|
| Brands | ~25 | No | 1 (logo) | ~15 min |
| Testimonials | ~35 | No | 1 (avatar) | ~15 min |
| Blogs | ~40 | No | 1 (cover) | ~15 min |
| Packages | ~50 | Yes (sections) | 0 | ~30 min |
| Projects | ~55 | No | 1 (cover) | ~15 min |
| SEO | ~20 | No | 0 | ~10 min |
| FAQ | ~20 | No | 0 | ~10 min |

**Adding any future module = 1 config file + 1 registration line.**

---

## 16. Documentation Index

All import/export architecture documentation:

| Document | Purpose | Audience |
|----------|---------|----------|
| [BULK_IMPORT_ARCHITECTURE.md](./BULK_IMPORT_ARCHITECTURE.md) | Main architecture document (this file) | Developers, Tech Leads |
| [IMPORT_FLOW_DIAGRAM.md](./IMPORT_FLOW_DIAGRAM.md) | Visual flow diagrams (ASCII art) | Developers, QA |
| [IMPORT_FOLDER_DIAGRAM.md](./IMPORT_FOLDER_DIAGRAM.md) | File structure with line counts | Developers |
| [IMPORT_MODULE_REGISTRATION.md](./IMPORT_MODULE_REGISTRATION.md) | How to add new modules (step-by-step) | Developers |
| [IMPORT_DEVELOPER_GUIDE.md](./IMPORT_DEVELOPER_GUIDE.md) | API reference, engine internals, testing | Developers |
| [IMPORT_ADMIN_GUIDE.md](./IMPORT_ADMIN_GUIDE.md) | How to use import/export as an admin | Administrators |

### Quick Links

- **I want to add a new module** → Read [Module Registration Guide](./IMPORT_MODULE_REGISTRATION.md)
- **I want to understand the flow** → Read [Flow Diagram](./IMPORT_FLOW_DIAGRAM.md)
- **I want to see file structure** → Read [Folder Diagram](./IMPORT_FOLDER_DIAGRAM.md)
- **I want to extend the engine** → Read [Developer Guide](./IMPORT_DEVELOPER_GUIDE.md)
- **I want to use the import** → Read [Admin Guide](./IMPORT_ADMIN_GUIDE.md)
- **I want to understand the architecture** → Read [Architecture](#1-updated-architecture) (this file)

---

## 17. Import Queue (Future Ready)

### 17.1 Purpose

Design the engine so that future imports can run as background jobs. This section documents the **extension point only** — the queue is **NOT implemented yet**.

### 17.2 Current vs Future

| Aspect | Current (v1.0) | Future (Queue) |
|--------|---------------|----------------|
| Execution | Synchronous request-response | Background worker |
| UI | Blocks until complete | Async with progress polling |
| File size limit | 10 MB | 50 MB |
| Row limit | 10,000 | 100,000 |
| Multiple imports | Sequential only | Parallel with per-module locks |
| User experience | Wait and see progress | Submit and get notified |

### 17.3 Queue Status Values

The `import_logs.status` field already supports these values:

```
pending         → File uploaded, not yet processed
queued          → Added to background queue (future)
processing      → Worker is processing (future)
completed       → Import finished successfully
failed          → Import failed with errors
rolled_back     → Import was rolled back
```

**Extension point:** The engine already writes to `import_logs`. When the queue is implemented, only the orchestration layer changes — the engine stays the same.

### 17.4 Queue Worker Interface (Future, Not Implemented)

```typescript
// lib/import/queue.ts — NOT IMPLEMENTED YET
// Extension point for background import queue

interface QueueWorker {
  // Add import to queue
  enqueue(importId: number, module: string, fileBuffer: ArrayBuffer): Promise<string>;

  // Get status
  getStatus(jobId: string): Promise<ImportStatus>;

  // Cancel if still queued
  cancel(jobId: string): Promise<boolean>;
}

/* Future Implementation Plan:
 *
 * 1. Add a `jobs` table or use Supabase pg_net for webhook-based workers
 * 2. Worker picks up queued jobs in FIFO order
 * 3. Processes import in chunks (100 rows at a time)
 * 4. Updates progress % in import_logs
 * 5. Sends in-app notification on completion
 * 6. Admin can view real-time progress from import history
 */
```

### 17.5 Queue States and Transitions

```
                  ┌─────────┐
                  │ PENDING │
                  └────┬────┘
                       │ (queue worker picks up)
                       ▼
                  ┌─────────┐
           ┌─────→│ QUEUED  │←────┐
           │      └────┬────┘     │
           │           │          │
      (admin        (worker      (retry
      cancels)      starts)      on failure)
           │           │          │
           │           ▼          │
           │      ┌──────────┐    │
           │      │PROCESSING│    │
           │      └────┬─────┘    │
           │           │          │
           │      ┌────┴────┐     │
           │      │         │     │
           │      ▼         ▼     │
           │  ┌────────┐ ┌──────┐ │
           │  │COMPLET │ │FAILED├─┘
           │  │  ED    │ └──────┘
           │  └────────┘
           │
           ▼
      ┌─────────────┐
      │  CANCELLED  │
      └─────────────┘
```

### 17.6 Impact on Sync Import (v1.0)

The synchronous import (v1.0) will always remain available. The queue is an **additional** option for large imports. Admins choose:

- **Small imports (< 100 rows):** Sync (instant)
- **Large imports (> 100 rows):** Queue (background)

No engine changes needed. Only orchestration layer changes.

---

## 18. Storage Manager

### 18.1 Official Storage Standard

All CMS file storage follows one unified structure under the `cms` bucket:

```
Bucket: cms
├── brands/           ← Brand logos (logo_url)
├── projects/         ← Project cover images (cover_image_url)
├── testimonials/     ← Client photos (image_url)
├── blogs/            ← Blog cover images (cover_image_url)
├── company/          ← Company logo, favicon
├── homepage/         ← Hero background, banner images
├── packages/         ← Package images (if any)
├── imports/          ← Temporary upload staging area
│   ├── brands/
│   ├── projects/
│   ├── testimonials/
│   └── blogs/
├── exports/          ← Generated export files (temporary)
└── temp/             ← Ephemeral processing files (auto-clean)
```

### 18.2 Folder Rules

Every module MUST follow the same folder rules:

| Rule | Description |
|------|-------------|
| **One bucket** | All CMS files go in bucket `cms` |
| **One folder per module** | Folder name matches the module identity |
| **No nesting beyond 1 level** | `cms/brands/` — not `cms/brands/2026/07/` |
| **No spaces in folder names** | Use lowercase hyphenated |
| **No root-level files** | Every file must be inside a module folder |
| **Filenames are unique** | Use UUID or unique identifiers to avoid collisions |
| **Imports folder** | Used only during import dry-run image resolution |
| **Exports folder** | Temporary export files, cleaned after 24 hours |
| **Temp folder** | Auto-cleaned on a schedule |

### 18.3 Folder Diagram

```
cms/ (Supabase Bucket)
│
├── brands/
│   ├── ultratech-logo.png
│   ├── kajaria-logo.png
│   └── jsw-logo.png
│
├── projects/
│   ├── green-valley-cover.jpg
│   └── ocean-tower-cover.png
│
├── testimonials/
│   ├── rajesh.png
│   └── priya.jpg
│
├── blogs/
│   └── construction-tips-banner.jpg
│
├── company/
│   ├── logo.png
│   └── favicon.ico
│
├── homepage/
│   └── hero-bg.jpg
│
├── packages/
│   └── premium-package.jpg
│
├── imports/
│   ├── brands/
│   ├── projects/
│   ├── testimonials/
│   └── blogs/
│
├── exports/
│   └── brands-export-2026-07-28.xlsx
│
└── temp/
    └── processing-abc123.csv
```

### 18.4 Storage Manager Interface (Future Ready)

```typescript
// lib/storage/manager.ts
// Responsible for all file operations in the cms bucket

interface StorageManager {
  // Upload file to module folder
  upload(module: string, file: File): Promise<string>;

  // Get public URL for a file
  getPublicUrl(module: string, filename: string): string;

  // Check if file exists
  exists(module: string, filename: string): Promise<boolean>;

  // Delete file
  delete(module: string, filename: string): Promise<void>;

  // List all files in a module folder
  list(module: string): Promise<StorageFile[]>;

  // Copy file between folders (e.g., imports → module folder)
  copy(fromPath: string, toPath: string): Promise<void>;

  // Get file stats
  stats(module: string, filename: string): Promise<FileStats>;

  // Clean temp and exports folders
  cleanTemp(): Promise<CleanupResult>;
}
```

### 18.5 Image Resolver Integration

The `image-resolver.ts` in the import engine uses the Storage Manager to find image files during import:

```
1. Import engine reads "logo_image_filename" column
2. Calls storage.exists("brands", "ultratech-logo.png")
3. If found: returns public URL → stores in DB
4. If missing: adds warning, row proceeds without image
5. If file exists in imports/brands/ but not in brands/:
   → Auto-copy from imports to permanent folder
   → Return public URL
```

---

## 19. Audit History (Per-Record)

### 19.1 Purpose

Every record imported through the system should permanently remember its origin. This ensures full traceability.

### 19.2 Audit Fields (Documented for Future Implementation)

Each CMS table should eventually have these audit fields:

```sql
-- Add to every CMS table for per-record import tracking
ALTER TABLE cms_brands ADD COLUMN IF NOT EXISTS
  imported_by UUID REFERENCES auth.users(id);

ALTER TABLE cms_brands ADD COLUMN IF NOT EXISTS
  imported_at TIMESTAMPTZ;

ALTER TABLE cms_brands ADD COLUMN IF NOT EXISTS
  import_id BIGINT REFERENCES import_logs(id);

ALTER TABLE cms_brands ADD COLUMN IF NOT EXISTS
  template_version TEXT;

ALTER TABLE cms_brands ADD COLUMN IF NOT EXISTS
  import_mode TEXT;

ALTER TABLE cms_brands ADD COLUMN IF NOT EXISTS
  rollback_source_import_id BIGINT REFERENCES import_logs(id);
```

### 19.3 Audit Bubble (Visual)

Every CMS record in the admin panel shows:

```
┌────────────────────────────────────────────┐
│  Brand: UltraTech Cement                   │
│  Status: ✅ Active                         │
├────────────────────────────────────────────┤
│  Created: 2026-07-28 14:30 by admin        │
│  Updated: 2026-07-28 15:45 by admin        │
│                                            │
│  ── IMPORT ORIGIN ──                       │
│  Imported: 2026-07-28 14:30                │
│  Import ID: #2847                          │
│  Template Version: 1.0.0                   │
│  Import Mode: Upsert                       │
│  Rollback Source: —                        │
│                                            │
│  [View Import #2847 Details]              │
└────────────────────────────────────────────┘
```

### 19.4 Audit Values During Import

When the engine imports a record, it sets audit fields automatically:

```typescript
// During import phase, set audit fields on every row
const auditFields = {
  imported_by: currentUserId,
  imported_at: new Date().toISOString(),
  import_id: importId,
  template_version: moduleConfig.templateVersion,
  import_mode: importMode,
};

// These are merged into the INSERT/UPDATE data
// Field names are derived from column config
```

### 19.5 Rollback Trace

When a record is rolled back, the `rollback_source_import_id` is set:

```sql
UPDATE cms_brands
SET rollback_source_import_id = import_id,
    imported_by = rolled_back_by,
    imported_at = now()
WHERE import_id = targetImportId;
```

This creates a chain:
```
Brand created by Import #2847
  → Rolled back by Rollback #2847 (same ID, but is_rolled_back = true)
  → New data imported by Import #2890
  → Full audit trail preserved
```

### 19.6 Not Implemented Yet

| Feature | Status | Reason |
|---------|--------|--------|
| Per-record import audit fields | Documented | Requires ALTER TABLE on every CMS table |
| Audit bubble in admin panel | Documented | UI change, not urgent |
| Rollback trace chain | Documented | Relies on audit fields above |
| Filter by import source | Documented | Query enhancement |

---

## 20. Module Health Diagnostics

### 20.1 Purpose

Provide a diagnostics dashboard showing the health of each CMS module. This is a **future feature** — only documented here.

### 20.2 Health Dashboard (Future)

```
┌─────────────────────────────────────────────────────────────────────┐
│  MODULE HEALTH — Brands                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  RECORDS                                                     │   │
│  │  Total Records:          45                                  │   │
│  │  Active Records:         42  ━━━━━━━━━━━━━━━━━━━━ 93%        │   │
│  │  Inactive Records:       3   ━━━━ 7%                         │   │
│  │  Duplicate Records:      1   ⚠️ "Cement Corp" ≈ "CementCorp" │   │
│  │  Missing Images:         2   ⚠️ brand-a.jpg, brand-b.png     │   │
│  │  Broken URLs:            1   ❌ https://old-site.com (404)    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  IMPORTS                                                     │   │
│  │  Last Import:          #2847 · 28/07/2026 · 25 rows           │   │
│  │  Last Export:          28/07/2026 · brands-export.xlsx       │   │
│  │  Total Imports:        12                                     │   │
│  │  Import Errors:        2   ❌ See error log                  │   │
│  │  Rolled Back:          1   🔄 #2842                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  STORAGE                                                     │   │
│  │  Storage Folder:     cms/brands/                              │   │
│  │  Total Files:        40 / 45 records have images             │   │
│  │  Storage Used:       125.4 MB                                │   │
│  │  Largest File:       premium-logo.png (12.3 MB) ⚠️          │   │
│  │  Unused Files:       3   (in storage but not referenced)     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [📊 Refresh] [📥 Download Report] [🛠️ Fix Missing Images]        │
└─────────────────────────────────────────────────────────────────────┘
```

### 20.3 Health Metrics

| Metric | Source | Threshold |
|--------|--------|-----------|
| Total Records | `COUNT(*)` from module table | — |
| Active Records | `WHERE is_active = true` | — |
| Inactive Records | `WHERE is_active = false` | — |
| Duplicate Records | Levenshtein comparison of identity fields | ≥ 80% similarity |
| Missing Images | `SELECT WHERE image_url IS NULL` | — |
| Broken URLs | HTTP HEAD check on URL fields | Non-200 response |
| Last Import | `MAX(created_at)` from `import_logs` | — |
| Last Export | System event log | — |
| Total Imports | `COUNT(*)` from `import_logs` | — |
| Import Errors | `COUNT(*) WHERE status = 'failed'` | — |
| Storage Files | `storage.list('cms/brands/')` | — |
| Storage Used | Sum of file sizes | — |
| File Count vs Record Count | Compare storage files to image references | Unused files warning |

### 20.4 When to Check Health

| Cadence | Trigger | Action |
|---------|---------|--------|
| After every import | Auto-check | Report any new issues |
| Daily | Scheduled | Email report to admin |
| On demand | Admin clicks "Refresh" | Real-time scan |
| Before export | Pre-export check | Warn about missing images |

### 20.5 Not Implemented Yet

| Feature | Status | Reason |
|---------|--------|--------|
| Health dashboard page | Documented | New page required |
| Auto-detection of duplicates | Documented | Requires scheduled job |
| Broken URL checker | Documented | Requires HTTP HEAD worker |
| Storage usage tracker | Documented | Requires storage.list integration |
| Email reports | Documented | Requires notification system |

---

## 21. Success Criteria

### 21.1 Performance Goals

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Import speed** | 10,000 rows in < 60 seconds | Start → End (full import) |
| **Dry run speed** | 10,000 rows in < 10 seconds | Start → Preview displayed |
| **Template download** | < 1 second | Click → File ready |
| **Export speed** | 10,000 rows in < 30 seconds | Click → File ready |
| **Rollback speed** | 10,000 rows in < 30 seconds | Confirm → Rollback complete |
| **Upload time** | 10 MB file in < 5 seconds | Client → Server |
| **Duplicate check** | 10,000 rows in < 5 seconds | In-file + database comparison |
| **Image resolution** | 1,000 images in < 3 seconds | Filename → URL mapping |

### 21.2 Accuracy Goals

| Metric | Target | Verification |
|--------|--------|-------------|
| **Data integrity** | 0 data loss | Compare pre/post row counts and values |
| **Rollback accuracy** | 100% restore | Verify rolled-back data matches originals |
| **Round-trip fidelity** | 100% identical | Export → Import → Export = same structure |
| **Template compatibility** | 100% | Old templates rejected, new templates accepted |
| **Duplicate detection** | 0 false positives | No valid rows rejected as duplicates |
| **Duplicate prevention** | 0 exact duplicates | No exact duplicates in database after import |
| **Image mapping** | 100% accurate | All found images correctly mapped to records |
| **Error reporting** | 100% captured | Every validation error has a row number + message |

### 21.3 Round-Trip Test

The most important success criteria: an export must produce a file that can be re-imported **without any data loss or structural changes**.

```
Step 1: Export data from module
        → brands-export.xlsx
        → Contains all records in template format

Step 2: Edit the file (optional)
        → Modify some values, add new rows

Step 3: Import the edited file
        → Same template format
        → UPSERT mode

Step 4: Export again
        → brands-export-2.xlsx

Step 5: Compare Step 1 and Step 4
        ┌────────────────────────────────────────────────────────┐
        │  ROUND-TRIP VERIFICATION                               │
        ├────────────────────────────────────────────────────────┤
        │                                                        │
        │  Step 1: Export #1 (original)                         │
        │  Step 4: Export #2 (after import of #1)               │
        │                                                        │
        │  ✅ Column headers: Identical                         │
        │  ✅ Column order: Identical                           │
        │  ✅ Data types: Identical                             │
        │  ✅ Nested format: Identical (pipe/semicolon)         │
        │  ✅ Boolean format: Identical ("yes"/"no")            │
        │  ✅ Date format: Identical (DD/MM/YYYY)               │
        │  ✅ Number format: Identical (no currency symbols)    │
        │  ✅ Template version: Identical                       │
        │  ✅ Module name: Identical                            │
        │                                                        │
        │  ❌ Only differences SHOULD be:                       │
        │     • TEMPLATE_DATE (new generation timestamp)        │
        │     • Any intentional edits made in Step 2            │
        │                                                        │
        │  RESULT: ✅ Round-trip PASS                           │
        └────────────────────────────────────────────────────────┘
```

### 21.4 Rollback Test

```
Step 1: Take snapshot of current data
Step 2: Import 25 new records (INSERT_ONLY)
Step 3: Verify 25 new records exist
Step 4: Rollback the import
Step 5: Compare with Step 1 snapshot
        → 25 records deleted
        → Remaining records unchanged
        → RESULT: ✅ Rollback PASS

Step 1: Take snapshot of current data (record values)
Step 2: Update 5 records via import (UPDATE_ONLY)
Step 3: Verify 5 records have new values
Step 4: Rollback the import
Step 5: Compare with Step 1 snapshot
        → 5 records restored to original values
        → Other records unchanged
        → RESULT: ✅ Rollback PASS
```

### 21.5 Validation Test

| Scenario | Expected Result |
|----------|----------------|
| Upload wrong module template | Rejected: "Template is for module X, expected Y" |
| Upload old template version | Rejected: "Template version X is incompatible" |
| Upload with missing required column | Rejected: "Required column X is missing" |
| Upload with invalid data type | Error on specific row: "Row X: price must be a number" |
| Upload with exact duplicate in file | Error: "Row X: Duplicate Y detected in row Z" |
| Upload 10,001 rows | Rejected: "Maximum 10,000 rows per import" |
| Upload 11 MB file | Rejected: "File exceeds 10 MB limit" |
| Upload .csv instead of .xlsx | Rejected: "Only .xlsx files are supported" |
| Upload with boolean "yes" | Pass: normalized to `true` |
| Upload with boolean "no" | Pass: normalized to `false` |
| Upload with boolean "Yes" | Pass: case-insensitive |
| Upload with image filename missing | Warning: "Image file X not found in storage" |

### 21.6 Edge Cases

| Edge Case | Expected Behavior |
|-----------|------------------|
| Empty file (0 data rows) | Pass: "0 rows to import" |
| File with only header row | Pass: "0 rows to import" |
| All rows have errors | No rows imported, full error report generated |
| Mixed valid/invalid rows | Valid rows imported, invalid rows in error report |
| Network failure during import | Partial rows saved, error log shows failure point |
| Duplicate identity in different case | UPSERT: Updates existing record |
| Very long text (> maxLength) | Truncated with warning |
| Special characters (©, ®, ™) | Preserved in xlsx encoding |
| Unicode text (Hindi, Tamil) | Preserved (UTF-8 encoding) |

---

## Implementation Checklist (Post-Approval)

1. [ ] Create `Supabase_v2/080_import_logs.sql` migration
2. [ ] Create `lib/import/types.ts` — all interfaces
3. [ ] Create `lib/import/configs/_index.ts` — module registry
4. [ ] Create `lib/import/configs/packages.ts` — config
5. [ ] Create `lib/import/configs/testimonials.ts` — config
6. [ ] Create `lib/import/configs/projects.ts` — config
7. [ ] Create `lib/import/excel.ts` — xlsx parser/generator
8. [ ] Create `lib/import/template-generator.ts` — template creation
9. [ ] Create `lib/import/image-resolver.ts` — image filename → URL
10. [ ] Create `lib/import/engine.ts` — THE shared engine
11. [ ] Create `lib/import/rollback.ts` — rollback logic
12. [ ] Create `lib/import/error-collector.ts` — error formatting
13. [ ] Create `lib/import/export.ts` — module data → xlsx
14. [ ] Create `lib/import/index.ts` — public re-exports
15. [ ] Create `components/shared/ImportModal.tsx` — reusable modal
16. [ ] Create `components/shared/ImportButtonGroup.tsx` — buttons
17. [ ] Create `components/shared/ImportDryRunPreview.tsx` — preview
18. [ ] Create `components/shared/ImportLogHistory.tsx` — history + rollback
19. [ ] Create `app/dashboard/import/actions.ts` — server actions
20. [ ] Create `app/dashboard/packages/components/PackageImportBar.tsx`
21. [ ] Create `app/dashboard/testimonials/components/TestimonialImportBar.tsx`
22. [ ] Create `app/dashboard/projects/components/ProjectImportBar.tsx`
23. [ ] Integrate into existing CMS pages
24. [ ] Install xlsx library (`npm install xlsx`)
25. [ ] Verify: TypeScript + Build + Lint
26. [ ] Test: Download template → Fill → Upload → Dry Run → Import → Rollback