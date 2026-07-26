-- ============================================================
-- Migration: 051 — Customers
-- SBBT CRM v2 — Database Architecture
--
-- Registered customers (converted from leads or signed up directly).
-- Distinct from contact_leads: customers have completed transactions
-- or registered accounts.
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  full_name TEXT NOT NULL DEFAULT '',
  mobile_number TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',

  customer_type TEXT NOT NULL DEFAULT 'individual' CHECK (customer_type IN ('individual', 'commercial', 'contractor')),

  company_name TEXT NOT NULL DEFAULT '',
  gstin TEXT NOT NULL DEFAULT '',

  total_projects INTEGER NOT NULL DEFAULT 0,
  lifetime_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  last_project_date TIMESTAMPTZ,

  notes TEXT NOT NULL DEFAULT '',

  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_customers_site_id ON customers(site_id);
CREATE INDEX IF NOT EXISTS idx_customers_mobile_number ON customers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers(deleted_at);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select_auth" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "customers_insert_auth" ON customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "customers_update_auth" ON customers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "customers_delete_auth" ON customers FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();