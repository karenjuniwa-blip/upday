import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL as string
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Kita gunakan <any> agar Supabase melonggarkan pengecekan tipe strict di file store
export const supabase = createClient<any>(url, key)
