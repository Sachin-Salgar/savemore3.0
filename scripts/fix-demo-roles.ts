import fetch from 'node-fetch'

const SUPABASE_URL = 'https://tjtakqkcxkrzhrwapylw.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
  process.exit(1)
}

const demoUsers = [
  { email: 'admin@demo.com', role: 'admin', name: 'Admin Demo' },
  { email: 'president@demo.com', role: 'president', name: 'President Demo' },
  { email: 'member@demo.com', role: 'member', name: 'Member Demo' }
]

async function updateRoles() {
  console.log('Fetching users...\n')

  // List all users
  const listResponse = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users`,
    {
      method: 'GET',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`
      }
    }
  )

  if (!listResponse.ok) {
    console.error('Failed to fetch users:', listResponse.statusText)
    process.exit(1)
  }

  const { users } = await listResponse.json() as any

  for (const demoUser of demoUsers) {
    const user = users.find((u: any) => u.email === demoUser.email)

    if (!user) {
      console.log(`⚠️  User not found: ${demoUser.email}`)
      continue
    }

    console.log(`Updating ${demoUser.email}...`)

    const updateResponse = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users/${user.id}`,
      {
        method: 'PUT',
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
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

    if (!updateResponse.ok) {
      const error = await updateResponse.text()
      console.error(`❌ Failed: ${error}`)
      continue
    }

    console.log(`✅ Updated ${demoUser.email} with role: ${demoUser.role}\n`)
  }

  console.log('Done!')
}

updateRoles().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
