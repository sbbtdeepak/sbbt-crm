// ============================================================
// CMS Module — TypeScript Types
// SBBT CRM Next.js Project
//
// This file defines all TypeScript interfaces for the CMS module.
// Types are organized into three layers per entity:
//   - Row:   Shape of a database row (read)
//   - Insert: Shape for creating a new row (omit id, timestamps, audit)
//   - Update: Shape for updating an existing row (partial, omit id)
//
// All entities extend CMSBase which provides the common columns:
//   id, site_id, created_at, updated_at, created_by, updated_by
//
// Multi-site support is built in via site_id (UUID).
// ============================================================

// ============================================================
// Base Types
// ============================================================

/**
 * Common columns present in every CMS table.
 * Provides multi-site support (site_id) and audit trail
 * (created_by, updated_by referencing auth.users).
 */
export interface CMSBase {
  /** Auto-incrementing primary key */
  id: number;
  /** UUID for multi-site/tenant support. Default site: 00000000-0000-0000-0000-000000000001 */
  site_id: string;
  /** Timestamp of row creation (set by database) */
  created_at: string | null;
  /** Timestamp of last update (set by database) */
  updated_at: string | null;
  /** UUID of the auth.users who created this row */
  created_by: string | null;
  /** UUID of the auth.users who last updated this row */
  updated_by: string | null;
}

/**
 * Shape for inserting a new row.
 * Omits id (auto-generated), timestamps (set by database),
 * and audit fields (set by server action).
 */
export type CMSInsert<T extends CMSBase> = Omit<
  T,
  "id" | "created_at" | "updated_at" | "created_by" | "updated_by"
>;

/**
 * Shape for updating an existing row.
 * All fields optional except site_id (required for lookup).
 */
export type CMSUpdate<T extends CMSBase> = Partial<
  Omit<T, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">
> & {
  site_id: string;
};

// ============================================================
// Company
// ============================================================

/**
 * Company information for the site.
 * Stores brand identity, contact details, and localization settings.
 */
export interface CMSCompanyRow extends CMSBase {
  /** Display brand name (e.g. "SBBT Construction") */
  brand_name: string;
  /** Registered legal entity name */
  legal_name: string;
  /** Short brand tagline */
  tagline: string;
  /** URL to company logo image (stored in cms/logos/) */
  logo_url: string;
  /** URL to favicon image (stored in cms/favicons/) */
  favicon_url: string;
  /** Primary brand color (hex, e.g. "#4f46e5") */
  primary_color: string;
  /** Secondary brand color (hex, e.g. "#06b6d4") */
  secondary_color: string;
  /** Currency code (e.g. "INR", "USD") */
  currency: string;
  /** IANA timezone (e.g. "Asia/Kolkata") */
  timezone: string;
  /** Language code (e.g. "en", "hi") */
  language: string;
  /** Goods and Services Tax ID */
  gst: string;
  /** Permanent Account Number (tax ID) */
  pan: string;
  /** Physical address */
  address: string;
  /** Primary phone number */
  phone: string;
  /** WhatsApp number */
  whatsapp: string;
  /** Primary email address */
  email: string;
  /** Customer support email */
  support_email: string;
  /** Sales email */
  sales_email: string;
  /** Website URL */
  website: string;
  /** Google Maps embed URL or location URL */
  google_maps_url: string;
  /** Business hours description (e.g. "Mon-Sat: 9:00 AM - 6:00 PM") */
  business_hours: string;
  /** Alternate mobile number */
  alternate_mobile: string;
  /** Grievance email address */
  grievance_email: string;
  /** Google rating (0-5) */
  google_rating: number;
  /** Years of experience */
  years_experience: number;
  /** Homes delivered count */
  homes_delivered: number;
  /** Projects completed count */
  projects_completed: number;
}

/** Shape for inserting a new company row */
export type CMSCompanyInsert = CMSInsert<CMSCompanyRow>;

/** Shape for updating an existing company row */
export type CMSCompanyUpdate = CMSUpdate<CMSCompanyRow>;

/** @deprecated Use CMSCompanyRow for database row type */
export type CMSCompany = CMSCompanyRow;

/**
 * Public company data shape for client-side consumption.
 * Used by Header, Footer, Hero, Contact, and other public components.
 */
export interface CompanyPublicData {
  brand_name: string;
  legal_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  phone: string;
  alternate_mobile: string;
  whatsapp: string;
  email: string;
  grievance_email: string;
  support_email: string;
  sales_email: string;
  website: string;
  address: string;
  google_maps_url: string;
  google_rating: number;
  years_experience: number;
  homes_delivered: number;
  projects_completed: number;
  gst: string;
  pan: string;
  business_hours: string;
  primary_color: string;
  secondary_color: string;
}

// ============================================================
// Internal Settings (Admin Only)
// ============================================================

/**
 * Internal settings for admin-only configuration.
 * NOT exposed on the public website.
 * Controls notification emails, integration URLs, and API readiness.
 */
export interface CMSInternalSettingsRow extends CMSBase {
  /** Email address for lead notifications */
  lead_notification_email: string;
  /** Sales email address */
  sales_email: string;
  /** Quotation email address */
  quotation_email: string;
  /** Support email address */
  support_email: string;
  /** Accounts email address */
  accounts_email: string;
  /** Google Sheets URL for lead export */
  google_sheet_url: string;
  /** Webhook URL for external integrations */
  webhook_url: string;
  /** Whether SMTP is configured and ready */
  smtp_ready: boolean;
  /** Whether Resend is configured and ready */
  resend_ready: boolean;
  /** WhatsApp API phone number */
  whatsapp_api_number: string;
  /** API keys for future integrations (JSONB placeholder) */
  api_keys: Record<string, unknown>;
}

/** Shape for inserting a new internal settings row */
export type CMSInternalSettingsInsert = CMSInsert<CMSInternalSettingsRow>;

/** Shape for updating an existing internal settings row */
export type CMSInternalSettingsUpdate = CMSUpdate<CMSInternalSettingsRow>;

// ============================================================
// Hero Banner
// ============================================================

/**
 * Hero banner content for the homepage.
 * Controls the main hero section displayed on the public homepage.
 */
export interface HeroBanner {
  /** Auto-incrementing primary key */
  id: number;
  /** Main hero heading text */
  title: string;
  /** Hero subheading / description text */
  subtitle: string;
  /** Call-to-action button text */
  button_text: string;
  /** Call-to-action button link */
  button_link: string;
  /** URL to hero background image */
  image_url: string;
}

// ============================================================
// Homepage
// ============================================================

/**
 * A single statistic displayed on the homepage hero section.
 * Consists of a label and its corresponding value.
 */
export interface CMSStat {
  /** Display label (e.g. "Years of Experience") */
  label: string;
  /** Display value (e.g. "15+") */
  value: string;
}

/**
 * Homepage hero section content and statistics.
 * Controls the main banner and stats display on the public homepage.
 */
export interface CMSHomepageRow extends CMSBase {
  /** Main hero heading text */
  hero_heading: string;
  /** Hero subheading / description text */
  hero_subheading: string;
  /** Call-to-action button text */
  hero_cta_text: string;
  /** Call-to-action button link */
  hero_cta_link: string;
  /** URL to hero background image (stored in cms/hero/) */
  hero_background_url: string;
  /** Heading text displayed above the statistics section */
  stats_heading: string;
  /** Array of statistics as JSONB */
  stats: CMSStat[];
}

/** Shape for inserting a new homepage row */
export type CMSHomepageInsert = CMSInsert<CMSHomepageRow>;

/** Shape for updating an existing homepage row */
export type CMSHomepageUpdate = CMSUpdate<CMSHomepageRow>;

/** @deprecated Use CMSHomepageRow for database row type */
export type CMSHomepage = CMSHomepageRow;

// ============================================================
// SEO
// ============================================================

/**
 * SEO metadata for the site.
 * Controls search engine indexing, social sharing, and verification.
 */
export interface CMSSEORow extends CMSBase {
  /** Default meta title for the site */
  meta_title: string;
  /** Default meta description */
  meta_description: string;
  /** Comma-separated meta keywords */
  meta_keywords: string;
  /** URL to Open Graph image (stored in cms/og-images/) */
  og_image_url: string;
  /** Canonical URL for the site */
  canonical_url: string;
  /** Robots meta directive (e.g. "index, follow", "noindex, nofollow") */
  robots: string;
  /** Structured data / JSON-LD schema as JSON object */
  schema_json: Record<string, unknown>;
  /** Twitter card type (e.g. "summary_large_image", "summary") */
  twitter_card: string;
  /** Facebook App ID for social integration */
  facebook_app_id: string;
  /** Google Search Console verification code */
  google_verification: string;
  /** Bing Webmaster Tools verification code */
  bing_verification: string;
}

/** Shape for inserting a new SEO row */
export type CMSSeoInsert = CMSInsert<CMSSEORow>;

/** Shape for updating an existing SEO row */
export type CMSSeoUpdate = CMSUpdate<CMSSEORow>;

/** @deprecated Use CMSSEORow for database row type */
export type CMSSEO = CMSSEORow;

// ============================================================
// Social
// ============================================================

/**
 * Social media profile links for the site.
 * Each field stores the full URL to the respective social profile.
 */
export interface CMSSocialRow extends CMSBase {
  /** Facebook page/profile URL */
  facebook_url: string;
  /** Instagram profile URL */
  instagram_url: string;
  /** LinkedIn company/page URL */
  linkedin_url: string;
  /** YouTube channel URL */
  youtube_url: string;
  /** Twitter/X profile URL */
  twitter_url: string;
}

/** Shape for inserting a new social row */
export type CMSSocialInsert = CMSInsert<CMSSocialRow>;

/** Shape for updating an existing social row */
export type CMSSocialUpdate = CMSUpdate<CMSSocialRow>;

/** @deprecated Use CMSSocialRow for database row type */
export type CMSSocial = CMSSocialRow;

// ============================================================
// Settings
// ============================================================

/**
 * Site-wide settings and feature toggles.
 * Controls footer content, maintenance mode, and available features.
 */
export interface CMSSettingsRow extends CMSBase {
  /** Custom footer text/HTML */
  footer_text: string;
  /** Copyright notice text */
  copyright_text: string;
  /** Whether the site is in maintenance mode */
  maintenance_mode: boolean;
  /** Message displayed during maintenance mode */
  maintenance_message: string;
  /** Whether the blog feature is enabled */
  enable_blog: boolean;
  /** Whether the quote request feature is enabled */
  enable_quote: boolean;
  /** Whether WhatsApp contact button is enabled */
  enable_whatsapp: boolean;
  /** Whether the chatbot is enabled */
  enable_chatbot: boolean;
  /** Whether the call button is enabled */
  enable_call_button: boolean;
}

/** Shape for inserting a new settings row */
export type CMSSettingsInsert = CMSInsert<CMSSettingsRow>;

/** Shape for updating an existing settings row */
export type CMSSettingsUpdate = CMSUpdate<CMSSettingsRow>;

/** @deprecated Use CMSSettingsRow for database row type */
export type CMSSettings = CMSSettingsRow;

// ============================================================
// Packages
// ============================================================

/**
 * A feature item within a package.
 * Stored in cms_package_features table.
 */
export interface CMSPackageFeature {
  /** Icon identifier (e.g. icon name "shield-check", "clock") */
  icon: string;
  /** Feature title (e.g. "Structural Warranty") */
  title: string;
  /** Feature description */
  description: string;
}

/**
 * A specification item within a package.
 * Stored in cms_package_specifications table.
 */
export interface CMSPackageSpecification {
  /** Specification category (e.g. "Flooring", "Electrical") */
  category: string;
  /** Specification item name */
  item: string;
  /** Brand name for the specification */
  brand: string;
  /** Additional remarks */
  remarks: string;
}

/**
 * A gallery image within a package.
 * Stored in cms_package_gallery table.
 */
export interface CMSPackageGalleryItem {
  /** URL to the image (stored in cms/packages/) */
  image_url: string;
  /** Image caption */
  caption: string;
}

/**
 * Package row from cms_packages table.
 */
export interface CMSPackageRow extends CMSBase {
  /** Package name (e.g. "Silver", "Gold", "Platinum") */
  name: string;
  /** URL-friendly unique identifier */
  slug: string;
  /** Price per square foot in INR */
  price: number;
  /** Short description for cards/summary display */
  short_description: string;
  /** Full detailed description */
  description: string;
  /** Sort order for display (ascending) */
  display_order: number;
  /** Whether the package is published and visible */
  is_active: boolean;
  /** URL to thumbnail image (stored in cms/packages/) */
  thumbnail_url: string;
  /** URL to banner image (stored in cms/packages/) */
  banner_url: string;
  /** Meta title for SEO */
  meta_title: string;
  /** Meta description for SEO */
  meta_description: string;
  /** URL to Open Graph image (stored in cms/packages/) */
  og_image_url: string;
}

/** Shape for inserting a new package */
export type CMSPackageInsert = CMSInsert<CMSPackageRow>;

/** Shape for updating an existing package */
export type CMSPackageUpdate = CMSUpdate<CMSPackageRow>;

/**
 * Full package data including relations.
 * Used for the CMS form and API responses.
 */
export interface CMSPackageFull {
  /** The main package row */
  package: CMSPackageRow;
  /** Associated features sorted by display_order */
  features: CMSPackageFeature[];
  /** Associated specifications sorted by display_order */
  specifications: CMSPackageSpecification[];
  /** Associated gallery images sorted by display_order */
  gallery: CMSPackageGalleryItem[];
}

/** Form state for package server actions */
export interface CMSPackageFormState extends CMSFormState {
  /** Server-side validation errors keyed by field path */
  errors?: Record<string, string[]>;
  /** Generated slug (returned for preview after name entry) */
  slug?: string;
}

// ============================================================
// Projects
// ============================================================

/**
 * A gallery image within a project.
 */
export interface CMSProjectGalleryItem {
  image_url: string;
  caption: string;
}

/**
 * A before/after image within a project.
 */
export interface CMSProjectBeforeAfterItem {
  image_url: string;
  caption: string;
}

/**
 * Project row from cms_projects table.
 */
export interface CMSProjectRow extends CMSBase {
  name: string;
  slug: string;
  client_name: string;
  location: string;
  project_type: string;
  package_used: string;
  plot_area: string;
  built_up_area: string;
  floors: string;
  completion_date: string;
  status: string;
  short_description: string;
  description: string;
  cover_image_url: string;
  video_url: string;
  project_value: string;
  duration: string;
  team_size: string;
  customer_rating: number;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
}

/** Shape for inserting a new project */
export type CMSProjectInsert = CMSInsert<CMSProjectRow>;

/** Shape for updating an existing project */
export type CMSProjectUpdate = CMSUpdate<CMSProjectRow>;

/**
 * Full project data including relations.
 */
export interface CMSProjectFull {
  project: CMSProjectRow;
  gallery: CMSProjectGalleryItem[];
  beforeImages: CMSProjectBeforeAfterItem[];
  afterImages: CMSProjectBeforeAfterItem[];
}

/** Form state for project server actions */
export interface CMSProjectFormState extends CMSFormState {
  errors?: Record<string, string[]>;
}

// ============================================================
// Media
// ============================================================

/**
 * Represents a single file stored in the CMS storage bucket.
 * Used by the MediaManager component for listing and management.
 */
export interface CMSMediaItem {
  /** File name in storage (e.g. "logos/abc123.png") */
  name: string;
  /** Public URL to access the file */
  public_url: string;
  /** File size in bytes */
  size: number;
  /** MIME type (e.g. "image/png") */
  mimetype: string;
  /** Timestamp when the file was last modified */
  updated_at: string;
}

/**
 * Result of an image upload operation.
 */
export interface CMSUploadResult {
  /** Public URL of the uploaded image */
  url: string;
  /** Storage path of the uploaded file */
  path: string;
}

// ============================================================
// Server Action Form State
// ============================================================

/**
 * Standard response shape for all CMS Server Actions.
 * Used by useActionState() in form components.
 */
export interface CMSFormState {
  /** Whether the operation succeeded */
  success: boolean;
  /** User-facing message (success or error) */
  message: string;
  /** Field-level validation errors (keyed by field name) */
  errors?: Record<string, string[]>;
}

// ============================================================
// Default Site ID
// ============================================================

/**
 * The default site UUID used for single-site deployments.
 * In a multi-site setup, this would be replaced with the
 * current site's UUID from the request context.
 */
export const DEFAULT_SITE_ID = "00000000-0000-0000-0000-000000000001";

// ============================================================
// Storage Bucket Configuration
// ============================================================

/**
 * Available folders within the CMS storage bucket.
 * Each folder corresponds to a specific content type.
 */
export const CMS_STORAGE_FOLDERS = {
  LOGOS: "logos",
  FAVICONS: "favicons",
  HERO: "hero",
  OG_IMAGES: "og-images",
  GENERAL: "general",
  PACKAGES: "packages",
  PROJECTS: "projects",
} as const;

/** Union type of valid storage folder names */
export type CMSStorageFolder =
  (typeof CMS_STORAGE_FOLDERS)[keyof typeof CMS_STORAGE_FOLDERS];

/** Name of the CMS storage bucket */
export const CMS_STORAGE_BUCKET = "cms";