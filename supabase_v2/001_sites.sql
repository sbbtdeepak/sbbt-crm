-- ============================================================
-- Migration: 001 — Sites / Multi-Tenant Foundation
-- SBBT CRM v2 — Database Architecture
--
-- This is the foundation table for future multi-tenant support.
-- Every data table references sites(id) via site_id.
--
-- For single-site deployments, a default site is seeded.
-- ============================================================

-- ------------------------------------------------------------
-- 1. sites
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  domain TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'maintenance')),
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sites_domain ON sites(domain);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_sites_deleted_at ON sites(deleted_at);

-- RLS
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sites_select_authenticated" ON sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "sites_insert_authenticated" ON sites FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sites_update_authenticated" ON sites FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sites_delete_authenticated" ON sites FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 2. Audit helper function (updated_at trigger)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- 3. Soft-delete helper function
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to sites
CREATE TRIGGER trigger_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- Seed: Default site
-- ------------------------------------------------------------
INSERT INTO sites (id, name, domain)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Site',
  'www.sbbt.in'
)
ON CONFLICT (id) DO NOTHING;