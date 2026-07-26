-- ============================================================
-- Migration: 056 — Estimate Attachments
-- SBBT CRM v2 — Database Architecture
--
-- Future attachments: PDFs, drawings, BOQ documents.
-- ============================================================

CREATE TABLE IF NOT EXISTS estimate_attachments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  estimate_id BIGINT NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,

  file_name TEXT NOT NULL DEFAULT '',
  file_url TEXT NOT NULL DEFAULT '',
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL DEFAULT '',
  attachment_type TEXT NOT NULL DEFAULT 'pdf' CHECK (attachment_type IN ('pdf', 'drawing', 'boq', 'image', 'other')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_estimate_attachments_site_id ON estimate_attachments(site_id);
CREATE INDEX IF NOT EXISTS idx_estimate_attachments_estimate_id ON estimate_attachments(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_attachments_type ON estimate_attachments(attachment_type);
CREATE INDEX IF NOT EXISTS idx_estimate_attachments_deleted_at ON estimate_attachments(deleted_at);

ALTER TABLE estimate_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estimate_attachments_select_authenticated" ON estimate_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "estimate_attachments_insert_authenticated" ON estimate_attachments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "estimate_attachments_update_authenticated" ON estimate_attachments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "estimate_attachments_delete_authenticated" ON estimate_attachments FOR DELETE TO authenticated USING (true);