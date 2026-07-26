-- ============================================================
-- Migration: 012 — CMS: Social Links
-- SBBT CRM v2 — Database Architecture
--
-- Stores social media profile URLs for the public website.
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_social (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  facebook_url TEXT NOT NULL DEFAULT '',
  instagram_url TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  youtube_url TEXT NOT NULL DEFAULT '',
  twitter_url TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,

  UNIQUE(site_id)
);

CREATE INDEX IF NOT EXISTS idx_cms_social_site_id ON cms_social(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_social_deleted_at ON cms_social(deleted_at);

ALTER TABLE cms_social ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_social_select_authenticated" ON cms_social FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_social_select_public" ON cms_social FOR SELECT TO public USING (true);
CREATE POLICY "cms_social_insert_authenticated" ON cms_social FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_social_update_authenticated" ON cms_social FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_social_delete_authenticated" ON cms_social FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_cms_social_updated_at
  BEFORE UPDATE ON cms_social
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();