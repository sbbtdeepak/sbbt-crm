-- ============================================================
-- Migration: 081 — CMS: Blogs Premium Fields
-- SBBT CRM v2 — Database Architecture
--
-- Adds ONLY the premium blog fields NOT already provided
-- by earlier migrations (073 added: category, published_date,
-- reading_time, featured, featured_image_alt, and SEO block).
--
-- New in 081:
--   - views        : read counter for "Most Read" section
--   - is_hot       : hot topics flag for trending slider
--   - og_image_url : dedicated Open Graph image
--   - faq          : JSONB FAQ section for detail page schema
--
-- Additive only. No destructive changes. Safe to re-run.
-- ============================================================

ALTER TABLE cms_blogs
 ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0,
 ADD COLUMN IF NOT EXISTS is_hot BOOLEAN NOT NULL DEFAULT false,
 ADD COLUMN IF NOT EXISTS og_image_url TEXT NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS faq JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Indexes for premium query patterns
CREATE INDEX IF NOT EXISTS idx_cms_blogs_views ON cms_blogs(views DESC);
CREATE INDEX IF NOT EXISTS idx_cms_blogs_is_hot ON cms_blogs(is_hot);

-- ============================================================
-- Safe view counter
--
-- SECURITY DEFINER: runs as table owner, bypasses RLS so public
-- (anonymous) visitors can increment counters without UPDATE
-- privileges on cms_blogs.
-- ============================================================
CREATE OR REPLACE FUNCTION increment_blog_views(p_slug TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE cms_blogs
     SET views = views + 1,
         updated_at = now()
   WHERE slug = p_slug;
$$;
