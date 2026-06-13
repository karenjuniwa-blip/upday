import type { AppTheme } from '@/lib/theme'
import type { Habit } from '@/types/database'
import { todayISO } from '@/utils'

interface PinnedHabitsProps {
  C:          AppTheme
  habits:     Habit[]
  onTapDone:  (h: Habit) => void
  onTapUndo:  (id: string) => void
}

export function PinnedHabits({ C, habits, onTapDone, onTapUndo }: PinnedHabitsProps) {
  const pinned = habits.filter(h => h.pinned)
  if (!pinned.length) return null

  const today = todayISO()

  return (
    <div style={{ padding: '16px 0 0' }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: C.muted,
        letterSpacing: 1, marginBottom: 10, paddingLeft: 20,
      }}>
        📌 HABIT HARI INI
      </div>
      <div style={{
        display: 'flex', gap: 10,
        overflowX: 'auto', paddingLeft: 20, paddingRight: 20, paddingBottom: 4,
      }}
        className="scrollbar-none"
      >
        {pinned.map(h => {
          const done = h.logs.find(l => l.log_date === today)?.done ?? false
          return (
            <button
              key={h.id}
              onClick={() => done ? onTapUndo(h.id) : onTapDone(h)}
              className="tap-highlight"
              style={{
                flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                padding: '10px 14px', borderRadius: 14,
                border: `1.5px solid ${done ? h.color : C.border}`,
                background: done ? `${h.color}22` : C.surface,
                cursor: 'pointer', transition: 'all .2s',
                minWidth: 72,
              }}
            >
              <span style={{ fontSize: 22 }}>{done ? '✅' : h.icon}</span>
              <span style={{
                fontSize: 11, color: done ? h.color : C.muted,
                fontWeight: 600, whiteSpace: 'nowrap',
                maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {h.title.split(' ').slice(0, 2).join(' ')}
              </span>
              <span style={{ fontSize: 10, color: done ? h.color : C.muted }}>
                🔥{h.streak}
              </span>
              {done && (
                <span style={{ fontSize: 9, color: h.color, fontWeight: 700 }}>✓ Done</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
