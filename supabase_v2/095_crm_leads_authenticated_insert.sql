-- ============================================================
-- Migration: 095 — CRM Leads Authenticated INSERT Policy
-- ============================================================
-- Adds INSERT policy for authenticated role.
-- Required because server-side requests run as authenticated,
-- not anon. Anon INSERT policy already exists.
-- ============================================================

-- ============================================================
-- INSERT policy for authenticated users (admin)
-- ============================================================
CREATE POLICY "crm_leads_insert_authenticated"
ON public.crm_leads
FOR INSERT
TO authenticated
WITH CHECK (TRUE);

-- ============================================================
-- Verification (no changes to existing policies)
-- ============================================================
-- Existing policies remain:
--   - crm_leads_insert_anon (anon INSERT)
--   - crm_leads_select_lead_number_anon (anon SELECT)
--   - crm_leads_select_authenticated (authenticated SELECT)
--   - crm_leads_update_authenticated (authenticated UPDATE)
--   - crm_leads_delete_authenticated (authenticated DELETE)
-- ============================================================