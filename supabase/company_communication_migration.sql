-- ============================================================
-- Company Communication Hub Migration (Sprint 7)
-- SBBT CRM Next.js Project
--
-- Adds new public company fields and creates an internal settings
-- table for admin-only configuration.
--
-- Design:
--   - Additive changes to cms_company (no columns dropped/renamed)
--   - New cms_internal_settings table (admin-only, not exposed publicly)
--   - RLS enabled on both tables
--   - Future-ready: api_keys JSONB for placeholder integrations
--
-- Migration: 002_company_communication
-- Date: 2026-07-22
-- ============================================================

-- ============================================================
-- UP MIGRATION
-- ============================================================

-- ------------------------------------------------------------
-- 1. Add new public columns to cms_company (additive)
-- ------------------------------------------------------------

ALTER TABLE cms_company
  ADD COLUMN IF NOT EXISTS alternate_mobile TEXT NOT NULL DEFAULT '';

ALTER TABLE cms_company
  ADD COLUMN IF NOT EXISTS grievance_email TEXT NOT NULL DEFAULT '';

ALTER TABLE cms_company
  ADD COLUMN IF NOT EXISTS google_rating NUMERIC(3,2) NOT NULL DEFAULT 0;

ALTER TABLE cms_company
  ADD COLUMN IF NOT EXISTS years_experience INTEGER NOT NULL DEFAULT 0;

ALTER TABLE cms_company
  ADD COLUMN IF NOT EXISTS homes_delivered INTEGER NOT NULL DEFAULT 0;

ALTER TABLE cms_company
  ADD COLUMN IF NOT EXISTS projects_completed INTEGER NOT NULL DEFAULT 0;

-- ------------------------------------------------------------
-- 2. Create cms_internal_settings table (admin-only)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cms_internal_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(site_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_internal_settings_site_id ON cms_internal_settings(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_internal_settings_created_at ON cms_internal_settings(created_at);
CREATE INDEX IF NOT EXISTS idx_cms_internal_settings_created_by ON cms_internal_settings(created_by);
CREATE INDEX IF NOT EXISTS idx_cms_internal_settings_updated_by ON cms_internal_settings(updated_by);

-- RLS — authenticated only (NO public access)
ALTER TABLE cms_internal_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_internal_settings_select_authenticated"
  ON cms_internal_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "cms_internal_settings_insert_authenticated"
  ON cms_internal_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "cms_internal_settings_update_authenticated"
  ON cms_internal_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "cms_internal_settings_delete_authenticated"
  ON cms_internal_settings FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- 3. Update trigger for cms_company (updated_at)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_cms_company_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cms_company_updated_at ON cms_company;
CREATE TRIGGER trigger_cms_company_updated_at
  BEFORE UPDATE ON cms_company
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_company_updated_at();

-- ============================================================
-- ROLLBACK
-- ============================================================
/*
  -- Drop trigger
  DROP TRIGGER IF EXISTS trigger_cms_company_updated_at ON cms_company;
  DROP FUNCTION IF EXISTS update_cms_company_updated_at();

  -- Drop internal settings table
  DROP TABLE IF EXISTS cms_internal_settings;

  -- Drop new columns from cms_company
  ALTER TABLE cms_company
    DROP COLUMN IF EXISTS alternate_mobile,
    DROP COLUMN IF EXISTS grievance_email,
    DROP COLUMN IF EXISTS google_rating,
    DROP COLUMN IF EXISTS years_experience,
    DROP COLUMN IF EXISTS homes_delivered,
    DROP COLUMN IF EXISTS projects_completed;
*/
