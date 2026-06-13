// ── Database Row Types ────────────────────────────────────────────────────────
// Cocok 1:1 dengan tabel Supabase

export interface DbProfile {
    id:         string
    email:      string
    full_name:  string | null
    avatar_url: string | null
    theme:      'dark' | 'light'
    created_at: string
    updated_at: string
  }
  
  export interface DbTask {
    id:                string
    user_id:           string
    title:             string
    priority:          'high' | 'med' | 'low'
    done:              boolean
    time:              string | null
    tag:               string
    date:              string
    recurring_freq:    'daily' | 'weekly' | 'weekday' | 'weekend' | null
    recurring_label:   string | null
    reminder_enabled:  boolean
    reminder_type:     'smart' | 'fixed'
    reminder_minutes:  number
    reminder_note:     string
    created_at:        string
    updated_at:        string
  }
  
  export interface DbSubtask {
    id:         string
    task_id:    string
    user_id:    string
    text:       string
    done:       boolean
    position:   number
    created_at: string
  }
  
  export interface DbHabit {
    id:           string
    user_id:      string
    title:        string
    icon:         string
    color:        string
    time:         string
    pinned:       boolean
    streak:       number
    freezes_left: number
    archived:     boolean
    created_at:   string
    updated_at:   string
  }
  
  export interface DbHabitLog {
    id:         string
    habit_id:   string
    user_id:    string
    log_date:   string
    done:       boolean
    note:       string
    created_at: string
  }
  
  export interface DbPlannerEvent {
    id:         string
    user_id:    string
    title:      string
    date:       string
    start_min:  number
    end_min:    number
    color:      string
    type:       'event' | 'task' | 'habit'
    task_id:    string | null
    habit_id:   string | null
    created_at: string
    updated_at: string
  }
  
  // ── App-level Types (dipakai di UI/store) ────────────────────────────────────
  
  export interface Subtask {
    id:       string
    task_id:  string
    text:     string
    done:     boolean
    position: number
  }
  
  export interface Task extends DbTask {
    subtasks: Subtask[]
  }
  
  export interface HabitLog {
    log_date: string
    done:     boolean
    note:     string
  }
  
  export interface Habit extends DbHabit {
    logs: HabitLog[]   // logs terakhir 35 hari, di-fetch sekaligus
  }
  
  export interface PlannerEvent extends DbPlannerEvent {}
  
  export type Priority   = 'high' | 'med' | 'low'
  export type RecurFreq  = 'daily' | 'weekly' | 'weekday' | 'weekend'
  export type ReminderType = 'smart' | 'fixed'
  export type EventType  = 'event' | 'task' | 'habit'
  export type Theme      = 'dark' | 'light'
  export type TabId      = 'home' | 'planner' | 'habits' | 'stats'
  
  // ── Database type wrapper (untuk Supabase createClient<Database>) ─────────────
  export type Database = {
    public: {
      Tables: {
        profiles:       { Row: DbProfile;       Insert: Partial<DbProfile>;       Update: Partial<DbProfile> }
        tasks:          { Row: DbTask;          Insert: Partial<DbTask>;          Update: Partial<DbTask> }
        subtasks:       { Row: DbSubtask;       Insert: Partial<DbSubtask>;       Update: Partial<DbSubtask> }
        habits:         { Row: DbHabit;         Insert: Partial<DbHabit>;         Update: Partial<DbHabit> }
        habit_logs:     { Row: DbHabitLog;      Insert: Partial<DbHabitLog>;      Update: Partial<DbHabitLog> }
        planner_events: { Row: DbPlannerEvent;  Insert: Partial<DbPlannerEvent>;  Update: Partial<DbPlannerEvent> }
      }
    }
  }