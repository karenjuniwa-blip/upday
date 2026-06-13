import { useEffect } from 'react'
import { useAuthStore }   from '@/stores/authStore'
import { useTaskStore }   from '@/stores/taskStore'
import { useHabitStore }  from '@/stores/habitStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { todayISO } from '@/utils'

/**
 * Call this once at the top-level authenticated page.
 * Fetches tasks, habits, and planner events for today.
 */
export function useData() {
  const { user } = useAuthStore()
  const { fetchTasks,   loading: tLoading } = useTaskStore()
  const { fetchHabits,  loading: hLoading } = useHabitStore()
  const { fetchEvents,  loading: pLoading } = usePlannerStore()

  const today = todayISO()

  useEffect(() => {
    if (!user) return
    fetchTasks(user.id, today)
    fetchHabits(user.id)
    fetchEvents(user.id, today)
  }, [user?.id, today])

  return {
    loading: tLoading || hLoading || pLoading,
  }
}
