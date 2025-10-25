import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'

export interface MemberInput {
  email: string
  name: string
  phone?: string
}

export interface AddMembersResult {
  success: number
  failed: number
  errors: Array<{ email: string; error: string }>
}

export function useAddMembers() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addMember = async (
    groupId: string,
    memberData: MemberInput
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabase()

      // Generate a temporary password
      const tempPassword = Math.random().toString(36).substring(2, 15) +
                          Math.random().toString(36).substring(2, 15)

      // Create new user via auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: memberData.email,
        password: tempPassword,
        options: {
          data: {
            name: memberData.name,
            role: 'member'
          }
        }
      })

      if (signUpError) {
        throw new Error(`Failed to create user: ${signUpError.message}`)
      }

      if (!authData.user?.id) {
        throw new Error('Failed to get user ID from signup')
      }

      const userId = authData.user.id

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          full_name: memberData.name,
          phone_number: memberData.phone
        })

      if (profileError && profileError.code !== '23505') {
        console.warn('Failed to create user profile:', profileError)
      }

      // Add member to group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member',
          status: 'pending'
        })

      if (memberError) {
        if (memberError.code === '23505') {
          throw new Error('Member is already part of this group')
        }
        throw new Error(`Failed to add member: ${memberError.message}`)
      }

      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add member'
      setError(errorMsg)
      console.error('Add member error:', errorMsg)
      return false
    } finally {
      setLoading(false)
    }
  }

  const addMultipleMembers = async (
    groupId: string,
    members: MemberInput[]
  ): Promise<AddMembersResult> => {
    setLoading(true)
    setError(null)

    const results: AddMembersResult = {
      success: 0,
      failed: 0,
      errors: []
    }

    for (const member of members) {
      try {
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(member.email)) {
          results.failed++
          results.errors.push({ email: member.email, error: 'Invalid email format' })
          continue
        }

        // Validate name
        if (!member.name || member.name.trim().length === 0) {
          results.failed++
          results.errors.push({ email: member.email, error: 'Name is required' })
          continue
        }

        const success = await addMember(groupId, member)
        if (success) {
          results.success++
        } else {
          results.failed++
          results.errors.push({ email: member.email, error: error || 'Failed to add member' })
        }
      } catch (err) {
        results.failed++
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        results.errors.push({ email: member.email, error: errorMsg })
      }
    }

    setLoading(false)
    return results
  }

  return {
    addMember,
    addMultipleMembers,
    loading,
    error,
    setError
  }
}
