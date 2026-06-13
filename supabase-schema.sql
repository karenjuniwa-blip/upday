-- ============================================================
-- UPDAY — Supabase Database Schema
-- Jalankan file ini di Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ────────────────────────────────────────────────
-- Otomatis dibuat saat user register via Supabase Auth
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  theme       TEXT DEFAULT 'dark' CHECK (theme IN ('dark','light')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── TASKS ───────────────────────────────────────────────────
CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  priority        TEXT DEFAULT 'med' CHECK (priority IN ('high','med','low')),
  done            BOOLEAN DEFAULT FALSE,
  time            TEXT,                        -- "09:00"
  tag             TEXT DEFAULT 'Personal',
  date            DATE DEFAULT CURRENT_DATE,
  -- Recurring
  recurring_freq  TEXT CHECK (recurring_freq IN ('daily','weekly','weekday','weekend')),
  recurring_label TEXT,
  -- Reminder
  reminder_enabled      BOOLEAN DEFAULT FALSE,
  reminder_type         TEXT DEFAULT 'fixed' CHECK (reminder_type IN ('smart','fixed')),
  reminder_minutes      INT DEFAULT 15,
  reminder_note         TEXT DEFAULT '',
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── SUBTASKS ─────────────────────────────────────────────────
CREATE TABLE subtasks (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id   UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text      TEXT NOT NULL,
  done      BOOLEAN DEFAULT FALSE,
  position  INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── HABITS ──────────────────────────────────────────────────
CREATE TABLE habits (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  icon          TEXT DEFAULT '🎯',
  color         TEXT DEFAULT '#7C6FCD',
  time          TEXT DEFAULT '08:00',
  pinned        BOOLEAN DEFAULT FALSE,
  streak        INT DEFAULT 0,
  freezes_left  INT DEFAULT 1,
  archived      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── HABIT LOGS ───────────────────────────────────────────────
-- Satu baris per habit per hari
CREATE TABLE habit_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id   UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  done       BOOLEAN DEFAULT FALSE,
  note       TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, log_date)               -- satu log per habit per hari
);

-- ── PLANNER EVENTS ───────────────────────────────────────────
CREATE TABLE planner_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  start_min   INT NOT NULL,               -- menit dari tengah malam, misal 540 = 09:00
  end_min     INT NOT NULL,               -- misal 600 = 10:00
  color       TEXT DEFAULT '#7C6FCD',
  type        TEXT DEFAULT 'event' CHECK (type IN ('event','task','habit')),
  -- Link opsional ke task atau habit
  task_id     UUID REFERENCES tasks(id) ON DELETE SET NULL,
  habit_id    UUID REFERENCES habits(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Setiap user hanya bisa akses data miliknya sendiri
-- ============================================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits         ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_events ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks
CREATE POLICY "Users manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- Subtasks
CREATE POLICY "Users manage own subtasks" ON subtasks FOR ALL USING (auth.uid() = user_id);

-- Habits
CREATE POLICY "Users manage own habits" ON habits FOR ALL USING (auth.uid() = user_id);

-- Habit Logs
CREATE POLICY "Users manage own habit_logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);

-- Planner Events
CREATE POLICY "Users manage own events" ON planner_events FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile saat user baru register
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at          BEFORE UPDATE ON tasks          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER habits_updated_at         BEFORE UPDATE ON habits         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER planner_events_updated_at BEFORE UPDATE ON planner_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at       BEFORE UPDATE ON profiles       FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- INDEXES (performa query)
-- ============================================================
CREATE INDEX idx_tasks_user_date       ON tasks(user_id, date);
CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, log_date);
CREATE INDEX idx_habit_logs_user_date  ON habit_logs(user_id, log_date);
CREATE INDEX idx_planner_events_date   ON planner_events(user_id, date);
CREATE INDEX idx_subtasks_task         ON subtasks(task_id);
