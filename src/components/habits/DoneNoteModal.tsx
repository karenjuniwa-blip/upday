import { useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import type { AppTheme } from '@/lib/theme'
import type { Habit } from '@/types/database'

interface DoneNoteModalProps {
  C:         AppTheme
  habit:     Habit
  onClose:   () => void
  onConfirm: (note: string) => void
}

export function DoneNoteModal({ C, habit, onClose, onConfirm }: DoneNoteModalProps) {
  const [note, setNote] = useState('')
  return (
    <Sheet C={C} onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>{habit.icon}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: habit.color }}>{habit.title}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Tandai selesai hari ini?</div>
      </div>
      <textarea
        value={note} onChange={e => setNote(e.target.value)}
        placeholder="Catatan singkat (opsional)... misal: lari 5km hari ini! 🏃"
        style={{
          width: '100%', background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 12, color: C.text, fontSize: 13, padding: 12,
          outline: 'none', resize: 'none', height: 80,
          boxSizing: 'border-box', marginBottom: 16,
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingBottom: 8 }}>
        <button onClick={onClose} style={{
          padding: '13px', borderRadius: 12, background: 'transparent',
          color: C.muted, border: `1px solid ${C.border}`,
          fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>Batal</button>
        <button onClick={() => onConfirm(note)} style={{
          padding: '13px', borderRadius: 12,
          background: habit.color, color: C.white,
          border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>✓ Selesai!</button>
      </div>
    </Sheet>
  )
}
