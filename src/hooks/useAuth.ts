import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    name: string
    role: 'member' | 'president' | 'admin'
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase not initialized. Please check your environment variables.')
        }
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user as AuthUser)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Auth check failed'
        console.error('[useAuth] Error:', errorMessage)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user) {
            setUser(session.user as AuthUser)
          } else {
            setUser(null)
          }
          setLoading(false)
        }
      )

      return () => subscription?.unsubscribe()
    } catch (err) {
      console.error('[useAuth] Subscription error:', err)
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (signInError) {
      setError(signInError.message)
      return false
    }
    return true
  }

  const register = async (
    email: string,
    password: string,
    name: string,
    role: string,
    groupCode?: string
  ) => {
    setError(null)
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          group_code: groupCode
        }
      }
    })
    if (signUpError) {
      setError(signUpError.message)
      return false
    }
    return true
  }

  const logout = async () => {
    setError(null)
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError(signOutError.message)
      return false
    }
    setUser(null)
    return true
  }

  const resetPassword = async (email: string) => {
    setError(null)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)
    if (resetError) {
      setError(resetError.message)
      return false
    }
    return true
  }

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    isAuthenticated: !!user
  }
}
