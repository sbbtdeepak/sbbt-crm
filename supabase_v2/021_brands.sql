-- ============================================================
-- Migration: 021 — Master Data: Brands
-- SBBT CRM v2 — Database Architecture
-- ============================================================

CREATE TABLE IF NOT EXISTS brands (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  material_category_id BIGINT REFERENCES material_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,

  version INTEGER NOT NULL DEFAULT 1,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_brands_site ON brands(site_id);
CREATE INDEX IF NOT EXISTS idx_brands_category ON brands(material_category_id);
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active);
CREATE INDEX IF NOT EXISTS idx_brands_deleted_at ON brands(deleted_at);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands_select_auth" ON brands FOR SELECT TO authenticated USING (true);
CREATE POLICY "brands_insert_auth" ON brands FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "brands_update_auth" ON brands FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "brands_delete_auth" ON brands FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();