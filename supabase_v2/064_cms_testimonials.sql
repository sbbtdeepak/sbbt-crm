-- ============================================================
-- Migration: 064 — CMS: Testimonials
-- SBBT CRM v2 — Database Architecture
--
-- Main testimonials table for customer reviews and feedback.
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_testimonials (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  client_name TEXT NOT NULL DEFAULT '',
  designation TEXT NOT NULL DEFAULT '',
  project_name TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  testimonial TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cms_testimonials_site_id ON cms_testimonials(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_testimonials_featured ON cms_testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_cms_testimonials_order ON cms_testimonials(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_testimonials_deleted_at ON cms_testimonials(deleted_at);

ALTER TABLE cms_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_testimonials_select_authenticated" ON cms_testimonials FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_testimonials_select_public" ON cms_testimonials FOR SELECT TO public USING (true);
CREATE POLICY "cms_testimonials_insert_authenticated" ON cms_testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_testimonials_update_authenticated" ON cms_testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_testimonials_delete_authenticated" ON cms_testimonials FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_cms_testimonials_updated_at
  BEFORE UPDATE ON cms_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();