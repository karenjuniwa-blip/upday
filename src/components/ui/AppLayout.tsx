import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useThemeStore } from '@/stores/themeStore'
import { pad } from '@/utils'

const TABS = [
  { id: 'home',    path: '/',        icon: '⚡', label: 'Hari Ini'  },
  { id: 'planner', path: '/planner', icon: '📅', label: 'Planner'   },
  { id: 'habits',  path: '/habits',  icon: '🔥', label: 'Habit'     },
  { id: 'stats',   path: '/stats',   icon: '📊', label: 'Statistik' },
]

export function AppLayout() {
  const { theme: C, toggle, isDark } = useThemeStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const activeTab = TABS.find(t =>
    t.path === '/' ? location.pathname === '/' : location.pathname.startsWith(t.path)
  )?.id ?? 'home'

  return (
    <div className="app-shell" style={{
      background: C.bg, color: C.text,
      minHeight: '100dvh', position: 'relative',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Top Bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: `${C.bg}EE`, backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        padding: 'env(safe-area-inset-top,0px) 18px 10px',
        paddingTop: `max(10px, env(safe-area-inset-top))`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `1px solid ${C.border}`,
        minHeight: 54,
      }}>
        <span style={{
          fontSize: 18, fontWeight: 900, cursor: 'pointer', letterSpacing: '-0.5px',
          background: `linear-gradient(90deg,${C.accent},${C.primary})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }} onClick={() => navigate('/')}>
          upday
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Dark/Light toggle */}
          <button onClick={toggle} style={{
            width: 46, height: 26, borderRadius: 99, padding: 3, cursor: 'pointer',
            border: `1px solid ${C.border}`,
            background: isDark ? C.primary : C.border,
            display: 'flex', alignItems: 'center',
            justifyContent: isDark ? 'flex-end' : 'flex-start',
            transition: 'background .3s', flexShrink: 0,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: isDark ? C.accent : '#7C6FCD',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
            }}>
              {isDark ? '🌙' : '☀️'}
            </div>
          </button>

          {/* Live clock */}
          <span style={{
            fontSize: 13, fontWeight: 700, color: C.accent,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px', flexShrink: 0,
          }}>
            {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
          </span>
        </div>
      </div>

      {/* ── Page content ── */}
      <div style={{ paddingBottom: 90 }}>
        <Outlet />
      </div>

      {/* ── Bottom Nav ── */}
      <nav style={{
        position: 'fixed', bottom: 0,
        left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: `${C.surface}F5`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: `1px solid ${C.border}`,
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        paddingTop: 8,
        paddingBottom: `max(16px, env(safe-area-inset-bottom))`,
        transition: 'background .3s',
        zIndex: 40,
      }}>
        {TABS.map(t => {
          const isActive = activeTab === t.id
          return (
            <button key={t.id} onClick={() => navigate(t.path)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '4px 0 2px', background: 'transparent', border: 'none',
              cursor: 'pointer', color: isActive ? C.accent : C.muted,
              transition: 'color .2s', position: 'relative',
              WebkitTapHighlightColor: 'transparent',
            }}>
              <span style={{ fontSize: isActive ? 22 : 20, lineHeight: 1.2 }}>{t.icon}</span>
              <span style={{
                fontSize: 10, fontWeight: isActive ? 700 : 500,
                lineHeight: 1,
              }}>
                {t.label}
              </span>
              {isActive && (
                <div style={{
                  position: 'absolute', bottom: -2, width: 20, height: 3,
                  borderRadius: 99, background: C.accent,
                }} />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
