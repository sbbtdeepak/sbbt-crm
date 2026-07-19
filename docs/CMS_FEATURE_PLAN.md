# Dynamic CMS Foundation — Feature Plan (v2)
## SBBT CRM Next.js Project

**Status:** Awaiting approval  
**Target:** Production-ready CMS module for managing company info, homepage, SEO, social links, settings, and media.  
**Architecture:** Multi-site ready (site_id), even though first release supports only one site.

---

## 1. Database Schema

### Design Principles
- Every table includes: `id`, `site_id`, `created_at`, `updated_at`, `created_by`, `updated_by`
- `site_id` enables future multi-site/tenant support
- `created_by` / `updated_by` reference `auth.users.id` for audit trail
- No singleton pattern — use `site_id` as the unique constraint instead

### Table: `cms_company`

```sql
CREATE TABLE cms_company (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  brand_name TEXT NOT NULL DEFAULT '',
  legal_name TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  favicon_url TEXT NOT NULL DEFAULT '',
  primary_color TEXT NOT NULL DEFAULT '#4f46e5',
  secondary_color TEXT NOT NULL DEFAULT '#06b6d4',
  currency TEXT NOT NULL DEFAULT 'INR',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  language TEXT NOT NULL DEFAULT 'en',
  gst TEXT NOT NULL DEFAULT '',
  pan TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  support_email TEXT NOT NULL DEFAULT '',
  sales_email TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  google_maps_url TEXT NOT NULL DEFAULT '',
  business_hours TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(site_id)
);
```

### Table: `cms_homepage`

```sql
CREATE TABLE cms_homepage (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  hero_heading TEXT NOT NULL DEFAULT '',
  hero_subheading TEXT NOT NULL DEFAULT '',
  hero_cta_text TEXT NOT NULL DEFAULT '',
  hero_cta_link TEXT NOT NULL DEFAULT '',
  hero_background_url TEXT NOT NULL DEFAULT '',
  stats_heading TEXT NOT NULL DEFAULT '',
  stats JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(site_id)
);
```

### Table: `cms_seo`

```sql
CREATE TABLE cms_seo (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  meta_keywords TEXT NOT NULL DEFAULT '',
  og_image_url TEXT NOT NULL DEFAULT '',
  canonical_url TEXT NOT NULL DEFAULT '',
  robots TEXT NOT NULL DEFAULT 'index, follow',
  schema_json JSONB NOT NULL DEFAULT '{}',
  twitter_card TEXT NOT NULL DEFAULT 'summary_large_image',
  facebook_app_id TEXT NOT NULL DEFAULT '',
  google_verification TEXT NOT NULL DEFAULT '',
  bing_verification TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(site_id)
);
```

### Table: `cms_social`

```sql
CREATE TABLE cms_social (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  facebook_url TEXT NOT NULL DEFAULT '',
  instagram_url TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  youtube_url TEXT NOT NULL DEFAULT '',
  twitter_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(site_id)
);
```

### Table: `cms_settings`

```sql
CREATE TABLE cms_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  footer_text TEXT NOT NULL DEFAULT '',
  copyright_text TEXT NOT NULL DEFAULT '',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT NOT NULL DEFAULT 'We are currently under maintenance. Please check back soon.',
  enable_blog BOOLEAN NOT NULL DEFAULT true,
  enable_quote BOOLEAN NOT NULL DEFAULT true,
  enable_whatsapp BOOLEAN NOT NULL DEFAULT true,
  enable_chatbot BOOLEAN NOT NULL DEFAULT false,
  enable_call_button BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(site_id)
);
```

### Storage Bucket: `cms`

```
Bucket: cms (public)
Folders:
  logos/       — Company logos
  favicons/    — Favicon files
  hero/        — Hero background images
  og-images/   — Open Graph images
  general/     — General purpose uploads
```

---

## 2. Folder Structure

```
app/dashboard/cms/
├── page.tsx                    # Main CMS page (tabbed interface)
├── types.ts                    # All CMS TypeScript types
├── actions.ts                  # Server actions for all CMS tables
├── components/
│   ├── CompanyForm.tsx         # Company information form
│   ├── HomepageForm.tsx        # Hero + stats form (replaces HeroForm)
│   ├── SEOForm.tsx             # SEO metadata form
│   ├── SocialForm.tsx          # Social links form
│   ├── SettingsForm.tsx        # Theme + footer + feature toggles form
│   └── MediaManager.tsx        # Image upload/replace/delete
├── lib/
│   └── storage.ts              # Supabase Storage helpers

components/shared/
├── ImageUploader.tsx            # Reusable image upload (used by CMS, Projects, Blogs, etc.)
```

---

## 3. Components

| Component | Type | Description |
|-----------|------|-------------|
| `CompanyForm` | Client | Form for brand_name, legal_name, tagline, logo, favicon, colors, currency, timezone, language, GST, PAN, address, phone, WhatsApp, emails, website, Google Maps, business hours. Includes image upload for logo/favicon. |
| `HomepageForm` | Client | Form for hero heading, subheading, CTA text/link, background image upload, stats (dynamic key-value pairs). |
| `SEOForm` | Client | Form for meta title, description, keywords, OG image, canonical URL, robots, schema JSON, twitter card, Facebook app ID, Google/Bing verification. |
| `SocialForm` | Client | Form for Facebook, Instagram, LinkedIn, YouTube, Twitter URLs. |
| `SettingsForm` | Client | Form for footer text, copyright, maintenance mode, feature toggles (blog, quote, WhatsApp, chatbot, call button). |
| `MediaManager` | Client | Image upload with preview, replace existing, delete. Uses Supabase Storage. |
| `ImageUploader` | Shared | Reusable component: file input → preview → upload to Supabase Storage → returns URL. Used by CMS, and designed for future use by Projects, Blogs, Packages, Testimonials, Gallery. |

### ImageUploader API

```typescript
interface ImageUploaderProps {
  bucket: string;        // Storage bucket name (e.g. "cms")
  folder: string;        // Folder within bucket (e.g. "logos")
  currentUrl?: string;   // Existing image URL for preview
  onUpload: (url: string) => void;  // Called after successful upload
  onDelete?: () => void; // Called after image deletion
  accept?: string;       // File types (default: "image/*")
  maxSizeMB?: number;    // Max file size (default: 5)
}
```

---

## 4. Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/dashboard/cms` | Page (existing) | Main CMS dashboard with tabbed interface |
| No new routes needed | — | All CMS management is within the existing `/dashboard/cms` route |

---

## 5. API Actions

All mutations use Next.js Server Actions (existing pattern in `actions.ts`):

| Action | Method | Target | Description |
|--------|--------|--------|-------------|
| `saveCompany(formData)` | Server Action | `cms_company` | Upsert company info for current site |
| `saveHomepage(formData)` | Server Action | `cms_homepage` | Upsert homepage hero + stats for current site |
| `saveSEO(formData)` | Server Action | `cms_seo` | Upsert SEO metadata for current site |
| `saveSocial(formData)` | Server Action | `cms_social` | Upsert social links for current site |
| `saveSettings(formData)` | Server Action | `cms_settings` | Upsert settings for current site |
| `uploadImage(formData)` | Server Action | Storage `cms` | Upload image to Supabase Storage |
| `deleteImage(path)` | Server Action | Storage `cms` | Delete image from Storage |

Each action will:
1. Get the current user from `supabase.auth.getUser()`
2. Use `site_id` from the first matching row (or default)
3. Set `created_by` / `updated_by` to the current user's ID
4. Revalidate `/dashboard/cms` and relevant public paths

---

## 6. Files to Create / Modify / Keep

### Files to CREATE (9)

| File | Purpose |
|------|---------|
| `app/dashboard/cms/components/CompanyForm.tsx` | Company information form |
| `app/dashboard/cms/components/HomepageForm.tsx` | Hero + stats form |
| `app/dashboard/cms/components/SEOForm.tsx` | SEO metadata form |
| `app/dashboard/cms/components/SocialForm.tsx` | Social links form |
| `app/dashboard/cms/components/SettingsForm.tsx` | Settings + feature toggles form |
| `app/dashboard/cms/components/MediaManager.tsx` | Image management |
| `app/dashboard/cms/lib/storage.ts` | Supabase Storage utility |
| `components/shared/ImageUploader.tsx` | Reusable image upload component |
| `supabase/cms_migration.sql` | Database migration script |

### Files to MODIFY (3)

| File | Change |
|------|--------|
| `app/dashboard/cms/page.tsx` | Rewrite to tabbed interface loading all CMS sections |
| `app/dashboard/cms/types.ts` | Rewrite with all CMS type definitions |
| `app/dashboard/cms/actions.ts` | Rewrite with all CMS server actions |

### Files to KEEP (1 — not deleted)

| File | Reason |
|------|--------|
| `app/dashboard/cms/components/HeroForm.tsx` | **Preserved** until HomepageForm is fully implemented and verified |

---

## 7. TypeScript Types (`types.ts`)

```typescript
// ============================================================
// Base
// ============================================================
export interface CMSBase {
  id: number;
  site_id: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// ============================================================
// Company
// ============================================================
export interface CMSCompany extends CMSBase {
  brand_name: string;
  legal_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  currency: string;
  timezone: string;
  language: string;
  gst: string;
  pan: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  support_email: string;
  sales_email: string;
  website: string;
  google_maps_url: string;
  business_hours: string;
}

// ============================================================
// Homepage
// ============================================================
export interface CMSHomepage extends CMSBase {
  hero_heading: string;
  hero_subheading: string;
  hero_cta_text: string;
  hero_cta_link: string;
  hero_background_url: string;
  stats_heading: string;
  stats: CMSStat[];
}

export interface CMSStat {
  label: string;
  value: string;
}

// ============================================================
// SEO
// ============================================================
export interface CMSSEO extends CMSBase {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image_url: string;
  canonical_url: string;
  robots: string;
  schema_json: Record<string, unknown>;
  twitter_card: string;
  facebook_app_id: string;
  google_verification: string;
  bing_verification: string;
}

// ============================================================
// Social
// ============================================================
export interface CMSSocial extends CMSBase {
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  twitter_url: string;
}

// ============================================================
// Settings
// ============================================================
export interface CMSSettings extends CMSBase {
  footer_text: string;
  copyright_text: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  enable_blog: boolean;
  enable_quote: boolean;
  enable_whatsapp: boolean;
  enable_chatbot: boolean;
  enable_call_button: boolean;
}

// ============================================================
// Form state (for client-side use)
// ============================================================
export type CMSFormState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[]>;
};
```

---

## 8. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Data loss if migration fails | High | Low | All tables use `UPSERT` on `site_id`. Existing `hero_banner` table is untouched. |
| Existing `hero_banner` table becomes orphaned | Low | High | Not dropped. Old data preserved. Can be cleaned up later. |
| Image upload fails | Medium | Low | Error handling in `ImageUploader` shows toast. Storage bucket `cms` must be created in Supabase dashboard. |
| Build breaks due to new imports | High | Low | All imports are within the CMS module. No global dependencies. |
| Auth protection bypassed | None | — | CMS is under `/dashboard` which is protected by `proxy.ts`. |
| `created_by` / `updated_by` fails if user not authenticated | Medium | Low | Server actions check `getUser()` before writing. If no user, action throws. |

---

## 9. Migration Script

```sql
-- ============================================================
-- CMS Module Migration
-- Run in Supabase SQL Editor
-- ============================================================

-- Company information
CREATE TABLE IF NOT EXISTS cms_company (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  brand_name TEXT NOT NULL DEFAULT '',
  legal_name TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  favicon_url TEXT NOT NULL DEFAULT '',
  primary_color TEXT NOT NULL DEFAULT '#4f46e5',
  secondary_color TEXT NOT NULL DEFAULT '#06b6d4',
  currency TEXT NOT NULL DEFAULT 'INR',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  language TEXT NOT NULL DEFAULT 'en',
  gst TEXT NOT NULL DEFAULT '',
  pan TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  support_email TEXT NOT NULL DEFAULT '',
  sales_email TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  google_maps_url TEXT NOT NULL DEFAULT '',
  business_hours TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(site_id)
);

-- Homepage hero + stats
CREATE TABLE IF NOT EXISTS cms_homepage (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  hero_heading TEXT NOT NULL DEFAULT '',
  hero_subheading TEXT NOT NULL DEFAULT '',
  hero_cta_text TEXT NOT NULL DEFAULT '',
  hero_cta_link TEXT NOT NULL DEFAULT '',
  hero_background_url TEXT NOT NULL DEFAULT '',
  stats_heading TEXT NOT NULL DEFAULT '',
  stats JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(site_id)
);

-- SEO metadata
CREATE TABLE IF NOT EXISTS cms_seo (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  meta_keywords TEXT NOT NULL DEFAULT '',
  og_image_url TEXT NOT NULL DEFAULT '',
  canonical_url TEXT NOT NULL DEFAULT '',
  robots TEXT NOT NULL DEFAULT 'index, follow',
  schema_json JSONB NOT NULL DEFAULT '{}',
  twitter_card TEXT NOT NULL DEFAULT 'summary_large_image',
  facebook_app_id TEXT NOT NULL DEFAULT '',
  google_verification TEXT NOT NULL DEFAULT '',
  bing_verification TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(site_id)
);

-- Social media links
CREATE TABLE IF NOT EXISTS cms_social (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  facebook_url TEXT NOT NULL DEFAULT '',
  instagram_url TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  youtube_url TEXT NOT NULL DEFAULT '',
  twitter_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(site_id)
);

-- Settings + feature toggles
CREATE TABLE IF NOT EXISTS cms_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  footer_text TEXT NOT NULL DEFAULT '',
  copyright_text TEXT NOT NULL DEFAULT '',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT NOT NULL DEFAULT 'We are currently under maintenance. Please check back soon.',
  enable_blog BOOLEAN NOT NULL DEFAULT true,
  enable_quote BOOLEAN NOT NULL DEFAULT true,
  enable_whatsapp BOOLEAN NOT NULL DEFAULT true,
  enable_chatbot BOOLEAN NOT NULL DEFAULT false,
  enable_call_button BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(site_id)
);

-- Insert default rows for the default site
INSERT INTO cms_company (site_id) VALUES ('00000000-0000-0000-0000-000000000001') ON CONFLICT (site_id) DO NOTHING;
INSERT INTO cms_homepage (site_id) VALUES ('00000000-0000-0000-0000-000000000001') ON CONFLICT (site_id) DO NOTHING;
INSERT INTO cms_seo (site_id) VALUES ('00000000-0000-0000-0000-000000000001') ON CONFLICT (site_id) DO NOTHING;
INSERT INTO cms_social (site_id) VALUES ('00000000-0000-0000-0000-000000000001') ON CONFLICT (site_id) DO NOTHING;
INSERT INTO cms_settings (site_id) VALUES ('00000000-0000-0000-0000-000000000001') ON CONFLICT (site_id) DO NOTHING;
```

---

## 10. Implementation Order

| Step | Description | Dependencies |
|------|-------------|--------------|
| 1 | Run SQL migration in Supabase | None |
| 2 | Create `types.ts` with all CMS types | Step 1 |
| 3 | Create `lib/storage.ts` for Supabase Storage helpers | None |
| 4 | Create `components/shared/ImageUploader.tsx` | None |
| 5 | Create all 5 form components (Company, Homepage, SEO, Social, Settings) | Steps 2, 3, 4 |
| 6 | Create `MediaManager.tsx` | Step 3 |
| 7 | Rewrite `actions.ts` with all server actions | Step 2 |
| 8 | Rewrite `page.tsx` with tabbed interface | Steps 5, 6, 7 |
| 9 | Run build + lint | Step 8 |
| 10 | Verify HomepageForm works | Step 8 |
| 11 | Delete old `HeroForm.tsx` **only after verification** | Step 10 |

---

## 11. Files NOT Modified (Guaranteed)

Per the architectural constraints, the following areas are **not touched**:

| Area | Reason |
|------|--------|
| `proxy.ts` | Auth/middleware — frozen |
| `app/auth/` | Auth routes — frozen |
| `app/login/` | Login page — frozen |
| `lib/supabase/` | Supabase core — frozen |
| `app/layout.tsx` | Root layout — not needed |
| `app/page.tsx` | Homepage — not modified (reads CMS data via components) |
| `components/layout/` | Layout components — not modified |
| `components/home/` | Homepage components — read CMS data but not modified in this phase |
| `next.config.ts` | Build config — not modified |

---

**Awaiting approval to proceed with implementation.**