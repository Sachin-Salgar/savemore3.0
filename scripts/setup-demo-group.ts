import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDemoGroup() {
  try {
    console.log('Setting up demo group...')

    // Step 1: Check if MADHURANGAN group already exists
    console.log('Checking if MADHURANGAN group exists...')
    const { data: existingGroup } = await supabase
      .from('groups')
      .select('id')
      .eq('code', 'MADHURANGAN')
      .maybeSingle()

    let groupId = existingGroup?.id

    if (!groupId) {
      // Step 2: Get the admin user to use as created_by
      console.log('Finding admin user...')
      const { data: adminUsers } = await supabase.auth.admin.listUsers()
      let adminId = adminUsers?.users[0]?.id

      // If no admin user exists, get any user
      if (!adminId && adminUsers?.users.length) {
        adminId = adminUsers.users[0].id
      }

      if (!adminId) {
        console.error('No users found in system')
        process.exit(1)
      }

      // Step 3: Create MADHURANGAN group
      console.log('Creating MADHURANGAN group...')
      const { data: newGroup, error: createError } = await supabase
        .from('groups')
        .insert({
          name: 'MADHURANGAN',
          code: 'MADHURANGAN',
          description: 'Demo Self Help Group for testing',
          status: 'approved',
          current_balance: 0,
          monthly_savings_amount: 500,
          interest_rate: 12,
          created_by: adminId
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating group:', createError)
        process.exit(1)
      }

      groupId = newGroup?.id
      console.log(`✓ Created group MADHURANGAN with ID: ${groupId}`)
    } else {
      console.log(`✓ MADHURANGAN group already exists with ID: ${groupId}`)
    }

    // Step 4: Find president@demo.com user
    console.log('Finding president@demo.com user...')
    const { data: allUsers } = await supabase.auth.admin.listUsers()
    const presidentUser = allUsers?.users.find(u => u.email === 'president@demo.com')

    if (!presidentUser) {
      console.error('president@demo.com user not found')
      console.log('Creating president@demo.com user...')
      
      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email: 'president@demo.com',
        password: 'president123',
        user_metadata: {
          name: 'President Demo',
          role: 'president'
        },
        email_confirm: true
      })

      if (createUserError) {
        console.error('Error creating president user:', createUserError)
        process.exit(1)
      }

      const presidentId = newUser.user?.id
      console.log(`✓ Created president user with ID: ${presidentId}`)

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: presidentId,
          full_name: 'President Demo'
        })

      if (profileError) {
        console.warn('Warning: Could not create user profile:', profileError)
      }

      // Step 5: Assign president to MADHURANGAN group
      console.log('Assigning president to MADHURANGAN group...')
      const { error: assignError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: presidentId,
          role: 'president',
          status: 'approved'
        })

      if (assignError) {
        console.error('Error assigning president to group:', assignError)
        process.exit(1)
      }

      console.log(`✓ Assigned president@demo.com to MADHURANGAN group`)
    } else {
      console.log(`✓ Found president@demo.com user with ID: ${presidentUser.id}`)

      // Check if president is already assigned to a group
      const { data: existingAssignment } = await supabase
        .from('group_members')
        .select('id')
        .eq('user_id', presidentUser.id)
        .eq('role', 'president')
        .maybeSingle()

      if (!existingAssignment) {
        // Step 5: Assign president to MADHURANGAN group
        console.log('Assigning president to MADHURANGAN group...')
        const { error: assignError } = await supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            user_id: presidentUser.id,
            role: 'president',
            status: 'approved'
          })

        if (assignError) {
          console.error('Error assigning president to group:', assignError)
          process.exit(1)
        }

        console.log(`✓ Assigned president@demo.com to MADHURANGAN group`)
      } else {
        console.log(`✓ president@demo.com is already assigned to a group`)
      }
    }

    console.log('\n✓ Demo group setup completed successfully!')
    console.log('\nYou can now login with:')
    console.log('Email: president@demo.com')
    console.log('Password: president123')
    console.log('\nThe president can now add members to the MADHURANGAN group.')

    process.exit(0)
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

setupDemoGroup()
