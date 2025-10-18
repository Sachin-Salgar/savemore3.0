import { useState } from 'react'

export default function AdminSetup() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [serviceRoleKey, setServiceRoleKey] = useState('')

  const createAdminUser = async () => {
    if (!serviceRoleKey.trim()) {
      setError('Please provide the service role key')
      return
    }

    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tjtakqkcxkrzhrwapylw.supabase.co'

      // Step 1: Get existing users
      const listRes = await fetch(
        `${SUPABASE_URL}/auth/v1/admin/users`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`
          }
        }
      )

      if (!listRes.ok) {
        setError(`Failed to authenticate: ${listRes.statusText}`)
        setLoading(false)
        return
      }

      const { users } = await listRes.json() as any
      let adminUser = users?.find((u: any) => u.email === 'admin@demo.com')

      if (adminUser) {
        setMessage(`Admin user already exists. Updating metadata...`)
        // Update existing user
        const updateRes = await fetch(
          `${SUPABASE_URL}/auth/v1/admin/users/${adminUser.id}`,
          {
            method: 'PUT',
            headers: {
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_metadata: {
                name: 'Admin Demo',
                role: 'admin'
              }
            })
          }
        )

        if (!updateRes.ok) {
          setError(`Failed to update: ${await updateRes.text()}`)
          setLoading(false)
          return
        }

        setMessage('✅ Admin user updated successfully!\n\nEmail: admin@demo.com\nPassword: admin123')
      } else {
        // Create new user
        const createRes = await fetch(
          `${SUPABASE_URL}/auth/v1/admin/users`,
          {
            method: 'POST',
            headers: {
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: 'admin@demo.com',
              password: 'admin123',
              email_confirm: true,
              user_metadata: {
                name: 'Admin Demo',
                role: 'admin'
              }
            })
          }
        )

        if (!createRes.ok) {
          setError(`Failed to create: ${await createRes.text()}`)
          setLoading(false)
          return
        }

        setMessage('✅ Admin user created successfully!\n\nEmail: admin@demo.com\nPassword: admin123')
      }
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
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase Service Role Key
              </label>
              <textarea
                value={serviceRoleKey}
                onChange={(e) => setServiceRoleKey(e.target.value)}
                placeholder="Paste your service role key here..."
                className="input-field font-mono text-xs h-24"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">
                Get this from Supabase Dashboard → Settings → API → Service Role Key
              </p>
            </div>

            <button
              onClick={createAdminUser}
              disabled={loading || !serviceRoleKey.trim()}
              className="btn-primary w-full"
            >
              {loading ? 'Setting up...' : 'Setup Admin Account'}
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
