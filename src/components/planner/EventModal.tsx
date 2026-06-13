import { useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { ColorPicker } from '@/components/ui/primitives'
import { EVENT_COLORS } from '@/lib/theme'
import type { AppTheme } from '@/lib/theme'
import type { PlannerEvent, EventType } from '@/types/database'
import { minToTime, toMin } from '@/utils'
import type { NewEventInput } from '@/stores/plannerStore'

interface EventModalProps {
  C:        AppTheme
  event:    PlannerEvent | null
  startMin: number
  onClose:  () => void
  onSave:   (data: NewEventInput) => void
  onDelete: (id: string) => void
}

export function EventModal({ C, event, startMin, onClose, onSave, onDelete }: EventModalProps) {
  const [form, setForm] = useState({
    title:     event?.title     ?? '',
    start_min: event?.start_min ?? startMin,
    end_min:   event?.end_min   ?? startMin + 60,
    color:     event?.color     ?? '#7C6FCD',
    type:      (event?.type     ?? 'event') as EventType,
    date:      event?.date      ?? new Date().toISOString().slice(0, 10),
  })

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  function save() {
    if (!form.title.trim()) return
    onSave({ ...form, task_id: null, habit_id: null })
    onClose()
  }

  const iStyle: React.CSSProperties = {
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: `1px solid ${C.border}`, color: C.text,
    fontSize: 15, padding: '8px 0', outline: 'none', boxSizing: 'border-box',
  }
  const lStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: C.muted,
    marginBottom: 6, display: 'block', letterSpacing: .5,
  }

  return (
    <Sheet C={C} onClose={onClose} title={event ? 'Edit Event' : 'Event Baru'}>
      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <label style={lStyle}>JUDUL</label>
        <input
          value={form.title} onChange={e => set('title', e.target.value)}
          placeholder="Nama kegiatan..." style={iStyle}
          autoFocus onKeyDown={e => e.key === 'Enter' && save()}
        />
      </div>

      {/* Start / End */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div>
          <label style={lStyle}>MULAI</label>
          <input
            type="time" value={minToTime(form.start_min)}
            onChange={e => set('start_min', toMin(e.target.value))}
            style={iStyle}
          />
        </div>
        <div>
          <label style={lStyle}>SELESAI</label>
          <input
            type="time" value={minToTime(form.end_min)}
            onChange={e => set('end_min', toMin(e.target.value))}
            style={iStyle}
          />
        </div>
      </div>

      {/* Type */}
      <div style={{ marginBottom: 16 }}>
        <label style={lStyle}>TIPE</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {([
            { v: 'event', l: '📅 Event' },
            { v: 'task',  l: '✅ Task'  },
            { v: 'habit', l: '🔥 Habit' },
          ] as { v: EventType; l: string }[]).map(t => (
            <button key={t.v} onClick={() => set('type', t.v)} style={{
              flex: 1, fontSize: 11, padding: '7px 0', borderRadius: 8,
              cursor: 'pointer', fontWeight: 700,
              background: form.type === t.v ? C.accent : 'transparent',
              color:      form.type === t.v ? C.bg     : C.muted,
              border:    `1px solid ${form.type === t.v ? C.accent : C.border}`,
              transition: 'all .15s',
            }}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div style={{ marginBottom: 20 }}>
        <label style={lStyle}>WARNA</label>
        <ColorPicker colors={EVENT_COLORS} selected={form.color} onSelect={c => set('color', c)} />
      </div>

      {/* Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: event ? '1fr 1fr 1fr' : '1fr 1fr',
        gap: 10, paddingBottom: 8,
      }}>
        {event && (
          <button onClick={() => { onDelete(event.id); onClose() }} style={{
            padding: '12px', borderRadius: 12,
            background: `${C.rose}20`, color: C.rose,
            border: `1px solid ${C.rose}44`,
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
            🗑 Hapus
          </button>
        )}
        <button onClick={onClose} style={{
          padding: '12px', borderRadius: 12, background: 'transparent',
          color: C.muted, border: `1px solid ${C.border}`,
          fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>Batal</button>
        <button onClick={save} style={{
          padding: '12px', borderRadius: 12,
          background: C.primary, color: C.white,
          border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>Simpan ✓</button>
      </div>
    </Sheet>
  )
}
