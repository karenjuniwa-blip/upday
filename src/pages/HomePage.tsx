import { useState } from 'react'
import { useThemeStore }   from '@/stores/themeStore'
import { useAuthStore }    from '@/stores/authStore'
import { useTaskStore }    from '@/stores/taskStore'
import { useHabitStore }   from '@/stores/habitStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { useData }         from '@/hooks/useData'
import { useNow }          from '@/hooks/useNow'
import { NowNextCard }     from '@/components/home/NowNextCard'
import { PinnedHabits }    from '@/components/home/PinnedHabits'
import { TaskList }        from '@/components/home/TaskList'
import { TaskModal }       from '@/components/tasks/TaskModal'
import { DoneNoteModal }   from '@/components/habits/DoneNoteModal'
import { BriefingModal }   from '@/components/modals/BriefingModal'
import { ProgressRing, Spinner } from '@/components/ui/primitives'
import { DAYS_SHORT, MONTHS } from '@/lib/theme'
import { pad, toMin, nowStr } from '@/utils'
import type { Task, Habit } from '@/types/database'
import type { NewTaskInput } from '@/stores/taskStore'

export function HomePage() {
  const { theme: C }                    = useThemeStore()
  const { user }                        = useAuthStore()
  const { tasks, toggleTask, toggleSubtask, addTask, updateTask } = useTaskStore()
  const { habits, markDone, markUndone } = useHabitStore()
  const { events }                      = usePlannerStore()
  const { loading }                     = useData()
  const now                             = useNow()

  const [showAdd,      setShowAdd]      = useState(false)
  const [editTask,     setEditTask]     = useState<Task | null>(null)
  const [doneHabit,    setDoneHabit]    = useState<Habit | null>(null)
  const [showBriefing, setShowBriefing] = useState(true)

  const nowMin  = toMin(nowStr(now))
  const done    = tasks.filter(t => t.done).length
  const pct     = tasks.length ? Math.round((done / tasks.length) * 100) : 0
  const greet   = now.getHours() < 12 ? 'Selamat pagi ☀️'
                : now.getHours() < 17 ? 'Selamat siang 🌤️'
                : 'Selamat malam 🌙'

  async function handleSaveTask(data: NewTaskInput) {
    if (!user) return
    if (editTask) {
      await updateTask(editTask.id, data)
    } else {
      await addTask(user.id, data)
    }
  }

  async function handleDone(habit: Habit, note: string) {
    if (!user) return
    await markDone(habit.id, user.id, note)
    setDoneHabit(null)
  }

  if (loading) return <Spinner C={C} />

  return (
    <div style={{ paddingBottom: 24 }}>

      {/* ── Header ── */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 2 }}>
              {DAYS_SHORT[now.getDay()]}, {now.getDate()} {MONTHS[now.getMonth()]} {now.getFullYear()}
            </div>
            <div style={{
              fontSize: 20, fontWeight: 700, color: C.text,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {greet}
            </div>
          </div>

          {/* Progress ring */}
          <div style={{ textAlign: 'center', position: 'relative', flexShrink: 0, marginLeft: 12 }}>
            <ProgressRing pct={pct} size={68} stroke={6} C={C} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.accent }}>{pct}%</span>
              <span style={{ fontSize: 9, color: C.muted }}>selesai</span>
            </div>
          </div>
        </div>

        {/* Now / Next */}
        <NowNextCard C={C} events={events} nowMin={nowMin} />
      </div>

      {/* ── Pinned habits ── */}
      <PinnedHabits
        C={C} habits={habits}
        onTapDone={h  => setDoneHabit(h)}
        onTapUndo={id => user && markUndone(id, user.id)}
      />

      {/* ── Task list ── */}
      <TaskList
        C={C} tasks={tasks}
        onToggle={id         => toggleTask(id)}
        onToggleSub={(tid, sid) => toggleSubtask(tid, sid)}
        onEdit={t  => setEditTask(t)}
        onAdd={() => setShowAdd(true)}
      />

      {/* ── Modals ── */}
      {(showAdd || editTask) && (
        <TaskModal
          C={C}
          initial={editTask}
          onClose={() => { setShowAdd(false); setEditTask(null) }}
          onSave={handleSaveTask}
        />
      )}

      {doneHabit && (
        <DoneNoteModal
          C={C} habit={doneHabit}
          onClose={() => setDoneHabit(null)}
          onConfirm={note => handleDone(doneHabit, note)}
        />
      )}

      {showBriefing && (
        <BriefingModal
          C={C} tasks={tasks} habits={habits}
          events={events} nowMin={nowMin}
          onClose={() => setShowBriefing(false)}
        />
      )}
    </div>
  )
}
