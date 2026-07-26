-- ============================================================
-- Migration: 020 — Master Data: Material Categories
-- SBBT CRM v2 — Database Architecture
-- ============================================================

CREATE TABLE IF NOT EXISTS material_categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  version INTEGER NOT NULL DEFAULT 1,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mat_categories_site ON material_categories(site_id);
CREATE INDEX IF NOT EXISTS idx_mat_categories_active ON material_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_mat_categories_order ON material_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_mat_categories_deleted_at ON material_categories(deleted_at);

ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mat_categories_select_auth" ON material_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "mat_categories_insert_auth" ON material_categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "mat_categories_update_auth" ON material_categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "mat_categories_delete_auth" ON material_categories FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_mat_categories_updated_at
  BEFORE UPDATE ON material_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed data
INSERT INTO material_categories (site_id, name, description, display_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Flooring', 'Flooring materials including tiles, marble, wood', 1),
  ('00000000-0000-0000-0000-000000000001', 'Wall Finishes', 'Paint, wallpaper, cladding', 2),
  ('00000000-0000-0000-0000-000000000001', 'Electrical', 'Wires, switches, fixtures', 3),
  ('00000000-0000-0000-0000-000000000001', 'Plumbing', 'Pipes, fittings, sanitaryware', 4),
  ('00000000-0000-0000-0000-000000000001', 'Structural', 'Cement, steel, concrete, bricks', 5),
  ('00000000-0000-0000-0000-000000000001', 'Woodwork', 'Doors, windows, furniture', 6),
  ('00000000-0000-0000-0000-000000000001', 'Glass & Aluminum', 'Windows, partitions, railings', 7),
  ('00000000-0000-0000-0000-000000000001', 'Hardware', 'Locks, handles, hinges', 8),
  ('00000000-0000-0000-0000-000000000001', 'Waterproofing', 'Waterproofing materials and solutions', 9),
  ('00000000-0000-0000-0000-000000000001', 'Finishing', 'All finishing materials', 10)
ON CONFLICT DO NOTHING;