import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

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
        const supabase = getSupabase()
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
      const supabase = getSupabase()
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
    try {
      const supabase = getSupabase()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (signInError) {
        const errorMsg = signInError.message || 'Login failed. Please try again.'
        setError(errorMsg)
        console.error('[useAuth] Sign in error:', errorMsg)
        return false
      }
      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error. Please check your connection and try again.'
      setError(errorMsg)
      console.error('[useAuth] Login error:', errorMsg)
      return false
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string,
    role: string,
    groupCode?: string
  ) => {
    setError(null)
    try {
      const supabase = getSupabase()
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
        const errorMsg = signUpError.message || 'Registration failed. Please try again.'
        setError(errorMsg)
        console.error('[useAuth] Sign up error:', errorMsg)
        return false
      }
      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error during registration.'
      setError(errorMsg)
      console.error('[useAuth] Register error:', errorMsg)
      return false
    }
  }

  const logout = async () => {
    setError(null)
    try {
      const supabase = getSupabase()
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        const errorMsg = signOutError.message || 'Logout failed.'
        setError(errorMsg)
        console.error('[useAuth] Sign out error:', errorMsg)
        return false
      }
      setUser(null)
      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Logout error.'
      setError(errorMsg)
      console.error('[useAuth] Logout error:', errorMsg)
      return false
    }
  }

  const resetPassword = async (email: string) => {
    setError(null)
    try {
      const supabase = getSupabase()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)
      if (resetError) {
        const errorMsg = resetError.message || 'Password reset failed.'
        setError(errorMsg)
        console.error('[useAuth] Reset error:', errorMsg)
        return false
      }
      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error during password reset.'
      setError(errorMsg)
      console.error('[useAuth] Reset error:', errorMsg)
      return false
    }
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
