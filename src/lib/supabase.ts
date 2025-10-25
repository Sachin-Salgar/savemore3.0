import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

let supabaseInstance: SupabaseClient | null = null
let initError: Error | null = null

const initializeSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance
  if (initError) throw initError

  try {
    if (!supabaseUrl) {
      initError = new Error(
        'VITE_SUPABASE_URL environment variable is not set. ' +
        'Please check your .env.local file or environment configuration.'
      )
      console.error('[Supabase] Init Error:', initError.message)
      throw initError
    }

    if (!supabaseAnonKey) {
      initError = new Error(
        'VITE_SUPABASE_ANON_KEY environment variable is not set. ' +
        'Please check your .env.local file or environment configuration.'
      )
      console.error('[Supabase] Init Error:', initError.message)
      throw initError
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    console.log('[Supabase] Successfully initialized')
    return supabaseInstance
  } catch (error) {
    if (error instanceof Error) {
      initError = error
    } else {
      initError = new Error('Failed to initialize Supabase')
    }
    console.error('[Supabase] Initialization failed:', initError.message)
    throw initError
  }
}

try {
  supabaseInstance = initializeSupabase()
} catch (error) {
  console.error('[Supabase] Failed to initialize at module load time:', error)
}

export const supabase = supabaseInstance as SupabaseClient
export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    if (initError) throw initError
    throw new Error('Supabase client not initialized')
  }
  return supabaseInstance
}
