-- ============================================================
-- Migration: 041 — CMS: Project Gallery
-- SBBT CRM v2 — Database Architecture
--
-- Multiple gallery images per project.
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_project_gallery (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES cms_projects(id) ON DELETE CASCADE,

  image_url TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cms_proj_gallery_project ON cms_project_gallery(project_id);
CREATE INDEX IF NOT EXISTS idx_cms_proj_gallery_order ON cms_project_gallery(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_proj_gallery_deleted_at ON cms_project_gallery(deleted_at);

ALTER TABLE cms_project_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_proj_gallery_select_auth" ON cms_project_gallery FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_proj_gallery_select_public" ON cms_project_gallery FOR SELECT TO public USING (true);
CREATE POLICY "cms_proj_gallery_insert_auth" ON cms_project_gallery FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_proj_gallery_update_auth" ON cms_project_gallery FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_proj_gallery_delete_auth" ON cms_project_gallery FOR DELETE TO authenticated USING (true);