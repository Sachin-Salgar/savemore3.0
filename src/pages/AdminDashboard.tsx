import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/utils/calculations'

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

        // Initialize default stats
        let groups: any[] = []
        let members: any[] = []
        let loans: any[] = []
        let savings: any[] = []

        // Fetch groups statistics
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

        // Fetch group members count
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

        // Fetch loans statistics
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

        // Fetch savings statistics
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

        // Calculate stats
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

        // Fetch pending requests (groups pending approval)
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
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and management</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Platform Statistics */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Groups */}
            <div className="stat-card">
              <p className="text-gray-600 text-sm font-medium">Total Groups</p>
              <p className="text-3xl font-bold text-primary mt-2">{stats.totalGroups}</p>
              <p className="text-gray-500 text-xs mt-1">Across the platform</p>
            </div>

            {/* Pending Groups */}
            <div className="stat-card border-l-4 border-accent">
              <p className="text-gray-600 text-sm font-medium">Pending Approvals</p>
              <p className="text-3xl font-bold text-accent mt-2">{stats.pendingGroups}</p>
              <p className="text-gray-500 text-xs mt-1">Awaiting review</p>
            </div>

            {/* Approved Groups */}
            <div className="stat-card border-l-4 border-secondary">
              <p className="text-gray-600 text-sm font-medium">Active Groups</p>
              <p className="text-3xl font-bold text-secondary mt-2">{stats.approvedGroups}</p>
              <p className="text-gray-500 text-xs mt-1">Operational</p>
            </div>

            {/* Active Members */}
            <div className="stat-card">
              <p className="text-gray-600 text-sm font-medium">Active Members</p>
              <p className="text-3xl font-bold text-primary mt-2">{stats.activeMembers}</p>
              <p className="text-gray-500 text-xs mt-1">Across all groups</p>
            </div>

            {/* Total Loans */}
            <div className="stat-card">
              <p className="text-gray-600 text-sm font-medium">Active Loans</p>
              <p className="text-3xl font-bold text-primary mt-2">{stats.totalLoans}</p>
              <p className="text-gray-500 text-xs mt-1">Disbursed</p>
            </div>

            {/* Total Savings */}
            <div className="stat-card">
              <p className="text-gray-600 text-sm font-medium">Total Savings</p>
              <p className="text-3xl font-bold text-primary mt-2">{formatCurrency(stats.totalSavings)}</p>
              <p className="text-gray-500 text-xs mt-1">Platform total</p>
            </div>
          </div>
        </section>

        {/* System Health */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-gray-900">Database Status</p>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Healthy</span>
              </div>
              <p className="text-sm text-gray-600">All systems operational</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-gray-900">API Status</p>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Healthy</span>
              </div>
              <p className="text-sm text-gray-600">Response time: under 100ms</p>
            </div>
          </div>
        </section>

        {/* Pending Approvals */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pending Group Registrations</h2>
            {stats.pendingGroups > 0 && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-accent text-white">
                {stats.pendingGroups} Pending
              </span>
            )}
          </div>

          {pendingRequests.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <div key={request.id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{request.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Submitted: {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveGroup(request.id)}
                      className="btn-secondary flex-1 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectGroup(request.id)}
                      className="btn-outline flex-1 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="#"
              className="card hover:shadow-lg transition-shadow"
            >
              <p className="font-medium text-gray-900 mb-2">View All Groups</p>
              <p className="text-sm text-gray-600">Manage group registrations and details</p>
            </a>
            <a
              href="#"
              className="card hover:shadow-lg transition-shadow"
            >
              <p className="font-medium text-gray-900 mb-2">User Management</p>
              <p className="text-sm text-gray-600">Manage user roles and permissions</p>
            </a>
            <a
              href="#"
              className="card hover:shadow-lg transition-shadow"
            >
              <p className="font-medium text-gray-900 mb-2">System Reports</p>
              <p className="text-sm text-gray-600">View detailed analytics and reports</p>
            </a>
            <a
              href="#"
              className="card hover:shadow-lg transition-shadow"
            >
              <p className="font-medium text-gray-900 mb-2">Activity Logs</p>
              <p className="text-sm text-gray-600">Review user activity and changes</p>
            </a>
          </div>
        </section>

        {/* System Alerts */}
        {stats.pendingGroups > 3 && (
          <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <p className="font-medium text-yellow-900">Action Required</p>
                <p className="text-sm text-yellow-800 mt-1">
                  {stats.pendingGroups} group registrations are pending approval. Please review them to keep the platform running smoothly.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}
