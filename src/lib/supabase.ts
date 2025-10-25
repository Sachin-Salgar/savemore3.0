import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

const cleanEnvVar = (value: any): string => {
  if (!value) return ''
  let cleaned = String(value)
  cleaned = cleaned.trim()
  cleaned = cleaned.replace(/^["'`]|["'`]$/g, '')
  cleaned = cleaned.trim()
  return cleaned
}

const initializeSupabase = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance

  const rawUrl = import.meta.env.VITE_SUPABASE_URL
  const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const supabaseUrl = cleanEnvVar(rawUrl)
  const supabaseAnonKey = cleanEnvVar(rawKey)

  console.log('[Supabase] Raw URL:', rawUrl)
  console.log('[Supabase] Cleaned URL:', supabaseUrl)
  console.log('[Supabase] URL valid:', supabaseUrl.startsWith('http'))
  console.log('[Supabase] Key present:', !!supabaseAnonKey)

  if (!supabaseUrl) {
    throw new Error(
      'VITE_SUPABASE_URL environment variable is not set. ' +
      'Please check your .env.local file or environment configuration.'
    )
  }

  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    throw new Error(
      `Invalid VITE_SUPABASE_URL: "${supabaseUrl}" does not start with http:// or https://. ` +
      'Please check your environment configuration.'
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
    console.log('[Supabase] Successfully initialized with URL:', supabaseUrl.substring(0, 50))
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
