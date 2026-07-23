-- ============================================================
-- Estimate Engine Migration (Sprint 10)
-- SBBT CRM Next.js Project
--
-- Creates the Estimate Engine module:
--   - estimates: Main estimate header
--   - estimate_items: Line items (package, add-ons, rate master)
--   - estimate_versions: Version history with full snapshots
--   - estimate_notes: Communication log
--   - estimate_attachments: Future PDFs, drawings, BOQ
--
-- Design:
--   - BIGINT IDENTITY primary keys
--   - site_id for multi-tenant
--   - created_by / updated_by audit fields
--   - version, status for lifecycle tracking
--   - RLS enabled with authenticated-only access
--   - Additive (no existing tables modified)
--   - Pricing snapshots stored for auditability
--
-- Migration: 005_estimate_engine
-- Date: 2026-07-23
-- ============================================================

-- ============================================================
-- UP MIGRATION
-- ============================================================

-- ------------------------------------------------------------
-- 1. estimates — Main estimate header
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS estimates (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

  -- Human-readable unique estimate number (e.g. EST-2026-000001)
  estimate_number TEXT,

  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,

  -- Project information
  project_type TEXT NOT NULL DEFAULT 'residential',

  -- Pricing snapshot (denormalized for auditability)
  pricing_region_id BIGINT REFERENCES pricing_regions(id) ON DELETE SET NULL,
  region_name TEXT NOT NULL DEFAULT '',
  package_id BIGINT REFERENCES cms_packages(id) ON DELETE SET NULL,
  package_name TEXT NOT NULL DEFAULT '',
  package_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',

  -- Plot information
  plot_width NUMERIC(10, 2) NOT NULL DEFAULT 0,
  plot_length NUMERIC(10, 2) NOT NULL DEFAULT 0,
  plot_area NUMERIC(12, 2) NOT NULL DEFAULT 0,
  road_facing TEXT NOT NULL DEFAULT '',
  basement BOOLEAN NOT NULL DEFAULT false,
  stilt BOOLEAN NOT NULL DEFAULT false,

  -- Floors
  floors TEXT NOT NULL DEFAULT 'ground',
  custom_floors INTEGER NOT NULL DEFAULT 1,

  -- Calculated totals
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

  -- Customer information
  customer_name TEXT NOT NULL DEFAULT '',
  customer_mobile TEXT NOT NULL DEFAULT '',
  customer_email TEXT NOT NULL DEFAULT '',

  -- CRM integration
  lead_id BIGINT REFERENCES contact_leads(id) ON DELETE SET NULL,

  -- Notes
  notes TEXT NOT NULL DEFAULT '',

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
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

ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estimates_select_authenticated"
  ON estimates FOR SELECT TO authenticated USING (true);
CREATE POLICY "estimates_insert_authenticated"
  ON estimates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "estimates_update_authenticated"
  ON estimates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "estimates_delete_authenticated"
  ON estimates FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 2. estimate_items — Line items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS estimate_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

  estimate_id BIGINT NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,

  -- Source of the item
  item_source TEXT NOT NULL DEFAULT 'RATE_MASTER',
  item_id BIGINT,

  -- Display fields
  item_name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '',

  -- Quantities and units
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '',

  -- Rate breakdown
  rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  material_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  labour_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  wastage_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  contractor_margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  customer_margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  gst_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,

  -- Calculated amount
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0,

  -- Display order
  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_estimate_items_site_id ON estimate_items(site_id);
CREATE INDEX IF NOT EXISTS idx_estimate_items_estimate_id ON estimate_items(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_items_item_source ON estimate_items(item_source);
CREATE INDEX IF NOT EXISTS idx_estimate_items_item_id ON estimate_items(item_id);
CREATE INDEX IF NOT EXISTS idx_estimate_items_sort_order ON estimate_items(sort_order);

ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estimate_items_select_authenticated"
  ON estimate_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "estimate_items_insert_authenticated"
  ON estimate_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "estimate_items_update_authenticated"
  ON estimate_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "estimate_items_delete_authenticated"
  ON estimate_items FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 3. estimate_versions — Version history
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS estimate_versions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

  estimate_id BIGINT NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,

  version_number INTEGER NOT NULL,
  version_name TEXT NOT NULL DEFAULT '',
  change_reason TEXT NOT NULL DEFAULT '',

  -- Full snapshot of estimate + items as JSONB
  data JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_estimate_versions_site_id ON estimate_versions(site_id);
CREATE INDEX IF NOT EXISTS idx_estimate_versions_estimate_id ON estimate_versions(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_versions_version_number ON estimate_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_estimate_versions_created_at ON estimate_versions(created_at DESC);

ALTER TABLE estimate_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estimate_versions_select_authenticated"
  ON estimate_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "estimate_versions_insert_authenticated"
  ON estimate_versions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "estimate_versions_update_authenticated"
  ON estimate_versions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "estimate_versions_delete_authenticated"
  ON estimate_versions FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 4. estimate_notes — Communication log
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS estimate_notes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

  estimate_id BIGINT NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,

  note TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_estimate_notes_site_id ON estimate_notes(site_id);
CREATE INDEX IF NOT EXISTS idx_estimate_notes_estimate_id ON estimate_notes(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_notes_created_at ON estimate_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimate_notes_is_internal ON estimate_notes(is_internal);

ALTER TABLE estimate_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estimate_notes_select_authenticated"
  ON estimate_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "estimate_notes_insert_authenticated"
  ON estimate_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "estimate_notes_update_authenticated"
  ON estimate_notes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "estimate_notes_delete_authenticated"
  ON estimate_notes FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 5. estimate_attachments — Future PDFs, drawings, BOQ
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS estimate_attachments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

  estimate_id BIGINT NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,

  file_name TEXT NOT NULL DEFAULT '',
  file_url TEXT NOT NULL DEFAULT '',
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL DEFAULT '',
  attachment_type TEXT NOT NULL DEFAULT 'pdf',

  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_estimate_attachments_site_id ON estimate_attachments(site_id);
CREATE INDEX IF NOT EXISTS idx_estimate_attachments_estimate_id ON estimate_attachments(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_attachments_type ON estimate_attachments(attachment_type);

ALTER TABLE estimate_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estimate_attachments_select_authenticated"
  ON estimate_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "estimate_attachments_insert_authenticated"
  ON estimate_attachments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "estimate_attachments_update_authenticated"
  ON estimate_attachments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "estimate_attachments_delete_authenticated"
  ON estimate_attachments FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- Triggers
-- ------------------------------------------------------------

-- Auto-generate estimate_number on insert
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

-- Update updated_at on modification
CREATE OR REPLACE FUNCTION update_estimates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_estimates_updated_at
  BEFORE UPDATE ON estimates
  FOR EACH ROW
  EXECUTE FUNCTION update_estimates_updated_at();

-- ============================================================
-- ROLLBACK
-- ============================================================
/*
  -- Drop triggers
  DROP TRIGGER IF EXISTS trigger_generate_estimate_number ON estimates;
  DROP TRIGGER IF EXISTS trigger_update_estimates_updated_at ON estimates;

  -- Drop functions
  DROP FUNCTION IF EXISTS generate_estimate_number();
  DROP FUNCTION IF EXISTS update_estimates_updated_at();

  -- Drop policies
  DROP POLICY IF EXISTS "estimates_select_authenticated" ON estimates;
  DROP POLICY IF EXISTS "estimates_insert_authenticated" ON estimates;
  DROP POLICY IF EXISTS "estimates_update_authenticated" ON estimates;
  DROP POLICY IF EXISTS "estimates_delete_authenticated" ON estimates;

  DROP POLICY IF EXISTS "estimate_items_select_authenticated" ON estimate_items;
  DROP POLICY IF EXISTS "estimate_items_insert_authenticated" ON estimate_items;
  DROP POLICY IF EXISTS "estimate_items_update_authenticated" ON estimate_items;
  DROP POLICY IF EXISTS "estimate_items_delete_authenticated" ON estimate_items;

  DROP POLICY IF EXISTS "estimate_versions_select_authenticated" ON estimate_versions;
  DROP POLICY IF EXISTS "estimate_versions_insert_authenticated" ON estimate_versions;
  DROP POLICY IF EXISTS "estimate_versions_update_authenticated" ON estimate_versions;
  DROP POLICY IF EXISTS "estimate_versions_delete_authenticated" ON estimate_versions;

  DROP POLICY IF EXISTS "estimate_notes_select_authenticated" ON estimate_notes;
  DROP POLICY IF EXISTS "estimate_notes_insert_authenticated" ON estimate_notes;
  DROP POLICY IF EXISTS "estimate_notes_update_authenticated" ON estimate_notes;
  DROP POLICY IF EXISTS "estimate_notes_delete_authenticated" ON estimate_notes;

  DROP POLICY IF EXISTS "estimate_attachments_select_authenticated" ON estimate_attachments;
  DROP POLICY IF EXISTS "estimate_attachments_insert_authenticated" ON estimate_attachments;
  DROP POLICY IF EXISTS "estimate_attachments_update_authenticated" ON estimate_attachments;
  DROP POLICY IF EXISTS "estimate_attachments_delete_authenticated" ON estimate_attachments;

  -- Drop indexes
  DROP INDEX IF EXISTS idx_estimates_site_id;
  DROP INDEX IF EXISTS idx_estimates_status;
  DROP INDEX IF EXISTS idx_estimates_estimate_number;
  DROP INDEX IF EXISTS idx_estimates_lead_id;
  DROP INDEX IF EXISTS idx_estimates_created_at;
  DROP INDEX IF EXISTS idx_estimates_created_by;
  DROP INDEX IF EXISTS idx_estimates_updated_by;
  DROP INDEX IF EXISTS idx_estimates_project_type;
  DROP INDEX IF EXISTS idx_estimates_region_id;
  DROP INDEX IF EXISTS idx_estimates_package_id;

  DROP INDEX IF EXISTS idx_estimate_items_site_id;
  DROP INDEX IF EXISTS idx_estimate_items_estimate_id;
  DROP INDEX IF EXISTS idx_estimate_items_item_source;
  DROP INDEX IF EXISTS idx_estimate_items_item_id;
  DROP INDEX IF EXISTS idx_estimate_items_sort_order;

  DROP INDEX IF EXISTS idx_estimate_versions_site_id;
  DROP INDEX IF EXISTS idx_estimate_versions_estimate_id;
  DROP INDEX IF EXISTS idx_estimate_versions_version_number;
  DROP INDEX IF EXISTS idx_estimate_versions_created_at;

  DROP INDEX IF EXISTS idx_estimate_notes_site_id;
  DROP INDEX IF EXISTS idx_estimate_notes_estimate_id;
  DROP INDEX IF EXISTS idx_estimate_notes_created_at;
  DROP INDEX IF EXISTS idx_estimate_notes_is_internal;

  DROP INDEX IF EXISTS idx_estimate_attachments_site_id;
  DROP INDEX IF EXISTS idx_estimate_attachments_estimate_id;
  DROP INDEX IF EXISTS idx_estimate_attachments_type;

  -- Drop tables
  DROP TABLE IF EXISTS estimate_attachments;
  DROP TABLE IF EXISTS estimate_notes;
  DROP TABLE IF EXISTS estimate_versions;
  DROP TABLE IF EXISTS estimate_items;
  DROP TABLE IF EXISTS estimates;

  -- Disable RLS
  ALTER TABLE estimates DISABLE ROW LEVEL SECURITY;
  ALTER TABLE estimate_items DISABLE ROW LEVEL SECURITY;
  ALTER TABLE estimate_versions DISABLE ROW LEVEL SECURITY;
  ALTER TABLE estimate_notes DISABLE ROW LEVEL SECURITY;
  ALTER TABLE estimate_attachments DISABLE ROW LEVEL SECURITY;
*/
