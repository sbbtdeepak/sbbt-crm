-- ============================================================
-- Migration: 090 — CMS: Webhook Settings (Additive)
-- SBBT CRM v2 — Database Architecture
--
-- Adds webhook_enabled and webhook_secret to cms_internal_settings.
-- Additive only. Backward compatible.
-- ============================================================

ALTER TABLE cms_internal_settings
  ADD COLUMN IF NOT EXISTS webhook_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS webhook_secret TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_cms_internal_settings_webhook_enabled ON cms_internal_settings(webhook_enabled);