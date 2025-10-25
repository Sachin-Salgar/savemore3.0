import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const navLinks = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/savings', label: 'Savings', icon: '💰' },
    { path: '/loans', label: 'Loans', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ]

  return (
    <div className="min-h-screen bg-light pb-24">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 flex justify-between">
          {navLinks.map(link => (
            <a
              key={link.path}
              href={link.path}
              className={`flex-1 py-3 text-center text-xs font-medium transition-colors ${
                location.pathname === link.path
                  ? 'text-primary border-t-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="text-xl mb-1">{link.icon}</div>
              {link.label}
            </a>
          ))}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex-1 py-3 text-center text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            <div className="text-xl mb-1">☰</div>
            Menu
          </button>
        </div>
      </nav>

      {/* Hamburger Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setMenuOpen(false)}>
          <div className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-lg overflow-y-auto">
            <div className="p-4">
              <button
                onClick={() => setMenuOpen(false)}
                className="mb-4 text-2xl text-gray-600"
              >
                ✕
              </button>
              
              <div className="space-y-2">
                <a href="/transactions" className="block px-4 py-2 text-gray-700 hover:bg-light rounded">
                  Transactions
                </a>
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-light rounded">
                  Notifications
                </a>
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-light rounded">
                  Settings
                </a>
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-light rounded">
                  Help
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
