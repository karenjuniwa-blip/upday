import { useState } from 'react'
import { useThemeStore }   from '@/stores/themeStore'
import { useAuthStore }    from '@/stores/authStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { useData }         from '@/hooks/useData'
import { useNow }          from '@/hooks/useNow'
import { PlannerTimeline } from '@/components/planner/PlannerTimeline'
import { EventModal }      from '@/components/planner/EventModal'
import { Spinner }         from '@/components/ui/primitives'
import { DAYS_SHORT, MONTHS } from '@/lib/theme'
import { toMin, nowStr, todayISO, toDateStr } from '@/utils'
import type { PlannerEvent } from '@/types/database'
import type { NewEventInput } from '@/stores/plannerStore'

export function PlannerPage() {
  const { theme: C }                              = useThemeStore()
  const { user }                                  = useAuthStore()
  const { events, addEvent, updateEvent, deleteEvent, fetchEvents } = usePlannerStore()
  const { loading }                               = useData()
  const now                                       = useNow(30000) // update every 30s

  const [selectedDate, setSelectedDate]           = useState(new Date())
  const [eventModal, setEventModal]               = useState<{ event: PlannerEvent | null; startMin: number } | null>(null)

  const nowMin    = toMin(nowStr(now))
  const isToday   = toDateStr(selectedDate) === todayISO()

  // Week strip: Sun–Sat of the current week
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  const weekDays  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d
  })

  async function handleDaySelect(d: Date) {
    setSelectedDate(d)
    if (user) await fetchEvents(user.id, toDateStr(d))
  }

  async function handleSaveEvent(data: NewEventInput) {
    if (!user) return
    if (eventModal?.event) {
      await updateEvent(eventModal.event.id, { ...data })
    } else {
      await addEvent(user.id, { ...data, date: toDateStr(selectedDate) })
    }
  }

  if (loading) return <Spinner C={C} />

  return (
    <div style={{ paddingBottom: 24 }}>

      {/* ── Header ── */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>
          {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>
          Ketuk slot kosong untuk tambah event · Drag untuk pindah
        </div>

        {/* Week strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 12 }}>
          {weekDays.map((d, i) => {
            const isToday_ = toDateStr(d) === todayISO()
            const isSel    = toDateStr(d) === toDateStr(selectedDate)
            return (
              <button key={i} onClick={() => handleDaySelect(d)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, padding: '7px 2px', borderRadius: 12,
                background: isSel ? C.primary : isToday_ ? `${C.primary}22` : 'transparent',
                border: `1px solid ${isSel ? C.primary : C.border}`,
                cursor: 'pointer', transition: 'all .15s',
              }}>
                <span style={{ fontSize: 10, color: isSel ? C.white : C.muted, fontWeight: 600 }}>
                  {DAYS_SHORT[d.getDay()]}
                </span>
                <span style={{
                  fontSize: 15, fontWeight: 700,
                  color: isSel ? C.white : isToday_ ? C.accent : C.text,
                }}>
                  {d.getDate()}
                </span>
                {/* dot if has events */}
                {isToday_ && !isSel && (
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.accent }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Timeline ── */}
      <div style={{ padding: '0 16px' }}>
        <PlannerTimeline
          C={C}
          events={events}
          nowMin={nowMin}
          isToday={isToday}
          onClickSlot={startMin => setEventModal({ event: null, startMin })}
          onClickEvent={ev       => setEventModal({ event: ev, startMin: ev.start_min })}
        />
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => setEventModal({ event: null, startMin: toMin('09:00') })}
        style={{
          position: 'fixed', bottom: 90, right: 20,
          width: 52, height: 52, borderRadius: '50%',
          background: `linear-gradient(135deg,${C.primary},${C.glow})`,
          color: C.white, fontSize: 26, border: 'none',
          cursor: 'pointer', boxShadow: `0 4px 16px ${C.primary}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 40,
        }}
      >
        +
      </button>

      {/* ── Event Modal ── */}
      {eventModal !== null && (
        <EventModal
          C={C}
          event={eventModal.event}
          startMin={eventModal.startMin}
          onClose={() => setEventModal(null)}
          onSave={handleSaveEvent}
          onDelete={id => deleteEvent(id)}
        />
      )}
    </div>
  )
}
