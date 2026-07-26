-- ============================================================
-- Migration: 028 — Master Data: Rate Master
-- SBBT CRM v2 — Database Architecture
--
-- THE CENTRAL TABLE for all pricing data.
-- Every estimate item traces back to a rate_master record.
-- ============================================================

CREATE TABLE IF NOT EXISTS rate_master (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  material_category_id BIGINT REFERENCES material_categories(id) ON DELETE SET NULL,
  brand_id BIGINT REFERENCES brands(id) ON DELETE SET NULL,
  unit_id BIGINT REFERENCES units(id) ON DELETE SET NULL,
  vendor_id BIGINT REFERENCES vendors(id) ON DELETE SET NULL,
  pricing_region_id BIGINT REFERENCES pricing_regions(id) ON DELETE SET NULL,

  item_name TEXT NOT NULL,
  hsn_code TEXT NOT NULL DEFAULT '',

  material_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  labour_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  wastage_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  contractor_margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  customer_margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  gst_percent NUMERIC(5, 2) NOT NULL DEFAULT 18,
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

CREATE INDEX IF NOT EXISTS idx_rate_master_site ON rate_master(site_id);
CREATE INDEX IF NOT EXISTS idx_rate_master_active ON rate_master(is_active);
CREATE INDEX IF NOT EXISTS idx_rate_master_category ON rate_master(material_category_id);
CREATE INDEX IF NOT EXISTS idx_rate_master_brand ON rate_master(brand_id);
CREATE INDEX IF NOT EXISTS idx_rate_master_region ON rate_master(pricing_region_id);
CREATE INDEX IF NOT EXISTS idx_rate_master_vendor ON rate_master(vendor_id);
CREATE INDEX IF NOT EXISTS idx_rate_master_item ON rate_master(item_name);
CREATE INDEX IF NOT EXISTS idx_rate_master_deleted_at ON rate_master(deleted_at);

ALTER TABLE rate_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_master_select_auth" ON rate_master FOR SELECT TO authenticated USING (true);
CREATE POLICY "rate_master_insert_auth" ON rate_master FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rate_master_update_auth" ON rate_master FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rate_master_delete_auth" ON rate_master FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_rate_master_updated_at
  BEFORE UPDATE ON rate_master
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();