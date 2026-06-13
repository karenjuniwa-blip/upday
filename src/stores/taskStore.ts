import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { todayISO, tempId } from '@/utils'
import type { Task, Subtask, Priority, RecurFreq, ReminderType } from '@/types/database'

interface TaskState {
  tasks:   Task[]
  loading: boolean
  error:   string | null
  // Fetch
  fetchTasks:  (userId: string, date?: string) => Promise<void>
  // CRUD Task
  addTask:     (userId: string, data: NewTaskInput) => Promise<void>
  updateTask:  (id: string, data: Partial<Task>)   => Promise<void>
  deleteTask:  (id: string)                         => Promise<void>
  toggleTask:  (id: string)                         => Promise<void>
  // CRUD Subtask
  addSubtask:    (taskId: string, userId: string, text: string) => Promise<void>
  toggleSubtask: (taskId: string, subtaskId: string)            => Promise<void>
  deleteSubtask: (taskId: string, subtaskId: string)            => Promise<void>
}

export interface NewTaskInput {
  title:            string
  priority:         Priority
  time:             string
  tag:              string
  date:             string
  recurring_freq:   RecurFreq | null
  recurring_label:  string | null
  reminder_enabled: boolean
  reminder_type:    ReminderType
  reminder_minutes: number
  reminder_note:    string
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks:   [],
  loading: false,
  error:   null,

  // ── Fetch ──────────────────────────────────────────────────────────────────
  fetchTasks: async (userId, date = todayISO()) => {
    set({ loading: true, error: null })
    try {
      // Fetch tasks for today + recurring tasks
      const { data: taskRows, error: tErr } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .or(`date.eq.${date},recurring_freq.neq.null`)
        .order('created_at', { ascending: true })

      if (tErr) throw tErr

      // Fetch all subtasks for these tasks
      const taskIds = taskRows?.map(t => t.id) ?? []
      const { data: subRows } = taskIds.length
        ? await supabase.from('subtasks').select('*').in('task_id', taskIds).order('position')
        : { data: [] }

      // Merge subtasks into tasks
      const tasks: Task[] = (taskRows ?? []).map(t => ({
        ...t,
        subtasks: (subRows ?? []).filter(s => s.task_id === t.id) as Subtask[],
      }))

      set({ tasks, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  // ── Add Task ───────────────────────────────────────────────────────────────
  addTask: async (userId, data) => {
    const optimisticId = tempId()
    const optimistic: Task = {
      id: optimisticId, user_id: userId, done: false,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      subtasks: [], ...data,
    }
    // Optimistic update
    set(s => ({ tasks: [...s.tasks, optimistic] }))

    const { data: row, error } = await supabase
      .from('tasks')
      .insert({ user_id: userId, ...data })
      .select()
      .single()

    if (error) {
      set(s => ({ tasks: s.tasks.filter(t => t.id !== optimisticId), error: error.message }))
    } else {
      set(s => ({ tasks: s.tasks.map(t => t.id === optimisticId ? { ...row, subtasks: [] } : t) }))
    }
  },

  // ── Update Task ────────────────────────────────────────────────────────────
  updateTask: async (id, data) => {
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...data } : t) }))
    const { subtasks: _, ...dbData } = data as any
    await supabase.from('tasks').update(dbData).eq('id', id)
  },

  // ── Delete Task ────────────────────────────────────────────────────────────
  deleteTask: async (id) => {
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
    await supabase.from('tasks').delete().eq('id', id)
  },

  // ── Toggle Done ────────────────────────────────────────────────────────────
  toggleTask: async (id) => {
    const task = get().tasks.find(t => t.id === id)
    if (!task) return
    const done = !task.done
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, done } : t) }))
    await supabase.from('tasks').update({ done }).eq('id', id)
  },

  // ── Subtask: Add ──────────────────────────────────────────────────────────
  addSubtask: async (taskId, userId, text) => {
    const task = get().tasks.find(t => t.id === taskId)
    if (!task) return
    const position = task.subtasks.length
    const optimisticId = tempId()
    const optimistic: Subtask = { id: optimisticId, task_id: taskId, user_id: userId, text, done: false, position, created_at: new Date().toISOString() }

    set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, optimistic] } : t) }))

    const { data: row } = await supabase
      .from('subtasks')
      .insert({ task_id: taskId, user_id: userId, text, position })
      .select().single()

    if (row) {
      set(s => ({ tasks: s.tasks.map(t => t.id === taskId
        ? { ...t, subtasks: t.subtasks.map(s => s.id === optimisticId ? row as Subtask : s) }
        : t
      )}))
    }
  },

  // ── Subtask: Toggle ───────────────────────────────────────────────────────
  toggleSubtask: async (taskId, subtaskId) => {
    const task = get().tasks.find(t => t.id === taskId)
    const sub  = task?.subtasks.find(s => s.id === subtaskId)
    if (!sub) return
    const done = !sub.done
    set(s => ({ tasks: s.tasks.map(t => t.id === taskId
      ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, done } : s) }
      : t
    )}))
    await supabase.from('subtasks').update({ done }).eq('id', subtaskId)
  },

  // ── Subtask: Delete ───────────────────────────────────────────────────────
  deleteSubtask: async (taskId, subtaskId) => {
    set(s => ({ tasks: s.tasks.map(t => t.id === taskId
      ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) }
      : t
    )}))
    await supabase.from('subtasks').delete().eq('id', subtaskId)
  },
}))
