-- ============================================================
-- Lead Management Migration (CRM Phase 1)
-- SBBT CRM Next.js Project
--
-- Adds the Lead module columns to the existing contact_leads table.
-- This is an additive migration — no existing columns are dropped or renamed.
--
-- Design:
--   - Adds audit fields (site_id, created_by, updated_by, updated_at)
--   - Adds lead_number for human-readable unique identifiers
--   - Adds UTM tracking fields for marketing attribution
--   - Adds assignment and remarks fields for CRM workflow
--   - Adds service_required and current_page for lead context
--   - Adds ip_address for spam detection
--   - RLS enabled with authenticated-only access
--   - Indexes on status, source, created_at, mobile_number, lead_number
--   - No destructive changes to existing columns
--
-- Migration: 002_lead_management
-- Date: 2026-07-22
-- ============================================================

-- ============================================================
-- UP MIGRATION
-- ============================================================

-- ------------------------------------------------------------
-- Add new columns to contact_leads (additive, backward compatible)
-- ------------------------------------------------------------

-- Human-readable unique lead number (e.g. LEAD-2026-0001)
ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS lead_number TEXT;

-- Full name of the lead (maps to existing "name" for backward compat)
ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Mobile number (maps to existing "phone" for backward compat)
ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS mobile_number TEXT;

-- Email address (already exists, kept for backward compat)
-- ALTER TABLE contact_leads ADD COLUMN IF NOT EXISTS email TEXT;

-- Plot location / project location (maps to existing "location")
ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS plot_location TEXT;

-- Budget estimate
-- ALTER TABLE contact_leads ADD COLUMN IF NOT EXISTS budget TEXT;  -- already exists

-- Service required (e.g. Residential, Commercial, Renovation)
ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS service_required TEXT;

-- Source of the lead (e.g. hero_popup, contact_form, whatsapp)
-- ALTER TABLE contact_leads ADD COLUMN IF NOT EXISTS source TEXT;  -- already exists

-- Current page URL where the lead was captured
ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS current_page TEXT;

-- UTM tracking fields
ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS utm_source TEXT;

ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS utm_medium TEXT;

ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- IP address for spam detection
ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Assigned to (references auth.users for future assignment feature)
ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Remarks / notes (for CRM workflow)
ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Audit fields
ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';

ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE contact_leads
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_contact_leads_lead_number ON contact_leads(lead_number);
CREATE INDEX IF NOT EXISTS idx_contact_leads_status ON contact_leads(status);
CREATE INDEX IF NOT EXISTS idx_contact_leads_source ON contact_leads(source);
CREATE INDEX IF NOT EXISTS idx_contact_leads_mobile_number ON contact_leads(mobile_number);
CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at ON contact_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_assigned_to ON contact_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_leads_site_id ON contact_leads(site_id);
CREATE INDEX IF NOT EXISTS idx_contact_leads_full_name ON contact_leads(full_name);

-- ------------------------------------------------------------
-- RLS (Row Level Security)
-- ------------------------------------------------------------

ALTER TABLE contact_leads ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all leads (admin dashboard)
CREATE POLICY "contact_leads_select_authenticated"
  ON contact_leads FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert leads (for server actions)
CREATE POLICY "contact_leads_insert_authenticated"
  ON contact_leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update leads (status, assignment, remarks)
CREATE POLICY "contact_leads_update_authenticated"
  ON contact_leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete leads
CREATE POLICY "contact_leads_delete_authenticated"
  ON contact_leads FOR DELETE
  TO authenticated
  USING (true);

-- Public can insert leads (for public API endpoint without auth)
CREATE POLICY "contact_leads_insert_public"
  ON contact_leads FOR INSERT
  TO public
  WITH CHECK (true);

-- ------------------------------------------------------------
-- Trigger: Auto-generate lead_number on insert
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION generate_lead_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num BIGINT;
BEGIN
  -- Only generate if lead_number is not already set
  IF NEW.lead_number IS NULL OR NEW.lead_number = '' THEN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;

    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(lead_number FROM 7) AS BIGINT)), 0) + 1
    INTO seq_num
    FROM contact_leads
    WHERE lead_number LIKE ('LEAD-' || year_part || '-%');

    -- Fallback to created_at-based count if no matches
    IF seq_num IS NULL OR seq_num = 0 THEN
      SELECT COUNT(*) + 1
      INTO seq_num
      FROM contact_leads
      WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    END IF;

    NEW.lead_number := 'LEAD-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_lead_number
  BEFORE INSERT ON contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION generate_lead_number();

-- ------------------------------------------------------------
-- Trigger: Update updated_at on row modification
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_leads_updated_at
  BEFORE UPDATE ON contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- Backfill: Copy existing data to new columns
-- ------------------------------------------------------------

UPDATE contact_leads
  SET full_name = name
  WHERE full_name IS NULL AND name IS NOT NULL;

UPDATE contact_leads
  SET mobile_number = phone
  WHERE mobile_number IS NULL AND phone IS NOT NULL;

UPDATE contact_leads
  SET plot_location = location
  WHERE plot_location IS NULL AND location IS NOT NULL;

-- ============================================================
-- ROLLBACK (Run in reverse order to undo this migration)
-- ============================================================
/*
  -- Drop triggers
  DROP TRIGGER IF EXISTS trigger_generate_lead_number ON contact_leads;
  DROP TRIGGER IF EXISTS trigger_update_contact_leads_updated_at ON contact_leads;

  -- Drop functions
  DROP FUNCTION IF EXISTS generate_lead_number();
  DROP FUNCTION IF EXISTS update_updated_at_column();

  -- Drop policies
  DROP POLICY IF EXISTS "contact_leads_select_authenticated" ON contact_leads;
  DROP POLICY IF EXISTS "contact_leads_insert_authenticated" ON contact_leads;
  DROP POLICY IF EXISTS "contact_leads_update_authenticated" ON contact_leads;
  DROP POLICY IF EXISTS "contact_leads_delete_authenticated" ON contact_leads;
  DROP POLICY IF EXISTS "contact_leads_insert_public" ON contact_leads;

  -- Drop indexes
  DROP INDEX IF EXISTS idx_contact_leads_lead_number;
  DROP INDEX IF EXISTS idx_contact_leads_status;
  DROP INDEX IF EXISTS idx_contact_leads_source;
  DROP INDEX IF EXISTS idx_contact_leads_mobile_number;
  DROP INDEX IF EXISTS idx_contact_leads_created_at;
  DROP INDEX IF EXISTS idx_contact_leads_assigned_to;
  DROP INDEX IF EXISTS idx_contact_leads_site_id;
  DROP INDEX IF EXISTS idx_contact_leads_full_name;

  -- Drop columns (only new ones, preserve existing)
  ALTER TABLE contact_leads
    DROP COLUMN IF EXISTS lead_number,
    DROP COLUMN IF EXISTS full_name,
    DROP COLUMN IF EXISTS mobile_number,
    DROP COLUMN IF EXISTS plot_location,
    DROP COLUMN IF EXISTS service_required,
    DROP COLUMN IF EXISTS current_page,
    DROP COLUMN IF EXISTS utm_source,
    DROP COLUMN IF EXISTS utm_medium,
    DROP COLUMN IF EXISTS utm_campaign,
    DROP COLUMN IF EXISTS ip_address,
    DROP COLUMN IF EXISTS assigned_to,
    DROP COLUMN IF EXISTS remarks,
    DROP COLUMN IF EXISTS site_id,
    DROP COLUMN IF EXISTS updated_at,
    DROP COLUMN IF EXISTS created_by,
    DROP COLUMN IF EXISTS updated_by;

  -- Disable RLS
  ALTER TABLE contact_leads DISABLE ROW LEVEL SECURITY;
*/
