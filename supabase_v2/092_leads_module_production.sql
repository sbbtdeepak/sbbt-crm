-- ============================================================
-- Migration: 092 — Leads Module Production (Additive)
-- SBBT CRM — Production Database
--
-- Purpose:
--   Creates ALL missing database objects required by the
--   Leads module. Production has 33 tables but NO:
--     contact_leads, admin_notifications, notification_logs,
--     cms_internal_settings (may or may not exist)
--
--   No dependency on sites / profiles tables (do not exist).
--   No CREATE POLICY IF NOT EXISTS (use DROP + CREATE pattern).
--   PostgreSQL 17 + Supabase compatible.
--   Additive + idempotent. Safe to apply multiple times.
--
-- Tables created (if missing):
--   1. contact_leads          — main leads table
--   2. admin_notifications    — in-app admin notifications
--   3. notification_logs      — notification delivery audit trail
--   4. cms_internal_settings  — provider config (email/sheets/whatsapp/webhook)
--
-- Column sets derived from CURRENT application code:
--   - App/dashboard/leads/actions.ts
--   - App/dashboard/leads/types.ts
--   - App/dashboard/leads/lib/notification-actions.ts
--   - App/dashboard/leads/lib/providers/*.ts
--   - App/api/leads/route.ts
-- ============================================================

-- ============================================================
-- 1. Shared Functions (idempotent)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- ============================================================
-- 2. contact_leads
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_leads (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

  -- Business fields (createLeadFromAPI / createLead)
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

  -- Legacy compatibility columns (types.ts + getLeads search .or())
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

CREATE INDEX IF NOT EXISTS idx_contact_leads_lead_number ON contact_leads(lead_number);
CREATE INDEX IF NOT EXISTS idx_contact_leads_status ON contact_leads(status);
CREATE INDEX IF NOT EXISTS idx_contact_leads_source ON contact_leads(source);
CREATE INDEX IF NOT EXISTS idx_contact_leads_mobile_number ON contact_leads(mobile_number);
CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at ON contact_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_assigned_to ON contact_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_leads_site_id ON contact_leads(site_id);
CREATE INDEX IF NOT EXISTS idx_contact_leads_deleted_at ON contact_leads(deleted_at);

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

ALTER TABLE contact_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_leads_select_authenticated" ON contact_leads;
CREATE POLICY "contact_leads_select_authenticated"
  ON contact_leads FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "contact_leads_insert_authenticated" ON contact_leads;
CREATE POLICY "contact_leads_insert_authenticated"
  ON contact_leads FOR INSERT TO authenticated WITH CHECK (true);

-- Public (anon) INSERT for website lead/quote forms via /api/leads
DROP POLICY IF EXISTS "contact_leads_insert_public" ON contact_leads;
CREATE POLICY "contact_leads_insert_public"
  ON contact_leads FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "contact_leads_update_authenticated" ON contact_leads;
CREATE POLICY "contact_leads_update_authenticated"
  ON contact_leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "contact_leads_delete_authenticated" ON contact_leads;
CREATE POLICY "contact_leads_delete_authenticated"
  ON contact_leads FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 3. admin_notifications
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_notifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID,

  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  link TEXT NOT NULL DEFAULT '',

  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,

  lead_id BIGINT,
  lead_number TEXT NOT NULL DEFAULT '',

  target_user_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_target_user ON admin_notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_lead_id ON admin_notifications(lead_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_deleted_at ON admin_notifications(deleted_at);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_notifications_select_authenticated" ON admin_notifications;
CREATE POLICY "admin_notifications_select_authenticated"
  ON admin_notifications FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_notifications_insert_authenticated" ON admin_notifications;
CREATE POLICY "admin_notifications_insert_authenticated"
  ON admin_notifications FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_notifications_update_authenticated" ON admin_notifications;
CREATE POLICY "admin_notifications_update_authenticated"
  ON admin_notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_notifications_delete_authenticated" ON admin_notifications;
CREATE POLICY "admin_notifications_delete_authenticated"
  ON admin_notifications FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 4. notification_logs
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID,

  notification_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  provider TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',

  recipient TEXT NOT NULL,

  subject TEXT,
  body TEXT,

  status TEXT NOT NULL DEFAULT 'pending',
  message_id TEXT,
  error_message TEXT,

  lead_id BIGINT,
  lead_number TEXT NOT NULL DEFAULT '',

  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_channel ON notification_logs(channel);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_lead_id ON notification_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_site_id ON notification_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_notification_id ON notification_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_deleted_at ON notification_logs(deleted_at);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notification_logs_select_authenticated" ON notification_logs;
CREATE POLICY "notification_logs_select_authenticated"
  ON notification_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "notification_logs_insert_authenticated" ON notification_logs;
CREATE POLICY "notification_logs_insert_authenticated"
  ON notification_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "notification_logs_update_authenticated" ON notification_logs;
CREATE POLICY "notification_logs_update_authenticated"
  ON notification_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "notification_logs_delete_authenticated" ON notification_logs;
CREATE POLICY "notification_logs_delete_authenticated"
  ON notification_logs FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 5. cms_internal_settings (provider config)
--    May already exist in production — additive columns only.
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_internal_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID,

  lead_notification_email TEXT NOT NULL DEFAULT '',
  sales_email TEXT NOT NULL DEFAULT '',
  quotation_email TEXT NOT NULL DEFAULT '',
  support_email TEXT NOT NULL DEFAULT '',
  accounts_email TEXT NOT NULL DEFAULT '',

  google_sheet_url TEXT NOT NULL DEFAULT '',
  webhook_url TEXT NOT NULL DEFAULT '',

  smtp_ready BOOLEAN NOT NULL DEFAULT false,
  resend_ready BOOLEAN NOT NULL DEFAULT false,
  whatsapp_api_number TEXT NOT NULL DEFAULT '',

  api_keys JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,

  UNIQUE(site_id)
);

-- Additive columns (safe if table already exists)
ALTER TABLE cms_internal_settings
  ADD COLUMN IF NOT EXISTS lead_notification_email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sales_email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS quotation_email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS support_email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS accounts_email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS google_sheet_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS webhook_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS smtp_ready BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS resend_ready BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_api_number TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS api_keys JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS webhook_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS webhook_secret TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_cms_internal_settings_site_id ON cms_internal_settings(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_internal_settings_deleted_at ON cms_internal_settings(deleted_at);
CREATE INDEX IF NOT EXISTS idx_cms_internal_settings_webhook_enabled ON cms_internal_settings(webhook_enabled);

DROP TRIGGER IF EXISTS trigger_cms_internal_settings_updated_at ON cms_internal_settings;
CREATE TRIGGER trigger_cms_internal_settings_updated_at
  BEFORE UPDATE ON cms_internal_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE cms_internal_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cms_internal_settings_select_authenticated" ON cms_internal_settings;
CREATE POLICY "cms_internal_settings_select_authenticated"
  ON cms_internal_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "cms_internal_settings_insert_authenticated" ON cms_internal_settings;
CREATE POLICY "cms_internal_settings_insert_authenticated"
  ON cms_internal_settings FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cms_internal_settings_update_authenticated" ON cms_internal_settings;
CREATE POLICY "cms_internal_settings_update_authenticated"
  ON cms_internal_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cms_internal_settings_delete_authenticated" ON cms_internal_settings;
CREATE POLICY "cms_internal_settings_delete_authenticated"
  ON cms_internal_settings FOR DELETE TO authenticated USING (true);