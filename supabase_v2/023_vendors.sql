-- ============================================================
-- Migration: 023 — Master Data: Vendors
-- SBBT CRM v2 — Database Architecture
-- ============================================================

CREATE TABLE IF NOT EXISTS vendors (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  contact_person TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  gst TEXT NOT NULL DEFAULT '',
  payment_terms TEXT NOT NULL DEFAULT '',

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

CREATE INDEX IF NOT EXISTS idx_vendors_site ON vendors(site_id);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_deleted_at ON vendors(deleted_at);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendors_select_auth" ON vendors FOR SELECT TO authenticated USING (true);
CREATE POLICY "vendors_insert_auth" ON vendors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vendors_update_auth" ON vendors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "vendors_delete_auth" ON vendors FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();