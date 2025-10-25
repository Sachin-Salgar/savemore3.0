import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

const initializeSupabase = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

  if (!supabaseUrl) {
    throw new Error(
      'VITE_SUPABASE_URL environment variable is not set. ' +
      'Please check your .env.local file or environment configuration.'
    )
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'VITE_SUPABASE_ANON_KEY environment variable is not set. ' +
      'Please check your .env.local file or environment configuration.'
    )
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  console.log('[Supabase] Successfully initialized')
  return supabaseInstance
}

export const getSupabase = (): SupabaseClient => {
  return initializeSupabase()
}

export const supabase = new Proxy({} as SupabaseClient, {
  get: (_target, prop) => {
    const instance = initializeSupabase()
    return (instance as any)[prop]
  }
})
