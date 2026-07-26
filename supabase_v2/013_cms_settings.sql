-- ============================================================
-- Migration: 013 — CMS: Settings & Feature Toggles
-- SBBT CRM v2 — Database Architecture
--
-- Controls site-wide settings, footer content, maintenance mode,
-- and feature toggles for the public website.
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  footer_text TEXT NOT NULL DEFAULT '',
  copyright_text TEXT NOT NULL DEFAULT '',

  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT NOT NULL DEFAULT 'We are currently under maintenance. Please check back soon.',

  enable_blog BOOLEAN NOT NULL DEFAULT true,
  enable_quote BOOLEAN NOT NULL DEFAULT true,
  enable_whatsapp BOOLEAN NOT NULL DEFAULT true,
  enable_chatbot BOOLEAN NOT NULL DEFAULT false,
  enable_call_button BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,

  UNIQUE(site_id)
);

CREATE INDEX IF NOT EXISTS idx_cms_settings_site_id ON cms_settings(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_settings_deleted_at ON cms_settings(deleted_at);

ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_settings_select_authenticated" ON cms_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_settings_select_public" ON cms_settings FOR SELECT TO public USING (true);
CREATE POLICY "cms_settings_insert_authenticated" ON cms_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_settings_update_authenticated" ON cms_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_settings_delete_authenticated" ON cms_settings FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_cms_settings_updated_at
  BEFORE UPDATE ON cms_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();