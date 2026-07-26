-- ============================================================
-- Migration: 055 — Estimate Notes
-- SBBT CRM v2 — Database Architecture
--
-- Communication log for estimates: internal notes and customer messages.
-- ============================================================

CREATE TABLE IF NOT EXISTS estimate_notes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  estimate_id BIGINT NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,

  note TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_estimate_notes_site_id ON estimate_notes(site_id);
CREATE INDEX IF NOT EXISTS idx_estimate_notes_estimate_id ON estimate_notes(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_notes_created_at ON estimate_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimate_notes_is_internal ON estimate_notes(is_internal);
CREATE INDEX IF NOT EXISTS idx_estimate_notes_deleted_at ON estimate_notes(deleted_at);

ALTER TABLE estimate_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estimate_notes_select_authenticated" ON estimate_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "estimate_notes_insert_authenticated" ON estimate_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "estimate_notes_update_authenticated" ON estimate_notes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "estimate_notes_delete_authenticated" ON estimate_notes FOR DELETE TO authenticated USING (true);