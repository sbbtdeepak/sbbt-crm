# Brands We Work With — Feature Investigation

## Objective
Determine whether the "Brands We Work With" homepage section has CMS-backed management.

## Investigation Results

### 1. Homepage Component (`Components/home/Brands.tsx`)
- **Status:** ⚠️ Hardcoded static data only
- Contains an array of 20 brand objects: `{ name: "UltraTech", category: "Cement" }`
- No database fetch or API call
- Uses deterministic color generation (`getBrandColor()`) from name hash — no logo images
- Uses initials fallback (`getInitials()`) — no logo/upload support
- Data is hardcoded, repeated 3× via `[...BRANDS, ...BRANDS, ...BRANDS]` for marquee scroll

### 2. Database Table
- **Status:** ❌ No CMS brands table exists
- Searched all 40+ SQL migrations in `Supabase_v2/` — zero matches for `cms_brands` or `cms_brand`
- The only brands-related table is `brands` (`021_brands.sql`) which is **Master Data** for the Estimate Engine (linked to `material_categories` with FK). It has a different purpose and schema:
  - `name`, `material_category_id`, `description`, `logo_url`, `is_active`, `display_order`, `version`, `effective_from`, `effective_to`
  - No `category` display field (text) — only `material_category_id` FK
  - Not integrated with CMS or the homepage

### 3. Server Actions (`App/dashboard/cms/actions.ts`)
- **Status:** ❌ No brands CRUD exists
- CMS actions exist for: Company, Social, Settings, Homepage, SEO, Packages, Projects, Blogs, Testimonials, Image Upload
- **No brands actions at all**

### 4. CMS Dashboard (`App/dashboard/cms/page.tsx`)
- **Status:** ❌ No brands tab/section in CMS admin
- The CMS page has sections for: Company, Hero Banner, Homepage, SEO, Social, Settings, Packages, Blogs, Testimonials, Internal Settings
- **No brands editor**

### 5. CMS Types (`App/dashboard/cms/types.ts`)
- **Status:** ❌ No brands interface exists
- No `CMSBrandRow`, `CMSBrandInsert`, or `CMSBrandUpdate` types defined

### 6. Public Rendering (`App/page.tsx`)
- **Status:** ⚠️ Renders static component directly
- Imports `<Brands />` from `@/components/home/Brands`
- No data fetching from any CMS table — pure static rendering

### 7. MobileBrandHeader (`Components/layout/MobileBrandHeader.tsx`)
- **Status:** ✅ Unrelated — this is the sticky mobile company header, not the brands section

---

## Conclusion: ❌ Feature Does NOT Exist (Missing Feature, Not a Bug)

The "Brands We Work With" section is entirely **static/hardcoded**. There is no:
- CMS database table for brands
- Server actions for brands CRUD
- Admin panel management interface
- Logo upload support
- Active/inactive toggling
- Display order control
- API endpoint for dynamic rendering

---

## Proposed Implementation Plan

### Database (`Supabase_v2/071_cms_brands.sql`)
```sql
CREATE TABLE IF NOT EXISTS cms_brands (
  id              BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id         UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  
  name            TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT '',       -- Display category text
  logo_url        TEXT NOT NULL DEFAULT '',       -- Uploaded logo image
  website_url     TEXT NOT NULL DEFAULT '',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  display_order   INTEGER NOT NULL DEFAULT 0,
  
  -- Audit
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      UUID,
  updated_by      UUID,
  deleted_at      TIMESTAMPTZ,
  
  UNIQUE(site_id, name)
);
-- Indexes, RLS Policies, Update Trigger
```

### TypeScript Types (`App/dashboard/cms/types.ts`)
- `CMSBrandRow extends CMSBase` — `name`, `category`, `logo_url`, `website_url`, `is_active`, `display_order`
- `CMSBrandInsert`, `CMSBrandUpdate`
- `CMS_STORAGE_FOLDERS.BRANDS` → `"brands"` (for logo uploads)

### Server Actions (`App/dashboard/cms/actions.ts`)
- `getBrands()` — fetch active, ordered
- `saveBrand()` — upsert (name, category, logo_url, website_url, is_active, display_order)
- `deleteBrand()` — soft delete
- `toggleBrandActive()`

### CMS Dashboard Component
- `BrandsList.tsx` — table with drag-to-reorder, active/inactive toggle, delete
- `BrandForm.tsx` — name, category, logo upload (ImageUploader), website URL, active checkbox

### CMS Admin Integration
- Add "Brands" tab in `App/dashboard/cms/page.tsx`
- Wire up server actions + form component

### Homepage Component (`Components/home/Brands.tsx`)
- Convert to fetch from `cms_brands` via server component
- Display logo images when available, fall back to initials
- Use `display_order` for sorting
- Filter by `is_active = true`

---

**Requesting approval before implementation.**