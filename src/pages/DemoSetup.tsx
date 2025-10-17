import { useState } from 'react'

interface DemoUser {
  email: string
  password: string
  name: string
  role: 'admin' | 'president' | 'member'
}

const demoUsers: DemoUser[] = [
  {
    email: 'admin@demo.com',
    password: 'admin123',
    name: 'Admin Demo',
    role: 'admin'
  },
  {
    email: 'president@demo.com',
    password: 'president123',
    name: 'President Demo',
    role: 'president'
  },
  {
    email: 'member@demo.com',
    password: 'member123',
    name: 'Member Demo',
    role: 'member'
  }
]

export default function DemoSetup() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [serviceRoleKey, setServiceRoleKey] = useState('')
  const [createdUsers, setCreatedUsers] = useState<string[]>([])

  const setupAllDemoUsers = async () => {
    if (!serviceRoleKey.trim()) {
      setError('Please provide the service role key')
      return
    }

    setLoading(true)
    setMessage(null)
    setError(null)
    setCreatedUsers([])

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
      const created: string[] = []

      for (const demoUser of demoUsers) {
        try {
          const existingUser = users?.find((u: any) => u.email === demoUser.email)

          if (existingUser) {
            // Update existing user
            const updateRes = await fetch(
              `${SUPABASE_URL}/auth/v1/admin/users/${existingUser.id}`,
              {
                method: 'PUT',
                headers: {
                  apikey: serviceRoleKey,
                  Authorization: `Bearer ${serviceRoleKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  user_metadata: {
                    name: demoUser.name,
                    role: demoUser.role
                  }
                })
              }
            )

            if (!updateRes.ok) {
              console.error(`Failed to update ${demoUser.email}`)
              continue
            }

            created.push(demoUser.email)
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
                  email: demoUser.email,
                  password: demoUser.password,
                  email_confirm: true,
                  user_metadata: {
                    name: demoUser.name,
                    role: demoUser.role
                  }
                })
              }
            )

            if (!createRes.ok) {
              console.error(`Failed to create ${demoUser.email}`)
              continue
            }

            created.push(demoUser.email)
          }
        } catch (err) {
          console.error(`Error with ${demoUser.email}:`, err)
        }
      }

      setCreatedUsers(created)
      setMessage(`✅ Setup complete!\n\n${demoUsers
        .map(u => `${u.name}\nEmail: ${u.email}\nPassword: ${u.password}`)
        .join('\n\n')}`)
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
            <h1 className="text-2xl font-bold text-primary mb-2">Demo Setup</h1>
            <p className="text-gray-600">Create all demo accounts</p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line font-mono text-xs max-h-96 overflow-y-auto">
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
              onClick={setupAllDemoUsers}
              disabled={loading || !serviceRoleKey.trim()}
              className="btn-primary w-full"
            >
              {loading ? 'Setting up...' : 'Setup All Demo Accounts'}
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
