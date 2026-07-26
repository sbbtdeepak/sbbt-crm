-- ============================================================
-- Extension: Required PostgreSQL extensions
-- SBBT CRM v2 — Database Architecture
--
-- Enables:
--   - pgcrypto: gen_random_uuid(), crypt(), gen_salt()
--   - pg_trgm: Trigram-based text search (future use)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;