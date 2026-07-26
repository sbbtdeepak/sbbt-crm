-- ============================================================
-- STANDALONE MIGRATION: Create only the missing tables
-- Does NOT touch cms_packages (already exists with data)
-- ============================================================

-- 1. cms_package_sections
CREATE TABLE IF NOT EXISTS cms_package_sections (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  package_id BIGINT NOT NULL REFERENCES cms_packages(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cms_pkg_sections_v3_package ON cms_package_sections(package_id);
CREATE INDEX IF NOT EXISTS idx_cms_pkg_sections_v3_order ON cms_package_sections(display_order);
ALTER TABLE cms_package_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cms_pkg_sections_v3_select_auth" ON cms_package_sections;
DROP POLICY IF EXISTS "cms_pkg_sections_v3_select_public" ON cms_package_sections;
DROP POLICY IF EXISTS "cms_pkg_sections_v3_insert_auth" ON cms_package_sections;
DROP POLICY IF EXISTS "cms_pkg_sections_v3_update_auth" ON cms_package_sections;
DROP POLICY IF EXISTS "cms_pkg_sections_v3_delete_auth" ON cms_package_sections;
CREATE POLICY "cms_pkg_sections_v3_select_auth" ON cms_package_sections FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_pkg_sections_v3_select_public" ON cms_package_sections FOR SELECT TO public USING (true);
CREATE POLICY "cms_pkg_sections_v3_insert_auth" ON cms_package_sections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_pkg_sections_v3_update_auth" ON cms_package_sections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_pkg_sections_v3_delete_auth" ON cms_package_sections FOR DELETE TO authenticated USING (true);

-- 2. cms_package_items
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
CREATE INDEX IF NOT EXISTS idx_cms_pkg_items_v3_section ON cms_package_items(section_id);
CREATE INDEX IF NOT EXISTS idx_cms_pkg_items_v3_order ON cms_package_items(display_order);
ALTER TABLE cms_package_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cms_pkg_items_v3_select_auth" ON cms_package_items;
DROP POLICY IF EXISTS "cms_pkg_items_v3_select_public" ON cms_package_items;
DROP POLICY IF EXISTS "cms_pkg_items_v3_insert_auth" ON cms_package_items;
DROP POLICY IF EXISTS "cms_pkg_items_v3_update_auth" ON cms_package_items;
DROP POLICY IF EXISTS "cms_pkg_items_v3_delete_auth" ON cms_package_items;
CREATE POLICY "cms_pkg_items_v3_select_auth" ON cms_package_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_pkg_items_v3_select_public" ON cms_package_items FOR SELECT TO public USING (true);
CREATE POLICY "cms_pkg_items_v3_insert_auth" ON cms_package_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_pkg_items_v3_update_auth" ON cms_package_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_pkg_items_v3_delete_auth" ON cms_package_items FOR DELETE TO authenticated USING (true);