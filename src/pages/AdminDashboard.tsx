import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/utils/calculations'
import { setupDemoGroup } from '@/utils/setupDemoData'

interface GroupStats {
  totalGroups: number
  pendingGroups: number
  approvedGroups: number
  activeMembers: number
  totalLoans: number
  totalSavings: number
}

interface PendingRequest {
  id: string
  name: string
  type: 'group' | 'president'
  email: string
  createdAt: string
  status: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<GroupStats>({
    totalGroups: 0,
    pendingGroups: 0,
    approvedGroups: 0,
    activeMembers: 0,
    totalLoans: 0,
    totalSavings: 0
  })
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        let groups: any[] = []
        let members: any[] = []
        let loans: any[] = []
        let savings: any[] = []

        try {
          const { data, error: groupsError } = await supabase
            .from('groups')
            .select('id, status, created_at')

          if (groupsError) {
            console.warn('Groups fetch warning:', groupsError)
          } else {
            groups = data || []
          }
        } catch (err) {
          console.warn('Groups fetch exception:', err)
        }

        try {
          const { data, error: membersError } = await supabase
            .from('group_members')
            .select('id, status')

          if (membersError) {
            console.warn('Members fetch warning:', membersError)
          } else {
            members = data || []
          }
        } catch (err) {
          console.warn('Members fetch exception:', err)
        }

        try {
          const { data, error: loansError } = await supabase
            .from('loans')
            .select('id, loan_amount, status')

          if (loansError) {
            console.warn('Loans fetch warning:', loansError)
          } else {
            loans = data || []
          }
        } catch (err) {
          console.warn('Loans fetch exception:', err)
        }

        try {
          const { data, error: savingsError } = await supabase
            .from('savings')
            .select('amount')

          if (savingsError) {
            console.warn('Savings fetch warning:', savingsError)
          } else {
            savings = data || []
          }
        } catch (err) {
          console.warn('Savings fetch exception:', err)
        }

        const totalGroups = groups.length
        const pendingGroups = groups.filter(g => g.status === 'pending').length
        const approvedGroups = groups.filter(g => g.status === 'approved').length
        const activeMembers = members.filter(m => m.status === 'approved').length
        const totalLoans = loans.length
        const totalSavings = savings.reduce((sum, s) => sum + (s.amount || 0), 0)

        setStats({
          totalGroups,
          pendingGroups,
          approvedGroups,
          activeMembers,
          totalLoans,
          totalSavings
        })

        const { data: pendingGroupsData, error: pendingError } = await supabase
          .from('groups')
          .select('id, name, created_at, status')
          .eq('status', 'pending')
          .limit(5)

        if (pendingError) {
          console.warn('Pending groups fetch warning:', pendingError)
        }

        const requests = (pendingGroupsData || []).map(g => ({
          id: g.id,
          name: g.name,
          type: 'group' as const,
          email: 'group@example.com',
          createdAt: g.created_at,
          status: g.status
        }))

        setPendingRequests(requests)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : JSON.stringify(err)
        console.error('Failed to fetch dashboard data:', errorMsg, err)
        setError(`Failed to load dashboard: ${errorMsg}`)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleApproveGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ status: 'approved' })
        .eq('id', groupId)

      if (error) {
        console.error('Approve error:', error)
        setError(`Failed to approve group: ${error.message}`)
        return
      }

      setPendingRequests(prev => prev.filter(r => r.id !== groupId))
      
      setStats(prev => ({
        ...prev,
        pendingGroups: Math.max(0, prev.pendingGroups - 1),
        approvedGroups: prev.approvedGroups + 1
      }))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('Failed to approve group:', errorMsg)
      setError(`Failed to approve group: ${errorMsg}`)
    }
  }

  const handleRejectGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ status: 'rejected' })
        .eq('id', groupId)

      if (error) {
        console.error('Reject error:', error)
        setError(`Failed to reject group: ${error.message}`)
        return
      }

      setPendingRequests(prev => prev.filter(r => r.id !== groupId))
      setStats(prev => ({
        ...prev,
        pendingGroups: Math.max(0, prev.pendingGroups - 1)
      }))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('Failed to reject group:', errorMsg)
      setError(`Failed to reject group: ${errorMsg}`)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
                Platform Admin
              </h1>
              <p className="text-gray-600 text-sm mt-1">System overview</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xl">
              ⚙️
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Quick Stats - Horizontal Scroll */}
        <div className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
            {/* Total Groups */}
            <div className="flex-shrink-0 w-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 snap-start hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Groups</p>
                  <p className="text-blue-900 text-sm text-opacity-60 mt-1">Total</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
              <p className="text-4xl font-bold text-blue-900">{stats.totalGroups}</p>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <a href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  View All →
                </a>
              </div>
            </div>

            {/* Active Groups */}
            <div className="flex-shrink-0 w-64 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 snap-start hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-green-600 text-xs font-semibold uppercase tracking-wider">Active</p>
                  <p className="text-green-900 text-sm text-opacity-60 mt-1">Operational</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
              <p className="text-4xl font-bold text-green-900">{stats.approvedGroups}</p>
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-green-600 text-sm font-medium">{((stats.approvedGroups / Math.max(stats.totalGroups, 1)) * 100).toFixed(0)}% approval rate</p>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="flex-shrink-0 w-64 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 snap-start hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-orange-600 text-xs font-semibold uppercase tracking-wider">Pending</p>
                  <p className="text-orange-900 text-sm text-opacity-60 mt-1">Awaiting</p>
                </div>
                <div className="text-3xl">⏳</div>
              </div>
              <p className="text-4xl font-bold text-orange-900">{stats.pendingGroups}</p>
              <div className="mt-4 pt-4 border-t border-orange-200">
                <a href="#" className="text-orange-600 text-sm font-medium hover:text-orange-700">
                  Review Now →
                </a>
              </div>
            </div>

            {/* Members */}
            <div className="flex-shrink-0 w-64 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200 snap-start hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-purple-600 text-xs font-semibold uppercase tracking-wider">Members</p>
                  <p className="text-purple-900 text-sm text-opacity-60 mt-1">Active</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
              <p className="text-4xl font-bold text-purple-900">{stats.activeMembers}</p>
              <div className="mt-4 pt-4 border-t border-purple-200">
                <p className="text-purple-600 text-sm font-medium">Across all groups</p>
              </div>
            </div>

            {/* Total Savings */}
            <div className="flex-shrink-0 w-64 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 border border-yellow-200 snap-start hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-yellow-600 text-xs font-semibold uppercase tracking-wider">Savings</p>
                  <p className="text-yellow-900 text-sm text-opacity-60 mt-1">Total</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{formatCurrency(stats.totalSavings)}</p>
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <p className="text-yellow-600 text-sm font-medium">Platform total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Management</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* View Groups */}
            <a href="/admin/groups" className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all active:scale-95">
              <div className="text-2xl mb-2">📋</div>
              <p className="font-semibold text-blue-900 text-sm">Groups</p>
              <p className="text-blue-700 text-xs mt-1">Create & assign</p>
            </a>

            {/* User Management */}
            <a href="/admin/members" className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-lg transition-all active:scale-95">
              <div className="text-2xl mb-2">👥</div>
              <p className="font-semibold text-green-900 text-sm">Members</p>
              <p className="text-green-700 text-xs mt-1">Add/manage members</p>
            </a>

            {/* System Reports */}
            <a href="#" className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 hover:shadow-lg transition-all active:scale-95">
              <div className="text-2xl mb-2">📈</div>
              <p className="font-semibold text-purple-900 text-sm">Reports</p>
              <p className="text-purple-700 text-xs mt-1">Analytics</p>
            </a>

            {/* System Health */}
            <a href="#" className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4 border border-cyan-200 hover:shadow-lg transition-all active:scale-95">
              <div className="text-2xl mb-2">🔧</div>
              <p className="font-semibold text-cyan-900 text-sm">System</p>
              <p className="text-cyan-700 text-xs mt-1">Health check</p>
            </a>
          </div>
        </div>

        {/* Pending Approvals Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
            {stats.pendingGroups > 0 && (
              <span className="relative">
                <div className="absolute inset-0 bg-orange-500 rounded-full blur animate-pulse"></div>
                <span className="relative px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-600 border border-orange-500/50">
                  {stats.pendingGroups}
                </span>
              </span>
            )}
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200 text-center">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-gray-900 font-medium">All caught up!</p>
              <p className="text-gray-600 text-sm mt-1">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <div key={request.id} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-orange-900">{request.name}</p>
                      <p className="text-orange-700 text-xs mt-1">
                        Submitted {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-600">
                      Review
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveGroup(request.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleRejectGroup(request.id)}
                      className="flex-1 px-3 py-2 rounded-lg border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 transition-all"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">System Status</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Database */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-green-900 text-sm">Database</p>
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full blur animate-pulse"></div>
                  <span className="relative w-2 h-2 rounded-full bg-green-500 block"></span>
                </div>
              </div>
              <p className="text-green-700 text-xs">Healthy</p>
            </div>

            {/* API */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-green-900 text-sm">API</p>
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full blur animate-pulse"></div>
                  <span className="relative w-2 h-2 rounded-full bg-green-500 block"></span>
                </div>
              </div>
              <p className="text-green-700 text-xs">Operational</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
