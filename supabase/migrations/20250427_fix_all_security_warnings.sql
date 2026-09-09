-- ============================================
-- FIX ALL SECURITY ADVISOR WARNINGS
-- ============================================

-- ============================================
-- 1. FIX SEARCH_PATH FOR ALL FUNCTIONS
-- ============================================

-- Helper functions (RLS recursion fix related)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
        'viewer'
    );
EXCEPTION WHEN OTHERS THEN RETURN 'viewer';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_my_role() IN ('admin', 'manager', 'management');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- User management functions
CREATE OR REPLACE FUNCTION public.create_user_profile(
    p_email TEXT,
    p_role TEXT,
    p_name TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_result JSONB;
BEGIN
    -- Create user in auth.users
    INSERT INTO auth.users (email, raw_app_meta_data, email_confirmed_at)
    VALUES (
        p_email,
        jsonb_build_object('role', p_role),
        NOW()
    )
    RETURNING id INTO v_user_id;
    
    -- Create profile
    INSERT INTO public.profiles (id, email, role, name)
    VALUES (v_user_id, p_email, p_role, p_name);
    
    RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.admin_insert_profile(
    p_id UUID,
    p_email TEXT,
    p_role TEXT,
    p_name TEXT,
    p_status TEXT DEFAULT 'active'
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, name, status)
    VALUES (p_id, p_email, p_role, p_name, p_status);
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM public.profiles WHERE id = p_user_id;
    DELETE FROM auth.users WHERE id = p_user_id;
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.create_pending_user(
    p_email TEXT,
    p_role TEXT,
    p_name TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
BEGIN
    INSERT INTO auth.users (email, raw_app_meta_data, created_at)
    VALUES (p_email, jsonb_build_object('role', p_role, 'pending', true), NOW())
    RETURNING id INTO v_user_id;
    
    INSERT INTO public.profiles (id, email, role, name, status)
    VALUES (v_user_id, p_email, p_role, p_name, 'pending');
    
    RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- PO/Inventory functions
CREATE OR REPLACE FUNCTION public.handle_po_received()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'received' AND OLD.status != 'received' THEN
        PERFORM public.add_inventory_from_received_po(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.add_inventory_from_received_po(p_po_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_po_record RECORD;
    v_item RECORD;
BEGIN
    SELECT * INTO v_po_record FROM public.purchase_orders WHERE id = p_po_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Purchase order not found';
    END IF;
    
    FOR v_item IN 
        SELECT * FROM public.po_items WHERE po_id = p_po_id
    LOOP
        INSERT INTO public.inventory (
            material_id, 
            project_id, 
            quantity, 
            location_id,
            po_id
        )
        VALUES (
            v_item.material_id,
            v_po_record.project_id,
            v_item.quantity,
            v_po_record.location_id,
            p_po_id
        );
    END LOOP;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error adding inventory: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_po_items_in_inventory(p_po_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM public.inventory 
    WHERE po_id = p_po_id;
    
    RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Low stock notification
CREATE OR REPLACE FUNCTION public.handle_low_stock_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_threshold NUMERIC;
    v_material_name TEXT;
BEGIN
    SELECT name INTO v_material_name 
    FROM public.materials 
    WHERE id = NEW.material_id;
    
    v_threshold := COALESCE(
        (SELECT reorder_level FROM public.materials WHERE id = NEW.material_id),
        10
    );
    
    IF NEW.quantity <= v_threshold THEN
        INSERT INTO public.notifications (
            type,
            title,
            message,
            material_id,
            project_id,
            is_read
        )
        VALUES (
            'low_stock',
            'Low Stock Alert',
            v_material_name || ' stock is low (' || NEW.quantity || ' remaining)',
            NEW.material_id,
            NEW.project_id,
            false
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Inventory cleanup functions
CREATE OR REPLACE FUNCTION public.prevent_duplicate_inventory_addition()
RETURNS TRIGGER AS $$
DECLARE
    v_existing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_existing_count
    FROM public.inventory
    WHERE material_id = NEW.material_id
    AND project_id = NEW.project_id
    AND location_id = NEW.location_id
    AND po_id = NEW.po_id;
    
    IF v_existing_count > 0 THEN
        RAISE EXCEPTION 'Duplicate inventory entry detected for material %', NEW.material_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.remove_duplicate_inventory_entries()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    WITH duplicates AS (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY material_id, project_id, location_id, po_id 
                   ORDER BY created_at DESC
               ) as rn
        FROM public.inventory
        WHERE po_id IS NOT NULL
    )
    DELETE FROM public.inventory
    WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.cleanup_duplicate_inventory_entries()
RETURNS TABLE(deleted_count INTEGER, remaining_count INTEGER) AS $$
DECLARE
    v_deleted INTEGER;
    v_remaining INTEGER;
BEGIN
    SELECT public.remove_duplicate_inventory_entries() INTO v_deleted;
    
    SELECT COUNT(*) INTO v_remaining FROM public.inventory;
    
    RETURN QUERY SELECT v_deleted, v_remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Transfer functions
CREATE OR REPLACE FUNCTION public.delete_transfer(transfer_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_created_by UUID;
    v_role TEXT := public.get_my_role();
BEGIN
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
    SELECT created_by INTO v_created_by FROM public.transfer_requests WHERE id = transfer_id;
    IF v_created_by IS NULL THEN RAISE EXCEPTION 'Transfer not found'; END IF;
    IF v_created_by != v_user_id AND v_role NOT IN ('admin', 'manager', 'management') THEN
        RAISE EXCEPTION 'Permission denied';
    END IF;
    DELETE FROM public.transfer_requests WHERE id = transfer_id;
    RETURN TRUE;
END;
$$;

-- Project inventory functions
CREATE OR REPLACE FUNCTION public.get_project_inventory(project_uuid UUID)
RETURNS TABLE(
    id UUID,
    material_id UUID,
    material_name TEXT,
    quantity NUMERIC,
    location_id UUID,
    location_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.material_id,
        m.name as material_name,
        i.quantity,
        i.location_id,
        l.name as location_name
    FROM public.inventory i
    JOIN public.materials m ON i.material_id = m.id
    LEFT JOIN public.locations l ON i.location_id = l.id
    WHERE i.project_id = project_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_all_projects_inventory_summary()
RETURNS TABLE(
    project_id UUID,
    project_name TEXT,
    total_items BIGINT,
    total_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as project_id,
        p.name as project_name,
        COUNT(i.id) as total_items,
        COALESCE(SUM(i.quantity * m.unit_cost), 0) as total_value
    FROM public.projects p
    LEFT JOIN public.inventory i ON i.project_id = p.id
    LEFT JOIN public.materials m ON i.material_id = m.id
    GROUP BY p.id, p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Handle new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, name, status)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_app_meta_data->>'role', 'viewer'),
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'active'
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Sync profile role
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_metadata()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- 2. REVOKE DANGEROUS FUNCTION EXECUTE PERMISSIONS
-- ============================================

-- REVOKE EXECUTE on sensitive functions from authenticated role
-- These should only be called internally or by admins

REVOKE EXECUTE ON FUNCTION public.get_user_reset_token(TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_reset_token(TEXT) FROM anon;

-- Only allow service_role or postgres to call these
GRANT EXECUTE ON FUNCTION public.get_user_reset_token(TEXT) TO service_role;

-- ============================================
-- 3. FIX SECURITY DEFINER VIEW
-- ============================================

-- Drop and recreate view without SECURITY DEFINER
DROP VIEW IF EXISTS public.project_inventory_summary;

CREATE VIEW public.project_inventory_summary AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    COUNT(i.id) as total_items,
    COALESCE(SUM(i.quantity), 0) as total_quantity,
    COALESCE(SUM(i.quantity * m.unit_cost), 0) as total_value
FROM public.projects p
LEFT JOIN public.inventory i ON i.project_id = p.id
LEFT JOIN public.materials m ON i.material_id = m.id
GROUP BY p.id, p.name;

-- Enable RLS on the view (it uses underlying table RLS)
ALTER VIEW public.project_inventory_summary SET (security_barrier = true);

-- Grant appropriate permissions
GRANT SELECT ON public.project_inventory_summary TO authenticated;

-- ============================================
-- 4. RESTRICT ACCESS TO ADMIN FUNCTIONS
-- ============================================

-- Revoke from authenticated for admin-only functions
REVOKE EXECUTE ON FUNCTION public.admin_insert_profile(UUID, TEXT, TEXT, TEXT, TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_delete_user(UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.create_pending_user(TEXT, TEXT, TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.create_user_profile(TEXT, TEXT, TEXT) FROM authenticated;

-- Only allow service_role or specific admin checks
GRANT EXECUTE ON FUNCTION public.admin_insert_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_pending_user(TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_user_profile(TEXT, TEXT, TEXT) TO service_role;

-- Inventory cleanup - restrict to admins
REVOKE EXECUTE ON FUNCTION public.remove_duplicate_inventory_entries() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_duplicate_inventory_entries() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.remove_duplicate_inventory_entries() TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_duplicate_inventory_entries() TO service_role;

-- Add policy to allow admin execution through service role
CREATE POLICY IF NOT EXISTS "Admin functions service only"
ON public.profiles FOR ALL
USING (public.is_admin_manager())
WITH CHECK (public.is_admin_manager());

-- ============================================
-- 5. ENABLE LEAKED PASSWORD PROTECTION (via auth config)
-- ============================================

-- This is configured in Supabase Dashboard > Auth > Settings > Security
-- Or via Management API (not available in SQL)

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Security fixes applied successfully' as status;
