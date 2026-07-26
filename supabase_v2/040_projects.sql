-- ============================================================
-- Migration: 040 — CMS: Projects
-- SBBT CRM v2 — Database Architecture
--
-- Main projects table for portfolio showcase.
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_projects (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

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
  status TEXT NOT NULL DEFAULT 'ongoing' CHECK (status IN ('planning', 'ongoing', 'completed', 'on_hold')),
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

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,

  UNIQUE(site_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_cms_projects_site_id ON cms_projects(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_projects_active ON cms_projects(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_projects_featured ON cms_projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_cms_projects_order ON cms_projects(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_projects_status ON cms_projects(status);
CREATE INDEX IF NOT EXISTS idx_cms_projects_deleted_at ON cms_projects(deleted_at);

ALTER TABLE cms_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_projects_select_authenticated" ON cms_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_projects_select_public" ON cms_projects FOR SELECT TO public USING (true);
CREATE POLICY "cms_projects_insert_authenticated" ON cms_projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_projects_update_authenticated" ON cms_projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_projects_delete_authenticated" ON cms_projects FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_cms_projects_updated_at
  BEFORE UPDATE ON cms_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();