-- ============================================================
-- Migration: 042 — CMS: Project Before/After Images
-- SBBT CRM v2 — Database Architecture
--
-- Before and after renovation images for projects.
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_project_before_images (
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

CREATE TABLE IF NOT EXISTS cms_project_after_images (
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

CREATE INDEX IF NOT EXISTS idx_cms_proj_before_project ON cms_project_before_images(project_id);
CREATE INDEX IF NOT EXISTS idx_cms_proj_before_order ON cms_project_before_images(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_proj_before_deleted_at ON cms_project_before_images(deleted_at);

CREATE INDEX IF NOT EXISTS idx_cms_proj_after_project ON cms_project_after_images(project_id);
CREATE INDEX IF NOT EXISTS idx_cms_proj_after_order ON cms_project_after_images(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_proj_after_deleted_at ON cms_project_after_images(deleted_at);

ALTER TABLE cms_project_before_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_project_after_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_proj_before_select_auth" ON cms_project_before_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_proj_before_select_public" ON cms_project_before_images FOR SELECT TO public USING (true);
CREATE POLICY "cms_proj_before_insert_auth" ON cms_project_before_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_proj_before_update_auth" ON cms_project_before_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_proj_before_delete_auth" ON cms_project_before_images FOR DELETE TO authenticated USING (true);

CREATE POLICY "cms_proj_after_select_auth" ON cms_project_after_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_proj_after_select_public" ON cms_project_after_images FOR SELECT TO public USING (true);
CREATE POLICY "cms_proj_after_insert_auth" ON cms_project_after_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_proj_after_update_auth" ON cms_project_after_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_proj_after_delete_auth" ON cms_project_after_images FOR DELETE TO authenticated USING (true);