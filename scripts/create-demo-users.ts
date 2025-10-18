import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tjtakqkcxkrzhrwapylw.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
  console.error('Usage: SUPABASE_SERVICE_ROLE_KEY=your_key npx ts-node scripts/create-demo-users.ts')
  process.exit(1)
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

const demoUsers = [
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

async function createDemoUsers() {
  console.log('Creating demo users in Supabase...\n')

  for (const user of demoUsers) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role
        }
      })

      if (error) {
        console.error(`❌ Failed to create ${user.email}:`, error.message)
        continue
      }

      console.log(`✅ Created ${user.role.toUpperCase()} user:`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Password: ${user.password}`)
      console.log(`   User ID: ${data?.user?.id}\n`)
    } catch (err) {
      console.error(`❌ Error creating ${user.email}:`, err)
    }
  }

  console.log('Demo user creation complete!')
}

createDemoUsers()
