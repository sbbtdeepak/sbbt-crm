-- ============================================================
-- Migration: 053 — Estimate Items
-- SBBT CRM v2 — Database Architecture
--
-- Line items for an estimate: package specs, add-ons, master data items.
-- ============================================================

CREATE TABLE IF NOT EXISTS estimate_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  estimate_id BIGINT NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,

  item_source TEXT NOT NULL DEFAULT 'RATE_MASTER' CHECK (item_source IN ('RATE_MASTER', 'PACKAGE_SPEC', 'ADD_ON', 'CUSTOM')),
  item_id BIGINT,

  item_name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '',

  quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '',

  rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  material_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  labour_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  wastage_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  contractor_margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  customer_margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  gst_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,

  amount NUMERIC(14, 2) NOT NULL DEFAULT 0,

  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_estimate_items_site_id ON estimate_items(site_id);
CREATE INDEX IF NOT EXISTS idx_estimate_items_estimate_id ON estimate_items(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_items_item_source ON estimate_items(item_source);
CREATE INDEX IF NOT EXISTS idx_estimate_items_item_id ON estimate_items(item_id);
CREATE INDEX IF NOT EXISTS idx_estimate_items_sort_order ON estimate_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_estimate_items_deleted_at ON estimate_items(deleted_at);

ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estimate_items_select_authenticated" ON estimate_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "estimate_items_insert_authenticated" ON estimate_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "estimate_items_update_authenticated" ON estimate_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "estimate_items_delete_authenticated" ON estimate_items FOR DELETE TO authenticated USING (true);