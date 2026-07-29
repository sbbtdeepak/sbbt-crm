# Module Registration Guide

## SBBT CRM v2 — Universal Import/Export Engine

This guide explains how to add any new module to the Data Import Framework. Follow these steps exactly — no engine modifications needed.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Step 1: Create Config File](#2-step-1-create-config-file)
3. [Step 2: Create Transformer (Optional)](#3-step-2-create-transformer-optional)
4. [Step 3: Register Module](#4-step-3-register-module)
5. [Step 4: Create Module Wrapper Component](#5-step-4-create-module-wrapper-component)
6. [Step 5: Integrate into Page](#6-step-5-integrate-into-page)
7. [Config File Reference](#7-config-file-reference)
8. [Column Types Reference](#8-column-types-reference)
9. [Validation Rules Reference](#9-validation-rules-reference)
10. [Examples](#10-examples)

---

## 1. Overview

Adding a new module requires exactly **3 code files** and **1 registration line**:

```
File                              Purpose
────────────────────────────────────────────────────────
lib/import/configs/{module}.ts    Module configuration (~20-40 lines)
lib/import/transformers/{module}.ts  Optional nested data transformer
app/dashboard/{module}/components/{Module}ImportBar.tsx  Wrapper component
```

Plus 1-line registration in:
```
lib/import/configs/_index.ts
```

**No changes to:**
- `engine.ts` — the universal import engine
- `excel.ts` — Excel parser/generator
- `template-generator.ts` — template creation
- `export.ts` — data export
- `rollback.ts` — rollback logic
- `error-collector.ts` — error formatting
- `image-resolver.ts` — image resolution
- `security-validator.ts` — file validation
- `chunk-processor.ts` — performance chunking
- `duplicate-detector.ts` — duplicate detection
- Any shared component in `components/shared/`

---

## 2. Step 1: Create Config File

Create `lib/import/configs/{module}.ts`:

```typescript
// lib/import/configs/brands.ts

import { ModuleConfig } from "../types";

export const brandsConfig: ModuleConfig = {
  // ── Module Identity ──
  module: "brands",
  displayName: "Brands",
  version: "1.0.0",
  templateVersion: "1.0.0",

  // ── Database ──
  tableName: "cms_brands",
  identityFields: ["name"],
  defaultSiteId: "00000000-0000-0000-0000-000000000001",

  // ── Columns ──
  columns: [
    {
      field: "name",
      label: "name*",
      required: true,
      type: "text",
      maxLength: 255,
      description: "Brand name (unique identifier)",
      duplicateCheck: true,  // Enables smart duplicate detection
    },
    {
      field: "category",
      label: "category*",
      required: true,
      type: "text",
      maxLength: 100,
      description: "Brand category (e.g. Cement, Steel, Tiles)",
    },
    {
      field: "website_url",
      label: "website_url",
      required: false,
      type: "url",
      maxLength: 500,
      description: "Brand website URL",
    },
    {
      field: "display_order",
      label: "display_order",
      required: false,
      type: "integer",
      min: 0,
      default: 0,
      description: "Display order (lower = first)",
    },
    {
      field: "is_active",
      label: "is_active",
      required: false,
      type: "boolean",
      default: true,
      description: "Whether brand is active on website",
    },
  ],

  // ── Image Fields ──
  imageFields: [
    {
      field: "logo_url",
      storageFolder: "brands",
      imageColumn: "logo_image_filename",
      required: false,
      description: "Brand logo image filename in storage",
      supportedFormats: ["png", "jpg", "jpeg", "svg", "webp"],
      maxFileSize: 5 * 1024 * 1024,  // 5MB
    },
  ],

  // ── Relations (Optional, for nested data) ──
  relations: [],

  // ── Template Instructions ──
  instructions: [
    { key: "Module", value: "Brand Import" },
    { key: "Required", value: "Fields marked with * are mandatory" },
    { key: "Duplicates", value: "If brand name exists → Update. Else → Create." },
    { key: "Images", value: "Place logo files in 'cms/brands/' folder. Use filename in logo_image_filename column." },
    { key: "Supported Formats", value: "png, jpg, jpeg, svg, webp. Max 5MB each." },
  ],

  // ── Export Settings ──
  export: {
    maxRows: 10000,
    sortBy: "display_order",
    sortOrder: "asc",
    includeInactive: false,
  },

  // ── Import Settings ──
  import: {
    maxRows: 5000,
    maxFileSize: 10 * 1024 * 1024,  // 10MB
    chunkSize: 100,
    supportedModes: ["insert_only", "update_only", "upsert"],
    defaultMode: "upsert",
  },
};
```

---

## 3. Step 2: Create Transformer (Optional)

Only needed for modules with complex nested data (like Packages with sections/items).

Create `lib/import/transformers/{module}.ts`:

```typescript
// lib/import/transformers/packages.ts

import { Transformer } from "../types";

/**
 * Transforms pipe-delimited sections cell into structured data.
 *
 * Excel format:
 *   "Structure|AAC Blocks|Magicrete|4"/6"|Included;
 *    Flooring|Vitrified Tiles|Kajaria|2x2|Included"
 *
 * Transforms to:
 *   [
 *     { section: "Structure", items: [
 *       { item: "AAC Blocks", brand: "Magicrete", spec: "4\"/6\"", remarks: "Included" }
 *     ]},
 *     { section: "Flooring", items: [
 *       { item: "Vitrified Tiles", brand: "Kajaria", spec: "2x2", remarks: "Included" }
 *     ]}
 *   ]
 */
export const packagesSectionTransformer: Transformer = {
  name: "packages.sections",
  description: "Parses pipe-delimited sections and items",

  parse(cellValue: string): ParsedNestedData {
    if (!cellValue || cellValue.trim() === "") {
      return { valid: true, data: [] };
    }

    const groups = cellValue.split(";").map(g => g.trim()).filter(Boolean);
    const sections: SectionData[] = [];
    const errors: string[] = [];

    for (const group of groups) {
      const parts = group.split("|").map(p => p.trim());

      if (parts.length < 2) {
        errors.push(`Invalid section format: "${group}"`);
        continue;
      }

      const sectionName = parts[0];
      const itemName = parts[1] || "";
      const brand = parts[2] || "";
      const spec = parts[3] || "";
      const remarks = parts[4] || "";

      if (!sectionName) {
        errors.push(`Empty section name in: "${group}"`);
        continue;
      }

      if (!itemName) {
        errors.push(`Empty item name in section "${sectionName}"`);
        continue;
      }

      // Find or create section
      let section = sections.find(s => s.section === sectionName);
      if (!section) {
        section = { section: sectionName, items: [] };
        sections.push(section);
      }

      section.items.push({ item: itemName, brand, spec, remarks });
    }

    return {
      valid: errors.length === 0,
      data: sections,
      errors: errors.length > 0 ? errors : undefined,
    };
  },

  /**
   * Reverse transform: structured data → Excel cell format
   * Used by export engine for round-trip compatibility.
   */
  stringify(data: SectionData[]): string {
    if (!data || data.length === 0) return "";

    return data
      .flatMap(section =>
        section.items.map(item =>
          [
            section.section,
            item.item,
            item.brand || "",
            item.spec || "",
            item.remarks || "",
          ].join("|")
        )
      )
      .join("; ");
  },
};
```

For simple modules (Brands, Testimonials, Blogs), no transformer is needed.

---

## 4. Step 3: Register Module

Add one line to `lib/import/configs/_index.ts`:

```typescript
// lib/import/configs/_index.ts

import { ModuleConfig } from "../types";
import { packagesConfig } from "./packages";
import { testimonialsConfig } from "./testimonials";
import { projectsConfig } from "./projects";
import { brandsConfig } from "./brands";           // NEW
// import { blogsConfig } from "./blogs";           // FUTURE
// import { teamConfig } from "./team";             // FUTURE

export const moduleRegistry: Record<string, ModuleConfig> = {
  packages: packagesConfig,
  testimonials: testimonialsConfig,
  projects: projectsConfig,
  brands: brandsConfig,                           // NEW
  // blogs: blogsConfig,                           // FUTURE
  // team: teamConfig,                             // FUTURE
};

// ── Helper Functions ──

export function getConfig(module: string): ModuleConfig {
  const config = moduleRegistry[module];
  if (!config) {
    throw new Error(`Module "${module}" not found in registry`);
  }
  return config;
}

export function getAllModules(): ModuleConfig[] {
  return Object.values(moduleRegistry);
}

export function validateModule(module: string): boolean {
  return module in moduleRegistry;
}

export function getModuleNames(): string[] {
  return Object.keys(moduleRegistry);
}
```

---

## 5. Step 4: Create Module Wrapper Component

Create `app/dashboard/{module}/components/{Module}ImportBar.tsx`:

```tsx
// app/dashboard/brands/components/BrandsImportBar.tsx

"use client";

import ImportButtonGroup from "@/components/shared/ImportButtonGroup";
import { brandsConfig } from "@/lib/import/configs/brands";

interface BrandsImportBarProps {
  onImportComplete?: () => void;
}

export default function BrandsImportBar({ onImportComplete }: BrandsImportBarProps) {
  return (
    <ImportButtonGroup
      module="brands"
      config={brandsConfig}
      onComplete={onImportComplete}
    />
  );
}
```

---

## 6. Step 5: Integrate into Page

Add to existing module page:

```tsx
// app/dashboard/brands/page.tsx

import BrandsImportBar from "./components/BrandsImportBar";

export default function BrandsPage() {
  const handleImportComplete = () => {
    // Refresh brand list
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Brands</h1>
        <BrandsImportBar onImportComplete={handleImportComplete} />
      </div>

      {/* Existing brand list remains untouched */}
      <BrandsList />
    </div>
  );
}
```

**That's it. Adding a new module is complete.**

---

## 7. Config File Reference

Full `ModuleConfig` interface:

```typescript
interface ModuleConfig {
  // ── Identity ──
  module: string;              // Unique module identifier (e.g. "brands")
  displayName: string;         // Human-readable name (e.g. "Brands")
  version: string;             // Module schema version (e.g. "1.0.0")
  templateVersion: string;     // Template format version (e.g. "1.0.0")

  // ── Database ──
  tableName: string;           // Supabase table name
  identityFields: string[];    // Fields determining uniqueness (e.g. ["name"])
  defaultSiteId: string;       // Default site UUID

  // ── Columns ──
  columns: ColumnConfig[];     // Column definitions

  // ── Image Fields ──
  imageFields: ImageFieldConfig[];  // Image mapping configuration

  // ── Relations ──
  relations: RelationConfig[]; // Nested data relations

  // ── Template Instructions ──
  instructions: Instruction[]; // Instructions shown on template Sheet 1

  // ── Export Settings (Optional) ──
  export?: {
    maxRows?: number;          // Maximum rows to export
    sortBy?: string;           // Sort field
    sortOrder?: "asc" | "desc";
    includeInactive?: boolean;
  };

  // ── Import Settings (Optional) ──
  import?: {
    maxRows?: number;
    maxFileSize?: number;      // In bytes
    chunkSize?: number;
    supportedModes?: ImportMode[];
    defaultMode?: ImportMode;
  };
}
```

---

## 8. Column Types Reference

```typescript
interface ColumnConfig {
  field: string;              // Database column name
  label: string;              // Excel column header
  required: boolean;          // Must be non-empty
  type: ColumnType;           // Data type
  maxLength?: number;         // Text max length
  minLength?: number;         // Text min length
  min?: number;               // Numeric minimum
  max?: number;               // Numeric maximum
  pattern?: RegExp;           // Regex pattern validation
  enum?: string[];            // Allowed enum values
  default?: unknown;          // Default value if empty
  description?: string;       // Column description for instructions
  duplicateCheck?: boolean;   // Enable smart duplicate detection
  transformer?: string;       // Transformer function name (for nested)
  imageField?: string;        // Associated image field name
}

type ColumnType =
  | "text"       // Free text
  | "integer"    // Whole number
  | "number"     // Decimal number
  | "boolean"    // "yes"/"no" or 1/0
  | "date"       // DD/MM/YYYY
  | "url"        // http(s) URL
  | "email"      // Email address
  | "enum"       // One of allowed values
  | "nested"     // Complex nested data (uses transformer)
  | "image";     // Image filename reference
```

---

## 9. Validation Rules Reference

| Type | Rule | Error Example |
|------|------|--------------|
| `text` | Non-empty if required, ≤ maxLength | "Brand name exceeds 255 characters" |
| `text` | ≥ minLength if set | "Brand name must be at least 2 characters" |
| `integer` | Must be whole number | "Display order must be a whole number" |
| `integer` | ≥ min, ≤ max | "Display order cannot be negative" |
| `number` | Must be numeric | "Price must be a number" |
| `boolean` | Must be "yes"/"no" or 1/0 | "is_active must be 'yes' or 'no'" |
| `date` | Must be valid DD/MM/YYYY | "Date is not a valid calendar date" |
| `url` | Must start with http(s):// | "Website URL must start with http:// or https://" |
| `email` | Must match email format | "Email is not valid" |
| `enum` | Must be one of allowed values | "Category must be one of: Cement, Steel, Tiles" |
| `image` | Must have valid extension | "Image format must be: png, jpg, jpeg, svg, webp" |

**Duplicate Detection Types (all automatic when `duplicateCheck: true`):**

| Type | Example Match | Severity |
|------|--------------|----------|
| EXACT | "Portland Cement" ≈ "Portland Cement" | Error (skip) |
| CASE | "portland cement" ≈ "Portland Cement" | Warning |
| WHITESPACE | "Portland  Cement" ≈ "Portland Cement" | Warning |
| NEAR | "Portland Cemnt" ≈ "Portland Cement" | Warning |
| SLUG | "portland-cement" ≈ "Portland Cement" | Warning |

---

## 10. Examples

### Example A: Simple Module (Brands) — 40 lines

```typescript
// lib/import/configs/brands.ts (shown in Step 1)
// ~40 lines, no transformer, no relations, 1 image field
```

### Example B: Complex Module (Packages) — 80 lines + transformer

```typescript
// lib/import/configs/packages.ts
// ~80 lines, 1 transformer, 2 relations, 0 image fields
// Nested: sections → items
```

### Example C: Text-Only Module (SEO) — 25 lines

```typescript
// lib/import/configs/seo.ts
// ~25 lines, no transformer, no relations, no image fields
// Columns: page, meta_title, meta_description, og_image_url
```

### Example D: Image-Heavy Module (Gallery) — 50 lines

```typescript
// lib/import/configs/gallery.ts
// ~50 lines, no transformer, no relations, 1 image field (multi)
// Columns: title, category, image_filename, display_order, is_active
```

---

## Quick Checklist

When adding a new module, verify:

- [ ] Config file created: `lib/import/configs/{module}.ts`
- [ ] All required columns defined
- [ ] Identity fields correctly set
- [ ] Image fields configured (if applicable)
- [ ] Transformer created (if nested data)
- [ ] Module registered in `_index.ts`
- [ ] Module wrapper component created
- [ ] Wrapper integrated into module page

**Total effort: ~15 minutes per new module.**

---

## Appendix: Future Readiness

The framework supports these future modules out of the box:

| Module | Config Complexity | Transformer Needed | Image Fields |
|--------|------------------|-------------------|--------------|
| Company | Simple (10 cols) | No | 1 (logo) |
| Homepage | Simple (15 cols) | No | 2 (hero images) |
| Brands | Simple (6 cols) | No | 1 (logo) |
| Packages | Complex (8 cols + nested) | Yes (sections/items) | 0 |
| Testimonials | Simple (9 cols) | No | 1 (avatar) |
| Blogs | Medium (15 cols) | No | 1 (cover) |
| Projects | Complex (20 cols) | No | 1 (cover) |
| SEO | Simple (5 cols) | No | 0 |
| FAQ | Simple (5 cols) | No | 0 |
| Services | Simple (8 cols) | No | 1 (icon) |
| Team | Simple (10 cols) | No | 1 (photo) |
| Gallery | Simple (6 cols) | No | 1 (image) |
| Awards | Simple (8 cols) | No | 1 (certificate) |
| Careers | Medium (12 cols) | No | 0 |
| Leads | Simple (15 cols) | No | 0 |
| Vendors | Medium (15 cols) | No | 0 |
| Customers | Medium (20 cols) | No | 0 |
| Inventory | Complex (20 cols) | No | 1 (product image) |

All fit within the same `ModuleConfig` interface. No engine changes ever.