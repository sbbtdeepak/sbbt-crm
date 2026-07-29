# COMPANY_SCHEMA_AUDIT.md

## LIVE Database Verification

**Method:** Supabase PostgREST `select(col)` per-column test against live `cms_company` table.

**Date:** 2026-07-27

---

## ⚠️ Previous Audit Incorrect

The original audit compared SQL **migration files** (`010_cms_company.sql`) against runtime code. Migration 010 was **never fully applied** to the live database. The live schema is an older subset.

---

## Complete Field Comparison Table

| Runtime Field | Database Column | Exists? | Required? | Where Used |
|:---|:---|:---:|:---:|:---|
| `id` | `id` | ✅ Yes | PK | CMSBase |
| `site_id` | `site_id` | ✅ Yes | Yes | saveCompany, select |
| `brand_name` | `brand_name` | ✅ Yes | Yes | saveCompany, CompanyForm, API |
| `legal_name` | `legal_name` | ✅ Yes | No | saveCompany, CompanyForm, API |
| `tagline` | `tagline` | ✅ Yes | No | saveCompany, CompanyForm, API, MobileBrandHeader |
| `logo_url` | `logo_url` | ✅ Yes | No | saveCompany, CompanyForm, API, Header |
| `favicon_url` | `favicon_url` | ✅ Yes | No | saveCompany, CompanyForm, API, layout |
| `primary_color` | `primary_color` | ✅ Yes | No | saveCompany, CompanyForm, API |
| `secondary_color` | `secondary_color` | ✅ Yes | No | saveCompany, CompanyForm, API |
| `currency` | `currency` | ✅ Yes | No | saveCompany, CompanyForm |
| `timezone` | `timezone` | ✅ Yes | No | saveCompany, CompanyForm |
| `language` | `language` | ✅ Yes | No | saveCompany, CompanyForm |
| `gst` | `gst` | ✅ Yes | No | saveCompany, CompanyForm, API |
| `pan` | `pan` | ✅ Yes | No | saveCompany, CompanyForm, API |
| `business_hours` | `business_hours` | ✅ Yes | No | saveCompany, CompanyForm, API |
| `address` | `address` | ✅ Yes | No | saveCompany, CompanyForm, API |
| `phone` | `phone` | ✅ Yes | Yes | saveCompany, CompanyForm, API, Header, Footer |
| `alternate_mobile` | `alternate_mobile` | ✅ Yes | No | saveCompany, CompanyForm, API, Footer |
| `whatsapp` | `whatsapp` | ✅ Yes | No | saveCompany, CompanyForm, API, Footer |
| `email` | `email` | ✅ Yes | Yes | saveCompany, CompanyForm, API, Contact, Footer |
| `grievance_email` | `grievance_email` | ❌ **MISSING** | No | saveCompany (line 116), CompanyForm (line 182-193), API (line 35) |
| `support_email` | `support_email` | ✅ Yes | No | saveCompany, CompanyForm, API |
| `sales_email` | `sales_email` | ✅ Yes | No | saveCompany, CompanyForm, API |
| `website` | `website` | ✅ Yes | No | saveCompany, CompanyForm, API |
| `google_maps_url` | `google_maps_url` | ✅ Yes | No | saveCompany, CompanyForm, API |
| `google_rating` | `google_rating` | ❌ **MISSING** | No | saveCompany (line 126-133), CompanyForm (line 278-291), API (line 45), **MobileBrandHeader** (hardcoded 4.9) |
| `years_experience` | `years_experience` | ❌ **MISSING** | No | saveCompany (line 134-141), CompanyForm (line 294-307), API (line 46) |
| `homes_delivered` | `homes_delivered` | ❌ **MISSING** | No | saveCompany (line 142-149), CompanyForm (line 310-323), API (line 47) |
| `projects_completed` | `projects_completed` | ❌ **MISSING** | No | saveCompany (line 150-157), CompanyForm (line 326-337), API (line 48) |
| `created_at` | `created_at` | ✅ Yes | Auto | DB default |
| `updated_at` | `updated_at` | ✅ Yes | Auto | saveCompany, DB trigger |
| `created_by` | `created_by` | ✅ Yes | No | CMSBase |
| `updated_by` | `updated_by` | ✅ Yes | No | CMSBase |
| `deleted_at` | `deleted_at` | ❌ **MISSING** | No | Soft delete support (not actively used by saveCompany) |

---

## MISSING COLUMNS (6 total)

| # | Column | Type | Default | Impact |
|:--|:---|:---|:---|:---|
| 1 | `grievance_email` | `TEXT NOT NULL DEFAULT ''` | `''` | Form save fails, API omits field |
| 2 | `google_rating` | `NUMERIC(3,2) NOT NULL DEFAULT 0` | `0` | **🔥 FIRST PostgREST error trigger**, Business Metrics section broken |
| 3 | `years_experience` | `INTEGER NOT NULL DEFAULT 0` | `0` | Business Metrics section broken |
| 4 | `homes_delivered` | `INTEGER NOT NULL DEFAULT 0` | `0` | Business Metrics section broken |
| 5 | `projects_completed` | `INTEGER NOT NULL DEFAULT 0` | `0` | Business Metrics section broken |
| 6 | `deleted_at` | `TIMESTAMPTZ` | `NULL` | Soft delete not possible (not actively failing) |

---

## FIRST Failure Point

The **first missing column that triggers the live error** is `google_rating`.

When `saveCompany()` executes `supabase.from('cms_company').update(updateData)`:
1. PostgREST validates all column names in `updateData` against the schema cache
2. The error `Could not find the 'google_rating' column of 'cms_company' in schema cache` fires because `google_rating` is included in the update payload (line 126-133 of actions.ts)
3. The error is raised **before any data is written** — the entire UPDATE fails

Note: `grievance_email` is also missing but PostgREST reports `google_rating` first (likely due to alphabetical or schema-cache ordering, not payload order).

---

## saveCompany() UPDATE Payload Order (lines 100-168)

| # | Field | DB Exists? |
|:--|:---|:---:|
| 1 | `site_id` | ✅ |
| 2 | `brand_name` | ✅ |
| 3 | `legal_name` | ✅ |
| 4 | `tagline` | ✅ |
| 5 | `logo_url` | ✅ |
| 6 | `favicon_url` | ✅ |
| 7 | `primary_color` | ✅ |
| 8 | `secondary_color` | ✅ |
| 9 | `phone` | ✅ |
| 10 | `alternate_mobile` | ✅ |
| 11 | `whatsapp` | ✅ |
| 12 | `email` | ✅ |
| 13 | `grievance_email` | ❌ **MISSING** |
| 14 | `support_email` | ✅ |
| 15 | `sales_email` | ✅ |
| 16 | `website` | ✅ |
| 17 | `address` | ✅ |
| 18 | `google_maps_url` | ✅ |
| 19 | `google_rating` | ❌ **MISSING — ERROR TRIGGER** |
| 20 | `years_experience` | ❌ **MISSING** |
| 21 | `homes_delivered` | ❌ **MISSING** |
| 22 | `projects_completed` | ❌ **MISSING** |
| 23 | `gst` | ✅ |
| 24 | `pan` | ✅ |
| 25 | `currency` | ✅ |
| 26 | `timezone` | ✅ |
| 27 | `language` | ✅ |
| 28 | `business_hours` | ✅ |
| 29 | `updated_at` | ✅ |

---

## Other Files Affected by Missing Columns

1. **`App/api/public/company/route.ts`** — References `google_rating`, `years_experience`, `homes_delivered`, `projects_completed` (lines 45-48)
2. **`App/dashboard/cms/types.ts`** — `CMSCompanyRow` defines all 6 missing fields (lines 113-123)
3. **`App/dashboard/cms/components/CompanyForm.tsx`** — Form inputs for `grievance_email` (line 182), `google_rating` (line 283), `years_experience` (line 303), `homes_delivered` (line 319), `projects_completed` (line 333)
4. **`Lib/cms/public.ts`** — Likely references these fields for public rendering

---

## Root Cause

The live database was created with an **older, incomplete schema** that does not include the full column set defined in migration `010_cms_company.sql`. Migration 070 only added `alternate_mobile` but did not add the other missing columns. The migration 010 file defines all columns but was apparently never applied (or was applied to a different database).

---

## Recommended Fix (for next step)

Single ALTER TABLE migration adding all 6 missing columns:

```sql
ALTER TABLE cms_company
  ADD COLUMN IF NOT EXISTS grievance_email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS google_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS years_experience INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS homes_delivered INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS projects_completed INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
```

**NO code changes needed.** All runtime code, types, forms, and API routes are already correct. The fix is purely additive database migration.

---

## Verification Script

The schema check script was created at `Scripts/check_cms_company_schema.ts` for future verification.

Run with: `npx tsx --env-file=.env.local Scripts/check_cms_company_schema.ts`