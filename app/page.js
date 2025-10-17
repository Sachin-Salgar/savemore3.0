'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [groups, setGroups] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic Supabase connectivity without triggering RLS policies
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          setError('Supabase environment variables are not configured')
          setLoading(false)
          return
        }

        // Perform a simple fetch to verify connection
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey,
          },
        })

        if (response.ok) {
          setGroups([{ message: 'Connected to Supabase' }])
          console.log('✓ Supabase connected successfully')
        } else {
          setError(`Connection failed with status: ${response.status}`)
        }
      } catch (err) {
        setError(`Connection failed: ${err.message}`)
        console.error('Connection failed:', err)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <main style={{ padding: '40px' }}>
      <h1>Welcome to SaveMore</h1>
      <p>Your Next.js application is ready.</p>
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Supabase Connection Test</h2>
        {loading && <p>Testing connection...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {groups !== null && !loading && (
          <div>
            <p style={{ color: 'green' }}>✓ Connected to Supabase</p>
            <pre>{JSON.stringify(groups, null, 2)}</pre>
          </div>
        )}
      </div>
    </main>
  )
}
