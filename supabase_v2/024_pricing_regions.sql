-- ============================================================
-- Migration: 024 — Master Data: Pricing Regions
-- SBBT CRM v2 — Database Architecture
-- ============================================================

CREATE TABLE IF NOT EXISTS pricing_regions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  region_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  base_rate_per_sqft NUMERIC(12, 2) NOT NULL DEFAULT 0,
  labour_rate_per_sqft NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
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

CREATE INDEX IF NOT EXISTS idx_pricing_regions_site ON pricing_regions(site_id);
CREATE INDEX IF NOT EXISTS idx_pricing_regions_active ON pricing_regions(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_regions_deleted_at ON pricing_regions(deleted_at);

ALTER TABLE pricing_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pricing_regions_select_auth" ON pricing_regions FOR SELECT TO authenticated USING (true);
CREATE POLICY "pricing_regions_insert_auth" ON pricing_regions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "pricing_regions_update_auth" ON pricing_regions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "pricing_regions_delete_auth" ON pricing_regions FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_pricing_regions_updated_at
  BEFORE UPDATE ON pricing_regions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed data
INSERT INTO pricing_regions (site_id, region_name, city, state, base_rate_per_sqft, labour_rate_per_sqft) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Delhi NCR', 'Delhi', 'Delhi', 0, 0)
ON CONFLICT DO NOTHING;