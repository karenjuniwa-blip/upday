import type { AppTheme } from '@/lib/theme'
import type { PlannerEvent } from '@/types/database'
import { minToTime } from '@/utils'

interface NowNextProps {
  C:       AppTheme
  events:  PlannerEvent[]
  nowMin:  number
}

export function NowNextCard({ C, events, nowMin }: NowNextProps) {
  const current = events.find(e => e.start_min <= nowMin && e.end_min > nowMin)
  const next    = events.find(e => e.start_min > nowMin)

  return (
    <div style={{
      marginTop: 14, borderRadius: 14, background: C.surface,
      border: `1px solid ${C.border}`, padding: '12px 14px',
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
      boxShadow: C.shadow,
    }}>
      {/* Sekarang */}
      <div>
        <div style={{
          fontSize: 10, color: C.muted, fontWeight: 600, marginBottom: 4,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: C.emerald,
            display: 'inline-block', boxShadow: `0 0 6px ${C.emerald}`,
            animation: 'pulseGlow 2s ease-in-out infinite',
          }} />
          SEKARANG
        </div>
        {current ? (
          <>
            <div style={{
              fontSize: 13, fontWeight: 700, color: current.color,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {current.title}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>
              {minToTime(current.start_min)} – {minToTime(current.end_min)}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: C.muted }}>Tidak ada jadwal</div>
        )}
      </div>

      {/* Berikutnya */}
      <div style={{ borderLeft: `1px solid ${C.border}`, paddingLeft: 10 }}>
        <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, marginBottom: 4 }}>
          BERIKUTNYA
        </div>
        {next ? (
          <>
            <div style={{
              fontSize: 13, fontWeight: 700, color: C.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {next.title}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{minToTime(next.start_min)}</div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: C.muted }}>Kosong</div>
        )}
      </div>
    </div>
  )
}
