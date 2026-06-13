import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore }  from '@/stores/authStore'
import { AppLayout }     from '@/components/ui/AppLayout'
import { LoginPage }     from './LoginPage'
import { RegisterPage }  from './RegisterPage'
import { HomePage }      from './HomePage'
import { PlannerPage }   from './PlannerPage'
import { HabitsPage }    from './HabitsPage'
import { StatsPage }     from './StatsPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return <SplashScreen />
  if (!user)   return <Navigate to="/login" replace />
  return <>{children}</>
}

function SplashScreen() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#0F0E17',
    }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>⚡</div>
      <div style={{
        fontSize: 28, fontWeight: 900, fontFamily: 'Inter, sans-serif',
        background: 'linear-gradient(90deg,#A78BFA,#7C6FCD)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>upday</div>
    </div>
  )
}

export function AppRouter() {
  const { loadSession } = useAuthStore()
  useEffect(() => { loadSession() }, [loadSession])

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index          element={<HomePage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="habits"  element={<HabitsPage />} />
        <Route path="stats"   element={<StatsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}