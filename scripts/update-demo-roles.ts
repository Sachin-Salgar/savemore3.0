import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tjtakqkcxkrzhrwapylw.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
  process.exit(1)
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

const demoUsers = [
  { email: 'admin@demo.com', role: 'admin', name: 'Admin Demo' },
  { email: 'president@demo.com', role: 'president', name: 'President Demo' },
  { email: 'member@demo.com', role: 'member', name: 'Member Demo' }
]

async function updateRoles() {
  console.log('Updating user roles...\n')

  for (const user of demoUsers) {
    try {
      // Get user by email
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        console.error(`Failed to list users: ${listError.message}`)
        continue
      }

      const foundUser = users?.users?.find(u => u.email === user.email)
      
      if (!foundUser) {
        console.log(`⚠️  User not found: ${user.email}`)
        continue
      }

      // Update user metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        foundUser.id,
        {
          user_metadata: {
            name: user.name,
            role: user.role
          }
        }
      )

      if (updateError) {
        console.error(`❌ Failed to update ${user.email}: ${updateError.message}`)
        continue
      }

      console.log(`✅ Updated ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   User ID: ${foundUser.id}\n`)
    } catch (err) {
      console.error(`❌ Error updating ${user.email}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log('Role update complete!')
}

updateRoles()
