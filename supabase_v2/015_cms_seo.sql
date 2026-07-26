-- ============================================================
-- Migration: 015 — CMS: SEO
-- SBBT CRM v2 — Database Architecture
--
-- Stores SEO metadata for the site: meta tags, Open Graph,
-- social cards, verification codes, and schema markup.
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_seo (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  meta_keywords TEXT NOT NULL DEFAULT '',
  og_image_url TEXT NOT NULL DEFAULT '',
  canonical_url TEXT NOT NULL DEFAULT '',
  robots TEXT NOT NULL DEFAULT 'index, follow',
  schema_json JSONB NOT NULL DEFAULT '{}',
  twitter_card TEXT NOT NULL DEFAULT 'summary_large_image',
  facebook_app_id TEXT NOT NULL DEFAULT '',
  google_verification TEXT NOT NULL DEFAULT '',
  bing_verification TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,

  UNIQUE(site_id)
);

CREATE INDEX IF NOT EXISTS idx_cms_seo_site_id ON cms_seo(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_seo_deleted_at ON cms_seo(deleted_at);

ALTER TABLE cms_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_seo_select_authenticated" ON cms_seo FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_seo_select_public" ON cms_seo FOR SELECT TO public USING (true);
CREATE POLICY "cms_seo_insert_authenticated" ON cms_seo FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_seo_update_authenticated" ON cms_seo FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_seo_delete_authenticated" ON cms_seo FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_cms_seo_updated_at
  BEFORE UPDATE ON cms_seo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();