import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'

export function LoginPage() {
  const { theme: C } = useThemeStore()
  const { signIn } = useAuthStore()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin() {
    if (!email || !password) { setError('Isi email dan password'); return }
    setLoading(true); setError('')
    const err = await signIn(email, password)
    setLoading(false)
    if (err) setError(err)
    else navigate('/')
  }

  const iStyle: React.CSSProperties = {
    width: '100%', background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 12, color: C.text, fontSize: 15, padding: '12px 14px',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100dvh', background: C.bg, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>⚡</div>
        <div style={{ fontSize: 32, fontWeight: 900,
          background: `linear-gradient(90deg,${C.accent},${C.primary})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          upday
        </div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>
          Habit · Task · Planner — semua di satu tempat
        </div>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 380, background: C.surface, borderRadius: 20,
        padding: '28px 24px', border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 24 }}>Masuk</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input value={email} onChange={e => setEmail(e.target.value)}
            type="email" placeholder="Email" style={iStyle}/>
          <input value={password} onChange={e => setPassword(e.target.value)}
            type="password" placeholder="Password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()} style={iStyle}/>

          {error && (
            <div style={{ fontSize: 12, color: C.rose, background: `${C.rose}18`,
              borderRadius: 8, padding: '8px 12px' }}>{error}</div>
          )}

          <button onClick={handleLogin} disabled={loading} style={{
            width: '100%', padding: '13px', borderRadius: 12,
            background: loading ? C.muted : C.primary, color: C.white,
            border: 'none', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background .2s',
          }}>
            {loading ? 'Masuk...' : 'Masuk →'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: C.muted }}>
          Belum punya akun?{' '}
          <Link to="/register" style={{ color: C.accent, fontWeight: 700, textDecoration: 'none' }}>
            Daftar
          </Link>
        </div>
      </div>
    </div>
  )
}
