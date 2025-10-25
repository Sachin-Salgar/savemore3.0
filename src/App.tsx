import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import Dashboard from '@/pages/Dashboard'
import Profile from '@/pages/Profile'
import Savings from '@/pages/Savings'
import Loans from '@/pages/Loans'
import Transactions from '@/pages/Transactions'
import PresidentDashboard from '@/pages/PresidentDashboard'
import PresidentSetup from '@/pages/PresidentSetup'
import Members from '@/pages/Members'
import AdminMembers from '@/pages/AdminMembers'
import AdminGroups from '@/pages/AdminGroups'
import AdminDashboard from '@/pages/AdminDashboard'
import DemoSetup from '@/pages/DemoSetup'
import ProtectedRoute from '@/components/ProtectedRoute'

function App() {
  const { user, loading } = useAuth()

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
        <Route path="/setup-demo" element={<DemoSetup />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />

        {/* Member Routes */}
        <Route path="/dashboard" element={<ProtectedRoute>{renderDashboard()}</ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
        <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />

        {/* President Routes */}
        <Route path="/members" element={<ProtectedRoute requiredRole="president"><Members /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/members" element={<ProtectedRoute requiredRole="admin"><AdminMembers /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
