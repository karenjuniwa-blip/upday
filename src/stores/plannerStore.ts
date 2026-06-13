import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { todayISO, tempId } from '@/utils'
import type { PlannerEvent, EventType } from '@/types/database'

export interface NewEventInput {
  title:     string
  date:      string
  start_min: number
  end_min:   number
  color:     string
  type:      EventType
  task_id?:  string | null
  habit_id?: string | null
}

interface PlannerState {
  events:  PlannerEvent[]
  loading: boolean
  error:   string | null
  // Fetch
  fetchEvents: (userId: string, date?: string) => Promise<void>
  // CRUD
  addEvent:    (userId: string, data: NewEventInput)         => Promise<void>
  updateEvent: (id: string, data: Partial<PlannerEvent>)     => Promise<void>
  deleteEvent: (id: string)                                  => Promise<void>
  // Drag & resize (optimistic only, then sync)
  moveEvent:   (id: string, newStart: number, newEnd: number) => void
  syncEvent:   (id: string)                                    => Promise<void>
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  events:  [],
  loading: false,
  error:   null,

  // ── Fetch events for a date ────────────────────────────────────────────────
  fetchEvents: async (userId, date = todayISO()) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('planner_events')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('start_min')

    if (error) { set({ error: error.message, loading: false }); return }
    set({ events: data ?? [], loading: false })
  },

  // ── Add Event ──────────────────────────────────────────────────────────────
  addEvent: async (userId, data) => {
    const optimisticId = tempId()
    const optimistic: PlannerEvent = {
      id: optimisticId, user_id: userId,
      task_id: null, habit_id: null,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      ...data,
    }
    set(s => ({ events: [...s.events, optimistic] }))

    const { data: row, error } = await supabase
      .from('planner_events')
      .insert({ user_id: userId, ...data })
      .select().single()

    if (error) {
      set(s => ({ events: s.events.filter(e => e.id !== optimisticId), error: error.message }))
    } else {
      set(s => ({ events: s.events.map(e => e.id === optimisticId ? row : e) }))
    }
  },

  // ── Update Event ───────────────────────────────────────────────────────────
  updateEvent: async (id, data) => {
    set(s => ({ events: s.events.map(e => e.id === id ? { ...e, ...data } : e) }))
    await supabase.from('planner_events').update(data).eq('id', id)
  },

  // ── Delete Event ───────────────────────────────────────────────────────────
  deleteEvent: async (id) => {
    set(s => ({ events: s.events.filter(e => e.id !== id) }))
    await supabase.from('planner_events').delete().eq('id', id)
  },

  // ── Move (drag/resize) — optimistic only, call syncEvent on mouse-up ───────
  moveEvent: (id, newStart, newEnd) => {
    set(s => ({ events: s.events.map(e =>
      e.id === id ? { ...e, start_min: newStart, end_min: newEnd } : e
    )}))
  },

  // ── Sync after drag ────────────────────────────────────────────────────────
  syncEvent: async (id) => {
    const ev = get().events.find(e => e.id === id)
    if (!ev) return
    await supabase.from('planner_events')
      .update({ start_min: ev.start_min, end_min: ev.end_min })
      .eq('id', id)
  },
}))
