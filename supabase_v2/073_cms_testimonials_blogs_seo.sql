-- ============================================================
-- Migration: 073 — CMS: Add SEO + Extended Fields to Testimonials & Blogs
-- SBBT CRM v2
--
-- Additive only - no destructive changes.
-- Idempotent - uses IF NOT EXISTS.
-- ============================================================

-- ============================================================
-- Testimonials: Add new columns
-- ============================================================

ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS initials TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS project_type TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS completion_year INTEGER;

-- Testimonial SEO fields
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS seo_title TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS seo_description TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS seo_keywords TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS canonical TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS og_title TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS og_description TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS twitter_title TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS twitter_description TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS robots TEXT NOT NULL DEFAULT 'index, follow';
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS schema_description TEXT NOT NULL DEFAULT '';

-- ============================================================
-- Blogs: Add new columns
-- ============================================================

ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS published_date DATE;
ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS reading_time INTEGER NOT NULL DEFAULT 5;
ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS featured_image_alt TEXT NOT NULL DEFAULT '';

-- Blog SEO fields
ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS seo_title TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS seo_description TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS seo_keywords TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS canonical TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS og_title TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS og_description TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS twitter_title TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS twitter_description TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS robots TEXT NOT NULL DEFAULT 'index, follow';
ALTER TABLE cms_blogs ADD COLUMN IF NOT EXISTS schema_description TEXT NOT NULL DEFAULT '';

-- ============================================================
-- Indexes for new columns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_cms_testimonials_project_type ON cms_testimonials(project_type);
CREATE INDEX IF NOT EXISTS idx_cms_testimonials_completion_year ON cms_testimonials(completion_year);

CREATE INDEX IF NOT EXISTS idx_cms_blogs_category ON cms_blogs(category);
CREATE INDEX IF NOT EXISTS idx_cms_blogs_published_date ON cms_blogs(published_date);
CREATE INDEX IF NOT EXISTS idx_cms_blogs_featured ON cms_blogs(featured);