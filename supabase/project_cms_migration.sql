-- ============================================================
-- Projects CMS Module Migration
-- SBBT CRM Next.js Project
--
-- Follows CMS conventions from cms_migration.sql:
--   - BIGINT IDENTITY primary keys
--   - site_id for multi-tenant
--   - created_by / updated_by audit fields
--   - RLS enabled
--   - Additive (no existing tables modified)
-- ============================================================

-- ------------------------------------------------------------
-- 1. cms_projects — Main project table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cms_projects (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL DEFAULT '',
  client_name TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  project_type TEXT NOT NULL DEFAULT '',
  package_used TEXT NOT NULL DEFAULT '',
  plot_area TEXT NOT NULL DEFAULT '',
  built_up_area TEXT NOT NULL DEFAULT '',
  floors TEXT NOT NULL DEFAULT '',
  completion_date TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'ongoing',
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT NOT NULL DEFAULT '',
  video_url TEXT NOT NULL DEFAULT '',
  project_value TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  team_size TEXT NOT NULL DEFAULT '',
  customer_rating NUMERIC(3,1) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  og_image_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(site_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_cms_projects_site_id ON cms_projects(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_projects_active ON cms_projects(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_projects_featured ON cms_projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_cms_projects_order ON cms_projects(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_projects_status ON cms_projects(status);
CREATE INDEX IF NOT EXISTS idx_cms_projects_created_at ON cms_projects(created_at);
CREATE INDEX IF NOT EXISTS idx_cms_projects_created_by ON cms_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_cms_projects_updated_by ON cms_projects(updated_by);

ALTER TABLE cms_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_projects_select_authenticated"
  ON cms_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_projects_select_public"
  ON cms_projects FOR SELECT TO public USING (true);
CREATE POLICY "cms_projects_insert_authenticated"
  ON cms_projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_projects_update_authenticated"
  ON cms_projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_projects_delete_authenticated"
  ON cms_projects FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 2. cms_project_gallery — Gallery images per project
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cms_project_gallery (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  project_id BIGINT NOT NULL REFERENCES cms_projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_proj_gallery_project ON cms_project_gallery(project_id);
CREATE INDEX IF NOT EXISTS idx_cms_proj_gallery_order ON cms_project_gallery(display_order);

ALTER TABLE cms_project_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_proj_gallery_select_auth"
  ON cms_project_gallery FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_proj_gallery_select_public"
  ON cms_project_gallery FOR SELECT TO public USING (true);
CREATE POLICY "cms_proj_gallery_insert_auth"
  ON cms_project_gallery FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_proj_gallery_update_auth"
  ON cms_project_gallery FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_proj_gallery_delete_auth"
  ON cms_project_gallery FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 3. cms_project_before_images — Before renovation images
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cms_project_before_images (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  project_id BIGINT NOT NULL REFERENCES cms_projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_proj_before_project ON cms_project_before_images(project_id);
CREATE INDEX IF NOT EXISTS idx_cms_proj_before_order ON cms_project_before_images(display_order);

ALTER TABLE cms_project_before_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_proj_before_select_auth"
  ON cms_project_before_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_proj_before_select_public"
  ON cms_project_before_images FOR SELECT TO public USING (true);
CREATE POLICY "cms_proj_before_insert_auth"
  ON cms_project_before_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_proj_before_update_auth"
  ON cms_project_before_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_proj_before_delete_auth"
  ON cms_project_before_images FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 4. cms_project_after_images — After renovation images
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cms_project_after_images (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  project_id BIGINT NOT NULL REFERENCES cms_projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_proj_after_project ON cms_project_after_images(project_id);
CREATE INDEX IF NOT EXISTS idx_cms_proj_after_order ON cms_project_after_images(display_order);

ALTER TABLE cms_project_after_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_proj_after_select_auth"
  ON cms_project_after_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_proj_after_select_public"
  ON cms_project_after_images FOR SELECT TO public USING (true);
CREATE POLICY "cms_proj_after_insert_auth"
  ON cms_project_after_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_proj_after_update_auth"
  ON cms_project_after_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_proj_after_delete_auth"
  ON cms_project_after_images FOR DELETE TO authenticated USING (true);