-- ============================================================
-- Migration: 065 — CMS: Brands
-- SBBT CRM v2 — Database Architecture
--
-- Partner brands table for homepage auto-scroller.
-- Supports image uploads to cms/brands/ folder.
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_brands (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  website_url TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_brands_site_id ON cms_brands(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_brands_active ON cms_brands(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_brands_order ON cms_brands(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_brands_deleted_at ON cms_brands(deleted_at);

ALTER TABLE cms_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY cms_brands_select_authenticated ON cms_brands FOR SELECT TO authenticated USING (true);
CREATE POLICY cms_brands_select_public ON cms_brands FOR SELECT TO public USING (true);
CREATE POLICY cms_brands_insert_authenticated ON cms_brands FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY cms_brands_update_authenticated ON cms_brands FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY cms_brands_delete_authenticated ON cms_brands FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_cms_brands_updated_at
  BEFORE UPDATE ON cms_brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();