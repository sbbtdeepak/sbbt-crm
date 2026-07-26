-- ============================================================
-- Migration: 011 — CMS: Homepage
-- SBBT CRM v2 — Database Architecture
--
-- Controls the hero banner section and statistics display
-- on the public homepage.
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_homepage (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  -- Hero Section
  hero_heading TEXT NOT NULL DEFAULT '',
  hero_subheading TEXT NOT NULL DEFAULT '',
  hero_cta_text TEXT NOT NULL DEFAULT '',
  hero_cta_link TEXT NOT NULL DEFAULT '',
  hero_background_url TEXT NOT NULL DEFAULT '',

  -- Statistics
  stats_heading TEXT NOT NULL DEFAULT '',
  stats JSONB NOT NULL DEFAULT '[]',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,

  UNIQUE(site_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cms_homepage_site_id ON cms_homepage(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_homepage_deleted_at ON cms_homepage(deleted_at);

-- RLS
ALTER TABLE cms_homepage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_homepage_select_authenticated" ON cms_homepage FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_homepage_select_public" ON cms_homepage FOR SELECT TO public USING (true);
CREATE POLICY "cms_homepage_insert_authenticated" ON cms_homepage FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_homepage_update_authenticated" ON cms_homepage FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_homepage_delete_authenticated" ON cms_homepage FOR DELETE TO authenticated USING (true);

-- Triggers
CREATE TRIGGER trigger_cms_homepage_updated_at
  BEFORE UPDATE ON cms_homepage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();