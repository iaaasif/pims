-- Verify and fix all transfer_requests policies
-- First, show existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'transfer_requests';

-- Drop ALL existing policies on transfer_requests to start fresh
DROP POLICY IF EXISTS "Users can delete their own transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Users can delete transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Users can view transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Users can insert transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Users can update transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON transfer_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON transfer_requests;
DROP POLICY IF EXISTS "Enable read access for all users" ON transfer_requests;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON transfer_requests;

-- Enable RLS on the table
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy (view transfers)
CREATE POLICY "Users can view transfers" ON transfer_requests
    FOR SELECT
    USING (true);

-- Create INSERT policy
CREATE POLICY "Users can insert transfers" ON transfer_requests
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Create UPDATE policy
CREATE POLICY "Users can update transfers" ON transfer_requests
    FOR UPDATE
    USING (
        auth.uid() = created_by
        OR
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role IN ('admin', 'manager', 'management')
        )
    );

-- Create DELETE policy (the important one!)
CREATE POLICY "Users can delete transfers" ON transfer_requests
    FOR DELETE
    USING (
        auth.uid() = created_by
        OR
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role IN ('admin', 'manager', 'management')
        )
    );

-- Verify policies were created
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename = 'transfer_requests';
