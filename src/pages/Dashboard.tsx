import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSavings } from '@/hooks/useSavings'
import { useLoans } from '@/hooks/useLoans'
import { useGroup } from '@/hooks/useGroup'
import Layout from '@/components/Layout'
import { formatCurrency } from '@/utils/calculations'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const { user } = useAuth()
  const [groupId, setGroupId] = useState<string | null>(null)
  const [nextPaymentDue, setNextPaymentDue] = useState<string | null>(null)
  const { totalSavings } = useSavings()
  const { activeLoans } = useLoans()
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
          // Calculate next payment due
          const today = new Date()
          const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
          setNextPaymentDue(nextMonth.toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }))
        }
      } catch (error) {
        console.error('Failed to fetch group:', error)
      }
    }

    if (user?.id) {
      fetchUserGroup()
    }
  }, [user?.id])

  return (
    <Layout>
      <div className="space-y-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.user_metadata?.name || 'Member'}!
          </h1>
          <p className="text-gray-600 mt-1">Here's your financial overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-gray-600 text-sm font-medium">Savings Balance</p>
            <p className="text-3xl font-bold text-primary mt-2">{formatCurrency(totalSavings)}</p>
            <p className="text-xs text-gray-500 mt-2">Total accumulated</p>
          </div>

          <div className="stat-card">
            <p className="text-gray-600 text-sm font-medium">Active Loans</p>
            <p className="text-3xl font-bold text-secondary mt-2">{activeLoans}</p>
            <p className="text-xs text-gray-500 mt-2">Loans taken</p>
          </div>

          <div className="stat-card">
            <p className="text-gray-600 text-sm font-medium">Next Payment Due</p>
            <p className="text-lg font-bold text-accent mt-2">{nextPaymentDue || '-'}</p>
            <p className="text-xs text-gray-500 mt-2">Monthly savings</p>
          </div>
        </div>

        {group && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Group Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Group Name</p>
                <p className="font-medium text-gray-900">{group.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Monthly Savings</p>
                <p className="font-medium text-gray-900">{formatCurrency(group.monthly_savings_amount)}</p>
              </div>
              <div>
                <p className="text-gray-600">Interest Rate</p>
                <p className="font-medium text-gray-900">{group.interest_rate}% p.a.</p>
              </div>
              <div>
                <p className="text-gray-600">Group Balance</p>
                <p className="font-medium text-gray-900">{formatCurrency(group.current_balance)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/savings" className="btn-primary text-center">View Savings</a>
            <a href="/loans" className="btn-secondary text-center">Apply for Loan</a>
            <a href="/transactions" className="btn-outline text-center">Transaction History</a>
            <a href="/profile" className="btn-outline text-center">Edit Profile</a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
