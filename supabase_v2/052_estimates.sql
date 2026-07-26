-- ============================================================
-- Migration: 052 — Estimates
-- SBBT CRM v2 — Database Architecture
--
-- Main estimate header table. Links to leads, packages, pricing regions.
-- ============================================================

CREATE TABLE IF NOT EXISTS estimates (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  estimate_number TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'sent', 'accepted', 'rejected', 'expired')),
  version INTEGER NOT NULL DEFAULT 1,

  project_type TEXT NOT NULL DEFAULT 'residential',

  pricing_region_id BIGINT REFERENCES pricing_regions(id) ON DELETE SET NULL,
  region_name TEXT NOT NULL DEFAULT '',
  package_id BIGINT REFERENCES cms_packages(id) ON DELETE SET NULL,
  package_name TEXT NOT NULL DEFAULT '',
  package_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',

  plot_width NUMERIC(10, 2) NOT NULL DEFAULT 0,
  plot_length NUMERIC(10, 2) NOT NULL DEFAULT 0,
  plot_area NUMERIC(12, 2) NOT NULL DEFAULT 0,
  road_facing TEXT NOT NULL DEFAULT '',
  basement BOOLEAN NOT NULL DEFAULT false,
  stilt BOOLEAN NOT NULL DEFAULT false,

  floors TEXT NOT NULL DEFAULT 'ground',
  custom_floors INTEGER NOT NULL DEFAULT 1,

  total_area NUMERIC(12, 2) NOT NULL DEFAULT 0,
  base_rate_per_sqft NUMERIC(12, 2) NOT NULL DEFAULT 0,
  labour_rate_per_sqft NUMERIC(12, 2) NOT NULL DEFAULT 0,
  construction_cost NUMERIC(14, 2) NOT NULL DEFAULT 0,
  material_cost NUMERIC(14, 2) NOT NULL DEFAULT 0,
  labour_cost NUMERIC(14, 2) NOT NULL DEFAULT 0,
  wastage_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  contractor_margin_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  customer_margin_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18,
  gst_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(14, 2) NOT NULL DEFAULT 0,

  customer_name TEXT NOT NULL DEFAULT '',
  customer_mobile TEXT NOT NULL DEFAULT '',
  customer_email TEXT NOT NULL DEFAULT '',

  lead_id BIGINT REFERENCES contact_leads(id) ON DELETE SET NULL,

  notes TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_estimates_site_id ON estimates(site_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_estimate_number ON estimates(estimate_number);
CREATE INDEX IF NOT EXISTS idx_estimates_lead_id ON estimates(lead_id);
CREATE INDEX IF NOT EXISTS idx_estimates_created_at ON estimates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimates_created_by ON estimates(created_by);
CREATE INDEX IF NOT EXISTS idx_estimates_updated_by ON estimates(updated_by);
CREATE INDEX IF NOT EXISTS idx_estimates_project_type ON estimates(project_type);
CREATE INDEX IF NOT EXISTS idx_estimates_region_id ON estimates(pricing_region_id);
CREATE INDEX IF NOT EXISTS idx_estimates_package_id ON estimates(package_id);
CREATE INDEX IF NOT EXISTS idx_estimates_deleted_at ON estimates(deleted_at);

ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estimates_select_authenticated" ON estimates FOR SELECT TO authenticated USING (true);
CREATE POLICY "estimates_insert_authenticated" ON estimates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "estimates_update_authenticated" ON estimates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "estimates_delete_authenticated" ON estimates FOR DELETE TO authenticated USING (true);

-- Triggers
CREATE OR REPLACE FUNCTION generate_estimate_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num BIGINT;
BEGIN
  IF NEW.estimate_number IS NULL OR NEW.estimate_number = '' THEN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;

    SELECT COALESCE(MAX(CAST(SUBSTRING(estimate_number FROM 7) AS BIGINT)), 0) + 1
    INTO seq_num
    FROM estimates
    WHERE estimate_number LIKE ('EST-' || year_part || '-%');

    IF seq_num IS NULL OR seq_num = 0 THEN
      SELECT COUNT(*) + 1
      INTO seq_num
      FROM estimates
      WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    END IF;

    NEW.estimate_number := 'EST-' || year_part || '-' || LPAD(seq_num::TEXT, 6, '0');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_estimate_number
  BEFORE INSERT ON estimates
  FOR EACH ROW
  EXECUTE FUNCTION generate_estimate_number();

CREATE TRIGGER trigger_estimates_updated_at
  BEFORE UPDATE ON estimates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();