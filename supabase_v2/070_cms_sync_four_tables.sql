-- ============================================================
-- Migration: 070 — CMS: Synchronize Four Missing Tables
-- SBBT CRM v2 — Production Database Synchronization
--
-- Creates (idempotent):
--   1. update_updated_at_column() function (if missing)
--   2. cms_internal_settings table
--   3. cms_testimonials table
--   4. cms_blogs table
--   5. alternate_mobile column on cms_company
--
-- Compatible with current production schema:
--   - No REFERENCES sites(id)
--   - No REFERENCES profiles(id)
--   - created_by / updated_by store auth.users UUID as plain text
--   - site_id is plain UUID with UNIQUE constraint (no FK)
--   - All CREATE use IF NOT EXISTS
--   - Column add uses IF NOT EXISTS
-- ============================================================

-- ============================================================
-- 0. Ensure helper function exists (idempotent)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. cms_internal_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_internal_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

  lead_notification_email TEXT NOT NULL DEFAULT '',
  sales_email TEXT NOT NULL DEFAULT '',
  quotation_email TEXT NOT NULL DEFAULT '',
  support_email TEXT NOT NULL DEFAULT '',
  accounts_email TEXT NOT NULL DEFAULT '',

  google_sheet_url TEXT NOT NULL DEFAULT '',
  webhook_url TEXT NOT NULL DEFAULT '',

  smtp_ready BOOLEAN NOT NULL DEFAULT false,
  resend_ready BOOLEAN NOT NULL DEFAULT false,
  whatsapp_api_number TEXT NOT NULL DEFAULT '',

  api_keys JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ,

  UNIQUE(site_id)
);

CREATE INDEX IF NOT EXISTS idx_cms_internal_settings_site_id
  ON cms_internal_settings(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_internal_settings_deleted_at
  ON cms_internal_settings(deleted_at);

ALTER TABLE cms_internal_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cms_internal_settings'
    AND policyname = 'cms_internal_settings_select_authenticated'
  ) THEN
    CREATE POLICY "cms_internal_settings_select_authenticated"
      ON cms_internal_settings FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cms_internal_settings'
    AND policyname = 'cms_internal_settings_insert_authenticated'
  ) THEN
    CREATE POLICY "cms_internal_settings_insert_authenticated"
      ON cms_internal_settings FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cms_internal_settings'
    AND policyname = 'cms_internal_settings_update_authenticated'
  ) THEN
    CREATE POLICY "cms_internal_settings_update_authenticated"
      ON cms_internal_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cms_internal_settings'
    AND policyname = 'cms_internal_settings_delete_authenticated'
  ) THEN
    CREATE POLICY "cms_internal_settings_delete_authenticated"
      ON cms_internal_settings FOR DELETE TO authenticated USING (true);
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trigger_cms_internal_settings_updated_at
  ON cms_internal_settings;
CREATE TRIGGER trigger_cms_internal_settings_updated_at
  BEFORE UPDATE ON cms_internal_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. cms_testimonials
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_testimonials (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

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
  created_by UUID,
  updated_by UUID
);

CREATE INDEX IF NOT EXISTS idx_cms_testimonials_site_id
  ON cms_testimonials(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_testimonials_featured
  ON cms_testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_cms_testimonials_order
  ON cms_testimonials(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_testimonials_deleted_at
  ON cms_testimonials(deleted_at);

ALTER TABLE cms_testimonials ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cms_testimonials'
    AND policyname = 'cms_testimonials_select_authenticated'
  ) THEN
    CREATE POLICY "cms_testimonials_select_authenticated"
      ON cms_testimonials FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cms_testimonials'
    AND policyname = 'cms_testimonials_select_public'
  ) THEN
    CREATE POLICY "cms_testimonials_select_public"
      ON cms_testimonials FOR SELECT TO public USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cms_testimonials'
    AND policyname = 'cms_testimonials_insert_authenticated'
  ) THEN
    CREATE POLICY "cms_testimonials_insert_authenticated"
      ON cms_testimonials FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cms_testimonials'
    AND policyname = 'cms_testimonials_update_authenticated'
  ) THEN
    CREATE POLICY "cms_testimonials_update_authenticated"
      ON cms_testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cms_testimonials'
    AND policyname = 'cms_testimonials_delete_authenticated'
  ) THEN
    CREATE POLICY "cms_testimonials_delete_authenticated"
      ON cms_testimonials FOR DELETE TO authenticated USING (true);
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trigger_cms_testimonials_updated_at
  ON cms_testimonials;
CREATE TRIGGER trigger_cms_testimonials_updated_at
  BEFORE UPDATE ON cms_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. cms_blogs
-- ============================================================
CREATE TABLE IF NOT EXISTS cms_blogs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

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
  created_by UUID,
  updated_by UUID,

  UNIQUE(site_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_cms_blogs_site_id
  ON cms_blogs(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_blogs_published
  ON cms_blogs(is_published);
CREATE INDEX IF NOT EXISTS idx_cms_blogs_order
  ON cms_blogs(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_blogs_deleted_at
  ON cms_blogs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_cms_blogs_slug
  ON cms_blogs(slug);

ALTER TABLE cms_blogs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cms_blogs'
    AND policyname = 'cms_blogs_select_authenticated'
  ) THEN
    CREATE POLICY "cms_blogs_select_authenticated"
      ON cms_blogs FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cms_blogs'
    AND policyname = 'cms_blogs_select_public'
  ) THEN
    CREATE POLICY "cms_blogs_select_public"
      ON cms_blogs FOR SELECT TO public USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cms_blogs'
    AND policyname = 'cms_blogs_insert_authenticated'
  ) THEN
    CREATE POLICY "cms_blogs_insert_authenticated"
      ON cms_blogs FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cms_blogs'
    AND policyname = 'cms_blogs_update_authenticated'
  ) THEN
    CREATE POLICY "cms_blogs_update_authenticated"
      ON cms_blogs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cms_blogs'
    AND policyname = 'cms_blogs_delete_authenticated'
  ) THEN
    CREATE POLICY "cms_blogs_delete_authenticated"
      ON cms_blogs FOR DELETE TO authenticated USING (true);
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trigger_cms_blogs_updated_at
  ON cms_blogs;
CREATE TRIGGER trigger_cms_blogs_updated_at
  BEFORE UPDATE ON cms_blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. Add alternate_mobile to cms_company (if missing)
-- ============================================================
ALTER TABLE cms_company
  ADD COLUMN IF NOT EXISTS alternate_mobile TEXT NOT NULL DEFAULT '';

-- ============================================================
-- Verification
-- ============================================================
SELECT '070_cms_sync_four_tables' AS migration,
       'cms_internal_settings' AS table_name,
       CASE WHEN EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'cms_internal_settings'
       ) THEN 'CREATED' ELSE 'FAILED' END AS status
UNION ALL
SELECT '070_cms_sync_four_tables', 'cms_testimonials',
       CASE WHEN EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'cms_testimonials'
       ) THEN 'CREATED' ELSE 'FAILED' END
UNION ALL
SELECT '070_cms_sync_four_tables', 'cms_blogs',
       CASE WHEN EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'cms_blogs'
       ) THEN 'CREATED' ELSE 'FAILED' END
UNION ALL
SELECT '070_cms_sync_four_tables', 'cms_company.alternate_mobile',
       CASE WHEN EXISTS (
         SELECT FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'cms_company'
         AND column_name = 'alternate_mobile'
       ) THEN 'ADDED' ELSE 'FAILED' END;