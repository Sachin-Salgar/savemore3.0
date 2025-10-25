import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import AddMembersModal from '@/components/AddMembersModal'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/utils/calculations'

interface Group {
  id: string
  name: string
  code: string
  status: string
}

interface GroupMember {
  id: string
  user_id: string
  group_id: string
  role: string
  status: string
  joined_at: string
  is_active: boolean
}

export default function AdminMembers() {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    if (selectedGroupId) {
      fetchMembers(selectedGroupId)
    } else {
      setMembers([])
    }
  }, [selectedGroupId])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('groups')
        .select('id, name, code, status')
        .order('name', { ascending: true })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setGroups(data || [])

      // Auto-select first group
      if (data && data.length > 0) {
        setSelectedGroupId(data[0].id)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch groups'
      setError(errorMsg)
      console.error('Fetch groups error:', errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async (groupId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setMembers(data || [])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch members'
      setError(errorMsg)
      console.error('Fetch members error:', errorMsg)
    }
  }

  const handleAddMembersSuccess = () => {
    setShowAddMembersModal(false)
    if (selectedGroupId) {
      fetchMembers(selectedGroupId)
    }
  }

  const approvedMembers = members.filter(m => m.status === 'approved')
  const pendingMembers = members.filter(m => m.status === 'pending')

  const selectedGroup = groups.find(g => g.id === selectedGroupId)

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
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Member Management</h1>
          <p className="text-gray-600 mt-1">Manage members across all groups</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {groups.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">No groups found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* Group Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Group
              </label>
              <select
                value={selectedGroupId || ''}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Choose a group...</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.code}) - {group.status}
                  </option>
                ))}
              </select>
            </div>

            {selectedGroup && (
              <>
                {/* Group Info */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-blue-900">{selectedGroup.name}</h3>
                      <p className="text-blue-700 text-sm mt-1">Code: {selectedGroup.code}</p>
                      <p className="text-blue-700 text-sm">
                        Status: <span className="font-medium capitalize">{selectedGroup.status}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddMembersModal(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                    >
                      + Add Members
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="stat-card">
                    <p className="text-gray-600 text-sm font-medium">Total Members</p>
                    <p className="text-3xl font-bold text-primary mt-2">{members.length}</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-gray-600 text-sm font-medium">Pending Approvals</p>
                    <p className="text-3xl font-bold text-accent mt-2">{pendingMembers.length}</p>
                  </div>
                </div>

                {/* Pending Members */}
                {pendingMembers.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg">Pending Approvals ({pendingMembers.length})</h3>
                    <div className="space-y-3">
                      {pendingMembers.map(member => (
                        <div key={member.id} className="card">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">User ID: {member.user_id.substring(0, 8)}</p>
                              <p className="text-sm text-gray-600 mt-1">Joined: {formatDate(member.joined_at)}</p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              Pending
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approved Members */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 text-lg">Approved Members ({approvedMembers.length})</h3>
                  {approvedMembers.length === 0 ? (
                    <div className="card text-center py-8">
                      <p className="text-gray-500">No approved members yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {approvedMembers.map(member => (
                        <div key={member.id} className="card">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">User ID: {member.user_id.substring(0, 8)}</p>
                              <p className="text-sm text-gray-600">Added: {formatDate(member.joined_at)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              member.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {member.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {showAddMembersModal && selectedGroupId && (
          <AddMembersModal
            groupId={selectedGroupId}
            onClose={() => setShowAddMembersModal(false)}
            onSuccess={handleAddMembersSuccess}
          />
        )}
      </div>
    </Layout>
  )
}
