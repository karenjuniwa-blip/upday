import { useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Toggle, ColorPicker, IconPicker } from '@/components/ui/primitives'
import { HABIT_COLORS, HABIT_ICONS } from '@/lib/theme'
import type { AppTheme } from '@/lib/theme'
import type { Habit } from '@/types/database'
import type { NewHabitInput } from '@/stores/habitStore'

interface AddHabitModalProps {
  C:       AppTheme
  initial: Habit | null
  onClose: () => void
  onSave:  (data: NewHabitInput) => void
}

export function AddHabitModal({ C, initial, onClose, onSave }: AddHabitModalProps) {
  const [form, setForm] = useState<NewHabitInput>({
    title:  initial?.title  ?? '',
    icon:   initial?.icon   ?? '🎯',
    color:  initial?.color  ?? HABIT_COLORS[0],
    time:   initial?.time   ?? '07:00',
    pinned: initial?.pinned ?? false,
  })
  const set = <K extends keyof NewHabitInput>(k: K, v: NewHabitInput[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  function save() {
    if (!form.title.trim()) return
    onSave(form)
    onClose()
  }

  const lStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: C.muted,
    marginBottom: 8, display: 'block', letterSpacing: .5,
  }

  return (
    <Sheet C={C} onClose={onClose} title={initial ? 'Edit Habit' : 'Habit Baru'}>
      {/* Name */}
      <div style={{ marginBottom: 16 }}>
        <label style={lStyle}>NAMA HABIT</label>
        <input
          value={form.title} onChange={e => set('title', e.target.value)}
          placeholder="Nama kebiasaanmu..." autoFocus
          onKeyDown={e => e.key === 'Enter' && save()}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            borderBottom: `1px solid ${C.border}`, color: C.text,
            fontSize: 15, padding: '8px 0', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Icon */}
      <div style={{ marginBottom: 16 }}>
        <label style={lStyle}>ICON</label>
        <IconPicker icons={HABIT_ICONS} selected={form.icon} onSelect={ic => set('icon', ic)} C={C} />
      </div>

      {/* Color */}
      <div style={{ marginBottom: 16 }}>
        <label style={lStyle}>WARNA</label>
        <ColorPicker colors={HABIT_COLORS} selected={form.color} onSelect={c => set('color', c)} />
      </div>

      {/* Time + Pin */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div>
          <label style={lStyle}>WAKTU REMINDER</label>
          <input type="time" value={form.time} onChange={e => set('time', e.target.value)} style={{
            width: '100%', background: 'transparent', border: 'none',
            borderBottom: `1px solid ${C.border}`, color: C.text,
            fontSize: 14, padding: '8px 0', outline: 'none', boxSizing: 'border-box',
          }} />
        </div>
        <div>
          <label style={lStyle}>PIN KE HOME</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8 }}>
            <Toggle on={form.pinned} onToggle={() => set('pinned', !form.pinned)} C={C} />
            <span style={{ fontSize: 12, color: C.muted }}>{form.pinned ? 'Ya 📌' : 'Tidak'}</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div style={{
        background: C.card, borderRadius: 14, padding: 14,
        border: `1px solid ${C.border}`, marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `${form.color}33`, border: `2px solid ${form.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
        }}>
          {form.icon}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
            {form.title || 'Nama habit'}
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>
            ⏰ {form.time} · {form.pinned ? '📌 Di-pin ke home' : 'Tidak di-pin'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingBottom: 8 }}>
        <button onClick={onClose} style={{
          padding: '13px', borderRadius: 12, background: 'transparent',
          color: C.muted, border: `1px solid ${C.border}`,
          fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>Batal</button>
        <button onClick={save} style={{
          padding: '13px', borderRadius: 12, background: C.primary,
          color: C.white, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>Simpan ✓</button>
      </div>
    </Sheet>
  )
}
