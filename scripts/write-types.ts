#!/usr/bin/env node
// Restore types.ts with correct casing + added CMSBrandRow + BRANDS folder
const fs = require('fs');
const path = require('path');

const content = `// ============================================================
// CMS Module — TypeScript Types
// SBBT CRM Next.js Project
//
// This file defines all TypeScript interfaces for the CMS module.
// Types are organized into three layers per entity:
// - Row: Shape of database row (read)
// - Insert: Shape for creating new row (omit id, timestamps, audit)
// - Update: Shape for updating existing row (partial, omit id)
//
// All entities extend CMSBase which provides common columns:
// id, site_id, created_at, updated_at, created_by, updated_by
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
  id: number;
  site_id: string;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export type CMSInsert<T extends CMSBase> = Omit<
  T,
  'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'
>;

export type CMSUpdate<T extends CMSBase> = Partial<
  Omit<T, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>
> & {
  site_id: string;
};

// ============================================================
// Company
// ============================================================

export interface CMSCompanyRow extends CMSBase {
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
  alternate_mobile: string;
  grievance_email: string;
  google_rating: number;
  years_experience: number;
  homes_delivered: number;
  projects_completed: number;
}

export type CMSCompanyInsert = CMSInsert<CMSCompanyRow>;
export type CMSCompanyUpdate = CMSUpdate<CMSCompanyRow>;
/** @deprecated Use CMSCompanyRow */
export type CMSCompany = CMSCompanyRow;

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

export interface CMSInternalSettingsRow extends CMSBase {
  lead_notification_email: string;
  sales_email: string;
  quotation_email: string;
  support_email: string;
  accounts_email: string;
  google_sheet_url: string;
  webhook_url: string;
  smtp_ready: boolean;
  resend_ready: boolean;
  whatsapp_api_number: string;
  api_keys: Record<string, unknown>;
}

export type CMSInternalSettingsInsert = CMSInsert<CMSInternalSettingsRow>;
export type CMSInternalSettingsUpdate = CMSUpdate<CMSInternalSettingsRow>;

// ============================================================
// Hero Banner
// ============================================================

export interface HeroBanner {
  id: number;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image_url: string;
}

// ============================================================
// Homepage
// ============================================================

export interface CMSStat {
  label: string;
  value: string;
}

export interface CMSHomepageRow extends CMSBase {
  hero_heading: string;
  hero_subheading: string;
  hero_cta_text: string;
  hero_cta_link: string;
  hero_background_url: string;
  stats_heading: string;
  stats: CMSStat[];
}

export type CMSHomepageInsert = CMSInsert<CMSHomepageRow>;
export type CMSHomepageUpdate = CMSUpdate<CMSHomepageRow>;
/** @deprecated Use CMSHomepageRow */
export type CMSHomepage = CMSHomepageRow;

// ============================================================
// SEO
// ============================================================

export interface CMSSEORow extends CMSBase {
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

export type CMSSeoInsert = CMSInsert<CMSSEORow>;
export type CMSSeoUpdate = CMSUpdate<CMSSEORow>;
/** @deprecated Use CMSSEORow */
export type CMSSEO = CMSSEORow;

// ============================================================
// Social
// ============================================================

export interface CMSSocialRow extends CMSBase {
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  twitter_url: string;
}

export type CMSSocialInsert = CMSInsert<CMSSocialRow>;
export type CMSSocialUpdate = CMSUpdate<CMSSocialRow>;
/** @deprecated Use CMSSocialRow */
export type CMSSocial = CMSSocialRow;

// ============================================================
// Settings
// ============================================================

export interface CMSSettingsRow extends CMSBase {
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

export type CMSSettingsInsert = CMSInsert<CMSSettingsRow>;
export type CMSSettingsUpdate = CMSUpdate<CMSSettingsRow>;
/** @deprecated Use CMSSettingsRow */
export type CMSSettings = CMSSettingsRow;

// ============================================================
// Packages V3 (Clean Rebuild)
// ============================================================

export interface CMSPackageItem {
  item: string;
  brand: string;
  specification: string;
  remarks: string;
}

export interface CMSPackageSection {
  id?: number;
  title: string;
  items: CMSPackageItem[];
  display_order: number;
}

export interface CMSPackageRow extends CMSBase {
  state_id: string | null;
  name: string;
  slug: string;
  price: number;
  description: string;
  display_order: number;
  is_active: boolean;
}

export type CMSPackageInsert = CMSInsert<CMSPackageRow>;
export type CMSPackageUpdate = CMSUpdate<CMSPackageRow>;

export interface CMSPackageFull {
  package: CMSPackageRow;
  sections: CMSPackageSection[];
}

export interface CMSPackageFormState extends CMSFormState {
  errors?: Record<string, string[]>;
  slug?: string;
}

// ============================================================
// Projects
// ============================================================

export interface CMSProjectGalleryItem {
  image_url: string;
  caption: string;
}

export interface CMSProjectBeforeAfterItem {
  image_url: string;
  caption: string;
}

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

export type CMSProjectInsert = CMSInsert<CMSProjectRow>;
export type CMSProjectUpdate = CMSUpdate<CMSProjectRow>;

export interface CMSProjectFull {
  project: CMSProjectRow;
  gallery: CMSProjectGalleryItem[];
  beforeImages: CMSProjectBeforeAfterItem[];
  afterImages: CMSProjectBeforeAfterItem[];
}

export interface CMSProjectFormState extends CMSFormState {
  errors?: Record<string, string[]>;
}

// ============================================================
// Blogs
// ============================================================

export interface CMSBlogRow extends CMSBase {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  author: string;
  tags: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  display_order: number;
}

export type CMSBlogInsert = CMSInsert<CMSBlogRow>;
export type CMSBlogUpdate = CMSUpdate<CMSBlogRow>;

// ============================================================
// Testimonials
// ============================================================

export interface CMSTestimonialRow extends CMSBase {
  client_name: string;
  designation: string;
  project_name: string;
  location: string;
  rating: number;
  testimonial: string;
  image_url: string;
  is_featured: boolean;
  display_order: number;
}

export type CMSTestimonialInsert = CMSInsert<CMSTestimonialRow>;
export type CMSTestimonialUpdate = CMSUpdate<CMSTestimonialRow>;

// ============================================================
// Brands
// ============================================================

/**
 * Partner brand for homepage auto-scrolling banner.
 * Stores brand name, category, optional logo, and display order.
 */
export interface CMSBrandRow extends CMSBase {
  name: string;
  category: string;
  logo_url: string;
  website_url: string;
  display_order: number;
  is_active: boolean;
}

/** Shape for inserting new brand row */
export type CMSBrandInsert = CMSInsert<CMSBrandRow>;

/** Shape for updating existing brand row */
export type CMSBrandUpdate = CMSUpdate<CMSBrandRow>;

// ============================================================
// Media
// ============================================================

export interface CMSMediaItem {
  name: string;
  public_url: string;
  size: number;
  mimetype: string;
  updated_at: string;
}

export interface CMSUploadResult {
  url: string;
  path: string;
}

// ============================================================
// Server Action Form State
// ============================================================

export interface CMSFormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================
// Default Site ID
// ============================================================

export const DEFAULT_SITE_ID = '00000000-0000-0000-0000-000000000001';

// ============================================================
// Storage Bucket Configuration
// ============================================================

export const CMS_STORAGE_FOLDERS = {
  LOGOS: 'logos',
  FAVICONS: 'favicons',
  HERO: 'hero',
  OG_IMAGES: 'og-images',
  GENERAL: 'general',
  PACKAGES: 'packages',
  PROJECTS: 'projects',
  BLOGS: 'blogs',
  TESTIMONIALS: 'testimonials',
  BRANDS: 'brands',
} as const;

export type CMSStorageFolder =
  (typeof CMS_STORAGE_FOLDERS)[keyof typeof CMS_STORAGE_FOLDERS];

export const CMS_STORAGE_BUCKET = 'cms';
`;

fs.writeFileSync(path.resolve('App/dashboard/cms/types.ts'), content, 'utf8');
console.log('types.ts written successfully');