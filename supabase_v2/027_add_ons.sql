-- ============================================================
-- Migration: 027 — Master Data: Add-ons
-- SBBT CRM v2 — Database Architecture
-- ============================================================

CREATE TABLE IF NOT EXISTS add_ons (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  unit_type TEXT NOT NULL DEFAULT 'flat',
  material_category_id BIGINT REFERENCES material_categories(id) ON DELETE SET NULL,
  unit_id BIGINT REFERENCES units(id) ON DELETE SET NULL,

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

CREATE INDEX IF NOT EXISTS idx_add_ons_site ON add_ons(site_id);
CREATE INDEX IF NOT EXISTS idx_add_ons_active ON add_ons(is_active);
CREATE INDEX IF NOT EXISTS idx_add_ons_category ON add_ons(material_category_id);
CREATE INDEX IF NOT EXISTS idx_add_ons_deleted_at ON add_ons(deleted_at);

ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "add_ons_select_auth" ON add_ons FOR SELECT TO authenticated USING (true);
CREATE POLICY "add_ons_insert_auth" ON add_ons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "add_ons_update_auth" ON add_ons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "add_ons_delete_auth" ON add_ons FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_add_ons_updated_at
  BEFORE UPDATE ON add_ons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();