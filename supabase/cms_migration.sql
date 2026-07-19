-- ============================================================
-- CMS Module Migration
-- SBBT CRM Next.js Project
-- 
-- Creates the complete CMS foundation with multi-site support.
-- 
-- Design:
--   - Every table includes site_id for future multi-tenant support
--   - Every table includes created_by / updated_by referencing auth.users
--   - RLS enabled on all tables
--   - Indexes on site_id, created_at, created_by, updated_by
--   - No existing tables are modified or dropped
--   - No seed data (default rows inserted on first use via application)
--
-- Migration: 001_cms_foundation
-- Date: 2026-07-19
-- ============================================================

-- ============================================================
-- UP MIGRATION
-- ============================================================

-- ------------------------------------------------------------
-- 1. cms_company — Company information
-- ------------------------------------------------------------
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
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(site_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_company_site_id ON cms_company(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_company_created_at ON cms_company(created_at);
CREATE INDEX IF NOT EXISTS idx_cms_company_created_by ON cms_company(created_by);
CREATE INDEX IF NOT EXISTS idx_cms_company_updated_by ON cms_company(updated_by);

-- RLS
ALTER TABLE cms_company ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_company_select_authenticated"
  ON cms_company FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cms_company_insert_authenticated"
  ON cms_company FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "cms_company_update_authenticated"
  ON cms_company FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "cms_company_delete_authenticated"
  ON cms_company FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- 2. cms_homepage — Homepage hero section + statistics
-- ------------------------------------------------------------
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
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(site_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_homepage_site_id ON cms_homepage(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_homepage_created_at ON cms_homepage(created_at);
CREATE INDEX IF NOT EXISTS idx_cms_homepage_created_by ON cms_homepage(created_by);
CREATE INDEX IF NOT EXISTS idx_cms_homepage_updated_by ON cms_homepage(updated_by);

-- RLS
ALTER TABLE cms_homepage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_homepage_select_authenticated"
  ON cms_homepage FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cms_homepage_insert_authenticated"
  ON cms_homepage FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "cms_homepage_update_authenticated"
  ON cms_homepage FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "cms_homepage_delete_authenticated"
  ON cms_homepage FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- 3. cms_seo — SEO metadata
-- ------------------------------------------------------------
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
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(site_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_seo_site_id ON cms_seo(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_seo_created_at ON cms_seo(created_at);
CREATE INDEX IF NOT EXISTS idx_cms_seo_created_by ON cms_seo(created_by);
CREATE INDEX IF NOT EXISTS idx_cms_seo_updated_by ON cms_seo(updated_by);

-- RLS
ALTER TABLE cms_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_seo_select_authenticated"
  ON cms_seo FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cms_seo_insert_authenticated"
  ON cms_seo FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "cms_seo_update_authenticated"
  ON cms_seo FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "cms_seo_delete_authenticated"
  ON cms_seo FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- 4. cms_social — Social media links
-- ------------------------------------------------------------
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
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(site_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_social_site_id ON cms_social(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_social_created_at ON cms_social(created_at);
CREATE INDEX IF NOT EXISTS idx_cms_social_created_by ON cms_social(created_by);
CREATE INDEX IF NOT EXISTS idx_cms_social_updated_by ON cms_social(updated_by);

-- RLS
ALTER TABLE cms_social ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_social_select_authenticated"
  ON cms_social FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cms_social_insert_authenticated"
  ON cms_social FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "cms_social_update_authenticated"
  ON cms_social FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "cms_social_delete_authenticated"
  ON cms_social FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- 5. cms_settings — Settings + feature toggles
-- ------------------------------------------------------------
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
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(site_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_settings_site_id ON cms_settings(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_settings_created_at ON cms_settings(created_at);
CREATE INDEX IF NOT EXISTS idx_cms_settings_created_by ON cms_settings(created_by);
CREATE INDEX IF NOT EXISTS idx_cms_settings_updated_by ON cms_settings(updated_by);

-- RLS
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_settings_select_authenticated"
  ON cms_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cms_settings_insert_authenticated"
  ON cms_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "cms_settings_update_authenticated"
  ON cms_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "cms_settings_delete_authenticated"
  ON cms_settings FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- ROLLBACK (Run in reverse order to undo this migration)
-- ============================================================
/*
  -- ROLLBACK: Drop all CMS tables and their indexes

  -- Drop policies
  DROP POLICY IF EXISTS "cms_company_select_authenticated" ON cms_company;
  DROP POLICY IF EXISTS "cms_company_insert_authenticated" ON cms_company;
  DROP POLICY IF EXISTS "cms_company_update_authenticated" ON cms_company;
  DROP POLICY IF EXISTS "cms_company_delete_authenticated" ON cms_company;

  DROP POLICY IF EXISTS "cms_homepage_select_authenticated" ON cms_homepage;
  DROP POLICY IF EXISTS "cms_homepage_insert_authenticated" ON cms_homepage;
  DROP POLICY IF EXISTS "cms_homepage_update_authenticated" ON cms_homepage;
  DROP POLICY IF EXISTS "cms_homepage_delete_authenticated" ON cms_homepage;

  DROP POLICY IF EXISTS "cms_seo_select_authenticated" ON cms_seo;
  DROP POLICY IF EXISTS "cms_seo_insert_authenticated" ON cms_seo;
  DROP POLICY IF EXISTS "cms_seo_update_authenticated" ON cms_seo;
  DROP POLICY IF EXISTS "cms_seo_delete_authenticated" ON cms_seo;

  DROP POLICY IF EXISTS "cms_social_select_authenticated" ON cms_social;
  DROP POLICY IF EXISTS "cms_social_insert_authenticated" ON cms_social;
  DROP POLICY IF EXISTS "cms_social_update_authenticated" ON cms_social;
  DROP POLICY IF EXISTS "cms_social_delete_authenticated" ON cms_social;

  DROP POLICY IF EXISTS "cms_settings_select_authenticated" ON cms_settings;
  DROP POLICY IF EXISTS "cms_settings_insert_authenticated" ON cms_settings;
  DROP POLICY IF EXISTS "cms_settings_update_authenticated" ON cms_settings;
  DROP POLICY IF EXISTS "cms_settings_delete_authenticated" ON cms_settings;

  -- Drop indexes
  DROP INDEX IF EXISTS idx_cms_company_site_id;
  DROP INDEX IF EXISTS idx_cms_company_created_at;
  DROP INDEX IF EXISTS idx_cms_company_created_by;
  DROP INDEX IF EXISTS idx_cms_company_updated_by;

  DROP INDEX IF EXISTS idx_cms_homepage_site_id;
  DROP INDEX IF EXISTS idx_cms_homepage_created_at;
  DROP INDEX IF EXISTS idx_cms_homepage_created_by;
  DROP INDEX IF EXISTS idx_cms_homepage_updated_by;

  DROP INDEX IF EXISTS idx_cms_seo_site_id;
  DROP INDEX IF EXISTS idx_cms_seo_created_at;
  DROP INDEX IF EXISTS idx_cms_seo_created_by;
  DROP INDEX IF EXISTS idx_cms_seo_updated_by;

  DROP INDEX IF EXISTS idx_cms_social_site_id;
  DROP INDEX IF EXISTS idx_cms_social_created_at;
  DROP INDEX IF EXISTS idx_cms_social_created_by;
  DROP INDEX IF EXISTS idx_cms_social_updated_by;

  DROP INDEX IF EXISTS idx_cms_settings_site_id;
  DROP INDEX IF EXISTS idx_cms_settings_created_at;
  DROP INDEX IF EXISTS idx_cms_settings_created_by;
  DROP INDEX IF EXISTS idx_cms_settings_updated_by;

  -- Drop tables
  DROP TABLE IF EXISTS cms_company;
  DROP TABLE IF EXISTS cms_homepage;
  DROP TABLE IF EXISTS cms_seo;
  DROP TABLE IF EXISTS cms_social;
  DROP TABLE IF EXISTS cms_settings;
*/