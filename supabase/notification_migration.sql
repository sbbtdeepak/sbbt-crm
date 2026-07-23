-- ============================================================
-- Notification Hub Migration (Sprint 8)
-- SBBT CRM Next.js Project
--
-- Adds notification infrastructure:
--   - notification_logs: Audit trail for all sent notifications
--   - admin_notifications: In-app notifications for admin dashboard
--
-- Design:
--   - notification_logs tracks every notification delivery attempt
--   - admin_notifications stores in-app notifications for admin users
--   - RLS enabled with authenticated-only access
--   - Indexes on status, channel, created_at, is_read
--   - Additive migration — no destructive changes
--
-- Migration: 003_notification_hub
-- Date: 2026-07-23
-- ============================================================

-- ============================================================
-- UP MIGRATION
-- ============================================================

-- ------------------------------------------------------------
-- Table: notification_logs
-- Purpose: Audit trail for every notification delivery attempt
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notification_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

  -- Notification context
  notification_id TEXT NOT NULL,       -- UUID from NotificationPayload
  channel TEXT NOT NULL,               -- email, whatsapp, admin, google_sheets, webhook
  provider TEXT NOT NULL,              -- Provider name (e.g. "resend", "admin_db", "google_sheets")
  priority TEXT NOT NULL DEFAULT 'normal',  -- low, normal, high, urgent

  -- Recipient info
  recipient TEXT NOT NULL,             -- email address, phone number, user ID

  -- Content
  subject TEXT,
  body TEXT,

  -- Delivery result
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, sent, failed
  message_id TEXT,                     -- Provider's message ID
  error_message TEXT,                  -- Error message if failed

  -- Lead reference (for tracking)
  lead_id BIGINT,
  lead_number TEXT,

  -- Metadata (JSONB for provider-specific data)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: admin_notifications
-- Purpose: In-app notifications for admin dashboard
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS admin_notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

  -- Notification content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',    -- info, success, warning, error
  link TEXT,                            -- Optional link to related page

  -- Read status
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Lead reference (for tracking)
  lead_id BIGINT,
  lead_number TEXT,

  -- Target user (null = broadcast to all admins)
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Indexes for notification_logs
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_channel ON notification_logs(channel);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_lead_id ON notification_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_site_id ON notification_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_notification_id ON notification_logs(notification_id);

-- ------------------------------------------------------------
-- Indexes for admin_notifications
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_target_user ON admin_notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_lead_id ON admin_notifications(lead_id);

-- ------------------------------------------------------------
-- RLS Policies for notification_logs
-- ------------------------------------------------------------

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read notification logs (admin dashboard)
CREATE POLICY "notification_logs_select_authenticated"
  ON notification_logs FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert notification logs (from server actions)
CREATE POLICY "notification_logs_insert_authenticated"
  ON notification_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update notification logs (e.g. status updates)
CREATE POLICY "notification_logs_update_authenticated"
  ON notification_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------
-- RLS Policies for admin_notifications
-- ------------------------------------------------------------

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Authenticated users can see their own notifications or broadcast notifications
CREATE POLICY "admin_notifications_select_authenticated"
  ON admin_notifications FOR SELECT
  TO authenticated
  USING (
    target_user_id IS NULL
    OR target_user_id = auth.uid()
  );

-- Authenticated users can insert admin notifications
CREATE POLICY "admin_notifications_insert_authenticated"
  ON admin_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update admin notifications (mark as read)
CREATE POLICY "admin_notifications_update_authenticated"
  ON admin_notifications FOR UPDATE
  TO authenticated
  USING (
    target_user_id IS NULL
    OR target_user_id = auth.uid()
  )
  WITH CHECK (
    target_user_id IS NULL
    OR target_user_id = auth.uid()
  );

-- ============================================================
-- Helpful Views
-- ============================================================

-- Recent notification failures (for monitoring)
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
ORDER BY created_at DESC;

-- Unread admin notification count (for badge)
CREATE OR REPLACE VIEW admin_notification_unread_count AS
SELECT
  COUNT(*) AS unread_count
FROM admin_notifications
WHERE
  is_read = false
  AND (target_user_id IS NULL OR target_user_id = auth.uid());

-- ============================================================
-- ROLLBACK (Run in reverse order to undo this migration)
-- ============================================================
/*
  -- Drop views
  DROP VIEW IF EXISTS notification_failures;
  DROP VIEW IF EXISTS admin_notification_unread_count;

  -- Drop policies for notification_logs
  DROP POLICY IF EXISTS "notification_logs_select_authenticated" ON notification_logs;
  DROP POLICY IF EXISTS "notification_logs_insert_authenticated" ON notification_logs;
  DROP POLICY IF EXISTS "notification_logs_update_authenticated" ON notification_logs;

  -- Drop policies for admin_notifications
  DROP POLICY IF EXISTS "admin_notifications_select_authenticated" ON admin_notifications;
  DROP POLICY IF EXISTS "admin_notifications_insert_authenticated" ON admin_notifications;
  DROP POLICY IF EXISTS "admin_notifications_update_authenticated" ON admin_notifications;

  -- Drop indexes for notification_logs
  DROP INDEX IF EXISTS idx_notification_logs_status;
  DROP INDEX IF EXISTS idx_notification_logs_channel;
  DROP INDEX IF EXISTS idx_notification_logs_created_at;
  DROP INDEX IF EXISTS idx_notification_logs_lead_id;
  DROP INDEX IF EXISTS idx_notification_logs_site_id;
  DROP INDEX IF EXISTS idx_notification_logs_notification_id;

  -- Drop indexes for admin_notifications
  DROP INDEX IF EXISTS idx_admin_notifications_is_read;
  DROP INDEX IF EXISTS idx_admin_notifications_created_at;
  DROP INDEX IF EXISTS idx_admin_notifications_target_user;
  DROP INDEX IF EXISTS idx_admin_notifications_type;
  DROP INDEX IF EXISTS idx_admin_notifications_lead_id;

  -- Drop tables
  DROP TABLE IF EXISTS notification_logs;
  DROP TABLE IF EXISTS admin_notifications;

  -- Disable RLS (optional, for cleanup)
  ALTER TABLE notification_logs DISABLE ROW LEVEL SECURITY;
  ALTER TABLE admin_notifications DISABLE ROW LEVEL SECURITY;
*/