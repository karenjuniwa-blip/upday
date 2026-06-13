import { useState } from 'react'
import type { AppTheme } from '@/lib/theme'
import type { Task } from '@/types/database'
import { PriorityBadge, RecurringBadge, ReminderBadge } from '@/components/ui/primitives'

interface TaskListProps {
  C:             AppTheme
  tasks:         Task[]
  onToggle:      (id: string) => void
  onToggleSub:   (taskId: string, subId: string) => void
  onEdit:        (t: Task) => void
  onAdd:         () => void
}

export function TaskList({ C, tasks, onToggle, onToggleSub, onEdit, onAdd }: TaskListProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const done  = tasks.filter(t => t.done).length
  const total = tasks.length

  return (
    <div style={{ padding: '16px 20px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1 }}>
          📋 TASK HARI INI ({done}/{total})
        </div>
        <button
          onClick={onAdd}
          className="tap-highlight"
          style={{
            fontSize: 12, fontWeight: 700, color: C.accent,
            background: 'transparent', border: `1px solid ${C.accent}`,
            borderRadius: 99, padding: '4px 12px', cursor: 'pointer',
          }}
        >
          + Tambah
        </button>
      </div>

      {/* Task cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map(t => (
          <div key={t.id} style={{
            background: C.card, borderRadius: 14,
            border: `1px solid ${C.border}`,
            opacity: t.done ? 0.6 : 1, transition: 'all .2s',
            overflow: 'hidden', boxShadow: C.shadow,
          }}>
            {/* Main row */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer' }}
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            >
              {/* Checkbox */}
              <button
                onClick={e => { e.stopPropagation(); onToggle(t.id) }}
                className="tap-highlight"
                style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${t.done ? C.accent : C.border}`,
                  background: t.done ? C.accent : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', transition: 'all .2s',
                }}
              >
                {t.done && <span style={{ fontSize: 11, color: C.bg, fontWeight: 900 }}>✓</span>}
              </button>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: t.done ? C.muted : C.text,
                  textDecoration: t.done ? 'line-through' : 'none',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {t.title}
                </div>
                <div style={{
                  display: 'flex', gap: 5, alignItems: 'center',
                  marginTop: 4, flexWrap: 'wrap',
                }}>
                  <PriorityBadge p={t.priority} C={C} />
                  {t.time && (
                    <span style={{ fontSize: 10, color: C.muted, whiteSpace: 'nowrap' }}>
                      ⏰ {t.time}
                    </span>
                  )}
                  {t.recurring_freq && t.recurring_label && (
                    <RecurringBadge label={t.recurring_label} C={C} />
                  )}
                  {t.reminder_enabled && (
                    <ReminderBadge type={t.reminder_type} minutes={t.reminder_minutes} C={C} />
                  )}
                </div>
              </div>

              {/* Subtask count + edit */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {t.subtasks.length > 0 && (
                  <span style={{ fontSize: 10, color: C.muted }}>
                    {t.subtasks.filter(s => s.done).length}/{t.subtasks.length}
                  </span>
                )}
                <button
                  onClick={e => { e.stopPropagation(); onEdit(t) }}
                  style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 14, padding: '0 2px' }}
                >
                  ✏️
                </button>
              </div>
            </div>

            {/* Subtasks expanded */}
            {expanded === t.id && t.subtasks.length > 0 && (
              <div style={{ padding: '0 14px 12px 48px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {t.subtasks.map(s => (
                  <div
                    key={s.id}
                    onClick={() => onToggleSub(t.id, s.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: `1.5px solid ${s.done ? C.accent : C.border}`,
                      background: s.done ? C.accent : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {s.done && <span style={{ fontSize: 9, color: C.bg }}>✓</span>}
                    </div>
                    <span style={{
                      fontSize: 12, color: s.done ? C.muted : C.text,
                      textDecoration: s.done ? 'line-through' : 'none',
                    }}>
                      {s.text}
                    </span>
                  </div>
                ))}
                {t.recurring_freq && (
                  <div style={{ fontSize: 11, color: C.accent, paddingLeft: 24, marginTop: 2 }}>
                    🔄 Muncul kembali {t.recurring_label?.toLowerCase()}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: C.muted }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✨</div>
            <div style={{ fontSize: 14 }}>Belum ada task hari ini</div>
          </div>
        )}
      </div>
    </div>
  )
}
