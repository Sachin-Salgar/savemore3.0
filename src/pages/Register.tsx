import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'member',
    groupCode: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.userType === 'member' && !formData.groupCode) {
      setError('Group code is required for members')
      return
    }

    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.userType,
            group_code: formData.groupCode
          }
        }
      })

      if (authError) {
        setError(authError.message)
      } else {
        navigate('/login')
      }
    } catch (err) {
      setError('Failed to register')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">SaveMore</h1>
            <p className="text-gray-600">Create Your Account</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="member">Group Member</option>
                <option value="president">Group President</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                disabled={loading}
              />
            </div>

            {formData.userType === 'member' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Code
                </label>
                <input
                  type="text"
                  name="groupCode"
                  value={formData.groupCode}
                  onChange={handleChange}
                  placeholder="Enter group code"
                  className="input-field"
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline font-medium">
              Login here
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
