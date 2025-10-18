import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'
import { formatCurrency, formatDate } from '@/utils/calculations'

interface GroupStats {
  memberCount: number
  totalSavings: number
  activeLoans: number
  pendingApprovals: number
  groupBalance: number
}

export default function PresidentDashboard() {
  const { user } = useAuth()
  const [groupId, setGroupId] = useState<string | null>(null)
  const [groupName, setGroupName] = useState<string>('')
  const [stats, setStats] = useState<GroupStats>({
    memberCount: 0,
    totalSavings: 0,
    activeLoans: 0,
    pendingApprovals: 0,
    groupBalance: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPresidentData = async () => {
      try {
        setLoading(true)
        
        // Get president's group
        const { data: presidentData } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user?.id)
          .eq('role', 'president')
          .single()

        if (!presidentData) {
          setLoading(false)
          return
        }

        setGroupId(presidentData.group_id)

        // Get group details
        const { data: groupData } = await supabase
          .from('groups')
          .select('name')
          .eq('id', presidentData.group_id)
          .single()

        if (groupData) {
          setGroupName(groupData.name)
        }

        // Get members count
        const { data: membersData } = await supabase
          .from('group_members')
          .select('id, status')
          .eq('group_id', presidentData.group_id)

        const memberCount = membersData?.length || 0
        const pendingApprovals = membersData?.filter(m => m.status === 'pending').length || 0

        // Get savings data
        const { data: savingsData } = await supabase
          .from('savings')
          .select('amount')
          .eq('group_id', presidentData.group_id)

        const totalSavings = savingsData?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0

        // Get loans data
        const { data: loansData } = await supabase
          .from('loans')
          .select('id, status')
          .eq('group_id', presidentData.group_id)

        const activeLoans = loansData?.filter(l => l.status === 'active').length || 0

        setStats({
          memberCount,
          totalSavings,
          activeLoans,
          pendingApprovals,
          groupBalance: totalSavings
        })
      } catch (error) {
        console.error('Failed to fetch president data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchPresidentData()
    }
  }, [user?.id])

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="pb-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {groupName || 'Group'} Management
              </h1>
              <p className="text-gray-600 text-sm mt-1">President Dashboard</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-emerald-600 flex items-center justify-center text-white text-xl">
              👑
            </div>
          </div>
        </div>

        {/* Quick Stats - Horizontal Scroll */}
        <div className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
            {/* Total Members */}
            <div className="flex-shrink-0 w-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 snap-start hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Members</p>
                  <p className="text-blue-900 text-sm text-opacity-60 mt-1">Total Active</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
              <p className="text-3xl font-bold text-blue-900">{stats.memberCount}</p>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <a href="/members" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  Manage Members →
                </a>
              </div>
            </div>

            {/* Group Balance */}
            <div className="flex-shrink-0 w-64 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 snap-start hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-green-600 text-xs font-semibold uppercase tracking-wider">Balance</p>
                  <p className="text-green-900 text-sm text-opacity-60 mt-1">Group Savings</p>
                </div>
                <div className="text-3xl">💵</div>
              </div>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.groupBalance)}</p>
              <div className="mt-4 pt-4 border-t border-green-200">
                <a href="#" className="text-green-600 text-sm font-medium hover:text-green-700">
                  Details →
                </a>
              </div>
            </div>

            {/* Active Loans */}
            <div className="flex-shrink-0 w-64 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200 snap-start hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-purple-600 text-xs font-semibold uppercase tracking-wider">Loans</p>
                  <p className="text-purple-900 text-sm text-opacity-60 mt-1">Active</p>
                </div>
                <div className="text-3xl">💳</div>
              </div>
              <p className="text-3xl font-bold text-purple-900">{stats.activeLoans}</p>
              <div className="mt-4 pt-4 border-t border-purple-200">
                <a href="#" className="text-purple-600 text-sm font-medium hover:text-purple-700">
                  Review Loans →
                </a>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="flex-shrink-0 w-64 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 snap-start hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-orange-600 text-xs font-semibold uppercase tracking-wider">Pending</p>
                  <p className="text-orange-900 text-sm text-opacity-60 mt-1">Approvals</p>
                </div>
                <div className="text-3xl">⏳</div>
              </div>
              <p className="text-3xl font-bold text-orange-900">{stats.pendingApprovals}</p>
              <div className="mt-4 pt-4 border-t border-orange-200">
                <a href="/members" className="text-orange-600 text-sm font-medium hover:text-orange-700">
                  Review Now →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Management Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Management</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Add Member */}
            <a href="/members" className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all active:scale-95">
              <div className="text-2xl mb-2">➕</div>
              <p className="font-semibold text-blue-900 text-sm">Add Member</p>
              <p className="text-blue-700 text-xs mt-1">New registration</p>
            </a>

            {/* Record Payment */}
            <a href="#" className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-lg transition-all active:scale-95">
              <div className="text-2xl mb-2">💰</div>
              <p className="font-semibold text-green-900 text-sm">Deposits</p>
              <p className="text-green-700 text-xs mt-1">Record payment</p>
            </a>

            {/* Loan Approvals */}
            <a href="#" className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 hover:shadow-lg transition-all active:scale-95">
              <div className="text-2xl mb-2">✓</div>
              <p className="font-semibold text-purple-900 text-sm">Approvals</p>
              <p className="text-purple-700 text-xs mt-1">Loan requests</p>
            </a>

            {/* Generate Report */}
            <a href="#" className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200 hover:shadow-lg transition-all active:scale-95">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-semibold text-amber-900 text-sm">Reports</p>
              <p className="text-amber-700 text-xs mt-1">Monthly summary</p>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {stats.pendingApprovals > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-orange-900">{stats.pendingApprovals} Pending Approvals</p>
                    <p className="text-orange-700 text-sm">Member registrations awaiting review</p>
                  </div>
                  <div className="text-2xl">⚠️</div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <p className="text-gray-600 text-sm text-center">
                Last updated: {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
