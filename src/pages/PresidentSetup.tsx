import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useGroupManagement } from '@/hooks/useGroupManagement'
import Layout from '@/components/Layout'

export default function PresidentSetup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<'create' | 'review'>('create')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { createGroup, assignGroupToPresident } = useGroupManagement()

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    monthlyAmount: '',
    interestRate: '12'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'code' ? value.toUpperCase() : value
    }))
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!formData.name.trim() || !formData.code.trim()) {
        throw new Error('Group name and code are required')
      }

      // Create the group
      const groupId = await createGroup({
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        monthlyAmount: formData.monthlyAmount ? parseFloat(formData.monthlyAmount) : undefined,
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : 12
      })

      if (!groupId) {
        throw new Error('Failed to create group')
      }

      // Assign president to group
      if (!user?.id) {
        throw new Error('User not found')
      }

      const assigned = await assignGroupToPresident(groupId, user.id)

      if (!assigned) {
        throw new Error('Failed to assign group to president')
      }

      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to setup group'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.user_metadata?.name}!</h1>
          <p className="text-gray-600 mt-2">Let's set up your Self Help Group</p>
        </div>

        <div className="card">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div className={`flex-1 text-center pb-4 ${step === 'create' ? 'border-b-2 border-primary' : 'border-b-2 border-gray-200'}`}>
                <div className={`text-2xl mb-2 ${step === 'create' ? 'text-primary' : 'text-gray-400'}`}>
                  1
                </div>
                <p className={`text-sm font-medium ${step === 'create' ? 'text-primary' : 'text-gray-600'}`}>
                  Group Details
                </p>
              </div>
              <div className={`flex-1 text-center pb-4 ${step === 'review' ? 'border-b-2 border-primary' : 'border-b-2 border-gray-200'}`}>
                <div className={`text-2xl mb-2 ${step === 'review' ? 'text-primary' : 'text-gray-400'}`}>
                  2
                </div>
                <p className={`text-sm font-medium ${step === 'review' ? 'text-primary' : 'text-gray-600'}`}>
                  Review & Confirm
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateGroup} className="space-y-4">
            {step === 'create' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Women's Savings Group"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is the official name of your SHG
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Code (Unique) *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g., MADHURANGAN"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Members will use this code to join your group
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your group's mission and goals..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Savings Amount (Optional)
                    </label>
                    <input
                      type="number"
                      name="monthlyAmount"
                      value={formData.monthlyAmount}
                      onChange={handleChange}
                      placeholder="500"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate (%) *
                    </label>
                    <input
                      type="number"
                      name="interestRate"
                      value={formData.interestRate}
                      onChange={handleChange}
                      step="0.5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (formData.name.trim() && formData.code.trim()) {
                      setStep('review')
                    } else {
                      setError('Please fill in required fields')
                    }
                  }}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Next: Review Details →
                </button>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Group Name</p>
                    <p className="text-lg font-semibold text-gray-900">{formData.name}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600">Group Code</p>
                    <p className="text-lg font-semibold text-gray-900">{formData.code}</p>
                  </div>

                  {formData.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Description</p>
                      <p className="text-gray-700">{formData.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-blue-200">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Savings</p>
                      <p className="text-gray-900">{formData.monthlyAmount || 'Not set'}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Interest Rate</p>
                      <p className="text-gray-900">{formData.interestRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    ✓ Once created, your group will be ready to accept members. Members will use the group code to request to join.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('create')}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Creating Group...' : 'Create & Continue'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Need help?</strong> A Self Help Group (SHG) is a community-based organization where members save together and provide loans to each other. You'll manage all group activities and member approvals.
          </p>
        </div>
      </div>
    </Layout>
  )
}
