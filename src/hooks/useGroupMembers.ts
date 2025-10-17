import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface GroupMember {
  id: string
  user_id: string
  role: string
  status: string
  total_savings: number
  is_active: boolean
  joined_at: string
}

export function useGroupMembers(groupId?: string) {
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = async () => {
    if (!groupId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setMembers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members')
    } finally {
      setLoading(false)
    }
  }

  const approveMember = async (memberId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('group_members')
        .update({ status: 'approved' })
        .eq('id', memberId)

      if (updateError) throw updateError

      await fetchMembers()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve member')
      return false
    }
  }

  const rejectMember = async (memberId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('group_members')
        .update({ status: 'rejected' })
        .eq('id', memberId)

      if (updateError) throw updateError

      await fetchMembers()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject member')
      return false
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [groupId])

  return {
    members,
    loading,
    error,
    approveMember,
    rejectMember,
    refetch: fetchMembers
  }
}
