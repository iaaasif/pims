-- Fix transfer_requests RLS policy to allow admins/managers to delete
-- This migration allows admins, managers, and the creator to delete transfers

-- First, drop the existing delete policy if it exists
DROP POLICY IF EXISTS "Users can delete their own transfers" ON transfer_requests;

-- Create new policy that allows creator OR admin/manager to delete
CREATE POLICY "Users can delete transfers" ON transfer_requests
    FOR DELETE
    USING (
        -- User is the creator
        auth.uid() = created_by
        OR
        -- User is admin or manager
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role IN ('admin', 'manager', 'management')
        )
    );

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'transfer_requests';
