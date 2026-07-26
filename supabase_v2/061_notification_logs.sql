-- ============================================================
-- Migration: 061 — Notification Logs
-- SBBT CRM v2 — Database Architecture
--
-- Audit trail for every notification delivery attempt.
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,

  notification_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  provider TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',

  recipient TEXT NOT NULL,

  subject TEXT,
  body TEXT,

  status TEXT NOT NULL DEFAULT 'pending',
  message_id TEXT,
  error_message TEXT,

  lead_id BIGINT REFERENCES contact_leads(id) ON DELETE SET NULL,
  lead_number TEXT NOT NULL DEFAULT '',

  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_channel ON notification_logs(channel);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_lead_id ON notification_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_site_id ON notification_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_notification_id ON notification_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_deleted_at ON notification_logs(deleted_at);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_logs_select_authenticated" ON notification_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "notification_logs_insert_authenticated" ON notification_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notification_logs_update_authenticated" ON notification_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "notification_logs_delete_authenticated" ON notification_logs FOR DELETE TO authenticated USING (true);