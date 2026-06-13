import { format, isToday, isYesterday, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { SNAP_MINUTES, START_HOUR } from '@/lib/theme'

// ── Time helpers ──────────────────────────────────────────────────────────────
export const pad = (n: number) => String(n).padStart(2, '0')

export const toMin = (t: string): number => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export const minToTime = (m: number): string => {
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${pad(h)}:${pad(min)}`
}

export const nowStr = (d = new Date()): string =>
  `${pad(d.getHours())}:${pad(d.getMinutes())}`

/** Snap minutes to nearest SNAP_MINUTES interval */
export const snapMin = (m: number): number =>
  Math.round(m / SNAP_MINUTES) * SNAP_MINUTES

/** Convert pixel Y offset to timeline minutes */
export const pxToMin = (px: number, hourHeight: number): number => {
  const rawMin = (px / hourHeight) * 60 + START_HOUR * 60
  return snapMin(rawMin)
}

/** Convert timeline minutes to pixel Y */
export const minToPx = (m: number, hourHeight: number): number =>
  ((m - START_HOUR * 60) / 60) * hourHeight

// ── Date helpers ──────────────────────────────────────────────────────────────
export const todayISO   = () => format(new Date(), 'yyyy-MM-dd')
export const toDateStr  = (d: Date) => format(d, 'yyyy-MM-dd')
export const fromISO    = (s: string) => parseISO(s)

export const formatDisplay = (d: Date) =>
  format(d, 'EEEE, d MMMM yyyy', { locale: localeId })

export const formatShort = (d: Date) =>
  format(d, 'd MMM', { locale: localeId })

export { isToday, isYesterday }

/** Returns array of Date objects for the whole month */
export const daysInMonth = (year: number, month: number): Date[] =>
  eachDayOfInterval({
    start: startOfMonth(new Date(year, month)),
    end:   endOfMonth(new Date(year, month)),
  })

/** Get the day-of-week index (0=Sun) of the first day of the month */
export const firstDayOfMonth = (year: number, month: number): number =>
  new Date(year, month, 1).getDay()

// ── Streak helpers ────────────────────────────────────────────────────────────
/**
 * Calculate current streak from a map of { 'Mon Jun 10 2024': { done: true } }
 * Counts backwards from yesterday (today's log is in-progress)
 */
export const calcStreak = (history: Record<string, { done: boolean }>): number => {
  let streak = 0
  const today = new Date()
  for (let i = 1; i <= 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toDateString()
    if (history[key]?.done) {
      streak++
    } else {
      break
    }
  }
  return streak
}

// ── String helpers ────────────────────────────────────────────────────────────
export const truncate = (s: string, max = 30) =>
  s.length > max ? s.slice(0, max) + '…' : s

export const initials = (name: string) =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

// ── Color helpers ─────────────────────────────────────────────────────────────
/** Add alpha to a hex color */
export const withAlpha = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ── ID generator ──────────────────────────────────────────────────────────────
export const tempId = () => `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`

// ── Responsive breakpoints ────────────────────────────────────────────────────
export const BREAKPOINTS = {
  xs: 360,
  sm: 390,
  md: 430,
} as const

export const useWindowWidth = () => {
  if (typeof window === 'undefined') return 390
  return window.innerWidth
}
