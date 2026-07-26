-- ============================================================
-- Migration: 014 — CMS: Internal Settings (Admin Only)
-- SBBT CRM v2 — Database Architecture
--
-- Stores admin-only configuration: notification emails,
-- integration URLs, API keys. NOT exposed publicly.
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_internal_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

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
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,

  UNIQUE(site_id)
);

CREATE INDEX IF NOT EXISTS idx_cms_internal_settings_site_id ON cms_internal_settings(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_internal_settings_deleted_at ON cms_internal_settings(deleted_at);

ALTER TABLE cms_internal_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_internal_settings_select_authenticated" ON cms_internal_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_internal_settings_insert_authenticated" ON cms_internal_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_internal_settings_update_authenticated" ON cms_internal_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_internal_settings_delete_authenticated" ON cms_internal_settings FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_cms_internal_settings_updated_at
  BEFORE UPDATE ON cms_internal_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();