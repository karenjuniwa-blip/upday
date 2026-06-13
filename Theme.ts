// ── Theme Colors ──────────────────────────────────────────────────────────────
export const DARK_THEME = {
    bg:      '#0F0E17',
    surface: '#1A1826',
    card:    '#221F32',
    border:  '#2E2B42',
    primary: '#7C6FCD',
    accent:  '#A78BFA',
    glow:    '#6D5FC4',
    emerald: '#34D399',
    amber:   '#FBBF24',
    rose:    '#F87171',
    sky:     '#60ABFA',
    text:    '#EAE8F5',
    muted:   '#7B78A0',
    white:   '#FFFFFF',
    shadow:  '0 4px 24px rgba(0,0,0,.4)',
    isDark:  true,
  } as const
  
  export const LIGHT_THEME = {
    bg:      '#F4F3FF',
    surface: '#FFFFFF',
    card:    '#F9F8FF',
    border:  '#E4E1F5',
    primary: '#7C6FCD',
    accent:  '#6D5FC4',
    glow:    '#5B4FB8',
    emerald: '#059669',
    amber:   '#D97706',
    rose:    '#E11D48',
    sky:     '#2563EB',
    text:    '#1A1826',
    muted:   '#8B88A8',
    white:   '#FFFFFF',
    shadow:  '0 2px 12px rgba(124,111,205,.1)',
    isDark:  false,
  } as const
  
  export type AppTheme = typeof DARK_THEME
  
  export function makeTheme(dark: boolean): AppTheme {
    return dark ? DARK_THEME : LIGHT_THEME
  }
  
  // ── Design Tokens ─────────────────────────────────────────────────────────────
  export const HABIT_COLORS = [
    '#7C6FCD', '#34D399', '#F87171', '#FBBF24',
    '#60ABFA', '#F472B6', '#A3E635', '#FB923C',
  ] as const
  
  export const HABIT_ICONS = [
    '💧','🏃','🧘','📓','📚','💪',
    '🥗','😴','🎯','🧠','🎵','✍️',
  ] as const
  
  export const PRIORITY_CONFIG = {
    high: { label: 'Tinggi', darkBg: '#3B1F2B', lightBg: '#FEE2E2', darkColor: '#F87171', lightColor: '#E11D48' },
    med:  { label: 'Sedang', darkBg: '#2B2415', lightBg: '#FEF3C7', darkColor: '#FBBF24', lightColor: '#D97706' },
    low:  { label: 'Rendah', darkBg: '#1A2B1F', lightBg: '#D1FAE5', darkColor: '#34D399', lightColor: '#059669' },
  } as const
  
  export const FREQ_OPTIONS = [
    { value: 'none',    label: 'Tidak berulang', icon: '—'  },
    { value: 'daily',   label: 'Setiap hari',    icon: '🔁' },
    { value: 'weekly',  label: 'Setiap minggu',  icon: '📅' },
    { value: 'weekday', label: 'Hari kerja',      icon: '💼' },
    { value: 'weekend', label: 'Akhir pekan',     icon: '🌅' },
  ] as const
  
  export const DAYS_SHORT  = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'] as const
  export const MONTHS      = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'] as const
  export const EVENT_COLORS = ['#7C6FCD','#34D399','#F87171','#FBBF24','#60ABFA','#F472B6'] as const
  
  // Planner
  export const HOUR_HEIGHT  = 64   // px per 1 jam di timeline
  export const START_HOUR   = 6    // timeline mulai jam 06:00
  export const END_HOUR     = 23   // timeline selesai jam 23:00
  export const SNAP_MINUTES = 15   // snap ke 15 menit terdekat