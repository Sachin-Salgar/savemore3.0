import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface SavingsRecord {
  id: string
  month_year: string
  amount: number
  status: string
  recorded_at: string
}

export function useSavings(memberId?: string) {
  const [savings, setSavings] = useState<SavingsRecord[]>([])
  const [totalSavings, setTotalSavings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSavings = async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from('savings').select('*')

      if (memberId) {
        query = query.eq('member_id', memberId)
      }

      const { data, error: fetchError } = await query.order('month_year', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setSavings(data || [])
      const total = (data || []).reduce((sum, s) => sum + s.amount, 0)
      setTotalSavings(total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch savings')
    } finally {
      setLoading(false)
    }
  }

  const addSavings = async (monthYear: string, amount: number, groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: memberData } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

      if (!memberData) throw new Error('Member not found in group')

      const { error: insertError } = await supabase.from('savings').insert({
        member_id: memberData.id,
        group_id: groupId,
        month_year: monthYear,
        amount,
        status: 'pending'
      })

      if (insertError) throw insertError

      await fetchSavings()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add savings')
      return false
    }
  }

  useEffect(() => {
    fetchSavings()
  }, [memberId])

  return {
    savings,
    totalSavings,
    loading,
    error,
    addSavings,
    refetch: fetchSavings
  }
}
