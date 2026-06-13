import { useThemeStore } from '@/stores/themeStore'
import { useData }        from '@/hooks/useData'
import { useStats }       from '@/hooks/useStats'
import { Spinner }        from '@/components/ui/primitives'

export function StatsPage() {
  const { theme: C } = useThemeStore()
  const { loading }  = useData()
  const stats        = useStats()

  if (loading) return <Spinner C={C} />

  const {
    doneTaskCount, totalTaskCount, taskPct,
    doneHabitCount, totalHabitCount,
    bestStreak, recurringCount,
    productivityScore, weekData,
  } = stats

  const maxBar = Math.max(...weekData.map(d => Math.max(d.tasks, d.habits)), 1)

  return (
    <div style={{ padding: '20px 20px 24px' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Statistik</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Minggu ini</div>

      {/* ── Productivity score card ── */}
      <div style={{
        background: `linear-gradient(135deg,${C.primary},${C.glow})`,
        borderRadius: 20, padding: '20px 24px', marginBottom: 16,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -20, top: -20, width: 100, height: 100,
          borderRadius: '50%', background: 'rgba(255,255,255,.08)',
        }} />
        <div style={{ position: 'absolute', right: 40, bottom: -30, width: 80, height: 80,
          borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', fontWeight: 600, marginBottom: 4, letterSpacing: 1 }}>
          PRODUCTIVITY SCORE
        </div>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
          {productivityScore}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginTop: 6 }}>
          Task {taskPct}% · Habit {totalHabitCount ? Math.round((doneHabitCount/totalHabitCount)*100) : 0}%
        </div>
      </div>

      {/* ── Stat cards 2x2 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Task Selesai',   val: `${doneTaskCount}/${totalTaskCount}`, icon: '✅', color: C.emerald },
          { label: 'Habit Selesai',  val: `${doneHabitCount}/${totalHabitCount}`, icon: '🔥', color: C.amber  },
          { label: 'Streak Terbaik', val: `${bestStreak} hari`,  icon: '⚡', color: C.accent  },
          { label: 'Task Berulang',  val: `${recurringCount}`,   icon: '🔄', color: C.primary },
        ].map(s => (
          <div key={s.label} style={{
            background: C.card, borderRadius: 14, padding: '14px 12px',
            border: `1px solid ${C.border}`, boxShadow: C.shadow,
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Weekly bar chart ── */}
      <div style={{
        background: C.surface, borderRadius: 14, padding: 16,
        border: `1px solid ${C.border}`, boxShadow: C.shadow, marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 16, letterSpacing: .5 }}>
          TASK & HABIT PER HARI
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110 }}>
          {weekData.map(d => (
            <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 88 }}>
                <div style={{
                  flex: 1, borderRadius: '4px 4px 0 0', background: C.primary,
                  height: `${(d.tasks / maxBar) * 100}%`, minHeight: 2, transition: 'height .5s',
                }} />
                <div style={{
                  flex: 1, borderRadius: '4px 4px 0 0', background: C.emerald,
                  height: `${(d.habits / maxBar) * 100}%`, minHeight: 2, transition: 'height .5s',
                }} />
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>{d.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          {[{ bg: C.primary, l: 'Task' }, { bg: C.emerald, l: 'Habit' }].map(x => (
            <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: x.bg }} />
              <span style={{ fontSize: 10, color: C.muted }}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Task completion bar ── */}
      <div style={{
        background: C.surface, borderRadius: 14, padding: 16,
        border: `1px solid ${C.border}`, boxShadow: C.shadow,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 12, letterSpacing: .5 }}>
          PROGRESS HARI INI
        </div>
        {[
          { label: 'Task',  pct: taskPct,  color: C.primary, count: `${doneTaskCount}/${totalTaskCount}` },
          {
            label: 'Habit',
            pct:   totalHabitCount ? Math.round((doneHabitCount/totalHabitCount)*100) : 0,
            color: C.emerald,
            count: `${doneHabitCount}/${totalHabitCount}`,
          },
        ].map(item => (
          <div key={item.label} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.label}</span>
              <span style={{ fontSize: 12, color: C.muted }}>{item.count}</span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: C.border, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99, background: item.color,
                width: `${item.pct}%`, transition: 'width .6s cubic-bezier(.4,0,.2,1)',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
