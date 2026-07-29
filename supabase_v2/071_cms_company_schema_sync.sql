-- ============================================================
-- Migration: 071 — CMS: Company Schema Synchronization
-- SBBT CRM v2 — Production Database Synchronization
--
-- Adds 6 missing columns to cms_company that exist in the
-- migration file (010) but were never applied to production.
--
-- Safe:
--   - Uses ADD COLUMN IF NOT EXISTS (idempotent)
--   - No DROP, no ALTER TYPE, no recreation
--   - No code changes required
--
-- Verified via PostgREST per-column test on 2026-07-27.
-- ============================================================

-- ============================================================
-- 1. Add missing columns (idempotent)
-- ============================================================
ALTER TABLE cms_company
  ADD COLUMN IF NOT EXISTS grievance_email    TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS google_rating      NUMERIC(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS years_experience   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS homes_delivered    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS projects_completed INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deleted_at         TIMESTAMPTZ;

-- ============================================================
-- 2. Verification
-- ============================================================
-- Run this query after migration to confirm all columns exist.
-- Expected: all 6 rows return 'EXISTS'.
SELECT column_name,
       CASE WHEN column_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END AS status
FROM   information_schema.columns
WHERE  table_schema = 'public'
  AND  table_name   = 'cms_company'
  AND  column_name IN (
    'grievance_email',
    'google_rating',
    'years_experience',
    'homes_delivered',
    'projects_completed',
    'deleted_at'
  )
ORDER  BY column_name;