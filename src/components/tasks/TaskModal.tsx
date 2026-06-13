import { useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Toggle } from '@/components/ui/primitives'
import { FREQ_OPTIONS } from '@/lib/theme'
import type { AppTheme } from '@/lib/theme'
import type { Task, Priority, RecurFreq, ReminderType } from '@/types/database'
import type { NewTaskInput } from '@/stores/taskStore'
import { todayISO } from '@/utils'

interface TaskModalProps {
  C:       AppTheme
  initial: Task | null
  onClose: () => void
  onSave:  (data: NewTaskInput) => void
}

export function TaskModal({ C, initial, onClose, onSave }: TaskModalProps) {
  const [form, setForm] = useState<NewTaskInput>({
    title:            initial?.title            ?? '',
    priority:         initial?.priority         ?? 'med',
    time:             initial?.time             ?? '',
    tag:              initial?.tag              ?? 'Personal',
    date:             initial?.date             ?? todayISO(),
    recurring_freq:   initial?.recurring_freq   ?? null,
    recurring_label:  initial?.recurring_label  ?? null,
    reminder_enabled: initial?.reminder_enabled ?? false,
    reminder_type:    initial?.reminder_type    ?? 'smart',
    reminder_minutes: initial?.reminder_minutes ?? 15,
    reminder_note:    initial?.reminder_note    ?? '',
  })

  const set = <K extends keyof NewTaskInput>(k: K, v: NewTaskInput[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  function save() {
    if (!form.title.trim()) return
    onSave(form)
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
    <Sheet C={C} onClose={onClose} title={initial ? 'Edit Task' : 'Task Baru'}>
      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <label style={lStyle}>NAMA TASK</label>
        <input
          value={form.title} onChange={e => set('title', e.target.value)}
          placeholder="Apa yang perlu dilakukan?" style={iStyle}
          autoFocus onKeyDown={e => e.key === 'Enter' && save()}
        />
      </div>

      {/* Priority + Time */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div>
          <label style={lStyle}>PRIORITAS</label>
          <div style={{ display: 'flex', gap: 5 }}>
            {(['high','med','low'] as Priority[]).map(p => (
              <button key={p} onClick={() => set('priority', p)} style={{
                flex: 1, fontSize: 12, padding: '6px 0', borderRadius: 8,
                cursor: 'pointer', fontWeight: 700,
                background: form.priority === p ? C.accent : 'transparent',
                color:      form.priority === p ? C.bg     : C.muted,
                border:    `1px solid ${form.priority === p ? C.accent : C.border}`,
                transition: 'all .15s',
              }}>
                {p === 'high' ? '🔴' : p === 'med' ? '🟡' : '🟢'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={lStyle}>WAKTU</label>
          <input type="time" value={form.time} onChange={e => set('time', e.target.value)} style={iStyle} />
        </div>
      </div>

      {/* Tag */}
      <div style={{ marginBottom: 16 }}>
        <label style={lStyle}>KATEGORI</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Personal','Work','Dev','Health','Finance'].map(tag => (
            <button key={tag} onClick={() => set('tag', tag)} style={{
              fontSize: 11, padding: '5px 12px', borderRadius: 99,
              cursor: 'pointer', fontWeight: 600,
              background: form.tag === tag ? `${C.primary}33` : 'transparent',
              color:      form.tag === tag ? C.accent           : C.muted,
              border:    `1px solid ${form.tag === tag ? C.accent : C.border}`,
            }}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Recurring */}
<div style={{ marginBottom: 16 }}>
  <label style={lStyle}>🔄 PENGULANGAN</label>
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
    {FREQ_OPTIONS.map(f => {
      const active = (!form.recurring_freq && f.value === 'none') || form.recurring_freq === f.value
      return (
        <button 
          key={f.value} 
          onClick={() => {
            set('recurring_freq', f.value === 'none' ? null : (f.value as RecurFreq));
            set('recurring_label', f.value === 'none' ? null : f.label);
          }} 
          style={{
            fontSize: 11, padding: '5px 10px', borderRadius: 99,
            cursor: 'pointer', fontWeight: 600,
            background: active ? `${C.primary}33` : 'transparent',
            color:      active ? C.accent          : C.muted,
            border:    `1px solid ${active ? C.accent : C.border}`,
          }}
        >
          {f.icon} {f.label}
        </button>
      )
    })}
  </div>
</div>

      {/* Reminder */}
      <div style={{
        marginBottom: 20, background: C.card, borderRadius: 14,
        padding: 14, border: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: form.reminder_enabled ? 14 : 0 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>🔔 Reminder</div>
            <div style={{ fontSize: 11, color: C.muted }}>Pengingat otomatis</div>
          </div>
          <Toggle on={form.reminder_enabled} onToggle={() => set('reminder_enabled', !form.reminder_enabled)} C={C} />
        </div>

        {form.reminder_enabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([
                { v: 'smart', icon: '🧠', label: 'Smart',  desc: 'Sesuai pola aktivitas' },
                { v: 'fixed', icon: '🔔', label: 'Fixed',  desc: 'Menit sebelum waktu' },
              ] as const).map(o => (
                <button key={o.v} onClick={() => set('reminder_type', o.v as ReminderType)} style={{
                  padding: '8px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  background: form.reminder_type === o.v ? `${C.primary}22` : 'transparent',
                  border: `1.5px solid ${form.reminder_type === o.v ? C.accent : C.border}`,
                }}>
                  <div style={{ fontSize: 16 }}>{o.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: form.reminder_type === o.v ? C.accent : C.text }}>
                    {o.label}
                  </div>
                  <div style={{ fontSize: 10, color: C.muted }}>{o.desc}</div>
                </button>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>
                INGATKAN {form.reminder_minutes} MENIT SEBELUMNYA
              </div>
              <input type="range" min={5} max={60} step={5} value={form.reminder_minutes}
                onChange={e => set('reminder_minutes', Number(e.target.value))}
                style={{ width: '100%', accentColor: C.accent }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {[5,15,30,60].map(v => (
                  <span key={v} style={{ fontSize: 10, color: form.reminder_minutes === v ? C.accent : C.muted }}>
                    {v}m
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
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
