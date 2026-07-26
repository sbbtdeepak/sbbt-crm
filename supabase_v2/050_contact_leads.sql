-- ============================================================
-- Migration: 050 — Contact Leads
-- SBBT CRM v2 — Database Architecture
--
-- Central table for all leads from website forms, contact page,
-- quote requests, and estimate engine. ALL new leads go here.
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_leads (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  lead_number TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  mobile_number TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',

  plot_location TEXT NOT NULL DEFAULT '',
  budget TEXT NOT NULL DEFAULT '',

  service_required TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  current_page TEXT NOT NULL DEFAULT '',

  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',

  ip_address TEXT NOT NULL DEFAULT '',

  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,

  remarks TEXT NOT NULL DEFAULT '',

  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost', 'archived')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contact_leads_lead_number ON contact_leads(lead_number);
CREATE INDEX IF NOT EXISTS idx_contact_leads_status ON contact_leads(status);
CREATE INDEX IF NOT EXISTS idx_contact_leads_source ON contact_leads(source);
CREATE INDEX IF NOT EXISTS idx_contact_leads_mobile_number ON contact_leads(mobile_number);
CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at ON contact_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_assigned_to ON contact_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_leads_site_id ON contact_leads(site_id);
CREATE INDEX IF NOT EXISTS idx_contact_leads_deleted_at ON contact_leads(deleted_at);

ALTER TABLE contact_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_leads_select_authenticated" ON contact_leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "contact_leads_insert_authenticated" ON contact_leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "contact_leads_insert_public" ON contact_leads FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "contact_leads_update_authenticated" ON contact_leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "contact_leads_delete_authenticated" ON contact_leads FOR DELETE TO authenticated USING (true);

-- Triggers
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

CREATE TRIGGER trigger_generate_lead_number
  BEFORE INSERT ON contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION generate_lead_number();

CREATE TRIGGER trigger_contact_leads_updated_at
  BEFORE UPDATE ON contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();