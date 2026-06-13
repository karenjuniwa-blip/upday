import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'

export function RegisterPage() {
  const { theme: C } = useThemeStore()
  const { signUp } = useAuthStore()
  const navigate = useNavigate()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleRegister() {
    if (!name || !email || !password) { setError('Isi semua kolom'); return }
    if (password.length < 6) { setError('Password minimal 6 karakter'); return }
    setLoading(true); setError('')
    const err = await signUp(email, password, name)
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

      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 6 }}>⚡</div>
        <div style={{ fontSize: 30, fontWeight: 900,
          background: `linear-gradient(90deg,${C.accent},${C.primary})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          upday
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 380, background: C.surface, borderRadius: 20,
        padding: '28px 24px', border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 24 }}>Buat Akun</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Nama lengkap" style={iStyle}/>
          <input value={email} onChange={e => setEmail(e.target.value)}
            type="email" placeholder="Email" style={iStyle}/>
          <input value={password} onChange={e => setPassword(e.target.value)}
            type="password" placeholder="Password (min. 6 karakter)"
            onKeyDown={e => e.key === 'Enter' && handleRegister()} style={iStyle}/>

          {error && (
            <div style={{ fontSize: 12, color: C.rose, background: `${C.rose}18`,
              borderRadius: 8, padding: '8px 12px' }}>{error}</div>
          )}

          <button onClick={handleRegister} disabled={loading} style={{
            width: '100%', padding: '13px', borderRadius: 12,
            background: loading ? C.muted : C.primary, color: C.white,
            border: 'none', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Mendaftar...' : 'Daftar Sekarang →'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: C.muted }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color: C.accent, fontWeight: 700, textDecoration: 'none' }}>
            Masuk
          </Link>
        </div>
      </div>
    </div>
  )
}
