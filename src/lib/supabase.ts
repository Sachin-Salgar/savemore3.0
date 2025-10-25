import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

// Log environment variables availability for debugging
if (typeof window !== 'undefined') {
  console.log('[Supabase Init] URL available:', !!supabaseUrl)
  console.log('[Supabase Init] Key available:', !!supabaseAnonKey)
}

let supabase: any = null

const initializeSupabase = () => {
  if (supabase) return supabase

  if (!supabaseUrl) {
    const error = new Error('VITE_SUPABASE_URL environment variable is not set')
    console.error('[Supabase Init Error]', error.message)
    throw error
  }

  if (!supabaseAnonKey) {
    const error = new Error('VITE_SUPABASE_ANON_KEY environment variable is not set')
    console.error('[Supabase Init Error]', error.message)
    throw error
  }

  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('[Supabase Init] Successfully initialized')
    return supabase
  } catch (error) {
    console.error('[Supabase Init Error]', error)
    throw error
  }
}

export const supabase = initializeSupabase()
