-- Create RPC function to delete transfer with admin check
-- This bypasses RLS by using SECURITY DEFINER

CREATE OR REPLACE FUNCTION delete_transfer(transfer_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_transfer_created_by UUID;
    v_user_role TEXT;
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Get the transfer's creator
    SELECT created_by INTO v_transfer_created_by
    FROM transfer_requests
    WHERE id = transfer_id;
    
    IF v_transfer_created_by IS NULL THEN
        RAISE EXCEPTION 'Transfer not found';
    END IF;
    
    -- Get current user's role
    SELECT role INTO v_user_role
    FROM profiles
    WHERE id = v_user_id;
    
    -- Check permission: creator OR admin/manager
    IF v_transfer_created_by != v_user_id 
       AND v_user_role NOT IN ('admin', 'manager', 'management') THEN
        RAISE EXCEPTION 'Permission denied: Only creator or admin/manager can delete';
    END IF;
    
    -- Delete the transfer
    DELETE FROM transfer_requests WHERE id = transfer_id;
    
    RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_transfer(UUID) TO authenticated;

-- Also ensure RLS policies allow admin/manager to delete
DROP POLICY IF EXISTS "Users can delete their own transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Users can delete transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON transfer_requests;

CREATE POLICY "Users can delete transfers" ON transfer_requests
    FOR DELETE
    USING (
        auth.uid() = created_by
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager', 'management')
        )
    );
