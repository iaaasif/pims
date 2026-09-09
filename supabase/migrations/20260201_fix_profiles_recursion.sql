-- Migration: Fix infinite recursion in profiles RLS policies
-- The issue: Policies querying profiles table from within profiles policies causes infinite recursion
-- Solution: Use auth.jwt() -> 'app_metadata' ->> 'role' instead of subqueries on profiles table

-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Policy: Admins can view all profiles (fixed - no recursion)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' 
    OR auth.uid() = id
);

-- Policy: Admins can update all profiles (fixed - no recursion)
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Policy: Admins can insert new profiles (fixed - no recursion)
CREATE POLICY "Admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Also need to update the handle_new_user function to sync role to app_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'viewer');
    
    -- Insert into profiles
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        user_role
    );
    
    -- Update auth.users to set role in app_metadata for RLS policies
    UPDATE auth.users 
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', user_role)
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to sync role changes to app_metadata
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the user's app_metadata when their role changes
    UPDATE auth.users 
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync role on profile update
DROP TRIGGER IF EXISTS sync_role_on_profile_update ON public.profiles;
CREATE TRIGGER sync_role_on_profile_update
    AFTER UPDATE OF role ON public.profiles
    FOR EACH ROW
    WHEN (OLD.role IS DISTINCT FROM NEW.role)
    EXECUTE FUNCTION public.sync_profile_role_to_metadata();

-- Update existing users to sync their roles to app_metadata
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', p.role)
FROM public.profiles p
WHERE auth.users.id = p.id 
AND (auth.users.raw_app_meta_data ->> 'role')::text IS DISTINCT FROM p.role::text;
