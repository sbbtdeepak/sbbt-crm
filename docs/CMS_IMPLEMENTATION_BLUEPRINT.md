# CMS Foundation — Implementation Blueprint
## SBBT CRM Next.js Project

**Status:** Awaiting approval  
**Target:** Production-ready CMS module  
**Architecture:** Multi-site ready, modular, Server Action based

---

## 1. Complete Folder Structure

```
sbbt-crm/
├── app/
│   └── dashboard/
│       └── cms/
│           ├── page.tsx                    # Tabbed CMS dashboard page
│           ├── types.ts                    # All CMS TypeScript interfaces
│           ├── actions.ts                  # All CMS Server Actions
│           ├── components/
│           │   ├── CompanyForm.tsx          # Company info form
│           │   ├── HomepageForm.tsx         # Hero + stats form
│           │   ├── SEOForm.tsx              # SEO metadata form
│           │   ├── SocialForm.tsx           # Social links form
│           │   ├── SettingsForm.tsx         # Settings + feature toggles
│           │   └── MediaManager.tsx         # Image management
│           └── lib/
│               └── storage.ts              # Supabase Storage helpers
│
├── components/
│   └── shared/
│       └── ImageUploader.tsx               # Reusable image upload component
│
└── supabase/
    └── cms_migration.sql                   # Database migration script
```

---

## 2. Complete File Tree

```
app/dashboard/cms/
├── page.tsx
│   Purpose: Main CMS page — server component
│   Fetches: All 5 CMS tables in parallel
│   Renders: Tab navigation + active tab content
│   Tabs: Company | Homepage | SEO | Social | Settings | Media
│
├── types.ts
│   Purpose: All TypeScript interfaces
│   Exports: CMSBase, CMSCompany, CMSHomepage, CMSStat,
│            CMSSEO, CMSSocial, CMSSettings, CMSFormState
│
├── actions.ts
│   Purpose: All Server Actions
│   Exports: saveCompany, saveHomepage, saveSEO,
│            saveSocial, saveSettings, uploadImage, deleteImage
│
├── components/
│   ├── CompanyForm.tsx
│   │   Type: Client component ("use client")
│   │   Props: { company: CMSCompany | null }
│   │   Fields: brand_name, legal_name, tagline, logo_url (ImageUploader),
│   │           favicon_url (ImageUploader), primary_color (color picker),
│   │           secondary_color (color picker), currency (select),
│   │           timezone (select), language (select), gst, pan,
│   │           address (textarea), phone, whatsapp, email,
│   │           support_email, sales_email, website,
│   │           google_maps_url, business_hours (textarea)
│   │   Action: saveCompany
│   │   State: loading, error, success toast
│   │
│   ├── HomepageForm.tsx
│   │   Type: Client component ("use client")
│   │   Props: { homepage: CMSHomepage | null }
│   │   Fields: hero_heading, hero_subheading, hero_cta_text,
│   │           hero_cta_link, hero_background_url (ImageUploader),
│   │           stats_heading, stats (dynamic add/remove key-value pairs)
│   │   Action: saveHomepage
│   │   State: loading, error, success toast
│   │
│   ├── SEOForm.tsx
│   │   Type: Client component ("use client")
│   │   Props: { seo: CMSSEO | null }
│   │   Fields: meta_title, meta_description (textarea),
│   │           meta_keywords (tags input), og_image_url (ImageUploader),
│   │           canonical_url, robots (select), schema_json (JSON editor),
│   │           twitter_card (select), facebook_app_id,
│   │           google_verification, bing_verification
│   │   Action: saveSEO
│   │   State: loading, error, success toast
│   │
│   ├── SocialForm.tsx
│   │   Type: Client component ("use client")
│   │   Props: { social: CMSSocial | null }
│   │   Fields: facebook_url, instagram_url, linkedin_url,
│   │           youtube_url, twitter_url
│   │   Action: saveSocial
│   │   State: loading, error, success toast
│   │
│   ├── SettingsForm.tsx
│   │   Type: Client component ("use client")
│   │   Props: { settings: CMSSettings | null }
│   │   Fields: footer_text (textarea), copyright_text,
│   │           maintenance_mode (toggle), maintenance_message (textarea),
│   │           enable_blog (toggle), enable_quote (toggle),
│   │           enable_whatsapp (toggle), enable_chatbot (toggle),
│   │           enable_call_button (toggle)
│   │   Action: saveSettings
│   │   State: loading, error, success toast
│   │
│   └── MediaManager.tsx
│       Type: Client component ("use client")
│       Props: none (self-contained)
│       Features: List all images in cms bucket,
│                 Upload new image (ImageUploader),
│                 Copy URL to clipboard,
│                 Delete image with confirmation
│       State: images[], loading, error, success toast
│
└── lib/
    └── storage.ts
        Purpose: Supabase Storage utility functions
        Exports: uploadFile, deleteFile, getPublicUrl, listFiles
        Bucket: "cms"
        Folders: logos/, favicons/, hero/, og-images/, general/

components/shared/
└── ImageUploader.tsx
    Type: Client component ("use client")
    Props: { bucket, folder, currentUrl?, onUpload, onDelete?, accept?, maxSizeMB? }
    States: idle, uploading (progress), preview, error
    Features: Drag & drop, file picker, preview, replace, remove
    Used by: CompanyForm, HomepageForm, SEOForm, MediaManager
    Future use: Projects, Blogs, Packages, Testimonials, Gallery
```

---

## 3. Database Schema (All 5 Tables)

### Table: `cms_company`

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| id | BIGINT | `GENERATED ALWAYS AS IDENTITY` | PRIMARY KEY |
| site_id | UUID | `'00000000-0000-0000-0000-000000000001'` | NOT NULL, UNIQUE |
| brand_name | TEXT | `''` | NOT NULL |
| legal_name | TEXT | `''` | NOT NULL |
| tagline | TEXT | `''` | NOT NULL |
| logo_url | TEXT | `''` | NOT NULL |
| favicon_url | TEXT | `''` | NOT NULL |
| primary_color | TEXT | `'#4f46e5'` | NOT NULL |
| secondary_color | TEXT | `'#06b6d4'` | NOT NULL |
| currency | TEXT | `'INR'` | NOT NULL |
| timezone | TEXT | `'Asia/Kolkata'` | NOT NULL |
| language | TEXT | `'en'` | NOT NULL |
| gst | TEXT | `''` | NOT NULL |
| pan | TEXT | `''` | NOT NULL |
| address | TEXT | `''` | NOT NULL |
| phone | TEXT | `''` | NOT NULL |
| whatsapp | TEXT | `''` | NOT NULL |
| email | TEXT | `''` | NOT NULL |
| support_email | TEXT | `''` | NOT NULL |
| sales_email | TEXT | `''` | NOT NULL |
| website | TEXT | `''` | NOT NULL |
| google_maps_url | TEXT | `''` | NOT NULL |
| business_hours | TEXT | `''` | NOT NULL |
| created_at | TIMESTAMPTZ | `now()` | |
| updated_at | TIMESTAMPTZ | `now()` | |
| created_by | UUID | | REFERENCES auth.users(id) |
| updated_by | UUID | | REFERENCES auth.users(id) |

**Unique constraint:** `UNIQUE(site_id)`

### Table: `cms_homepage`

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| id | BIGINT | `GENERATED ALWAYS AS IDENTITY` | PRIMARY KEY |
| site_id | UUID | `'00000000-0000-0000-0000-000000000001'` | NOT NULL, UNIQUE |
| hero_heading | TEXT | `''` | NOT NULL |
| hero_subheading | TEXT | `''` | NOT NULL |
| hero_cta_text | TEXT | `''` | NOT NULL |
| hero_cta_link | TEXT | `''` | NOT NULL |
| hero_background_url | TEXT | `''` | NOT NULL |
| stats_heading | TEXT | `''` | NOT NULL |
| stats | JSONB | `'[]'` | NOT NULL |
| created_at | TIMESTAMPTZ | `now()` | |
| updated_at | TIMESTAMPTZ | `now()` | |
| created_by | UUID | | REFERENCES auth.users(id) |
| updated_by | UUID | | REFERENCES auth.users(id) |

**Unique constraint:** `UNIQUE(site_id)`

### Table: `cms_seo`

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| id | BIGINT | `GENERATED ALWAYS AS IDENTITY` | PRIMARY KEY |
| site_id | UUID | `'00000000-0000-0000-0000-000000000001'` | NOT NULL, UNIQUE |
| meta_title | TEXT | `''` | NOT NULL |
| meta_description | TEXT | `''` | NOT NULL |
| meta_keywords | TEXT | `''` | NOT NULL |
| og_image_url | TEXT | `''` | NOT NULL |
| canonical_url | TEXT | `''` | NOT NULL |
| robots | TEXT | `'index, follow'` | NOT NULL |
| schema_json | JSONB | `'{}'` | NOT NULL |
| twitter_card | TEXT | `'summary_large_image'` | NOT NULL |
| facebook_app_id | TEXT | `''` | NOT NULL |
| google_verification | TEXT | `''` | NOT NULL |
| bing_verification | TEXT | `''` | NOT NULL |
| created_at | TIMESTAMPTZ | `now()` | |
| updated_at | TIMESTAMPTZ | `now()` | |
| created_by | UUID | | REFERENCES auth.users(id) |
| updated_by | UUID | | REFERENCES auth.users(id) |

**Unique constraint:** `UNIQUE(site_id)`

### Table: `cms_social`

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| id | BIGINT | `GENERATED ALWAYS AS IDENTITY` | PRIMARY KEY |
| site_id | UUID | `'00000000-0000-0000-0000-000000000001'` | NOT NULL, UNIQUE |
| facebook_url | TEXT | `''` | NOT NULL |
| instagram_url | TEXT | `''` | NOT NULL |
| linkedin_url | TEXT | `''` | NOT NULL |
| youtube_url | TEXT | `''` | NOT NULL |
| twitter_url | TEXT | `''` | NOT NULL |
| created_at | TIMESTAMPTZ | `now()` | |
| updated_at | TIMESTAMPTZ | `now()` | |
| created_by | UUID | | REFERENCES auth.users(id) |
| updated_by | UUID | | REFERENCES auth.users(id) |

**Unique constraint:** `UNIQUE(site_id)`

### Table: `cms_settings`

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| id | BIGINT | `GENERATED ALWAYS AS IDENTITY` | PRIMARY KEY |
| site_id | UUID | `'00000000-0000-0000-0000-000000000001'` | NOT NULL, UNIQUE |
| footer_text | TEXT | `''` | NOT NULL |
| copyright_text | TEXT | `''` | NOT NULL |
| maintenance_mode | BOOLEAN | `false` | NOT NULL |
| maintenance_message | TEXT | `'We are currently under maintenance. Please check back soon.'` | NOT NULL |
| enable_blog | BOOLEAN | `true` | NOT NULL |
| enable_quote | BOOLEAN | `true` | NOT NULL |
| enable_whatsapp | BOOLEAN | `true` | NOT NULL |
| enable_chatbot | BOOLEAN | `false` | NOT NULL |
| enable_call_button | BOOLEAN | `true` | NOT NULL |
| created_at | TIMESTAMPTZ | `now()` | |
| updated_at | TIMESTAMPTZ | `now()` | |
| created_by | UUID | | REFERENCES auth.users(id) |
| updated_by | UUID | | REFERENCES auth.users(id) |

**Unique constraint:** `UNIQUE(site_id)`

---

## 4. Supabase Storage Bucket Structure

```
Bucket: cms (public)
├── logos/
│   └── {timestamp}-{random}.{ext}     # Company logos
├── favicons/
│   └── {timestamp}-{random}.{ext}     # Favicon files
├── hero/
│   └── {timestamp}-{random}.{ext}     # Hero background images
├── og-images/
│   └── {timestamp}-{random}.{ext}     # Open Graph images
└── general/
    └── {timestamp}-{random}.{ext}     # General purpose uploads
```

**Naming convention:** `Date.now()_${random}.${ext}` — ensures uniqueness and chronological sorting.

**Access control:** Public read (images served on public pages), authenticated write (via Server Actions).

---

## 5. Server Actions

### `saveCompany(formData: FormData): Promise<CMSFormState>`

```
Input:  formData with all company fields + id (for upsert)
Flow:
  1. Validate required fields
  2. Get current user via supabase.auth.getUser()
  3. If user not authenticated → return error
  4. Upsert into cms_company where site_id = default
  5. Set created_by on insert, updated_by on update
  6. RevalidatePath /dashboard/cms
  7. Return { success: true, message: "Company saved" }
Error: Return { success: false, message: error.message }
```

### `saveHomepage(formData: FormData): Promise<CMSFormState>`

```
Input:  formData with hero fields + stats JSON string + id
Flow:
  1. Parse stats from JSON string
  2. Get current user
  3. Upsert into cms_homepage where site_id = default
  4. RevalidatePath /dashboard/cms, /
  5. Return { success: true, message: "Homepage saved" }
Error: Return { success: false, message: error.message }
```

### `saveSEO(formData: FormData): Promise<CMSFormState>`

```
Input:  formData with SEO fields + schema_json JSON string + id
Flow:
  1. Parse schema_json from JSON string
  2. Get current user
  3. Upsert into cms_seo where site_id = default
  4. RevalidatePath /dashboard/cms
  5. Return { success: true, message: "SEO saved" }
Error: Return { success: false, message: error.message }
```

### `saveSocial(formData: FormData): Promise<CMSFormState>`

```
Input:  formData with social URL fields + id
Flow:
  1. Get current user
  2. Upsert into cms_social where site_id = default
  3. RevalidatePath /dashboard/cms
  4. Return { success: true, message: "Social links saved" }
Error: Return { success: false, message: error.message }
```

### `saveSettings(formData: FormData): Promise<CMSFormState>`

```
Input:  formData with settings fields (booleans as "on"/"off") + id
Flow:
  1. Convert checkbox values to boolean
  2. Get current user
  3. Upsert into cms_settings where site_id = default
  4. RevalidatePath /dashboard/cms
  5. Return { success: true, message: "Settings saved" }
Error: Return { success: false, message: error.message }
```

### `uploadImage(formData: FormData): Promise<{ url: string } | { error: string }>`

```
Input:  formData with file + folder name
Flow:
  1. Extract file and folder from formData
  2. Validate file type (image/*)
  3. Validate file size (max 5MB)
  4. Generate unique filename: ${Date.now()}_${random}.${ext}
  5. Upload to Supabase Storage: cms/{folder}/{filename}
  6. Get public URL
  7. Return { url: publicUrl }
Error: Return { error: error.message }
```

### `deleteImage(path: string): Promise<{ success: boolean } | { error: string }>`

```
Input:  Full storage path (e.g. "logos/abc123.png")
Flow:
  1. Remove file from Supabase Storage
  2. Return { success: true }
Error: Return { error: error.message }
```

---

## 6. Components Hierarchy

```
app/dashboard/cms/page.tsx (Server Component)
│
├── Fetches all 5 CMS tables in parallel:
│   ├── cms_company    → company: CMSCompany | null
│   ├── cms_homepage   → homepage: CMSHomepage | null
│   ├── cms_seo        → seo: CMSSEO | null
│   ├── cms_social     → social: CMSSocial | null
│   └── cms_settings   → settings: CMSSettings | null
│
└── Renders:
    ├── Tab Navigation (client-side state: activeTab)
    │   ├── "Company"    → <CompanyForm company={company} />
    │   ├── "Homepage"   → <HomepageForm homepage={homepage} />
    │   ├── "SEO"        → <SEOForm seo={seo} />
    │   ├── "Social"     → <SocialForm social={social} />
    │   ├── "Settings"   → <SettingsForm settings={settings} />
    │   └── "Media"      → <MediaManager />
    │
    └── Each form component:
        ├── Uses useActionState() for form submission
        ├── Uses ImageUploader for image fields
        ├── Shows toast on success/error
        └── Disables submit button while loading

components/shared/ImageUploader.tsx (Client Component)
│
├── Props: { bucket, folder, currentUrl, onUpload, onDelete, accept, maxSizeMB }
│
├── States:
│   ├── idle: Shows upload area or current image preview
│   ├── uploading: Shows progress indicator
│   ├── preview: Shows uploaded image with replace/remove buttons
│   └── error: Shows error message
│
└── Behavior:
    ├── Click/drag to select file
    ├── Validate type and size client-side
    ├── Upload via uploadImage Server Action
    ├── Call onUpload(url) on success
    ├── Call onDelete() on remove
    └── Show preview of current image
```

---

## 7. Data Flow

```
DATABASE (Supabase)
    │
    ├─── page.tsx (Server Component)
    │    │
    │    │   Parallel fetch on page load:
    │    │   ├── SELECT * FROM cms_company WHERE site_id = default
    │    │   ├── SELECT * FROM cms_homepage WHERE site_id = default
    │    │   ├── SELECT * FROM cms_seo WHERE site_id = default
    │    │   ├── SELECT * FROM cms_social WHERE site_id = default
    │    │   └── SELECT * FROM cms_settings WHERE site_id = default
    │    │
    │    └── Passes data as props to form components
    │
    └─── Form Components (Client Components)
         │
         │   User fills form → clicks Save
         │
         ├─── Calls Server Action (e.g. saveCompany(formData))
         │    │
         │    │   Server Action flow:
         │    │   ├── Validate input
         │    │   ├── Get current user (supabase.auth.getUser())
         │    │   ├── UPSERT into table WHERE site_id = default
         │    │   │   ├── If row exists → UPDATE SET updated_by = user.id
         │    │   │   └── If no row → INSERT SET created_by = user.id
         │    │   ├── revalidatePath("/dashboard/cms")
         │    │   └── Return { success, message }
         │    │
         │    └── Form receives result → shows toast
         │
         └─── ImageUploader
              │
              ├── User selects file
              ├── Client-side validation (type, size)
              ├── Calls uploadImage(formData) Server Action
              │   ├── Upload to Supabase Storage
              │   └── Return public URL
              └── Calls onUpload(url) → sets hidden input value
```

---

## 8. API Flow

```
BROWSER                          NEXT.JS SERVER                    SUPABASE
│                                    │                                │
│  GET /dashboard/cms                │                                │
│ ─────────────────────────────────► │                                │
│                                    │                                │
│                                    │  proxy.ts checks auth          │
│                                    │  ├── getUser()                 │
│                                    │  │                           │
│                                    │  │  GET /auth/v1/user ◄───────►│
│                                    │  │                           │
│                                    │  └── user found → continue     │
│                                    │                                │
│                                    │  page.tsx (Server Component)   │
│                                    │  ├── createClient()            │
│                                    │  ├── SELECT cms_company ◄─────►│
│                                    │  ├── SELECT cms_homepage ◄────►│
│                                    │  ├── SELECT cms_seo ◄─────────►│
│                                    │  ├── SELECT cms_social ◄──────►│
│                                    │  └── SELECT cms_settings ◄────►│
│                                    │                                │
│  ◄── HTML with all data ──────────│                                │
│                                    │                                │
│  User edits form → clicks Save     │                                │
│                                    │                                │
│  POST (Server Action)              │                                │
│  formData ───────────────────────► │                                │
│                                    │                                │
│                                    │  saveCompany(formData)         │
│                                    │  ├── getUser()               │
│                                    │  │                           │
│                                    │  │  GET /auth/v1/user ◄───────►│
│                                    │  │                           │
│                                    │  ├── UPSERT cms_company ◄─────►│
│                                    │  ├── revalidatePath()          │
│                                    │  └── Return { success }        │
│                                    │                                │
│  ◄── { success: true } ───────────│                                │
│                                    │                                │
│  Show toast: "Company saved"       │                                │
│                                    │                                │
│  Image Upload                      │                                │
│                                    │                                │
│  POST (Server Action)              │                                │
│  file + folder ──────────────────► │                                │
│                                    │                                │
│                                    │  uploadImage(formData)         │
│                                    │  ├── Validate file             │
│                                    │  ├── Upload to Storage ◄──────►│
│                                    │  └── Return { url }            │
│                                    │                                │
│  ◄── { url: "https://..." } ──────│                                │
│                                    │                                │
│  Set hidden input value = url      │                                │
│  Show image preview                │                                │
```

---

## 9. Dashboard Navigation Flow

```
USER LOGS IN
    │
    ▼
/dashboard (Main Dashboard)
    │
    │   Sidebar menu:
    │   ├── Dashboard    → /dashboard
    │   ├── CMS          → /dashboard/cms    ◄── THIS MODULE
    │   ├── Packages     → /dashboard/packages
    │   ├── Projects     → /dashboard/projects
    │   ├── Leads        → /dashboard/leads
    │   ├── Quotations   → /dashboard/quotations
    │   ├── Testimonials → /dashboard/testimonials
    │   ├── Blogs        → /dashboard/blogs
    │   ├── SEO          → /dashboard/seo
    │   ├── Media        → /dashboard/media
    │   ├── Settings     → /dashboard/settings
    │   └── Profile      → /dashboard/profile
    │
    ▼
/dashboard/cms
    │
    │   Tab Navigation (horizontal tabs):
    │
    ├── Tab: Company ─────────────────────────────────────────────
    │   Content: CompanyForm
    │   Fields: brand_name, legal_name, tagline, logo, favicon,
    │           colors, currency, timezone, language, GST, PAN,
    │           address, phone, WhatsApp, emails, website, maps, hours
    │   Action: Save → saveCompany() → toast → revalidate
    │
    ├── Tab: Homepage ────────────────────────────────────────────
    │   Content: HomepageForm
    │   Fields: hero_heading, hero_subheading, hero_cta_text,
    │           hero_cta_link, hero_background, stats_heading, stats[]
    │   Action: Save → saveHomepage() → toast → revalidate
    │
    ├── Tab: SEO ─────────────────────────────────────────────────
    │   Content: SEOForm
    │   Fields: meta_title, meta_description, meta_keywords,
    │           og_image, canonical, robots, schema_json,
    │           twitter_card, facebook_app_id, google_verification,
    │           bing_verification
    │   Action: Save → saveSEO() → toast → revalidate
    │
    ├── Tab: Social ──────────────────────────────────────────────
    │   Content: SocialForm
    │   Fields: facebook_url, instagram_url, linkedin_url,
    │           youtube_url, twitter_url
    │   Action: Save → saveSocial() → toast → revalidate
    │
    ├── Tab: Settings ────────────────────────────────────────────
    │   Content: SettingsForm
    │   Fields: footer_text, copyright_text, maintenance_mode,
    │           maintenance_message, enable_blog, enable_quote,
    │           enable_whatsapp, enable_chatbot, enable_call_button
    │   Action: Save → saveSettings() → toast → revalidate
    │
    └── Tab: Media ───────────────────────────────────────────────
        Content: MediaManager
        Features: List all images, upload new, copy URL, delete
        Action: uploadImage() / deleteImage() → toast → refresh list
```

---

## 10. Public Website Integration Flow

```
PUBLIC WEBSITE (app/page.tsx + components/home/*)
    │
    │   These components ALREADY EXIST and are NOT modified.
    │   They currently use hardcoded data or the old hero_banner table.
    │
    │   Future integration (separate feature phase):
    │
    ├── Hero.tsx
    │   Currently: Hardcoded heading, subheading, CTA
    │   Future: Read from cms_homepage via Server Component
    │   │
    │   │   import { createClient } from "@/lib/supabase/server";
    │   │   const supabase = await createClient();
    │   │   const { data } = await supabase
    │   │     .from("cms_homepage")
    │   │     .select("*")
    │   │     .eq("site_id", DEFAULT_SITE_ID)
    │   │     .single();
    │   │   // Use data.hero_heading, data.hero_subheading, etc.
    │   │
    │
    ├── Footer.tsx
    │   Currently: Hardcoded company info
    │   Future: Read from cms_company + cms_settings
    │
    ├── Header.tsx
    │   Currently: Hardcoded logo and nav
    │   Future: Read logo_url from cms_company
    │
    ├── layout.tsx (root)
    │   Currently: Static metadata
    │   Future: Read from cms_seo for dynamic meta tags
    │
    └── app/page.tsx
        Currently: Static composition of home components
        Future: Components read CMS data internally
```

### Data Flow: CMS Dashboard → Public Website

```
┌─────────────────────────────────────────────────────────────────┐
│                    CMS DASHBOARD (Admin)                        │
│                                                                 │
│  Admin logs in → /dashboard/cms                                │
│  Fills forms → Server Actions → Supabase Database              │
│  revalidatePath("/") → public pages refresh                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Data flows through Supabase
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PUBLIC WEBSITE (Users)                       │
│                                                                 │
│  Server Components fetch from cms_* tables                     │
│  No API calls — direct database queries                        │
│  Automatically reflects CMS changes after revalidation         │
└─────────────────────────────────────────────────────────────────┘
```

### Revalidation Strategy

| CMS Action | Revalidates |
|------------|-------------|
| saveCompany | `/dashboard/cms` |
| saveHomepage | `/dashboard/cms`, `/` |
| saveSEO | `/dashboard/cms` |
| saveSocial | `/dashboard/cms` |
| saveSettings | `/dashboard/cms` |
| uploadImage | `/dashboard/cms` |
| deleteImage | `/dashboard/cms` |

---

## Implementation Order (Code Generation)

| Phase | Files | Description |
|-------|-------|-------------|
| **Phase 1** | `supabase/cms_migration.sql` | Database migration script |
| **Phase 2** | `app/dashboard/cms/types.ts` | All TypeScript types |
| **Phase 3** | `app/dashboard/cms/lib/storage.ts` | Storage utility |
| **Phase 4** | `components/shared/ImageUploader.tsx` | Reusable image upload |
| **Phase 5** | `app/dashboard/cms/actions.ts` | All Server Actions |
| **Phase 6** | All 5 form components + MediaManager | UI components |
| **Phase 7** | `app/dashboard/cms/page.tsx` | Tabbed CMS page |
| **Phase 8** | Build + lint + verify | Quality check |

---

**Awaiting approval to begin code generation.**