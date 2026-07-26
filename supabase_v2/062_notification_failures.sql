-- ============================================================
-- Migration: 062 — Notification Failures View
-- SBBT CRM v2 — Database Architecture
--
-- Creates a view for monitoring failed notifications.
-- ============================================================

-- View: Recent notification failures
CREATE OR REPLACE VIEW notification_failures AS
SELECT
  id,
  notification_id,
  channel,
  provider,
  recipient,
  subject,
  error_message,
  created_at
FROM notification_logs
WHERE status = 'failed'
  AND deleted_at IS NULL
ORDER BY created_at DESC;