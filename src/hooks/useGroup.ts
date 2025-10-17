import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Group {
  id: string
  name: string
  code: string
  status: string
  current_balance: number
  monthly_savings_amount: number
  interest_rate: number
  created_at: string
}

export function useGroup(groupId?: string) {
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single()

        if (fetchError) {
          setError(fetchError.message)
          return
        }

        setGroup(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch group')
      } finally {
        setLoading(false)
      }
    }

    fetchGroup()
  }, [groupId])

  return {
    group,
    loading,
    error
  }
}
