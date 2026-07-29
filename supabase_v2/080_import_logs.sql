-- ============================================================
-- Import Logs Table
-- SBBT CRM v2 — Enterprise Import Framework v1.0
--
-- Tracks all bulk import operations across all CMS modules.
-- Supports dry run, rollback, and audit tracking.
--
-- This migration is:
--   ✅ Idempotent (CREATE TABLE IF NOT EXISTS)
--   ✅ Production compatible
--   ✅ No dependency on sites or profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS import_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

  -- Module identity
  module TEXT NOT NULL,
  template_version TEXT NOT NULL DEFAULT '1.0.0',

  -- File info
  filename TEXT NOT NULL DEFAULT '',
  import_mode TEXT NOT NULL DEFAULT 'upsert'
    CHECK (import_mode IN ('insert_only', 'update_only', 'upsert')),

  -- Status tracking
  -- pending → dry_run → importing → completed | failed → rolled_back
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending',
      'dry_run',
      'importing',
      'completed',
      'failed',
      'rolled_back'
    )),

  -- Pre-import counts (from dry run)
  total_rows INTEGER NOT NULL DEFAULT 0,
  valid_rows INTEGER NOT NULL DEFAULT 0,
  error_rows INTEGER NOT NULL DEFAULT 0,
  skipped_rows INTEGER NOT NULL DEFAULT 0,

  -- Post-import counts
  inserted_rows INTEGER NOT NULL DEFAULT 0,
  updated_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,

  -- Dry run snapshot (JSON of what would happen)
  dry_run_result JSONB NOT NULL DEFAULT '{}',

  -- Error details
  errors JSONB NOT NULL DEFAULT '[]',
  -- [{ row: 5, column: "price", message: "Must be a number", severity: "error" }]

  warnings JSONB NOT NULL DEFAULT '[]',
  -- [{ row: 3, message: "Image file 'logo.png' not found in storage" }]

  -- Rollback support
  previous_data JSONB NOT NULL DEFAULT '{}',
  -- For UPSERT: snapshot of rows that were updated (before state)
  -- For INSERT_ONLY: list of inserted IDs
  -- For UPDATE_ONLY: nothing needed

  is_rolled_back BOOLEAN NOT NULL DEFAULT false,
  rolled_back_at TIMESTAMPTZ,
  rolled_back_by UUID,

  -- Performance
  duration_ms INTEGER NOT NULL DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_import_logs_module ON import_logs(module);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_by ON import_logs(created_by);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at ON import_logs(created_at DESC);

-- Allow public access for service role (RLS handled at application level)
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

-- Policy: service role can do everything
CREATE POLICY IF NOT EXISTS "service_role_all"
  ON import_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: authenticated users can read their own imports
CREATE POLICY IF NOT EXISTS "authenticated_read_own"
  ON import_logs
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Policy: authenticated users can insert their own imports
CREATE POLICY IF NOT EXISTS "authenticated_insert_own"
  ON import_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Policy: authenticated users can update their own imports
CREATE POLICY IF NOT EXISTS "authenticated_update_own"
  ON import_logs
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());