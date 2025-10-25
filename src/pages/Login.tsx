import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)
  const { login, error } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const checkConfig = () => {
      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!url || !key) {
        const missing = []
        if (!url) missing.push('VITE_SUPABASE_URL')
        if (!key) missing.push('VITE_SUPABASE_ANON_KEY')
        setConfigError(`Missing environment variables: ${missing.join(', ')}`)
      }
    }

    checkConfig()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setIsLoading(true)

    try {
      const success = await login(demoEmail, demoPassword)
      if (success) {
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Demo login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">SaveMore</h1>
            <p className="text-gray-600">Self Help Group Management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Phone
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-4 font-medium">DEMO ACCOUNTS</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@demo.com', 'admin123')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-100 text-primary border border-primary rounded-lg hover:bg-blue-50 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('president@demo.com', 'president123')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-100 text-secondary border border-secondary rounded-lg hover:bg-green-50 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                President Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('member@demo.com', 'member123')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-amber-100 text-accent border border-accent rounded-lg hover:bg-amber-50 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                Member Demo
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-center text-sm text-gray-600">
            <div>
              Don't have an account?{' '}
              <a href="/register" className="text-primary hover:underline font-medium">
                Register here
              </a>
            </div>
            <div>
              <a href="/forgot-password" className="text-accent hover:underline font-medium">
                Forgot password?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
