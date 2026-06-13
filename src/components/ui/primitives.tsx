import type { AppTheme } from '@/lib/theme'
import { PRIORITY_CONFIG } from '@/lib/theme'
import type { Priority } from '@/types/database'

// ── Toggle switch ─────────────────────────────────────────────────────────────
interface ToggleProps { on: boolean; onToggle: () => void; C: AppTheme }
export function Toggle({ on, onToggle, C }: ToggleProps) {
  return (
    <button onClick={onToggle} style={{
      width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
      background: on ? C.primary : C.border, position: 'relative',
      transition: 'background .2s', flexShrink: 0,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: C.white,
        position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left .2s',
      }} />
    </button>
  )
}

// ── Progress ring ─────────────────────────────────────────────────────────────
interface RingProps { pct: number; size?: number; stroke?: number; C: AppTheme }
export function ProgressRing({ pct, size = 72, stroke = 6, C }: RingProps) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.accent} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)' }} />
    </svg>
  )
}

// ── Priority badge ────────────────────────────────────────────────────────────
export function PriorityBadge({ p, C }: { p: Priority; C: AppTheme }) {
  const cfg = PRIORITY_CONFIG[p]
  const bg    = C.isDark ? cfg.darkBg    : cfg.lightBg
  const color = C.isDark ? cfg.darkColor : cfg.lightColor
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
      background: bg, color, textTransform: 'uppercase', letterSpacing: .5,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}

// ── Recurring badge ───────────────────────────────────────────────────────────
export function RecurringBadge({ label, C }: { label: string; C: AppTheme }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
      background: C.isDark ? '#1F1D35' : '#EDE9FF', color: C.accent,
      display: 'inline-flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap',
    }}>
      🔄 {label}
    </span>
  )
}

// ── Reminder badge ────────────────────────────────────────────────────────────
export function ReminderBadge({ type, minutes, C }: { type: 'smart'|'fixed'; minutes: number; C: AppTheme }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
      background: C.isDark ? '#1F2D1F' : '#ECFDF5', color: C.emerald,
      display: 'inline-flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap',
    }}>
      {type === 'smart' ? '🧠' : '🔔'} {minutes}m
    </span>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, C }: {
  icon: string; title: string; subtitle?: string; C: AppTheme
}) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: C.muted }}>{subtitle}</div>}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ C }: { C: AppTheme }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: `3px solid ${C.border}`,
        borderTopColor: C.accent,
        animation: 'spin .7s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Color dot ─────────────────────────────────────────────────────────────────
export function ColorPicker({ colors, selected, onSelect }: {
  colors: readonly string[]; selected: string; onSelect: (c: string) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {colors.map(c => (
        <button key={c} onClick={() => onSelect(c)} style={{
          width: 30, height: 30, borderRadius: '50%', background: c, cursor: 'pointer',
          border: `3px solid ${selected === c ? '#fff' : 'transparent'}`,
          boxShadow: selected === c ? `0 0 0 2px ${c}` : 'none',
          transition: 'all .15s',
        }} />
      ))}
    </div>
  )
}

// ── Icon picker ───────────────────────────────────────────────────────────────
export function IconPicker({ icons, selected, onSelect, C }: {
  icons: readonly string[]; selected: string; onSelect: (i: string) => void; C: AppTheme
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {icons.map(ic => (
        <button key={ic} onClick={() => onSelect(ic)} style={{
          width: 40, height: 40, borderRadius: 12, fontSize: 20, cursor: 'pointer',
          border: `2px solid ${selected === ic ? C.accent : C.border}`,
          background: selected === ic ? `${C.accent}22` : C.card,
          transition: 'all .15s',
        }}>
          {ic}
        </button>
      ))}
    </div>
  )
}
