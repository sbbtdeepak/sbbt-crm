-- ============================================================
-- Migration: 026 — Master Data: Construction Activities
-- SBBT CRM v2 — Database Architecture
-- ============================================================

CREATE TABLE IF NOT EXISTS construction_activities (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  material_category_id BIGINT REFERENCES material_categories(id) ON DELETE SET NULL,
  unit_id BIGINT REFERENCES units(id) ON DELETE SET NULL,

  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,

  version INTEGER NOT NULL DEFAULT 1,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_con_activities_site ON construction_activities(site_id);
CREATE INDEX IF NOT EXISTS idx_con_activities_active ON construction_activities(is_active);
CREATE INDEX IF NOT EXISTS idx_con_activities_category ON construction_activities(material_category_id);
CREATE INDEX IF NOT EXISTS idx_con_activities_deleted_at ON construction_activities(deleted_at);

ALTER TABLE construction_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "con_activities_select_auth" ON construction_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "con_activities_insert_auth" ON construction_activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "con_activities_update_auth" ON construction_activities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "con_activities_delete_auth" ON construction_activities FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trigger_con_activities_updated_at
  BEFORE UPDATE ON construction_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();