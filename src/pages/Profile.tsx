import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'

interface UserProfile {
  full_name: string
  phone_number: string
  address: string
  city: string
  state: string
  postal_code: string
}

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    postal_code: ''
  })
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user?.id)
          .single()

        if (data) {
          setProfile({
            full_name: data.full_name || user?.user_metadata?.name || '',
            phone_number: data.phone_number || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            postal_code: data.postal_code || ''
          })
        } else {
          setProfile(prev => ({
            ...prev,
            full_name: user?.user_metadata?.name || ''
          }))
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchProfile()
    }
  }, [user?.id, user?.user_metadata?.name])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)

    try {
      const { error } = await supabase.from('user_profiles').upsert({
        id: user?.id,
        ...profile,
        updated_at: new Date().toISOString()
      })

      if (error) throw error

      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Layout><div className="text-center py-8">Loading...</div></Layout>
  }

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            Profile updated successfully
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="btn-outline text-sm"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="input-field bg-gray-100"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!editing || saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={profile.phone_number}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="input-field"
                  disabled={!editing || saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <input
                  type="text"
                  value={user?.user_metadata?.role ? user.user_metadata.role.charAt(0).toUpperCase() + user.user_metadata.role.slice(1) : ''}
                  className="input-field bg-gray-100"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Address</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  className="input-field"
                  disabled={!editing || saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="input-field"
                    disabled={!editing || saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={profile.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="input-field"
                    disabled={!editing || saving}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={profile.postal_code}
                  onChange={handleChange}
                  placeholder="Postal code"
                  className="input-field"
                  disabled={!editing || saving}
                />
              </div>
            </div>
          </div>

          {editing && (
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn-outline flex-1"
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </Layout>
  )
}
