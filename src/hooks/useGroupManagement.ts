import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface GroupInput {
  name: string
  code: string
  description?: string
  monthlyAmount?: number
  interestRate?: number
}

export function useGroupManagement() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createGroup = async (groupData: GroupInput): Promise<string | null> => {
    setLoading(true)
    setError(null)

    try {
      // Validate group code format
      if (!groupData.code || groupData.code.trim().length === 0) {
        throw new Error('Group code is required')
      }

      // Check if code already exists
      const { data: existingGroup } = await supabase
        .from('groups')
        .select('id')
        .eq('code', groupData.code.toUpperCase())
        .maybeSingle()

      if (existingGroup) {
        throw new Error('Group code already exists')
      }

      // Get current user for created_by field
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Create the group
      const { data: newGroup, error: createError } = await supabase
        .from('groups')
        .insert({
          name: groupData.name.trim(),
          code: groupData.code.toUpperCase(),
          description: groupData.description?.trim(),
          monthly_savings_amount: groupData.monthlyAmount || 0,
          interest_rate: groupData.interestRate || 12,
          status: 'approved',
          current_balance: 0,
          created_by: user.id
        })
        .select('id')
        .single()

      if (createError) {
        throw new Error(`Failed to create group: ${createError.message}`)
      }

      if (!newGroup) {
        throw new Error('Failed to get created group ID')
      }

      return newGroup.id
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create group'
      setError(errorMsg)
      console.error('Create group error:', errorMsg)
      return null
    } finally {
      setLoading(false)
    }
  }

  const assignGroupToPresident = async (
    groupId: string,
    presidentId: string
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      // Check if president is already assigned to a group
      const { data: existingAssignment } = await supabase
        .from('group_members')
        .select('id')
        .eq('user_id', presidentId)
        .eq('role', 'president')
        .maybeSingle()

      if (existingAssignment) {
        throw new Error('President is already assigned to a group')
      }

      // Assign president to group
      const { error: assignError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: presidentId,
          role: 'president',
          status: 'approved'
        })

      if (assignError) {
        throw new Error(`Failed to assign president: ${assignError.message}`)
      }

      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to assign president'
      setError(errorMsg)
      console.error('Assign president error:', errorMsg)
      return false
    } finally {
      setLoading(false)
    }
  }

  const getGroupsByStatus = async (status?: string) => {
    try {
      let query = supabase.from('groups').select('*')

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error: fetchError } = await query.order('created_at', {
        ascending: false
      })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      return data || []
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch groups'
      setError(errorMsg)
      console.error('Fetch groups error:', errorMsg)
      return []
    }
  }

  const getPresidentsWithoutGroup = async () => {
    try {
      // Get all users with president role
      const { data: presidents, error: fetchError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          email: auth.users(email)
        `)

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      if (!presidents) {
        return []
      }

      // Filter out presidents already assigned to groups
      const filtered = []
      for (const president of presidents) {
        const { data: assignment } = await supabase
          .from('group_members')
          .select('id')
          .eq('user_id', president.id)
          .eq('role', 'president')
          .maybeSingle()

        if (!assignment) {
          filtered.push(president)
        }
      }

      return filtered
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch presidents'
      setError(errorMsg)
      console.error('Fetch presidents error:', errorMsg)
      return []
    }
  }

  const checkPresidentHasGroup = async (userId: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from('group_members')
        .select('id')
        .eq('user_id', userId)
        .eq('role', 'president')
        .maybeSingle()

      return !!data
    } catch (err) {
      console.error('Check group error:', err)
      return false
    }
  }

  return {
    createGroup,
    assignGroupToPresident,
    getGroupsByStatus,
    getPresidentsWithoutGroup,
    checkPresidentHasGroup,
    loading,
    error,
    setError
  }
}
