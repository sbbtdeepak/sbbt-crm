-- ============================================================
-- Migration: 022 — Master Data: Units
-- SBBT CRM v2 — Database Architecture
-- ============================================================

CREATE TABLE IF NOT EXISTS units (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  short_name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  conversion_factor NUMERIC(12, 4) NOT NULL DEFAULT 1.0000,
  is_active BOOLEAN NOT NULL DEFAULT true,

  version INTEGER NOT NULL DEFAULT 1,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_units_site ON units(site_id);
CREATE INDEX IF NOT EXISTS idx_units_active ON units(is_active);
CREATE INDEX IF NOT EXISTS idx_units_deleted_at ON units(deleted_at);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "units_select_auth" ON units FOR SELECT TO authenticated USING (true);
CREATE POLICY "units_insert_auth" ON units FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "units_update_auth" ON units FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "units_delete_auth" ON units FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed data
INSERT INTO units (site_id, name, short_name, category, conversion_factor) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Square Feet', 'sqft', 'area', 1.0000),
  ('00000000-0000-0000-0000-000000000001', 'Square Meter', 'sqm', 'area', 10.7639),
  ('00000000-0000-0000-0000-000000000001', 'Number', 'nos', 'count', 1.0000),
  ('00000000-0000-0000-0000-000000000001', 'Meter', 'm', 'length', 3.2808),
  ('00000000-0000-0000-0000-000000000001', 'Kilogram', 'kg', 'weight', 1.0000),
  ('00000000-0000-0000-0000-000000000001', 'Liter', 'L', 'volume', 1.0000),
  ('00000000-0000-0000-0000-000000000001', 'Cubic Feet', 'cft', 'volume', 1.0000),
  ('00000000-0000-0000-0000-000000000001', 'Bag', 'bag', 'count', 1.0000)
ON CONFLICT DO NOTHING;