-- Fix transfer_requests RLS policy to allow admins/managers to delete
DROP POLICY IF EXISTS "Users can delete their own transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Users can delete transfers" ON transfer_requests;

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
