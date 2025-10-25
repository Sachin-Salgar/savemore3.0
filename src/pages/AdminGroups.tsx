import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { useGroupManagement } from '@/hooks/useGroupManagement'
import { formatDate } from '@/utils/calculations'
import { supabase } from '@/lib/supabase'

interface Group {
  id: string
  name: string
  code: string
  status: string
  created_at: string
  monthly_savings_amount: number
  interest_rate: number
}

interface President {
  id: string
  full_name: string
  email: string
}

export default function AdminGroups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [presidents, setPresidents] = useState<President[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [selectedPresidentId, setSelectedPresidentId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { createGroup, assignGroupToPresident, getGroupsByStatus } = useGroupManagement()

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    monthlyAmount: '',
    interestRate: '12'
  })

  useEffect(() => {
    fetchGroups()
    fetchPresidents()
  }, [])

  const fetchGroups = async () => {
    try {
      const data = await getGroupsByStatus()
      setGroups(data as Group[])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch groups'
      setError(errorMsg)
    }
  }

  const fetchPresidents = async () => {
    try {
      // Get all users
      const { data: authUsers } = await supabase.auth.admin.listUsers()

      if (!authUsers) {
        setPresidents([])
        return
      }

      const presidentList: President[] = []

      for (const user of authUsers.users) {
        // Check if user is president
        if (user.user_metadata?.role === 'president') {
          // Check if they don't have a group assigned
          const { data: assignment } = await supabase
            .from('group_members')
            .select('id')
            .eq('user_id', user.id)
            .eq('role', 'president')
            .maybeSingle()

          if (!assignment) {
            // Get user profile for name
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('full_name')
              .eq('id', user.id)
              .maybeSingle()

            presidentList.push({
              id: user.id,
              full_name: profile?.full_name || user.user_metadata?.name || 'Unknown',
              email: user.email || ''
            })
          }
        }
      }

      setPresidents(presidentList)
    } catch (err) {
      console.error('Failed to fetch presidents:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Group name and code are required')
      return
    }

    const groupId = await createGroup({
      name: formData.name,
      code: formData.code,
      description: formData.description || undefined,
      monthlyAmount: formData.monthlyAmount ? parseFloat(formData.monthlyAmount) : undefined,
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : 12
    })

    if (groupId) {
      setSuccessMessage(`Group "${formData.name}" created successfully!`)
      setFormData({
        name: '',
        code: '',
        description: '',
        monthlyAmount: '',
        interestRate: '12'
      })
      setShowCreateForm(false)
      fetchGroups()
    }
  }

  const handleAssignPresident = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!selectedGroupId || !selectedPresidentId) {
      setError('Please select both a group and president')
      return
    }

    const success = await assignGroupToPresident(selectedGroupId, selectedPresidentId)

    if (success) {
      const group = groups.find(g => g.id === selectedGroupId)
      const president = presidents.find(p => p.id === selectedPresidentId)
      setSuccessMessage(`Group "${group?.name}" assigned to "${president?.full_name}" successfully!`)
      setShowAssignForm(false)
      setSelectedGroupId('')
      setSelectedPresidentId('')
      fetchGroups()
      fetchPresidents()
    }
  }

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

  const unassignedGroups = groups.filter(g => {
    // Check if group has a president assigned
    return true // Will be filtered by assignment logic
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Group Management</h1>
          <p className="text-gray-600 mt-1">Create and assign groups to presidents</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            ✓ {successMessage}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="stat-card">
            <p className="text-gray-600 text-sm font-medium">Total Groups</p>
            <p className="text-3xl font-bold text-primary mt-2">{groups.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-gray-600 text-sm font-medium">Presidents Without Group</p>
            <p className="text-3xl font-bold text-accent mt-2">{presidents.length}</p>
          </div>
        </div>

        {/* Create Group Form */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Create New Group</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 text-primary hover:bg-blue-50 rounded-lg font-medium transition-colors"
            >
              {showCreateForm ? '✕ Cancel' : '+ Create Group'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateGroup} className="card space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Women's Savings Group"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Code (Unique) *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., WSG001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                />
                <p className="text-xs text-gray-500 mt-1">Code will be auto-converted to uppercase</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Group description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Savings Amount (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyAmount}
                    onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
                    placeholder="500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    placeholder="12"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Group
              </button>
            </form>
          )}
        </div>

        {/* Assign President Form */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Assign Group to President</h2>
            <button
              onClick={() => setShowAssignForm(!showAssignForm)}
              className="px-4 py-2 text-primary hover:bg-blue-50 rounded-lg font-medium transition-colors"
              disabled={presidents.length === 0 || groups.length === 0}
            >
              {showAssignForm ? '✕ Cancel' : '+ Assign'}
            </button>
          </div>

          {presidents.length === 0 && !showAssignForm && (
            <div className="card text-center py-8">
              <p className="text-gray-500">All presidents have been assigned to groups</p>
            </div>
          )}

          {showAssignForm && (
            <form onSubmit={handleAssignPresident} className="card space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Group *
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose a group...</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select President *
                </label>
                <select
                  value={selectedPresidentId}
                  onChange={(e) => setSelectedPresidentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose a president...</option>
                  {presidents.map(president => (
                    <option key={president.id} value={president.id}>
                      {president.full_name} ({president.email})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Assign Group
              </button>
            </form>
          )}
        </div>

        {/* Groups List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Groups ({groups.length})</h2>
          {groups.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500">No groups created yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map(group => (
                <div key={group.id} className="card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Code:</span> {group.code}
                        </div>
                        <div>
                          <span className="font-medium">Rate:</span> {group.interest_rate}%
                        </div>
                        <div>
                          <span className="font-medium">Monthly:</span> {group.monthly_savings_amount || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(group.created_at)}
                        </div>
                      </div>
                      {group.description && (
                        <p className="text-sm text-gray-600 mt-2">{group.description}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      group.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {group.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
