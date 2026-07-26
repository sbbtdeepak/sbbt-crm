-- ============================================================
-- Migration: 025 — Master Data: Tax Master
-- SBBT CRM v2 — Database Architecture
-- ============================================================

CREATE TABLE IF NOT EXISTS tax_master (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'gst' CHECK (type IN ('gst', 'vat', 'service', 'other')),
  hsn_sac_code TEXT NOT NULL DEFAULT '',
  applicable_on TEXT NOT NULL DEFAULT 'both' CHECK (applicable_on IN ('material', 'labour', 'both')),

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

CREATE INDEX IF NOT EXISTS idx_tax_master_site ON tax_master(site_id);
CREATE INDEX IF NOT EXISTS idx_tax_master_active ON tax_master(is_active);
CREATE INDEX IF NOT EXISTS idx_tax_master_type ON tax_master(type);
CREATE INDEX IF NOT EXISTS idx_tax_master_deleted_at ON tax_master(deleted_at);

ALTER TABLE tax_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tax_master_select_auth" ON tax_master FOR SELECT TO authenticated USING (true);
CREATE POLICY "tax_master_insert_auth" ON tax_master FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tax_master_update_auth" ON tax_master FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tax_master_delete_auth" ON tax_master FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_tax_master_updated_at
  BEFORE UPDATE ON tax_master
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed data
INSERT INTO tax_master (site_id, name, rate, type, hsn_sac_code, applicable_on) VALUES
  ('00000000-0000-0000-0000-000000000001', 'GST 0%', 0, 'gst', '', 'both'),
  ('00000000-0000-0000-0000-000000000001', 'GST 5%', 5, 'gst', '', 'both'),
  ('00000000-0000-0000-0000-000000000001', 'GST 12%', 12, 'gst', '', 'both'),
  ('00000000-0000-0000-0000-000000000001', 'GST 18%', 18, 'gst', '', 'both'),
  ('00000000-0000-0000-0000-000000000001', 'GST 28%', 28, 'gst', '', 'both')
ON CONFLICT DO NOTHING;