import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

const SUPABASE_URL = 'https://tjtakqkcxkrzhrwapylw.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
  process.exit(1)
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

interface MemberRecord {
  name: string
  phone: string
  email: string
  address: string
  join_date: string
  status: string
}

async function importMembers(groupId: string, csvFilePath: string) {
  try {
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8')
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    }) as MemberRecord[]

    console.log(`Found ${records.length} members in CSV\n`)

    let successCount = 0
    let failureCount = 0

    for (const record of records) {
      try {
        const email = record.email.toLowerCase().trim()
        const phone = record.phone.trim()
        const fullName = record.name.trim()
        const address = record.address.trim()
        const joinDate = new Date(record.join_date)

        console.log(`Processing: ${fullName} (${email})`)

        // Create auth user
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: Math.random().toString(36).slice(-12),
          email_confirm: true,
          user_metadata: {
            name: fullName,
            role: 'member'
          }
        })

        if (userError) {
          console.error(`  ❌ Failed to create auth user: ${userError.message}`)
          failureCount++
          continue
        }

        const userId = userData?.user?.id
        if (!userId) {
          console.error(`  ❌ No user ID returned`)
          failureCount++
          continue
        }

        // Create user profile
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .upsert({
            id: userId,
            full_name: fullName,
            phone_number: phone,
            address: address
          }, { returning: 'minimal' })

        if (profileError) {
          console.error(`  ❌ Failed to create profile: ${profileError.message}`)
          failureCount++
          continue
        }

        // Add to group_members
        const { error: memberError } = await supabaseAdmin
          .from('group_members')
          .insert({
            group_id: groupId,
            user_id: userId,
            role: 'member',
            status: 'approved',
            joined_at: joinDate.toISOString(),
            is_active: true
          })

        if (memberError) {
          console.error(`  ❌ Failed to add to group: ${memberError.message}`)
          failureCount++
          continue
        }

        console.log(`  ✅ Created successfully (ID: ${userId.substring(0, 8)})`)
        successCount++
      } catch (err) {
        console.error(`  ❌ Unexpected error: ${err instanceof Error ? err.message : String(err)}`)
        failureCount++
      }
    }

    console.log(`\n📊 Import Summary`)
    console.log(`  ✅ Successful: ${successCount}`)
    console.log(`  ❌ Failed: ${failureCount}`)
  } catch (err) {
    console.error('Failed to read CSV file:', err instanceof Error ? err.message : String(err))
    process.exit(1)
  }
}

// Get groupId from command line argument or use environment variable
const groupId = process.argv[2] || process.env.GROUP_ID
const csvPath = process.argv[3] || 'members.csv'

if (!groupId) {
  console.error('Usage: SUPABASE_SERVICE_ROLE_KEY=key npx tsx scripts/import-members.ts <GROUP_ID> [csv_path]')
  console.error('Or set GROUP_ID environment variable')
  process.exit(1)
}

if (!fs.existsSync(csvPath)) {
  console.error(`CSV file not found: ${csvPath}`)
  process.exit(1)
}

importMembers(groupId, csvPath)
