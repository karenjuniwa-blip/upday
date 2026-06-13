import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { todayISO, tempId, calcStreak } from '@/utils'
import type { Habit, HabitLog } from '@/types/database'

export interface NewHabitInput {
  title:        string
  icon:         string
  color:        string
  time:         string
  pinned:       boolean
}

interface HabitState {
  habits:  Habit[]
  loading: boolean
  error:   string | null
  // Fetch
  fetchHabits: (userId: string) => Promise<void>
  // CRUD
  addHabit:    (userId: string, data: NewHabitInput)    => Promise<void>
  updateHabit: (id: string, data: Partial<Habit>)        => Promise<void>
  deleteHabit: (id: string)                              => Promise<void>
  // Done logic
  markDone:    (habitId: string, userId: string, note: string) => Promise<void>
  markUndone:  (habitId: string, userId: string)               => Promise<void>
  // Missed day toggle (from detail calendar)
  toggleLog:   (habitId: string, userId: string, date: string) => Promise<void>
  // Streak freeze
  useFreeze:   (habitId: string)                               => Promise<void>
  // Pin toggle
  togglePin:   (habitId: string)                               => Promise<void>
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits:  [],
  loading: false,
  error:   null,

  // ── Fetch habits + last 35 days of logs ────────────────────────────────────
  fetchHabits: async (userId) => {
    set({ loading: true, error: null })
    try {
      const [{ data: habitRows, error: hErr }, { data: logRows }] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', userId).eq('archived', false).order('created_at'),
        supabase.from('habit_logs').select('*').eq('user_id', userId)
          .gte('log_date', new Date(Date.now() - 35 * 86400000).toISOString().slice(0, 10))
          .order('log_date'),
      ])
      if (hErr) throw hErr

      const habits: Habit[] = (habitRows ?? []).map(h => ({
        ...h,
        logs: (logRows ?? []).filter(l => l.habit_id === h.id).map(l => ({
          log_date: l.log_date, done: l.done, note: l.note,
        })) as HabitLog[],
      }))

      set({ habits, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  // ── Add Habit ──────────────────────────────────────────────────────────────
  addHabit: async (userId, data) => {
    const optimisticId = tempId()
    const optimistic: Habit = {
      id: optimisticId, user_id: userId, streak: 0,
      freezes_left: 1, archived: false, logs: [],
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      ...data,
    }
    set(s => ({ habits: [...s.habits, optimistic] }))

    const { data: row, error } = await supabase
      .from('habits').insert({ user_id: userId, ...data }).select().single()

    if (error) {
      set(s => ({ habits: s.habits.filter(h => h.id !== optimisticId), error: error.message }))
    } else {
      set(s => ({ habits: s.habits.map(h => h.id === optimisticId ? { ...row, logs: [] } : h) }))
    }
  },

  // ── Update Habit ───────────────────────────────────────────────────────────
  updateHabit: async (id, data) => {
    const { logs: _, ...dbData } = data as any
    set(s => ({ habits: s.habits.map(h => h.id === id ? { ...h, ...data } : h) }))
    await supabase.from('habits').update(dbData).eq('id', id)
  },

  // ── Delete Habit ───────────────────────────────────────────────────────────
  deleteHabit: async (id) => {
    set(s => ({ habits: s.habits.filter(h => h.id !== id) }))
    await supabase.from('habits').update({ archived: true }).eq('id', id)
  },

  // ── Mark Done today ────────────────────────────────────────────────────────
  markDone: async (habitId, userId, note) => {
    const today = todayISO()
    // Optimistic
    set(s => ({ habits: s.habits.map(h => {
      if (h.id !== habitId) return h
      const logs = [...h.logs.filter(l => l.log_date !== today), { log_date: today, done: true, note }]
      return { ...h, streak: h.streak + 1, logs }
    })}))

    await supabase.from('habit_logs').upsert(
      { habit_id: habitId, user_id: userId, log_date: today, done: true, note },
      { onConflict: 'habit_id,log_date' }
    )
    await supabase.from('habits').update({ streak: get().habits.find(h => h.id === habitId)?.streak ?? 0 }).eq('id', habitId)
  },

  // ── Mark Undone today ──────────────────────────────────────────────────────
  markUndone: async (habitId, userId) => {
    const today = todayISO()
    set(s => ({ habits: s.habits.map(h => {
      if (h.id !== habitId) return h
      const logs = [...h.logs.filter(l => l.log_date !== today), { log_date: today, done: false, note: '' }]
      return { ...h, streak: Math.max(0, h.streak - 1), logs }
    })}))

    await supabase.from('habit_logs').upsert(
      { habit_id: habitId, user_id: userId, log_date: today, done: false, note: '' },
      { onConflict: 'habit_id,log_date' }
    )
    await supabase.from('habits').update({ streak: get().habits.find(h => h.id === habitId)?.streak ?? 0 }).eq('id', habitId)
  },

  // ── Toggle any past date (from detail calendar) ────────────────────────────
  toggleLog: async (habitId, userId, date) => {
    const habit = get().habits.find(h => h.id === habitId)
    if (!habit) return
    const existing = habit.logs.find(l => l.log_date === date)
    const done = !existing?.done

    set(s => ({ habits: s.habits.map(h => {
      if (h.id !== habitId) return h
      const logs = [...h.logs.filter(l => l.log_date !== date), { log_date: date, done, note: existing?.note ?? '' }]
      // Recalculate streak from logs
      const logMap: Record<string, { done: boolean }> = {}
      logs.forEach(l => { logMap[new Date(l.log_date).toDateString()] = { done: l.done } })
      return { ...h, logs, streak: calcStreak(logMap) }
    })}))

    await supabase.from('habit_logs').upsert(
      { habit_id: habitId, user_id: userId, log_date: date, done, note: existing?.note ?? '' },
      { onConflict: 'habit_id,log_date' }
    )
    const updatedHabit = get().habits.find(h => h.id === habitId)
    if (updatedHabit) {
      await supabase.from('habits').update({ streak: updatedHabit.streak }).eq('id', habitId)
    }
  },

  // ── Streak Freeze ──────────────────────────────────────────────────────────
  useFreeze: async (habitId) => {
    const habit = get().habits.find(h => h.id === habitId)
    if (!habit || habit.freezes_left <= 0) return
    const freezes_left = habit.freezes_left - 1
    set(s => ({ habits: s.habits.map(h => h.id === habitId ? { ...h, freezes_left } : h) }))
    await supabase.from('habits').update({ freezes_left }).eq('id', habitId)
  },

  // ── Toggle Pin ─────────────────────────────────────────────────────────────
  togglePin: async (habitId) => {
    const habit = get().habits.find(h => h.id === habitId)
    if (!habit) return
    const pinned = !habit.pinned
    set(s => ({ habits: s.habits.map(h => h.id === habitId ? { ...h, pinned } : h) }))
    await supabase.from('habits').update({ pinned }).eq('id', habitId)
  },
}))
