-- ============================================================
-- Migration: 034 — Drop Old Package Tables (Reset)
-- SBBT CRM v2
--
-- SAFETY: Only drops tables if they exist.
-- Does NOT touch any other module's tables.
-- ============================================================

-- Drop old package-related tables (IF EXISTS for safety)
DROP TABLE IF EXISTS cms_package_gallery CASCADE;
DROP TABLE IF EXISTS cms_package_features CASCADE;
DROP TABLE IF EXISTS cms_package_specifications CASCADE;

-- Drop the old V2 tables (will be recreated in 035)
DROP TABLE IF EXISTS cms_package_items CASCADE;
DROP TABLE IF EXISTS cms_package_sections CASCADE;
DROP TABLE IF EXISTS cms_packages CASCADE;

-- Remove old columns from projects if they exist
ALTER TABLE cms_projects DROP COLUMN IF EXISTS package_id;