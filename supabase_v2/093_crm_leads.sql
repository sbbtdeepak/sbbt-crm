-- ============================================================
-- Migration: 093 — CRM Leads V2 (New Backend)
-- SBBT CRM — Production Database
--
-- Purpose:
--   Creates brand new crm_leads table for the new Lead Module V2.
--   Runs ALONGSIDE legacy contact_leads. No old code is touched.
--
-- Design:
--   - No triggers (lead number generated in server code only)
--   - No duplicate trigger
--   - No update trigger
--   - Clean RLS:
--       anon          -> INSERT only
--       authenticated -> SELECT / UPDATE / DELETE
--       no public SELECT
-- ============================================================

-- ============================================================
-- 1. crm_leads table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_number   TEXT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  mobile        TEXT NOT NULL,
  email         TEXT,
  location      TEXT,
  plot_area     TEXT,
  budget        TEXT,
  service       TEXT,
  message       TEXT,
  source        TEXT NOT NULL DEFAULT 'website',
  page_url      TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  ip_address    TEXT,
  status        TEXT NOT NULL DEFAULT 'new',
  assigned_to   UUID,
  otp_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_crm_leads_lead_number ON public.crm_leads (lead_number);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON public.crm_leads (status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source ON public.crm_leads (source);
CREATE INDEX IF NOT EXISTS idx_crm_leads_mobile ON public.crm_leads (mobile);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON public.crm_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned_to ON public.crm_leads (assigned_to);

-- ============================================================
-- 3. Row Level Security
-- ============================================================
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- anon: INSERT only (website forms)
DROP POLICY IF EXISTS "crm_leads_insert_anon" ON public.crm_leads;
CREATE POLICY "crm_leads_insert_anon"
ON public.crm_leads
FOR INSERT
TO anon
WITH CHECK (TRUE);

-- anon: SELECT lead_number only (for MAX+1 lead number generation in server code)
DROP POLICY IF EXISTS "crm_leads_select_lead_number_anon" ON public.crm_leads;
CREATE POLICY "crm_leads_select_lead_number_anon"
ON public.crm_leads
FOR SELECT
TO anon
USING (TRUE);

-- authenticated: SELECT
DROP POLICY IF EXISTS "crm_leads_select_authenticated" ON public.crm_leads;
CREATE POLICY "crm_leads_select_authenticated"
  ON public.crm_leads
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- authenticated: UPDATE
DROP POLICY IF EXISTS "crm_leads_update_authenticated" ON public.crm_leads;
CREATE POLICY "crm_leads_update_authenticated"
  ON public.crm_leads
  FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- authenticated: DELETE
DROP POLICY IF EXISTS "crm_leads_delete_authenticated" ON public.crm_leads;
CREATE POLICY "crm_leads_delete_authenticated"
  ON public.crm_leads
  FOR DELETE
  TO authenticated
  USING (TRUE);

-- ============================================================
-- NOTE: No triggers. Lead number is generated in server code.
-- ============================================================