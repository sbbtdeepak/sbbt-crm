-- ============================================================
-- Migration: 002 — Users / Profiles
-- SBBT CRM v2 — Database Architecture
--
-- Extends auth.users with a profile table for CRM-specific
-- user data (display name, avatar, role, etc.).
--
-- This is the ONLY table that references auth.users directly.
-- All other tables reference this profiles table via created_by.
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'customer')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_site_id ON profiles(site_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_authenticated" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_authenticated" ON profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "profiles_update_authenticated" ON profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "profiles_delete_authenticated" ON profiles FOR DELETE TO authenticated USING (true);

-- Triggers
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, site_id, display_name, role)
  VALUES (
    NEW.id,
    '00000000-0000-0000-0000-000000000001',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE WHEN NEW.raw_user_meta_data->>'role' IS NOT NULL THEN NEW.raw_user_meta_data->>'role' ELSE 'staff' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();