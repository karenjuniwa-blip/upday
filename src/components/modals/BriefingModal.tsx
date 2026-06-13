import type { AppTheme } from '@/lib/theme'
import type { Task, Habit, PlannerEvent } from '@/types/database'
import { minToTime, todayISO } from '@/utils'

interface BriefingModalProps {
  C:       AppTheme
  tasks:   Task[]
  habits:  Habit[]
  events:  PlannerEvent[]
  nowMin:  number
  onClose: () => void
}

const QUOTES = [
  'Fokus pada progres, bukan kesempurnaan.',
  'Satu langkah kecil setiap hari membuat perbedaan besar.',
  'Hari ini adalah kesempatan baru untuk jadi lebih baik.',
  'Konsistensi mengalahkan motivasi.',
  'Mulai dari yang kecil, lakukan setiap hari.',
]

export function BriefingModal({ C, tasks, habits, events, nowMin, onClose }: BriefingModalProps) {
  const today        = todayISO()
  const pendingTasks = tasks.filter(t => !t.done).length
  const recurring    = tasks.filter(t => t.recurring_freq && !t.done).length
  const pendingHabits = habits.filter(h => !h.logs.find(l => l.log_date === today)?.done).length
  const nextEvent    = events.find(e => e.start_min > nowMin)
  const quote        = QUOTES[new Date().getDay() % QUOTES.length]

  const items = [
    { icon: '📋', val: `${pendingTasks} task`,   label: 'belum selesai',   color: C.accent  },
    { icon: '🔄', val: `${recurring} task`,       label: 'berulang aktif',  color: C.primary },
    { icon: '🔥', val: `${pendingHabits} habit`,  label: 'menunggu',        color: C.amber   },
    {
      icon: '📅',
      val: nextEvent ? `${minToTime(nextEvent.start_min)}` : 'Kosong',
      label: nextEvent ? nextEvent.title : 'tidak ada jadwal lagi',
      color: C.emerald,
    },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)',
        zIndex: 300, display: 'flex', alignItems: 'flex-end',
        animation: 'fadeIn .2s ease-out',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', background: C.surface,
        borderRadius: '24px 24px 0 0',
        padding: '0 24px 40px',
        border: `1px solid ${C.border}`,
        animation: 'slideUp .28s cubic-bezier(.4,0,.2,1)',
        maxHeight: '90dvh', overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 99, background: C.border, margin: '16px auto 20px' }} />

        <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>☀️ Daily Briefing</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 20 }}>
          Hari ini kamu punya:
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {items.map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: C.card, borderRadius: 14, padding: '12px 16px',
              border: `1px solid ${C.border}`,
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{s.icon}</span>
              <div>
                <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val} </span>
                <span style={{ fontSize: 13, color: C.text }}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div style={{
          background: `${C.primary}20`, border: `1px solid ${C.primary}44`,
          borderRadius: 14, padding: '12px 16px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, color: C.accent, fontWeight: 700, marginBottom: 4 }}>
            💡 Quote Hari Ini
          </div>
          <div style={{ fontSize: 14, color: C.text, fontStyle: 'italic' }}>"{quote}"</div>
        </div>

        <button onClick={onClose} style={{
          width: '100%', padding: '14px', borderRadius: 14,
          background: C.primary, color: C.white,
          fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
        }}>
          Mulai Hari Ini 🚀
        </button>
      </div>
    </div>
  )
}
