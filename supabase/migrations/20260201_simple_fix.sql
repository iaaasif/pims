-- SIMPLE FIX: Disable RLS on profiles temporarily
-- This immediately fixes the infinite recursion

-- Quick fix: Disable RLS on profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- For security, re-enable with simple policy
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "admin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_all" ON public.profiles;

-- Create simple non-recursive policy
CREATE POLICY "allow_all_select"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_own_update"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "allow_own_insert"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
