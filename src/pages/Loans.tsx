import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLoans, calculateEMI } from '@/hooks/useLoans'
import { useGroup } from '@/hooks/useGroup'
import Layout from '@/components/Layout'
import { formatCurrency, calculateTotalRepayment, calculateInterestAmount } from '@/utils/calculations'
import { supabase } from '@/lib/supabase'

export default function Loans() {
  const { user } = useAuth()
  const [groupId, setGroupId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    loanAmount: '',
    purpose: '',
    repaymentPeriod: '12'
  })
  const [applying, setApplying] = useState(false)
  const { loans, activeLoans, applyLoan } = useLoans()
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
        }
      } catch (error) {
        console.error('Failed to fetch group:', error)
      }
    }

    if (user?.id) {
      fetchUserGroup()
    }
  }, [user?.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupId || !formData.loanAmount || !formData.purpose) return

    setApplying(true)
    try {
      const success = await applyLoan(
        parseFloat(formData.loanAmount),
        formData.purpose,
        parseInt(formData.repaymentPeriod),
        groupId
      )
      if (success) {
        setFormData({ loanAmount: '', purpose: '', repaymentPeriod: '12' })
        setShowForm(false)
      }
    } finally {
      setApplying(false)
    }
  }

  const calculatedEMI = formData.loanAmount && group
    ? calculateEMI(parseFloat(formData.loanAmount), group.interest_rate, parseInt(formData.repaymentPeriod))
    : 0

  const totalRepayment = calculateTotalRepayment(calculatedEMI, parseInt(formData.repaymentPeriod))
  const interestAmount = calculateInterestAmount(parseFloat(formData.loanAmount) || 0, totalRepayment)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-600 mt-1">Manage your loan applications and repayments</p>
        </div>

        <div className="stat-card">
          <p className="text-gray-600 text-sm font-medium">Active Loans</p>
          <p className="text-4xl font-bold text-secondary mt-2">{activeLoans}</p>
          <p className="text-xs text-gray-500 mt-2">Currently borrowed</p>
        </div>

        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary w-full">
            Apply for New Loan
          </button>
        )}

        {showForm && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Loan Application</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount
                </label>
                <input
                  type="number"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleChange}
                  placeholder="Enter amount in ₹"
                  className="input-field"
                  disabled={applying}
                  step="1000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="e.g., Business, Agriculture, Education"
                  className="input-field"
                  disabled={applying}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repayment Period (Months)
                </label>
                <select
                  name="repaymentPeriod"
                  value={formData.repaymentPeriod}
                  onChange={handleChange}
                  className="input-field"
                  disabled={applying}
                >
                  {[6, 12, 18, 24, 36].map(m => (
                    <option key={m} value={m}>{m} months</option>
                  ))}
                </select>
              </div>

              {formData.loanAmount && group && (
                <div className="bg-light p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly EMI:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(calculatedEMI)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(totalRepayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(interestAmount)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button type="submit" disabled={applying} className="btn-primary flex-1">
                  {applying ? 'Applying...' : 'Submit Application'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline flex-1"
                  disabled={applying}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Loan History</h3>
          {loans.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500">No loans yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {loans.map(loan => (
                <div key={loan.id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{formatCurrency(loan.loan_amount)}</p>
                      <p className="text-xs text-gray-500 capitalize">{loan.status}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      loan.status === 'approved' ? 'bg-green-100 text-green-700' :
                      loan.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                  {loan.emi_amount && (
                    <p className="text-sm text-gray-600">EMI: {formatCurrency(loan.emi_amount)}/month</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
