-- ============================================================
-- Migration: 060 — Notifications
-- SBBT CRM v2 — Database Architecture
--
-- In-app notifications for admin dashboard.
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_notifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),

  link TEXT NOT NULL DEFAULT '',

  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,

  lead_id BIGINT REFERENCES contact_leads(id) ON DELETE SET NULL,
  lead_number TEXT NOT NULL DEFAULT '',

  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_target_user ON admin_notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_lead_id ON admin_notifications(lead_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_deleted_at ON admin_notifications(deleted_at);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_notifications_select_authenticated" ON admin_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_notifications_insert_authenticated" ON admin_notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin_notifications_update_authenticated" ON admin_notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_notifications_delete_authenticated" ON admin_notifications FOR DELETE TO authenticated USING (true);

-- View: Unread notification count
CREATE OR REPLACE VIEW admin_notification_unread_count AS
SELECT
  COUNT(*) AS unread_count
FROM admin_notifications
WHERE
  is_read = false
  AND deleted_at IS NULL
  AND (target_user_id IS NULL OR target_user_id = auth.uid());