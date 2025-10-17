import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Loan {
  id: string
  loan_amount: number
  interest_rate: number
  repayment_period_months: number
  emi_amount: number
  status: string
  approved_at?: string
  disbursed_at?: string
  total_repaid: number
  created_at: string
}

export function useLoans(memberId?: string) {
  const [loans, setLoans] = useState<Loan[]>([])
  const [activeLoans, setActiveLoans] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLoans = async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from('loans').select('*')

      if (memberId) {
        query = query.eq('member_id', memberId)
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setLoans(data || [])
      const active = (data || []).filter(l => l.status === 'disbursed' || l.status === 'repaying').length
      setActiveLoans(active)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loans')
    } finally {
      setLoading(false)
    }
  }

  const applyLoan = async (loanAmount: number, purpose: string, repaymentPeriod: number, groupId: string) => {
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

      const { data: groupData } = await supabase
        .from('groups')
        .select('interest_rate')
        .eq('id', groupId)
        .single()

      const interestRate = groupData?.interest_rate || 0
      const emiAmount = calculateEMI(loanAmount, interestRate, repaymentPeriod)

      const { error: insertError } = await supabase.from('loans').insert({
        member_id: memberData.id,
        group_id: groupId,
        loan_amount: loanAmount,
        loan_purpose: purpose,
        interest_rate: interestRate,
        repayment_period_months: repaymentPeriod,
        emi_amount: emiAmount,
        status: 'pending'
      })

      if (insertError) throw insertError

      await fetchLoans()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply loan')
      return false
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [memberId])

  return {
    loans,
    activeLoans,
    loading,
    error,
    applyLoan,
    refetch: fetchLoans
  }
}

export function calculateEMI(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12 / 100
  if (monthlyRate === 0) return principal / months
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}
