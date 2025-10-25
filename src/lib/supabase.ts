import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

const initializeSupabase = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance

  let supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl) {
    supabaseUrl = supabaseUrl.trim().replace(/^["']|["']$/g, '')
  }
  if (supabaseAnonKey) {
    supabaseAnonKey = supabaseAnonKey.trim().replace(/^["']|["']$/g, '')
  }

  console.log('[Supabase] URL:', supabaseUrl)
  console.log('[Supabase] Key present:', !!supabaseAnonKey)

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

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    console.log('[Supabase] Successfully initialized')
    return supabaseInstance
  } catch (error) {
    console.error('[Supabase] Failed to initialize:', error)
    throw error
  }
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
