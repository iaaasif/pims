-- COMPLETE RESET OF PROFILES POLICIES
-- This drops ALL policies and creates minimal non-recursive ones

-- First, find and drop ALL policies on profiles
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
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Disable RLS completely first
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function that returns true/false based on JWT role
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check the JWT claims directly - this does NOT query the profiles table
    RETURN COALESCE(
        (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role'),
        (current_setting('request.jwt.claims', true)::jsonb ->> 'role')
    ) = 'admin';
EXCEPTION
    WHEN OTHERS THEN 
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policy 1: Everyone can see their own profile (non-recursive)
CREATE POLICY "select_own_profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Everyone can update their own profile (non-recursive)
CREATE POLICY "update_own_profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Policy 3: Admins can see all profiles using the safe function
CREATE POLICY "admin_select_all"
ON public.profiles FOR SELECT
TO authenticated
USING (public.current_user_is_admin());

-- Policy 4: Admins can update all profiles using the safe function
CREATE POLICY "admin_update_all"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.current_user_is_admin());

-- Policy 5: Users can insert their own profile (for signup)
CREATE POLICY "insert_own_profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Force reconnection to clear any cached plans
NOTIFY pgrst, 'reload config';
