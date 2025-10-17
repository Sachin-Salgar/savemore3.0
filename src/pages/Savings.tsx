import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSavings } from '@/hooks/useSavings'
import { useGroup } from '@/hooks/useGroup'
import Layout from '@/components/Layout'
import { formatCurrency, formatDate, getMonthYear } from '@/utils/calculations'
import { supabase } from '@/lib/supabase'

export default function Savings() {
  const { user } = useAuth()
  const [groupId, setGroupId] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(getMonthYear())
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const { savings, totalSavings, loading, addSavings } = useSavings()
  const { group } = useGroup(groupId || undefined)

  useEffect(() => {
    const fetchUserGroup = async () => {
      try {
        const { data } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user?.id)
          .eq('status', 'approved')
          .single()

        if (data) {
          setGroupId(data.group_id)
        }
      } catch (error) {
        console.error('Failed to fetch group:', error)
      }
    }

    if (user?.id) {
      fetchUserGroup()
    }
  }, [user?.id])

  const handleAddSavings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupId || !amount) return

    setSaving(true)
    try {
      const success = await addSavings(selectedMonth, parseFloat(amount), groupId)
      if (success) {
        setAmount('')
        setSelectedMonth(getMonthYear())
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Layout><div className="text-center py-8">Loading...</div></Layout>
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Savings</h1>
          <p className="text-gray-600 mt-1">Track your monthly contributions</p>
        </div>

        <div className="stat-card">
          <p className="text-gray-600 text-sm font-medium">Total Savings</p>
          <p className="text-4xl font-bold text-primary mt-2">{formatCurrency(totalSavings)}</p>
          <p className="text-xs text-gray-500 mt-2">Cumulative balance</p>
        </div>

        {group && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Record Savings</h3>
            <form onSubmit={handleAddSavings} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="input-field"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ({formatCurrency(group.monthly_savings_amount)} default)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={group.monthly_savings_amount.toString()}
                  className="input-field"
                  disabled={saving}
                  step="1"
                  min="0"
                />
              </div>

              <button type="submit" disabled={saving || !amount} className="btn-primary w-full">
                {saving ? 'Recording...' : 'Record Savings'}
              </button>
            </form>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Savings History</h3>
          {savings.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500">No savings recorded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savings.map(saving => (
                <div key={saving.id} className="card flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{saving.month_year}</p>
                    <p className="text-sm text-gray-500">{saving.status}</p>
                  </div>
                  <p className="text-lg font-bold text-primary">{formatCurrency(saving.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
