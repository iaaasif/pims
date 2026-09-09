-- FIX ALL RECURSIVE POLICIES: Replace profiles table queries with JWT checks

-- ============================================
-- STEP 1: Create helper functions (safe, no recursion)
-- ============================================

-- Function to get role from JWT (does NOT query profiles table)
CREATE OR REPLACE FUNCTION public.get_jwt_role()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
        current_setting('request.jwt.claims', true)::jsonb ->> 'role',
        'viewer'
    );
EXCEPTION
    WHEN OTHERS THEN 
        RETURN 'viewer';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user has specific roles
CREATE OR REPLACE FUNCTION public.has_role(roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_jwt_role() = ANY(roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is admin/manager/management
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_jwt_role() IN ('admin', 'manager', 'management');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- STEP 2: Fix transfer_requests policies
-- ============================================

-- Drop all existing policies on transfer_requests
DROP POLICY IF EXISTS "Users can delete their own transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Users can delete transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Users can view transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Users can insert transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Users can update transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON transfer_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON transfer_requests;
DROP POLICY IF EXISTS "Enable read access for all users" ON transfer_requests;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON transfer_requests;

-- Enable RLS
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;

-- SELECT policy - everyone can view
CREATE POLICY "Users can view transfers" 
ON transfer_requests FOR SELECT
USING (true);

-- INSERT policy - any authenticated user
CREATE POLICY "Users can insert transfers" 
ON transfer_requests FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- UPDATE policy - creator OR admin/manager (using JWT, NOT profiles table)
CREATE POLICY "Users can update transfers" 
ON transfer_requests FOR UPDATE
USING (
    auth.uid() = created_by
    OR public.is_admin_or_manager()
);

-- DELETE policy - creator OR admin/manager (using JWT, NOT profiles table)
CREATE POLICY "Users can delete transfers" 
ON transfer_requests FOR DELETE
USING (
    auth.uid() = created_by
    OR public.is_admin_or_manager()
);

-- ============================================
-- STEP 3: Fix delete_transfer RPC function
-- ============================================

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
    
    -- Get role from JWT (NOT from profiles table)
    v_user_role := public.get_jwt_role();
    
    -- Check permission: creator OR admin/manager/management
    IF v_transfer_created_by != v_user_id 
       AND v_user_role NOT IN ('admin', 'manager', 'management') THEN
        RAISE EXCEPTION 'Permission denied: Only creator or admin/manager can delete';
    END IF;
    
    -- Delete the transfer
    DELETE FROM transfer_requests WHERE id = transfer_id;
    
    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_transfer(UUID) TO authenticated;

-- ============================================
-- STEP 4: Complete reset of profiles policies
-- ============================================

-- Drop ALL policies on profiles using DO block
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- Disable and re-enable RLS to clear cache
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Non-recursive profiles policies using JWT
CREATE POLICY "profiles_select_own" 
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.get_jwt_role() = 'admin');

CREATE POLICY "profiles_update_own" 
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.get_jwt_role() = 'admin');

CREATE POLICY "profiles_insert_own" 
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 5: Notify to reload config
-- ============================================

NOTIFY pgrst, 'reload config';
