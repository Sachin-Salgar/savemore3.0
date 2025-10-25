import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGroupMembers } from '@/hooks/useGroupMembers'
import Layout from '@/components/Layout'
import AddMembersModal from '@/components/AddMembersModal'
import { formatCurrency, formatDate } from '@/utils/calculations'
import { supabase } from '@/lib/supabase'

export default function Members() {
  const { user } = useAuth()
  const [groupId, setGroupId] = useState<string | null>(null)
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const { members, loading, approveMember, rejectMember, refetch } = useGroupMembers(groupId || undefined)

  useEffect(() => {
    const fetchPresidentGroup = async () => {
      try {
        const { data } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user?.id)
          .eq('role', 'president')
          .single()

        if (data) {
          setGroupId(data.group_id)
        }
      } catch (error) {
        console.error('Failed to fetch group:', error)
      }
    }

    if (user?.id) {
      fetchPresidentGroup()
    }
  }, [user?.id])

  if (loading) {
    return <Layout><div className="text-center py-8">Loading...</div></Layout>
  }

  const pendingMembers = members.filter(m => m.status === 'pending')
  const approvedMembers = members.filter(m => m.status === 'approved')

  const handleAddMembersSuccess = () => {
    setShowAddMembersModal(false)
    refetch()
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Members Management</h1>
            <p className="text-gray-600 mt-1">Manage your group members</p>
          </div>
          <button
            onClick={() => setShowAddMembersModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            + Add Members
          </button>
        </div>

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

        {pendingMembers.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Pending Approvals</h3>
            <div className="space-y-3">
              {pendingMembers.map(member => (
                <div key={member.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900">Member ID: {member.id.substring(0, 8)}</p>
                      <p className="text-sm text-gray-600 mt-1">Joined: {formatDate(member.joined_at)}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveMember(member.id)}
                      className="btn-secondary flex-1 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectMember(member.id)}
                      className="btn-outline flex-1 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                      <p className="font-medium text-gray-900">Active Member</p>
                      <p className="text-sm text-gray-600">Savings: {formatCurrency(member.total_savings)}</p>
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
      </div>
    </Layout>
  )
}
