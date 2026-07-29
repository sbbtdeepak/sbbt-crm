-- ============================================================
-- VERIFICATION: Four Missing CMS Modules
-- SBBT CRM v2 — Production Schema Check
--
-- Run this ONCE in Supabase SQL Editor.
-- Paste the output exactly. Do not modify.
-- ============================================================

-- ============================================================
-- 1. Check if cms_internal_settings exists
-- ============================================================
SELECT '1. cms_internal_settings' AS check_name,
       CASE WHEN EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public'
         AND table_name = 'cms_internal_settings'
       ) THEN 'EXISTS' ELSE 'MISSING' END AS status;

-- ============================================================
-- 2. Check if cms_testimonials exists
-- ============================================================
SELECT '2. cms_testimonials' AS check_name,
       CASE WHEN EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public'
         AND table_name = 'cms_testimonials'
       ) THEN 'EXISTS' ELSE 'MISSING' END AS status;

-- ============================================================
-- 3. Check if cms_blogs exists (or similar alternative)
-- ============================================================
SELECT '3a. cms_blogs' AS check_name,
       CASE WHEN EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public'
         AND table_name = 'cms_blogs'
       ) THEN 'EXISTS' ELSE 'MISSING' END AS status;

-- Also check for any similarly named table
SELECT '3b. alternative blog tables' AS check_name,
       COALESCE(
         (SELECT string_agg(table_name, ', ')
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name LIKE '%blog%'
          AND table_name != 'cms_blogs'),
         'none found'
       ) AS found_tables;

-- ============================================================
-- 4. Check if alternate_mobile column exists in cms_company
-- ============================================================
SELECT '4. alternate_mobile in cms_company' AS check_name,
       CASE WHEN EXISTS (
         SELECT FROM information_schema.columns
         WHERE table_schema = 'public'
         AND table_name = 'cms_company'
         AND column_name = 'alternate_mobile'
       ) THEN 'EXISTS' ELSE 'MISSING' END AS status;

-- Also show all columns of cms_company for reference
SELECT '4b. cms_company columns' AS check_name,
       string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position) AS columns
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'cms_company';

-- ============================================================
-- 5. Show constraints on cms_company
-- ============================================================
SELECT '5. cms_company constraints' AS check_name,
       string_agg(constraint_name || ' (' || constraint_type || ')', ', ' ORDER BY constraint_name) AS constraints
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name = 'cms_company'
AND constraint_type IN ('FOREIGN KEY', 'PRIMARY KEY', 'UNIQUE');

-- ============================================================
-- 6. Show constraints on cms_blogs (if exists)
-- ============================================================
SELECT '6. cms_blogs constraints' AS check_name,
       CASE WHEN EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'cms_blogs'
       ) THEN
         COALESCE(
           (SELECT string_agg(constraint_name || ' (' || constraint_type || ')', ', ')
            FROM information_schema.table_constraints
            WHERE table_schema = 'public'
            AND table_name = 'cms_blogs'
            AND constraint_type IN ('FOREIGN KEY', 'PRIMARY KEY', 'UNIQUE')),
           'none found'
         )
       ELSE 'table does not exist' END AS constraints;

-- ============================================================
-- 7. Show constraints on cms_testimonials (if exists)
-- ============================================================
SELECT '7. cms_testimonials constraints' AS check_name,
       CASE WHEN EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'cms_testimonials'
       ) THEN
         COALESCE(
           (SELECT string_agg(constraint_name || ' (' || constraint_type || ')', ', ')
            FROM information_schema.table_constraints
            WHERE table_schema = 'public'
            AND table_name = 'cms_testimonials'
            AND constraint_type IN ('FOREIGN KEY', 'PRIMARY KEY', 'UNIQUE')),
           'none found'
         )
       ELSE 'table does not exist' END AS constraints;

-- ============================================================
-- 8. Show constraints on cms_internal_settings (if exists)
-- ============================================================
SELECT '8. cms_internal_settings constraints' AS check_name,
       CASE WHEN EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'cms_internal_settings'
       ) THEN
         COALESCE(
           (SELECT string_agg(constraint_name || ' (' || constraint_type || ')', ', ')
            FROM information_schema.table_constraints
            WHERE table_schema = 'public'
            AND table_name = 'cms_internal_settings'
            AND constraint_type IN ('FOREIGN KEY', 'PRIMARY KEY', 'UNIQUE')),
           'none found'
         )
       ELSE 'table does not exist' END AS constraints;

-- ============================================================
-- 9. Show all FK constraints referencing sites or profiles
--    across ALL four tables (confirms they don't exist)
-- ============================================================
SELECT '9. FK referencing sites/profiles' AS check_name,
       tc.table_name,
       tc.constraint_name,
       ccu.table_name AS referenced_table
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
  AND tc.table_schema = ccu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('cms_company', 'cms_blogs', 'cms_testimonials', 'cms_internal_settings')
  AND tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name IN ('sites', 'profiles')
ORDER BY tc.table_name, tc.constraint_name;