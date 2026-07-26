-- ============================================================
-- Migration: 063 — CMS: Blogs
-- SBBT CRM v2 — Database Architecture
--
-- Main blogs table for publishing construction-related articles.
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_blogs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  title TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  featured_image_url TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  UNIQUE(site_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_cms_blogs_site_id ON cms_blogs(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_blogs_published ON cms_blogs(is_published);
CREATE INDEX IF NOT EXISTS idx_cms_blogs_order ON cms_blogs(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_blogs_deleted_at ON cms_blogs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_cms_blogs_slug ON cms_blogs(slug);

ALTER TABLE cms_blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_blogs_select_authenticated" ON cms_blogs FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_blogs_select_public" ON cms_blogs FOR SELECT TO public USING (true);
CREATE POLICY "cms_blogs_insert_authenticated" ON cms_blogs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_blogs_update_authenticated" ON cms_blogs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_blogs_delete_authenticated" ON cms_blogs FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_cms_blogs_updated_at
  BEFORE UPDATE ON cms_blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();