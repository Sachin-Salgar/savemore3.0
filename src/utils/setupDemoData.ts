import { supabase } from '@/lib/supabase'

export async function setupDemoGroup(): Promise<{ success: boolean; message: string }> {
  try {
    // Check if MADHURANGAN group already exists
    const { data: existingGroup, error: checkError } = await supabase
      .from('groups')
      .select('id')
      .eq('code', 'MADHURANGAN')
      .maybeSingle()

    if (checkError) {
      return { success: false, message: `Failed to check existing group: ${checkError.message}` }
    }

    let groupId = existingGroup?.id

    if (!groupId) {
      // Get current user for created_by field
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { success: false, message: 'User authentication failed' }
      }

      // Create MADHURANGAN group
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
          created_by: user.id
        })
        .select('id')
        .single()

      if (createError) {
        return { success: false, message: `Failed to create group: ${createError.message}` }
      }

      if (!newGroup) {
        return { success: false, message: 'Failed to get created group ID' }
      }

      groupId = newGroup.id
    }

    // Check if president@demo.com user exists
    try {
      const { data: allUsers } = await supabase.auth.admin.listUsers()
      let presidentUser = allUsers?.users.find(u => u.email === 'president@demo.com')

      if (!presidentUser) {
        return { 
          success: false, 
          message: 'president@demo.com user not found. Please create demo users first using the Demo Setup page.' 
        }
      }

      // Check if president is already assigned to a group
      const { data: existingAssignment } = await supabase
        .from('group_members')
        .select('id')
        .eq('user_id', presidentUser.id)
        .eq('role', 'president')
        .maybeSingle()

      if (existingAssignment) {
        return { success: false, message: 'president@demo.com is already assigned to a group' }
      }

      // Assign president to MADHURANGAN group
      const { error: assignError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: presidentUser.id,
          role: 'president',
          status: 'approved'
        })

      if (assignError) {
        return { success: false, message: `Failed to assign president: ${assignError.message}` }
      }

      return { 
        success: true, 
        message: '✓ Demo group MADHURANGAN created and assigned to president@demo.com successfully!' 
      }
    } catch (err) {
      return { 
        success: false, 
        message: `Error accessing admin API: Make sure you're logged in as admin` 
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, message: `Unexpected error: ${errorMsg}` }
  }
}
