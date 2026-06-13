import { useMemo } from 'react'
import { useTaskStore }  from '@/stores/taskStore'
import { useHabitStore } from '@/stores/habitStore'

export interface DailyStats {
  label: string
  tasks: number
  habits: number
}

export function useStats() {
  const { tasks }  = useTaskStore()
  const { habits } = useHabitStore()

  return useMemo(() => {
    const doneTaskCount  = tasks.filter(t => t.done).length
    const totalTaskCount = tasks.length
    const taskPct        = totalTaskCount ? Math.round((doneTaskCount / totalTaskCount) * 100) : 0

    const doneHabitCount  = habits.filter(h => {
      const today = new Date().toISOString().slice(0, 10)
      return h.logs.find(l => l.log_date === today)?.done
    }).length
    const totalHabitCount = habits.length
    const habitPct        = totalHabitCount ? Math.round((doneHabitCount / totalHabitCount) * 100) : 0

    const bestStreak     = Math.max(0, ...habits.map(h => h.streak))
    const recurringCount = tasks.filter(t => t.recurring_freq).length
    const activeReminders = tasks.filter(t => t.reminder_enabled && !t.done).length

    // Productivity score: 60% tasks + 40% habits
    const productivityScore = Math.round(taskPct * 0.6 + habitPct * 0.4)

    // Weekly bar chart data (mock last 7 days names)
    const days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min']
    const weekData: DailyStats[] = days.map((label, i) => ({
      label,
      tasks:  Math.floor(Math.random() * 8) + 2,  // replaced with real data in Phase 3
      habits: Math.floor(Math.random() * 4) + 1,
    }))

    return {
      doneTaskCount, totalTaskCount, taskPct,
      doneHabitCount, totalHabitCount, habitPct,
      bestStreak, recurringCount, activeReminders,
      productivityScore, weekData,
    }
  }, [tasks, habits])
}
