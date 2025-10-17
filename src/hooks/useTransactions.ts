import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Transaction {
  id: string
  transaction_type: string
  amount: number
  description: string
  created_at: string
}

export function useTransactions(groupId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    if (!groupId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setTransactions(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [groupId])

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions
  }
}
