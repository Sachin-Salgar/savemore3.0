import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminSetup() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createAdminUser = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      // This endpoint requires server-side handling
      const response = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@demo.com',
          password: 'admin123',
          name: 'Admin Demo',
          role: 'admin'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create admin user')
        return
      }

      setMessage('✅ Admin user created successfully! Email: admin@demo.com, Password: admin123')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-primary mb-2">Admin Setup</h1>
            <p className="text-gray-600">Create admin demo account</p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            <button
              onClick={createAdminUser}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating...' : 'Create Admin User'}
            </button>

            <a
              href="/login"
              className="block text-center text-primary hover:underline text-sm mt-4"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
