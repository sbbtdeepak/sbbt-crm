-- ============================================================
-- Migration: 094 — Estimates: Add crm_lead_id (UUID)
-- SBBT CRM — Production Database
--
-- Purpose:
--   Adds a crm_lead_id UUID column to estimates so the
--   Estimate Engine can link to the new crm_leads table.
--   The old lead_id (BIGINT -> contact_leads) is kept for
--   backward compatibility but is no longer written to.
-- ============================================================

-- Add crm_lead_id column (UUID, references crm_leads)
ALTER TABLE public.estimates
  ADD COLUMN IF NOT EXISTS crm_lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL;

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_estimates_crm_lead_id ON public.estimates(crm_lead_id);