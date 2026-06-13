import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { DbProfile } from '@/types/database'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user:    User | null
  session: Session | null
  profile: DbProfile | null
  loading: boolean
  // Actions
  signIn:   (email: string, password: string) => Promise<string | null>
  signUp:   (email: string, password: string, name: string) => Promise<string | null>
  signOut:  () => Promise<void>
  loadSession: () => Promise<void>
  updateProfile: (data: Partial<DbProfile>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:    null,
  session: null,
  profile: null,
  loading: true,

  loadSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      set({ user: session.user, session, profile, loading: false })
    } else {
      set({ loading: false })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        set({ user: session.user, session, profile })
      } else {
        set({ user: null, session: null, profile: null })
      }
    })
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  },

  signUp: async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    })
    return error ? error.message : null
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null })
  },

  updateProfile: async (data) => {
    const { user } = get()
    if (!user) return
    const { data: updated } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single()
    if (updated) set({ profile: updated })
  },
}))