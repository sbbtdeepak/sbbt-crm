-- ============================================================
-- Migration: 010 — CMS: Company Information
-- SBBT CRM v2 — Database Architecture
--
-- Stores brand identity, contact details, business metrics,
-- and localization settings for the public website.
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_company (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  -- Brand Identity
  brand_name TEXT NOT NULL DEFAULT '',
  legal_name TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  favicon_url TEXT NOT NULL DEFAULT '',
  primary_color TEXT NOT NULL DEFAULT '#4f46e5',
  secondary_color TEXT NOT NULL DEFAULT '#06b6d4',

  -- Localization
  currency TEXT NOT NULL DEFAULT 'INR',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  language TEXT NOT NULL DEFAULT 'en',

  -- Business Details
  gst TEXT NOT NULL DEFAULT '',
  pan TEXT NOT NULL DEFAULT '',
  business_hours TEXT NOT NULL DEFAULT '',

  -- Contact
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  alternate_mobile TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  grievance_email TEXT NOT NULL DEFAULT '',
  support_email TEXT NOT NULL DEFAULT '',
  sales_email TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  google_maps_url TEXT NOT NULL DEFAULT '',

  -- Business Metrics
  google_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  years_experience INTEGER NOT NULL DEFAULT 0,
  homes_delivered INTEGER NOT NULL DEFAULT 0,
  projects_completed INTEGER NOT NULL DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,

  UNIQUE(site_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_company_site_id ON cms_company(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_company_deleted_at ON cms_company(deleted_at);

-- RLS
ALTER TABLE cms_company ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_company_select_authenticated" ON cms_company FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_company_select_public" ON cms_company FOR SELECT TO public USING (true);
CREATE POLICY "cms_company_insert_authenticated" ON cms_company FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_company_update_authenticated" ON cms_company FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_company_delete_authenticated" ON cms_company FOR DELETE TO authenticated USING (true);

-- Triggers
CREATE TRIGGER trigger_cms_company_updated_at
  BEFORE UPDATE ON cms_company
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();