#!/usr/bin/env node

const SUPABASE_URL = 'https://tjtakqkcxkrzhrwapylw.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY not set')
  process.exit(1)
}

async function createAdminUser() {
  try {
    // Step 1: Check if admin user exists
    console.log('Checking for existing admin user...')
    const listRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`
        }
      }
    )

    if (!listRes.ok) {
      console.error('Failed to list users:', listRes.statusText)
      process.exit(1)
    }

    const { users } = await listRes.json()
    let adminUser = users.find(u => u.email === 'admin@demo.com')

    // Step 2: Create or update user
    if (adminUser) {
      console.log(`✅ Admin user exists: ${adminUser.id}`)
      console.log('Updating metadata...')

      const updateRes = await fetch(
        `${SUPABASE_URL}/auth/v1/admin/users/${adminUser.id}`,
        {
          method: 'PUT',
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
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
        console.error('Failed to update:', await updateRes.text())
        process.exit(1)
      }

      console.log('✅ Admin metadata updated')
    } else {
      console.log('Creating new admin user...')

      const createRes = await fetch(
        `${SUPABASE_URL}/auth/v1/admin/users`,
        {
          method: 'POST',
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
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
        console.error('Failed to create user:', await createRes.text())
        process.exit(1)
      }

      const { user } = await createRes.json()
      console.log(`✅ Admin user created: ${user.id}`)
    }

    console.log('\n✅ Admin account ready!')
    console.log('Email: admin@demo.com')
    console.log('Password: admin123')
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

createAdminUser()
