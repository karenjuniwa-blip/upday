import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { makeTheme, type AppTheme } from '@/lib/theme'

interface ThemeState {
  isDark: boolean
  theme:  AppTheme
  toggle: () => void
  setDark: (dark: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: true,
      theme:  makeTheme(true),
      toggle: () =>
        set((s) => ({
          isDark: !s.isDark,
          theme:  makeTheme(!s.isDark),
        })),
      setDark: (dark: boolean) =>
        set({ isDark: dark, theme: makeTheme(dark) }),
    }),
    { name: 'upday-theme' }
  )
)