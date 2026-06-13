import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/pages/AppRouter'
import { useThemeStore } from '@/stores/themeStore'
import { useEffect } from 'react'

export default function App() {
  const { isDark } = useThemeStore()

  // Sync dark class ke <html> untuk Tailwind darkMode: 'class'
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}
