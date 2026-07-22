-- ============================================================
-- Packages CMS Module Migration
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
-- 1. cms_packages — Main package table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cms_packages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  thumbnail_url TEXT NOT NULL DEFAULT '',
  banner_url TEXT NOT NULL DEFAULT '',
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  og_image_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(site_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_cms_packages_site_id ON cms_packages(site_id);
CREATE INDEX IF NOT EXISTS idx_cms_packages_active ON cms_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_packages_order ON cms_packages(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_packages_created_at ON cms_packages(created_at);
CREATE INDEX IF NOT EXISTS idx_cms_packages_created_by ON cms_packages(created_by);
CREATE INDEX IF NOT EXISTS idx_cms_packages_updated_by ON cms_packages(updated_by);

ALTER TABLE cms_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_packages_select_authenticated"
  ON cms_packages FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_packages_select_public"
  ON cms_packages FOR SELECT TO public USING (true);
CREATE POLICY "cms_packages_insert_authenticated"
  ON cms_packages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_packages_update_authenticated"
  ON cms_packages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_packages_delete_authenticated"
  ON cms_packages FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 2. cms_package_features — Unlimited feature list per package
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cms_package_features (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  package_id BIGINT NOT NULL REFERENCES cms_packages(id) ON DELETE CASCADE,
  icon TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_pkg_features_package ON cms_package_features(package_id);
CREATE INDEX IF NOT EXISTS idx_cms_pkg_features_order ON cms_package_features(display_order);

ALTER TABLE cms_package_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_pkg_features_select_auth"
  ON cms_package_features FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_pkg_features_select_public"
  ON cms_package_features FOR SELECT TO public USING (true);
CREATE POLICY "cms_pkg_features_insert_auth"
  ON cms_package_features FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_pkg_features_update_auth"
  ON cms_package_features FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_pkg_features_delete_auth"
  ON cms_package_features FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 3. cms_package_specifications — Specs per package
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cms_package_specifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  package_id BIGINT NOT NULL REFERENCES cms_packages(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT '',
  item TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '',
  remarks TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_pkg_specs_package ON cms_package_specifications(package_id);
CREATE INDEX IF NOT EXISTS idx_cms_pkg_specs_order ON cms_package_specifications(display_order);

ALTER TABLE cms_package_specifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_pkg_specs_select_auth"
  ON cms_package_specifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_pkg_specs_select_public"
  ON cms_package_specifications FOR SELECT TO public USING (true);
CREATE POLICY "cms_pkg_specs_insert_auth"
  ON cms_package_specifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_pkg_specs_update_auth"
  ON cms_package_specifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_pkg_specs_delete_auth"
  ON cms_package_specifications FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 4. cms_package_gallery — Multiple images per package
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cms_package_gallery (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  package_id BIGINT NOT NULL REFERENCES cms_packages(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_pkg_gallery_package ON cms_package_gallery(package_id);
CREATE INDEX IF NOT EXISTS idx_cms_pkg_gallery_order ON cms_package_gallery(display_order);

ALTER TABLE cms_package_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_pkg_gallery_select_auth"
  ON cms_package_gallery FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_pkg_gallery_select_public"
  ON cms_package_gallery FOR SELECT TO public USING (true);
CREATE POLICY "cms_pkg_gallery_insert_auth"
  ON cms_package_gallery FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_pkg_gallery_update_auth"
  ON cms_package_gallery FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_pkg_gallery_delete_auth"
  ON cms_package_gallery FOR DELETE TO authenticated USING (true);