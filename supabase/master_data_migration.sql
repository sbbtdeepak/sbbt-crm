-- ============================================================
-- Master Data Management Migration (Sprint 9)
-- SBBT CRM Next.js Project
--
-- Creates the master data layer that powers the entire ERP.
-- All tables follow CMS conventions:
--   - BIGINT IDENTITY primary keys
--   - site_id for multi-tenant
--   - created_by / updated_by audit fields
--   - version, effective_from, effective_to for versioning
--   - RLS enabled
--   - Additive (no existing tables modified)
--
-- Migration: 004_master_data
-- Date: 2026-07-23
-- ============================================================

-- ============================================================
-- UP MIGRATION
-- ============================================================

-- ------------------------------------------------------------
-- 1. Material Categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS material_categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_mat_categories_site ON material_categories(site_id);
CREATE INDEX IF NOT EXISTS idx_mat_categories_active ON material_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_mat_categories_order ON material_categories(display_order);

ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mat_categories_select_auth" ON material_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "mat_categories_insert_auth" ON material_categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "mat_categories_update_auth" ON material_categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "mat_categories_delete_auth" ON material_categories FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 2. Brands
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brands (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  material_category_id BIGINT REFERENCES material_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_brands_site ON brands(site_id);
CREATE INDEX IF NOT EXISTS idx_brands_category ON brands(material_category_id);
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands_select_auth" ON brands FOR SELECT TO authenticated USING (true);
CREATE POLICY "brands_insert_auth" ON brands FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "brands_update_auth" ON brands FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "brands_delete_auth" ON brands FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 3. Pricing Regions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pricing_regions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  region_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  base_rate_per_sqft NUMERIC(12, 2) NOT NULL DEFAULT 0,
  labour_rate_per_sqft NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pricing_regions_site ON pricing_regions(site_id);
CREATE INDEX IF NOT EXISTS idx_pricing_regions_active ON pricing_regions(is_active);

ALTER TABLE pricing_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pricing_regions_select_auth" ON pricing_regions FOR SELECT TO authenticated USING (true);
CREATE POLICY "pricing_regions_insert_auth" ON pricing_regions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "pricing_regions_update_auth" ON pricing_regions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "pricing_regions_delete_auth" ON pricing_regions FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 4. Units
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS units (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  short_name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  conversion_factor NUMERIC(12, 4) NOT NULL DEFAULT 1.0000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_units_site ON units(site_id);
CREATE INDEX IF NOT EXISTS idx_units_active ON units(is_active);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "units_select_auth" ON units FOR SELECT TO authenticated USING (true);
CREATE POLICY "units_insert_auth" ON units FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "units_update_auth" ON units FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "units_delete_auth" ON units FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 5. Vendors
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendors (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  contact_person TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  gst TEXT NOT NULL DEFAULT '',
  payment_terms TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_vendors_site ON vendors(site_id);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendors_select_auth" ON vendors FOR SELECT TO authenticated USING (true);
CREATE POLICY "vendors_insert_auth" ON vendors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vendors_update_auth" ON vendors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "vendors_delete_auth" ON vendors FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 6. Tax Master
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tax_master (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'gst',
  hsn_sac_code TEXT NOT NULL DEFAULT '',
  applicable_on TEXT NOT NULL DEFAULT 'both',
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tax_master_site ON tax_master(site_id);
CREATE INDEX IF NOT EXISTS idx_tax_master_active ON tax_master(is_active);
CREATE INDEX IF NOT EXISTS idx_tax_master_type ON tax_master(type);

ALTER TABLE tax_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tax_master_select_auth" ON tax_master FOR SELECT TO authenticated USING (true);
CREATE POLICY "tax_master_insert_auth" ON tax_master FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tax_master_update_auth" ON tax_master FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tax_master_delete_auth" ON tax_master FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 7. Construction Activities
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS construction_activities (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  material_category_id BIGINT REFERENCES material_categories(id) ON DELETE SET NULL,
  unit_id BIGINT REFERENCES units(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_con_activities_site ON construction_activities(site_id);
CREATE INDEX IF NOT EXISTS idx_con_activities_active ON construction_activities(is_active);
CREATE INDEX IF NOT EXISTS idx_con_activities_category ON construction_activities(material_category_id);

ALTER TABLE construction_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "con_activities_select_auth" ON construction_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "con_activities_insert_auth" ON construction_activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "con_activities_update_auth" ON construction_activities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "con_activities_delete_auth" ON construction_activities FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 8. Add-ons
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS add_ons (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  unit_type TEXT NOT NULL DEFAULT 'flat',
  material_category_id BIGINT REFERENCES material_categories(id) ON DELETE SET NULL,
  unit_id BIGINT REFERENCES units(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_add_ons_site ON add_ons(site_id);
CREATE INDEX IF NOT EXISTS idx_add_ons_active ON add_ons(is_active);
CREATE INDEX IF NOT EXISTS idx_add_ons_category ON add_ons(material_category_id);

ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "add_ons_select_auth" ON add_ons FOR SELECT TO authenticated USING (true);
CREATE POLICY "add_ons_insert_auth" ON add_ons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "add_ons_update_auth" ON add_ons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "add_ons_delete_auth" ON add_ons FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 9. Rate Master (THE CENTRAL TABLE)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rate_master (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

  -- Core references
  material_category_id BIGINT REFERENCES material_categories(id) ON DELETE SET NULL,
  brand_id BIGINT REFERENCES brands(id) ON DELETE SET NULL,
  unit_id BIGINT REFERENCES units(id) ON DELETE SET NULL,
  vendor_id BIGINT REFERENCES vendors(id) ON DELETE SET NULL,
  pricing_region_id BIGINT REFERENCES pricing_regions(id) ON DELETE SET NULL,

  -- Item details
  item_name TEXT NOT NULL,
  hsn_code TEXT NOT NULL DEFAULT '',

  -- Financial rates
  material_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  labour_rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  wastage_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  contractor_margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  customer_margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  gst_percent NUMERIC(5, 2) NOT NULL DEFAULT 18,
  currency TEXT NOT NULL DEFAULT 'INR',

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_master_site ON rate_master(site_id);
CREATE INDEX IF NOT EXISTS idx_rate_master_active ON rate_master(is_active);
CREATE INDEX IF NOT EXISTS idx_rate_master_category ON rate_master(material_category_id);
CREATE INDEX IF NOT EXISTS idx_rate_master_brand ON rate_master(brand_id);
CREATE INDEX IF NOT EXISTS idx_rate_master_region ON rate_master(pricing_region_id);
CREATE INDEX IF NOT EXISTS idx_rate_master_vendor ON rate_master(vendor_id);
CREATE INDEX IF NOT EXISTS idx_rate_master_item ON rate_master(item_name);

ALTER TABLE rate_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_master_select_auth" ON rate_master FOR SELECT TO authenticated USING (true);
CREATE POLICY "rate_master_insert_auth" ON rate_master FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rate_master_update_auth" ON rate_master FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rate_master_delete_auth" ON rate_master FOR DELETE TO authenticated USING (true);

-- ------------------------------------------------------------
-- 10. Extend cms_packages with target_segment
-- ------------------------------------------------------------
ALTER TABLE cms_packages
  ADD COLUMN IF NOT EXISTS target_segment TEXT NOT NULL DEFAULT 'standard';

CREATE INDEX IF NOT EXISTS idx_cms_packages_segment ON cms_packages(target_segment);

-- ------------------------------------------------------------
-- 11. Extend cms_package_specifications with rate_master link
-- ------------------------------------------------------------
ALTER TABLE cms_package_specifications
  ADD COLUMN IF NOT EXISTS rate_master_id BIGINT REFERENCES rate_master(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cms_pkg_specs_rate_master ON cms_package_specifications(rate_master_id);

-- ------------------------------------------------------------
-- Seed Data: Default Units
-- ------------------------------------------------------------
INSERT INTO units (site_id, name, short_name, category, conversion_factor) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Square Feet', 'sqft', 'area', 1.0000),
  ('00000000-0000-0000-0000-000000000001', 'Square Meter', 'sqm', 'area', 10.7639),
  ('00000000-0000-0000-0000-000000000001', 'Number', 'nos', 'count', 1.0000),
  ('00000000-0000-0000-0000-000000000001', 'Meter', 'm', 'length', 3.2808),
  ('00000000-0000-0000-0000-000000000001', 'Kilogram', 'kg', 'weight', 1.0000),
  ('00000000-0000-0000-0000-000000000001', 'Liter', 'L', 'volume', 1.0000),
  ('00000000-0000-0000-0000-000000000001', 'Cubic Feet', 'cft', 'volume', 1.0000),
  ('00000000-0000-0000-0000-000000000001', 'Bag', 'bag', 'count', 1.0000)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Seed Data: Default Tax Rates
-- ------------------------------------------------------------
INSERT INTO tax_master (site_id, name, rate, type, hsn_sac_code, applicable_on) VALUES
  ('00000000-0000-0000-0000-000000000001', 'GST 0%', 0, 'gst', '', 'both'),
  ('00000000-0000-0000-0000-000000000001', 'GST 5%', 5, 'gst', '', 'both'),
  ('00000000-0000-0000-0000-000000000001', 'GST 12%', 12, 'gst', '', 'both'),
  ('00000000-0000-0000-0000-000000000001', 'GST 18%', 18, 'gst', '', 'both'),
  ('00000000-0000-0000-0000-000000000001', 'GST 28%', 28, 'gst', '', 'both')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Seed Data: Default Material Categories
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- Seed Data: Default Pricing Region
-- ------------------------------------------------------------
INSERT INTO pricing_regions (site_id, region_name, city, state, base_rate_per_sqft, labour_rate_per_sqft) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Delhi NCR', 'Delhi', 'Delhi', 0, 0)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROLLBACK (Run in reverse order to undo this migration)
-- ============================================================
/*
  -- Drop extended columns
  ALTER TABLE cms_package_specifications DROP COLUMN IF EXISTS rate_master_id;
  ALTER TABLE cms_packages DROP COLUMN IF EXISTS target_segment;

  -- Drop tables (in dependency order)
  DROP TABLE IF EXISTS rate_master CASCADE;
  DROP TABLE IF EXISTS add_ons CASCADE;
  DROP TABLE IF EXISTS construction_activities CASCADE;
  DROP TABLE IF EXISTS tax_master CASCADE;
  DROP TABLE IF EXISTS vendors CASCADE;
  DROP TABLE IF EXISTS units CASCADE;
  DROP TABLE IF EXISTS pricing_regions CASCADE;
  DROP TABLE IF EXISTS brands CASCADE;
  DROP TABLE IF EXISTS material_categories CASCADE;

  -- Drop indexes
  DROP INDEX IF EXISTS idx_rate_master_site;
  DROP INDEX IF EXISTS idx_rate_master_active;
  DROP INDEX IF EXISTS idx_rate_master_category;
  DROP INDEX IF EXISTS idx_rate_master_brand;
  DROP INDEX IF EXISTS idx_rate_master_region;
  DROP INDEX IF EXISTS idx_rate_master_vendor;
  DROP INDEX IF EXISTS idx_rate_master_item;
  DROP INDEX IF EXISTS idx_add_ons_site;
  DROP INDEX IF EXISTS idx_add_ons_active;
  DROP INDEX IF EXISTS idx_add_ons_category;
  DROP INDEX IF EXISTS idx_con_activities_site;
  DROP INDEX IF EXISTS idx_con_activities_active;
  DROP INDEX IF EXISTS idx_con_activities_category;
  DROP INDEX IF EXISTS idx_tax_master_site;
  DROP INDEX IF EXISTS idx_tax_master_active;
  DROP INDEX IF EXISTS idx_tax_master_type;
  DROP INDEX IF EXISTS idx_vendors_site;
  DROP INDEX IF EXISTS idx_vendors_active;
  DROP INDEX IF EXISTS idx_units_site;
  DROP INDEX IF EXISTS idx_units_active;
  DROP INDEX IF EXISTS idx_pricing_regions_site;
  DROP INDEX IF EXISTS idx_pricing_regions_active;
  DROP INDEX IF EXISTS idx_brands_site;
  DROP INDEX IF EXISTS idx_brands_category;
  DROP INDEX IF EXISTS idx_brands_active;
  DROP INDEX IF EXISTS idx_mat_categories_site;
  DROP INDEX IF EXISTS idx_mat_categories_active;
  DROP INDEX IF EXISTS idx_mat_categories_order;
  DROP INDEX IF EXISTS idx_cms_packages_segment;
  DROP INDEX IF EXISTS idx_cms_pkg_specs_rate_master;
*/