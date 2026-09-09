-- =========================================================
-- FINAL FIX: All RLS Infinite Recursion Issues
-- Run this in Supabase Dashboard SQL Editor
-- =========================================================

-- Step 1: Create helper functions (NO table queries)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
        'viewer'
    );
EXCEPTION WHEN OTHERS THEN RETURN 'viewer';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_my_role() IN ('admin', 'manager', 'management');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 2: Fix PROFILES table - drop ALL policies
DO $$
DECLARE pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- Disable/enable RLS to clear cache
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create non-recursive profiles policies
CREATE POLICY "p_select" ON public.profiles FOR SELECT 
TO authenticated USING (auth.uid() = id OR public.get_my_role() = 'admin');

CREATE POLICY "p_update" ON public.profiles FOR UPDATE 
TO authenticated USING (auth.uid() = id OR public.get_my_role() = 'admin');

CREATE POLICY "p_insert" ON public.profiles FOR INSERT 
TO authenticated WITH CHECK (auth.uid() = id);

-- Step 3: Fix TRANSFER_REQUESTS table
DROP POLICY IF EXISTS "Users can delete their own transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Users can delete transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Users can view transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Users can insert transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Users can update transfers" ON transfer_requests;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON transfer_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON transfer_requests;
DROP POLICY IF EXISTS "Enable read access for all users" ON transfer_requests;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON transfer_requests;

ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;

-- Non-recursive transfer policies
CREATE POLICY "tr_select" ON transfer_requests FOR SELECT USING (true);
CREATE POLICY "tr_insert" ON transfer_requests FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "tr_update" ON transfer_requests FOR UPDATE 
USING (auth.uid() = created_by OR public.is_admin_manager());
CREATE POLICY "tr_delete" ON transfer_requests FOR DELETE 
USING (auth.uid() = created_by OR public.is_admin_manager());

-- Step 4: Update delete_transfer function
CREATE OR REPLACE FUNCTION delete_transfer(transfer_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_created_by UUID;
    v_role TEXT := public.get_my_role();
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    SELECT created_by INTO v_created_by FROM transfer_requests WHERE id = transfer_id;
    IF v_created_by IS NULL THEN RAISE EXCEPTION 'Transfer not found'; END IF;
    IF v_created_by != v_user_id AND v_role NOT IN ('admin', 'manager', 'management') THEN
        RAISE EXCEPTION 'Permission denied';
    END IF;
    DELETE FROM transfer_requests WHERE id = transfer_id;
    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_transfer(UUID) TO authenticated;

-- Done!
SELECT 'All RLS policies fixed successfully!' as result;
