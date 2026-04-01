-- ═══════════════════════════════════════════════════════════════
-- CHATHURYA SDC — SUPABASE DATABASE SCHEMA
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension (already enabled on Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── MEMBERS ───────────────────────────────────────────────────
CREATE TABLE members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid           VARCHAR(8) UNIQUE NOT NULL, -- NFC short code e.g. 'xK9mP2'
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'Member' 
                  CHECK (role IN ('Lead', 'Core', 'Member', 'Alumni')),
  batch_year    INTEGER,
  invite_token  TEXT UNIQUE,               -- Set when invite is sent, cleared after signup
  invited_by    UUID REFERENCES members(id),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast NFC lookup
CREATE INDEX idx_members_uid ON members(uid);
CREATE INDEX idx_members_email ON members(email);

-- ─── PROFILES ──────────────────────────────────────────────────
CREATE TABLE profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  bio                 TEXT,
  github_url          TEXT,
  linkedin_url        TEXT,
  portfolio_url       TEXT,
  avatar_url          TEXT,                -- Supabase Storage path
  visibility_mode     TEXT NOT NULL DEFAULT 'public'
                        CHECK (visibility_mode IN ('public', 'networking', 'ghost')),
  archetype_primary   TEXT,
  archetype_secondary TEXT,
  skills_raw          TEXT[] DEFAULT '{}', -- Self-reported skills
  xp_total            INTEGER NOT NULL DEFAULT 0,
  streak_count        INTEGER NOT NULL DEFAULT 0,
  streak_last_date    DATE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id)
);

-- ─── WORKSHOPS ─────────────────────────────────────────────────
CREATE TABLE workshops (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  description       TEXT,
  workshop_date     DATE NOT NULL,
  location          TEXT,
  lead_id           UUID REFERENCES members(id),
  required_skills   TEXT[] DEFAULT '{}',  -- Prereq skills from skill tree
  xp_reward         INTEGER NOT NULL DEFAULT 100,
  late_xp_reward    INTEGER NOT NULL DEFAULT 50,
  max_attendees     INTEGER,
  resources_url     TEXT,                 -- Exclusive resource link (member-only)
  is_published      BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ATTENDANCE ────────────────────────────────────────────────
CREATE TABLE attendance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  workshop_id     UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  checked_in_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_late         BOOLEAN NOT NULL DEFAULT false,
  xp_earned       INTEGER NOT NULL DEFAULT 0,
  UNIQUE (member_id, workshop_id)
);

CREATE INDEX idx_attendance_member ON attendance(member_id);
CREATE INDEX idx_attendance_workshop ON attendance(workshop_id);

-- ─── BADGES ────────────────────────────────────────────────────
CREATE TABLE badges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  badge_type    TEXT NOT NULL,            -- e.g. 'workshop_warrior'
  badge_name    TEXT NOT NULL,            -- Display name
  category      TEXT NOT NULL DEFAULT 'workshop'
                  CHECK (category IN ('workshop', 'building', 'community', 'networking', 'special', 'secret')),
  is_secret     BOOLEAN NOT NULL DEFAULT false,
  earned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  context       TEXT,                     -- How it was earned
  UNIQUE (member_id, badge_type)          -- One of each badge type per member
);

CREATE INDEX idx_badges_member ON badges(member_id);

-- ─── ENDORSEMENTS ──────────────────────────────────────────────
CREATE TABLE endorsements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endorser_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  endorsed_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  skill         TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (endorser_id, endorsed_id, skill), -- Can't endorse same skill twice
  CHECK (endorser_id != endorsed_id)        -- Can't endorse yourself
);

CREATE INDEX idx_endorsements_endorsed ON endorsements(endorsed_id);

-- ─── CONNECTIONS (Tap-to-Connect) ──────────────────────────────
CREATE TABLE connections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_a_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  member_b_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  connected_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_a_id, member_b_id),
  CHECK (member_a_id < member_b_id)         -- Prevent duplicates (a,b) and (b,a)
);

-- ─── INVITE TOKENS ─────────────────────────────────────────────
CREATE TABLE invite_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token         TEXT UNIQUE NOT NULL,
  email         TEXT,                     -- Pre-filled email if known
  created_by    UUID REFERENCES members(id),
  used_at       TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SITE CONFIG (Admin-controlled settings) ───────────────────
CREATE TABLE site_config (
  key           TEXT PRIMARY KEY,
  value         TEXT,
  updated_by    UUID REFERENCES members(id),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default config values
INSERT INTO site_config (key, value) VALUES
  ('nfc_redirect_override', NULL),         -- NULL = use member profiles
  ('invite_only_mode', 'true'),
  ('maintenance_mode', 'false');

-- ─── XP TRANSACTIONS (audit trail) ────────────────────────────
CREATE TABLE xp_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount        INTEGER NOT NULL,          -- Positive = earn, Negative = spend
  reason        TEXT NOT NULL,
  reference_id  UUID,                      -- workshop_id, badge_id, etc.
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_xp_member ON xp_transactions(member_id);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- Helper function: get current member's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM members WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: is current user a lead?
CREATE OR REPLACE FUNCTION is_lead()
RETURNS BOOLEAN AS $$
  SELECT role IN ('Lead', 'Core') FROM members WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ─── MEMBERS policies ──────────────────────────────────────────
-- Members can see all members (for leaderboard, profiles)
CREATE POLICY "Members can view all members"
  ON members FOR SELECT
  TO authenticated
  USING (true);

-- Members can only update their own basic info
CREATE POLICY "Members update own row"
  ON members FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Leads can update any member
CREATE POLICY "Leads can update all members"
  ON members FOR UPDATE
  TO authenticated
  USING (is_lead());

-- NFC profile pages are public (for /u/[uid] route)
CREATE POLICY "NFC profiles are publicly viewable"
  ON members FOR SELECT
  TO anon
  USING (is_active = true);

-- ─── PROFILES policies ─────────────────────────────────────────
-- Public profiles visible to all (anon for NFC tap)
CREATE POLICY "Public profiles viewable by all"
  ON profiles FOR SELECT
  TO anon
  USING (visibility_mode = 'public');

-- Authenticated members can see all profiles
CREATE POLICY "Members can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Members can only update their own profile
CREATE POLICY "Members update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Members insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = member_id);

-- ─── WORKSHOPS policies ────────────────────────────────────────
CREATE POLICY "Published workshops visible to all members"
  ON workshops FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Leads manage workshops"
  ON workshops FOR ALL
  TO authenticated
  USING (is_lead());

-- ─── ATTENDANCE policies ───────────────────────────────────────
CREATE POLICY "Members view own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (auth.uid() = member_id);

CREATE POLICY "Leads view all attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (is_lead());

-- Attendance is inserted via edge function (service_role)
-- Members cannot insert their own attendance directly

-- ─── BADGES policies ───────────────────────────────────────────
CREATE POLICY "Members view own badges"
  ON badges FOR SELECT
  TO authenticated
  USING (auth.uid() = member_id);

-- Public non-secret badges visible on profile
CREATE POLICY "Non-secret badges visible on profiles"
  ON badges FOR SELECT
  TO anon
  USING (is_secret = false);

-- ─── ENDORSEMENTS policies ─────────────────────────────────────
CREATE POLICY "Endorsements visible to authenticated members"
  ON endorsements FOR SELECT
  TO authenticated
  USING (true);

-- Anon can see endorsements for public profiles
CREATE POLICY "Endorsements publicly visible"
  ON endorsements FOR SELECT
  TO anon
  USING (true);

-- Members can endorse others
CREATE POLICY "Members can create endorsements"
  ON endorsements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = endorser_id);

-- ─── SITE CONFIG policies ──────────────────────────────────────
-- Anyone can read (needed for NFC redirect check)
CREATE POLICY "Site config publicly readable"
  ON site_config FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Site config readable by members"
  ON site_config FOR SELECT
  TO authenticated
  USING (true);

-- Only leads can modify config
CREATE POLICY "Leads can modify site config"
  ON site_config FOR ALL
  TO authenticated
  USING (is_lead());

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Award XP and update total on xp_transactions insert
CREATE OR REPLACE FUNCTION apply_xp_transaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET xp_total = xp_total + NEW.amount
  WHERE member_id = NEW.member_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER xp_transaction_apply
  AFTER INSERT ON xp_transactions
  FOR EACH ROW EXECUTE FUNCTION apply_xp_transaction();

-- Auto-create profile when member is created
CREATE OR REPLACE FUNCTION create_member_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (member_id)
  VALUES (NEW.id)
  ON CONFLICT (member_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER member_create_profile
  AFTER INSERT ON members
  FOR EACH ROW EXECUTE FUNCTION create_member_profile();

-- ═══════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- Run these in Supabase Dashboard → Storage
-- ═══════════════════════════════════════════════════════════════
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('avatars', 'avatars', true),
--   ('workshop-resources', 'workshop-resources', false),
--   ('gallery', 'gallery', true);
