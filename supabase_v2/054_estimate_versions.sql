-- ============================================================
-- Migration: 054 — Estimate Versions
-- SBBT CRM v2 — Database Architecture
--
-- Version history with full JSONB snapshots for audit trail.
-- ============================================================

CREATE TABLE IF NOT EXISTS estimate_versions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  estimate_id BIGINT NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,

  version_number INTEGER NOT NULL,
  version_name TEXT NOT NULL DEFAULT '',
  change_reason TEXT NOT NULL DEFAULT '',

  data JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_estimate_versions_site_id ON estimate_versions(site_id);
CREATE INDEX IF NOT EXISTS idx_estimate_versions_estimate_id ON estimate_versions(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_versions_version_number ON estimate_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_estimate_versions_created_at ON estimate_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimate_versions_deleted_at ON estimate_versions(deleted_at);

ALTER TABLE estimate_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estimate_versions_select_authenticated" ON estimate_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "estimate_versions_insert_authenticated" ON estimate_versions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "estimate_versions_update_authenticated" ON estimate_versions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "estimate_versions_delete_authenticated" ON estimate_versions FOR DELETE TO authenticated USING (true);