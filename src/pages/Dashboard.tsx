import { useState, useEffect } from 'react'
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
      <div className="pb-4">
        {/* Header */}
        <div className="mb-8 px-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user?.user_metadata?.name?.split(' ')[0] || 'Member'}!
              </h1>
              <p className="text-gray-600 text-sm mt-1">Your financial dashboard</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xl">
              {user?.user_metadata?.name?.[0] || 'M'}
            </div>
          </div>
        </div>

        {/* Quick Stats Cards - Horizontal Scroll */}
        <div className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
            {/* Savings Card */}
            <div className="flex-shrink-0 w-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 snap-start hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Savings</p>
                  <p className="text-blue-900 text-sm text-opacity-60 mt-1">Your Balance</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
              <p className="text-3xl font-bold text-blue-900">{formatCurrency(totalSavings)}</p>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <a href="/savings" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  View Details →
                </a>
              </div>
            </div>

            {/* Loans Card */}
            <div className="flex-shrink-0 w-64 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 snap-start hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-green-600 text-xs font-semibold uppercase tracking-wider">Loans</p>
                  <p className="text-green-900 text-sm text-opacity-60 mt-1">Active Loans</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
              <p className="text-3xl font-bold text-green-900">{activeLoans}</p>
              <div className="mt-4 pt-4 border-t border-green-200">
                <a href="/loans" className="text-green-600 text-sm font-medium hover:text-green-700">
                  Apply Now →
                </a>
              </div>
            </div>

            {/* Payment Due Card */}
            <div className="flex-shrink-0 w-64 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 snap-start hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-orange-600 text-xs font-semibold uppercase tracking-wider">Next Payment</p>
                  <p className="text-orange-900 text-sm text-opacity-60 mt-1">Due Date</p>
                </div>
                <div className="text-3xl">📅</div>
              </div>
              <p className="text-2xl font-bold text-orange-900">{nextPaymentDue || '-'}</p>
              <div className="mt-4 pt-4 border-t border-orange-200">
                <a href="/dashboard" className="text-orange-600 text-sm font-medium hover:text-orange-700">
                  Pay Now →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* View Transactions */}
            <a href="/transactions" className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 hover:shadow-lg transition-all active:scale-95">
              <div className="text-2xl mb-2">📋</div>
              <p className="font-semibold text-purple-900 text-sm">Transactions</p>
              <p className="text-purple-700 text-xs mt-1">View history</p>
            </a>

            {/* Edit Profile */}
            <a href="/profile" className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200 hover:shadow-lg transition-all active:scale-95">
              <div className="text-2xl mb-2">👤</div>
              <p className="font-semibold text-pink-900 text-sm">Profile</p>
              <p className="text-pink-700 text-xs mt-1">Update details</p>
            </a>

            {/* Loan Status */}
            <a href="/loans" className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4 border border-cyan-200 hover:shadow-lg transition-all active:scale-95">
              <div className="text-2xl mb-2">💳</div>
              <p className="font-semibold text-cyan-900 text-sm">My Loans</p>
              <p className="text-cyan-700 text-xs mt-1">Loan status</p>
            </a>

            {/* Help & Support */}
            <a href="#" className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200 hover:shadow-lg transition-all active:scale-95">
              <div className="text-2xl mb-2">❓</div>
              <p className="font-semibold text-indigo-900 text-sm">Help</p>
              <p className="text-indigo-700 text-xs mt-1">Get support</p>
            </a>
          </div>
        </div>

        {/* Group Information */}
        {group && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Group Information</h2>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{group.name}</p>
                  <p className="text-gray-600 text-sm mt-1">Member since {group.created_at ? new Date(group.created_at).toLocaleDateString() : '-'}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">President:</span>
                  <span className="font-medium text-gray-900">{group.president_name || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Members:</span>
                  <span className="font-medium text-gray-900">{group.member_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h2>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 text-center">
            <p className="text-gray-600 text-sm">No recent transactions</p>
            <a href="/transactions" className="text-primary text-sm font-medium mt-2 hover:underline">
              View all transactions →
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
