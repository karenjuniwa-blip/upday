import { Sheet } from '@/components/ui/Sheet'
import type { AppTheme } from '@/lib/theme'
import type { Habit } from '@/types/database'
import { DAYS_SHORT, MONTHS } from '@/lib/theme'
import { daysInMonth, firstDayOfMonth, toDateStr } from '@/utils'
import { useHabitStore } from '@/stores/habitStore'
import { useAuthStore }  from '@/stores/authStore'

interface HabitDetailModalProps {
  C:       AppTheme
  habit:   Habit
  onClose: () => void
}

export function HabitDetailModal({ C, habit, onClose }: HabitDetailModalProps) {
  const { toggleLog, useFreeze } = useHabitStore()
  const { user }                 = useAuthStore()
  const today    = new Date()
  const year     = today.getFullYear()
  const month    = today.getMonth()
  const days     = daysInMonth(year, month)
  const firstDay = firstDayOfMonth(year, month)

  const logMap: Record<string, boolean> = {}
  habit.logs.forEach(l => { logMap[l.log_date] = l.done })

  const doneDays  = habit.logs.filter(l => l.done).length
  const totalDays = habit.logs.length
  const rate      = totalDays ? Math.round((doneDays / totalDays) * 100) : 0

  function getDayStatus(d: Date): 'done' | 'missed' | 'future' | 'today' {
    if (d > today) return 'future'
    const key = toDateStr(d)
    if (toDateStr(d) === toDateStr(today)) return 'today'
    return logMap[key] ? 'done' : 'missed'
  }

  async function handleToggle(d: Date) {
    if (d > today || !user) return
    await toggleLog(habit.id, user.id, toDateStr(d))
  }

  return (
    <Sheet C={C} onClose={onClose} maxH="92dvh">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: `${habit.color}33`, border: `2px solid ${habit.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          flexShrink: 0,
        }}>
          {habit.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {habit.title}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>⏰ {habit.time}</div>
        </div>
        <div style={{
          textAlign: 'center', background: `${habit.color}22`,
          borderRadius: 12, padding: '8px 14px', flexShrink: 0,
        }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: habit.color }}>🔥{habit.streak}</div>
          <div style={{ fontSize: 9, color: C.muted }}>streak</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        {[
          { label: 'Selesai',  val: `${doneDays}`,          sub: 'hari',   color: C.emerald },
          { label: 'Terlewat', val: `${totalDays-doneDays}`, sub: 'hari',   color: C.rose    },
          { label: 'Tingkat',  val: `${rate}%`,              sub: 'sukses', color: C.accent  },
        ].map(s => (
          <div key={s.label} style={{
            background: C.card, borderRadius: 12, padding: '10px 8px',
            border: `1px solid ${C.border}`, textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 9, color: C.muted }}>{s.sub}</div>
            <div style={{ fontSize: 9, color: C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div style={{
        marginBottom: 16, background: C.card, borderRadius: 14,
        padding: 14, border: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
            {MONTHS[month]} {year}
          </span>
          <span style={{ fontSize: 11, color: C.muted }}>Tap tanggal untuk toggle</span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, borderRadius: 99, background: C.border, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{
            height: '100%', borderRadius: 99, width: `${rate}%`,
            background: `linear-gradient(90deg,${habit.color},${habit.color}88)`,
            transition: 'width .5s',
          }} />
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 4 }}>
          {DAYS_SHORT.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 9, color: C.muted, fontWeight: 700 }}>{d}</div>
          ))}
        </div>

        {/* Empty cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
          {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
          {days.map(d => {
            const status  = getDayStatus(d)
            const isToday_ = toDateStr(d) === toDateStr(today)
            const bg =
              status === 'done'   ? habit.color :
              status === 'missed' ? `${C.rose}44` : 'transparent'
            const col =
              status === 'done'   ? C.white :
              status === 'missed' ? C.rose   : C.muted

            return (
              <button key={d.toISOString()} onClick={() => handleToggle(d)} style={{
                aspectRatio: '1', borderRadius: 6, fontSize: 10,
                fontWeight: isToday_ ? 900 : 500,
                background: bg, color: col,
                border: isToday_ ? `2px solid ${C.accent}` : 'none',
                cursor: status !== 'future' ? 'pointer' : 'default',
                opacity: status === 'future' ? .3 : 1,
                transition: 'all .15s',
              }}>
                {d.getDate()}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 10 }}>
          {[
            { bg: habit.color,      label: 'Selesai'  },
            { bg: `${C.rose}44`,    label: 'Terlewat' },
            { bg: 'transparent',    label: 'Belum'    },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: l.bg, border: `1px solid ${C.border}` }} />
              <span style={{ fontSize: 10, color: C.muted }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Streak freeze */}
      <div style={{
        background: C.isDark ? '#1F1A2E' : '#EDE9FF', borderRadius: 12, padding: 12,
        border: `1px solid ${C.primary}44`, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>❄️ Streak Freeze</div>
            <div style={{ fontSize: 11, color: C.muted }}>Skip 1 hari tanpa reset streak</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>
              {habit.freezes_left}x tersisa
            </span>
            {habit.freezes_left > 0 && (
              <button onClick={() => useFreeze(habit.id)} style={{
                fontSize: 11, fontWeight: 700, color: C.primary,
                background: `${C.primary}22`, border: `1px solid ${C.primary}`,
                borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
              }}>
                Pakai
              </button>
            )}
          </div>
        </div>
      </div>

      <button onClick={onClose} style={{
        width: '100%', padding: '13px', borderRadius: 12,
        background: C.primary, color: C.white,
        border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        marginBottom: 8,
      }}>
        Tutup
      </button>
    </Sheet>
  )
}
