import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Layout from '@/components/Layout'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setUser(authUser)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <Layout>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
        
        <div className="card space-y-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="text-lg font-semibold text-gray-900">{user?.user_metadata?.name}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Account Type</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{user?.user_metadata?.role}</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
