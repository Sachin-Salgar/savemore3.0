-- Add INSERT policy for groups table
CREATE POLICY "Enable insert for authenticated users" ON groups
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

-- Add UPDATE policy for groups table
CREATE POLICY "Enable update for group creator" ON groups
  FOR UPDATE USING (auth.role() = 'authenticated' AND created_by = auth.uid())
  WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

-- Add INSERT policy for group_members table
CREATE POLICY "Enable insert for authenticated users" ON group_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for group_members table
CREATE POLICY "Enable update for authenticated users" ON group_members
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Add INSERT policy for savings table
CREATE POLICY "Enable insert for authenticated users" ON savings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for savings table
CREATE POLICY "Enable update for authenticated users" ON savings
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Add INSERT policy for loans table
CREATE POLICY "Enable insert for authenticated users" ON loans
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for loans table
CREATE POLICY "Enable update for authenticated users" ON loans
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Add INSERT policy for loan_repayments table
CREATE POLICY "Enable insert for authenticated users" ON loan_repayments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add INSERT policy for transactions table
CREATE POLICY "Enable insert for authenticated users" ON transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

-- Add INSERT policy for notifications table
CREATE POLICY "Enable insert for authenticated users" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for notifications table
CREATE POLICY "Enable update for own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add INSERT policy for user_profiles table
CREATE POLICY "Enable insert for own profile" ON user_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Add INSERT policy for group_meetings table
CREATE POLICY "Enable insert for authenticated users" ON group_meetings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

-- Add UPDATE policy for group_meetings table
CREATE POLICY "Enable update for authenticated users" ON group_meetings
  FOR UPDATE USING (auth.role() = 'authenticated' AND created_by = auth.uid())
  WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

-- Add INSERT policy for meeting_attendance table
CREATE POLICY "Enable insert for authenticated users" ON meeting_attendance
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add INSERT policy for audit_logs table
CREATE POLICY "Enable insert for authenticated users" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());
