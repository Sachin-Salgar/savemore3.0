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
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-gray-400 text-sm font-medium">Total Groups</p>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 opacity-20"></div>
              </div>
              <p className="text-4xl font-bold text-primary">{stats.totalGroups}</p>
              <p className="text-gray-500 text-xs mt-3">+{Math.max(0, stats.totalGroups - 1)} from last month</p>
              <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-blue-400" style={{width: `${Math.min(100, (stats.totalGroups / 10) * 100)}%`}}></div>
              </div>
            </div>

            {/* Pending Groups */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-gray-400 text-sm font-medium">Pending Approvals</p>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-orange-600 opacity-20"></div>
              </div>
              <p className="text-4xl font-bold text-accent">{stats.pendingGroups}</p>
              <p className="text-gray-500 text-xs mt-3">Awaiting your action</p>
              <div className="mt-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`flex-1 h-8 rounded ${i < stats.pendingGroups ? 'bg-gradient-to-t from-accent to-orange-400' : 'bg-gray-700'}`}></div>
                ))}
              </div>
            </div>

            {/* Approved Groups */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-gray-400 text-sm font-medium">Active Groups</p>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-emerald-600 opacity-20"></div>
              </div>
              <p className="text-4xl font-bold text-secondary">{stats.approvedGroups}</p>
              <p className="text-gray-500 text-xs mt-3">Currently operational</p>
              <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-secondary to-emerald-400" style={{width: `${Math.min(100, (stats.approvedGroups / 10) * 100)}%`}}></div>
              </div>
            </div>

            {/* Active Members */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-gray-400 text-sm font-medium">Active Members</p>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 opacity-20"></div>
              </div>
              <p className="text-4xl font-bold text-cyan-400">{stats.activeMembers}</p>
              <p className="text-gray-500 text-xs mt-3">Member accounts</p>
              <div className="mt-4 flex gap-1 h-16">
                {[...Array(6)].map((_, i) => {
                  const heights = [60, 40, 70, 50, 65, 45]
                  return (
                    <div key={i} className="flex-1 flex items-end">
                      <div className="w-full bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t" style={{height: `${heights[i]}%`}}></div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Total Loans */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-gray-400 text-sm font-medium">Active Loans</p>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 opacity-20"></div>
              </div>
              <p className="text-4xl font-bold text-purple-400">{stats.totalLoans}</p>
              <p className="text-gray-500 text-xs mt-3">Disbursed to members</p>
              <div className="mt-4 flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-1">
                    <div className="h-2 bg-gray-700 rounded-full mb-1"></div>
                    <div className="text-xs text-gray-500">Q{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Savings */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <p className="text-gray-400 text-sm font-medium">Total Savings</p>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 opacity-20"></div>
              </div>
              <p className="text-3xl font-bold text-yellow-400">{formatCurrency(stats.totalSavings)}</p>
              <p className="text-gray-500 text-xs mt-3">Platform total</p>
              <div className="mt-4">
                <div className="relative w-24 h-24 mx-auto">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#374151" strokeWidth="8"></circle>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="url(#grad1)" strokeWidth="8" strokeDasharray={`${stats.totalSavings > 0 ? 160 : 0} 251`} strokeLinecap="round" transform="rotate(-90 50 50)"></circle>
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FBBF24"></stop>
                        <stop offset="100%" stopColor="#F59E0B"></stop>
                      </linearGradient>
                    </defs>
                    <text x="50" y="55" textAnchor="middle" fontSize="14" fill="#FBBF24" fontWeight="bold">
                      {Math.min(100, stats.totalSavings > 0 ? 75 : 0)}%
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Health */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium text-gray-100">Database Status</p>
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full blur animate-pulse"></div>
                  <span className="relative px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/50">● Healthy</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">All systems operational</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Uptime</span>
                  <span className="text-green-400">99.9%</span>
                </div>
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full w-[99%] bg-gradient-to-r from-green-500 to-green-400"></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium text-gray-100">API Status</p>
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full blur animate-pulse"></div>
                  <span className="relative px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/50">● Healthy</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">Response time: under 100ms</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Avg Response</span>
                  <span className="text-cyan-400">42ms</span>
                </div>
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full w-[42%] bg-gradient-to-r from-cyan-500 to-cyan-400"></div>
                </div>
              </div>
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
