-- ============================================================
-- Migration: 035 — CMS: Packages V2 (Production-Compatible)
-- SBBT CRM v2
--
-- Package → Section → Item
-- Item has: item, brand, specification, remarks
--
-- IMPORTANT: This migration works with the ACTUAL production schema.
-- The production database does NOT have sites or profiles tables.
-- This migration creates V2 structure WITHOUT breaking existing data.
-- ============================================================

-- ============================================================
-- Step A: Create cms_package_sections
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_package_sections (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  package_id BIGINT NOT NULL REFERENCES cms_packages(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_pkg_sections_package ON cms_package_sections(package_id);
CREATE INDEX IF NOT EXISTS idx_cms_pkg_sections_order ON cms_package_sections(display_order);

ALTER TABLE cms_package_sections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "cms_pkg_sections_select_auth" ON cms_package_sections FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "cms_pkg_sections_select_public" ON cms_package_sections FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "cms_pkg_sections_insert_auth" ON cms_package_sections FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "cms_pkg_sections_update_auth" ON cms_package_sections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "cms_pkg_sections_delete_auth" ON cms_package_sections FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- Step B: Create cms_package_items
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_package_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  section_id BIGINT NOT NULL REFERENCES cms_package_sections(id) ON DELETE CASCADE,
  item TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '',
  specification TEXT NOT NULL DEFAULT '',
  remarks TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_pkg_items_section ON cms_package_items(section_id);
CREATE INDEX IF NOT EXISTS idx_cms_pkg_items_order ON cms_package_items(display_order);

ALTER TABLE cms_package_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "cms_pkg_items_select_auth" ON cms_package_items FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "cms_pkg_items_select_public" ON cms_package_items FOR SELECT TO public USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "cms_pkg_items_insert_auth" ON cms_package_items FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "cms_pkg_items_update_auth" ON cms_package_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "cms_pkg_items_delete_auth" ON cms_package_items FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- Step C: Verify
-- ============================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'cms_package%'
ORDER BY table_name;