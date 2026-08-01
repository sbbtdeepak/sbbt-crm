-- ============================================================
-- Migration: 091 — contact_leads Production Create (Additive)
-- SBBT CRM — Production Database
--
-- Purpose:
--   Creates contact_leads in PRODUCTION with NO V2 foreign keys.
--   Production does NOT have sites / profiles tables.
--   All FK references from 050 removed (compatible with 035/070/072 pattern).
--
-- Column set derived from the CURRENT application code:
--   - App/dashboard/leads/types.ts (LeadRow)
--   - App/dashboard/leads/actions.ts (createLeadFromAPI, getLeads,
--     getLeadById, updateLeadStatus, addLeadRemarks, assignLead,
--     deleteLead, getLeadStats, checkForDuplicate)
--   - App/api/leads/route.ts
--
-- Additive & Idempotent:
--   CREATE TABLE IF NOT EXISTS
--   CREATE OR REPLACE FUNCTION
--   DROP TRIGGER IF EXISTS + CREATE TRIGGER
--   CREATE POLICY IF NOT EXISTS
--   CREATE INDEX IF NOT EXISTS
--
-- Safe to apply multiple times.
-- ============================================================

-- ----------------------------------------
-- 1. Table
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS contact_leads (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

  -- Business fields (used by createLeadFromAPI / createLead)
  lead_number TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  mobile_number TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',

  plot_location TEXT NOT NULL DEFAULT '',
  budget TEXT NOT NULL DEFAULT '',
  service_required TEXT NOT NULL DEFAULT '',

  -- Tracking / source attribution
  source TEXT NOT NULL DEFAULT '',
  current_page TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  ip_address TEXT NOT NULL DEFAULT '',

  -- Assignment / status (status validated app-side via LEAD_STATUSES)
  assigned_to UUID,
  status TEXT NOT NULL DEFAULT 'new',
  remarks TEXT NOT NULL DEFAULT '',

  -- Legacy compatibility columns (used by types.ts + getLeads search .or())
  name TEXT,
  phone TEXT,
  location TEXT,
  message TEXT,

  -- Audit fields (no FK — sites/profiles do not exist in production)
  site_id UUID,
  created_by UUID,
  updated_by UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ----------------------------------------
-- 2. Indexes
-- ----------------------------------------
CREATE INDEX IF NOT EXISTS idx_contact_leads_lead_number ON contact_leads(lead_number);
CREATE INDEX IF NOT EXISTS idx_contact_leads_status ON contact_leads(status);
CREATE INDEX IF NOT EXISTS idx_contact_leads_source ON contact_leads(source);
CREATE INDEX IF NOT EXISTS idx_contact_leads_mobile_number ON contact_leads(mobile_number);
CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at ON contact_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_assigned_to ON contact_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_leads_site_id ON contact_leads(site_id);
CREATE INDEX IF NOT EXISTS idx_contact_leads_deleted_at ON contact_leads(deleted_at);

-- ----------------------------------------
-- 3. updated_at trigger function (idempotent)
-- ----------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------
-- 4. lead_number generation (idempotent)
-- ----------------------------------------
CREATE OR REPLACE FUNCTION generate_lead_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num BIGINT;
BEGIN
  IF NEW.lead_number IS NULL OR NEW.lead_number = '' THEN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;

    SELECT COALESCE(MAX(CAST(SUBSTRING(lead_number FROM 7) AS BIGINT)), 0) + 1
    INTO seq_num
    FROM contact_leads
    WHERE lead_number LIKE ('LEAD-' || year_part || '-%');

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

DROP TRIGGER IF EXISTS trigger_generate_lead_number ON contact_leads;
CREATE TRIGGER trigger_generate_lead_number
  BEFORE INSERT ON contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION generate_lead_number();

DROP TRIGGER IF EXISTS trigger_contact_leads_updated_at ON contact_leads;
CREATE TRIGGER trigger_contact_leads_updated_at
  BEFORE UPDATE ON contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------
-- 5. Row Level Security
-- ----------------------------------------
ALTER TABLE contact_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "contact_leads_select_authenticated"
  ON contact_leads FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "contact_leads_insert_authenticated"
  ON contact_leads FOR INSERT TO authenticated WITH CHECK (true);

-- Public (anon) INSERT for website lead/quote forms via /api/leads
CREATE POLICY IF NOT EXISTS "contact_leads_insert_public"
  ON contact_leads FOR INSERT TO public WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "contact_leads_update_authenticated"
  ON contact_leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "contact_leads_delete_authenticated"
  ON contact_leads FOR DELETE TO authenticated USING (true);