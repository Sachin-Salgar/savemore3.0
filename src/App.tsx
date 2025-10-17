import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Profile from '@/pages/Profile'
import Savings from '@/pages/Savings'
import Loans from '@/pages/Loans'
import Transactions from '@/pages/Transactions'
import PresidentDashboard from '@/pages/PresidentDashboard'
import Members from '@/pages/Members'
import AdminDashboard from '@/pages/AdminDashboard'

interface User {
  id: string
  email: string
  user_metadata: {
    role: 'member' | 'president' | 'admin'
    name: string
  }
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user as User)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user as User)
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SaveMore...</p>
        </div>
      </div>
    )
  }

  const renderDashboard = () => {
    if (!user) return <Navigate to="/login" replace />
    
    const role = user.user_metadata?.role
    if (role === 'president') return <PresidentDashboard />
    if (role === 'admin') return <AdminDashboard />
    return <Dashboard />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
        
        {/* Member Routes */}
        <Route path="/dashboard" element={renderDashboard()} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
        <Route path="/savings" element={user ? <Savings /> : <Navigate to="/login" replace />} />
        <Route path="/loans" element={user ? <Loans /> : <Navigate to="/login" replace />} />
        <Route path="/transactions" element={user ? <Transactions /> : <Navigate to="/login" replace />} />
        
        {/* President Routes */}
        <Route path="/members" element={user?.user_metadata?.role === 'president' ? <Members /> : <Navigate to="/login" replace />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
