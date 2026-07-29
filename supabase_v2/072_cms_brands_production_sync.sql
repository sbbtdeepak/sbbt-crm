-- ============================================================
-- Migration: 072 — CMS: Brands (Production Compatible)
-- SBBT CRM v2 — Database Architecture
--
-- Partner brands table for homepage auto-scroller.
-- Production-safe: No foreign keys to sites/profiles tables.
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_brands (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',

  name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  website_url TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID
);

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_cms_brands_site_id ON cms_brands(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_brands_active ON cms_brands(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_brands_order ON cms_brands(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_brands_deleted_at ON cms_brands(deleted_at);

-- RLS
ALTER TABLE cms_brands ENABLE ROW LEVEL SECURITY;

-- Policies (drop if exists to avoid duplicates on re-run)
DROP POLICY IF EXISTS cms_brands_select_authenticated ON cms_brands;
DROP POLICY IF EXISTS cms_brands_select_public ON cms_brands;
DROP POLICY IF EXISTS cms_brands_insert_authenticated ON cms_brands;
DROP POLICY IF EXISTS cms_brands_update_authenticated ON cms_brands;
DROP POLICY IF EXISTS cms_brands_delete_authenticated ON cms_brands;

CREATE POLICY cms_brands_select_authenticated ON cms_brands
  FOR SELECT TO authenticated USING (true);

CREATE POLICY cms_brands_select_public ON cms_brands
  FOR SELECT TO public USING (true);

CREATE POLICY cms_brands_insert_authenticated ON cms_brands
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY cms_brands_update_authenticated ON cms_brands
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY cms_brands_delete_authenticated ON cms_brands
  FOR DELETE TO authenticated USING (true);

-- Trigger: auto-set updated_at (drop and recreate to avoid duplicates)
DROP TRIGGER IF EXISTS trigger_cms_brands_updated_at ON cms_brands;

CREATE TRIGGER trigger_cms_brands_updated_at
  BEFORE UPDATE ON cms_brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Verification Query
-- Run this after execution to confirm everything is in place.
-- ============================================================
-- SELECT
--   (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'cms_brands') AS table_exists,
--   (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'cms_brands') AS index_count,
--   (SELECT relrowsecurity FROM pg_class WHERE relname = 'cms_brands') AS rls_enabled,
--   (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'cms_brands') AS policy_count,
--   (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'trigger_cms_brands_updated_at') AS trigger_exists;