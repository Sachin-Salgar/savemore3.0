import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    savingsBalance: 0,
    activeLoans: 0,
    nextPayment: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setUser(authUser)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.user_metadata?.name || 'Member'}!
          </h1>
          <p className="text-gray-600 mt-1">Here's your financial overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-gray-600 text-sm font-medium">Savings Balance</p>
            <p className="text-3xl font-bold text-primary mt-2">₹{stats.savingsBalance.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">Updated today</p>
          </div>

          <div className="stat-card">
            <p className="text-gray-600 text-sm font-medium">Active Loans</p>
            <p className="text-3xl font-bold text-secondary mt-2">{stats.activeLoans}</p>
            <p className="text-xs text-gray-500 mt-2">Loans taken</p>
          </div>

          <div className="stat-card">
            <p className="text-gray-600 text-sm font-medium">Next Payment</p>
            <p className="text-3xl font-bold text-accent mt-2">-</p>
            <p className="text-xs text-gray-500 mt-2">No pending payments</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/savings" className="btn-primary text-center">View Savings</a>
            <a href="/loans" className="btn-secondary text-center">Apply for Loan</a>
            <a href="/transactions" className="btn-outline text-center">Transaction History</a>
            <a href="/profile" className="btn-outline text-center">Edit Profile</a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
