import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { UserRole, Module, PermissionAction } from '@/lib/permissions'
import {
    hasPermission as checkPermission,
    canView as checkCanView,
    canCreate as checkCanCreate,
    canEdit as checkCanEdit,
    canDelete as checkCanDelete,
    canApprove as checkCanApprove,
    canPrint as checkCanPrint,
    isAdmin as checkIsAdmin,
    isManagement as checkIsManagement,
    isManager as checkIsManager,
    isStoreKeeper as checkIsStoreKeeper,
    isViewer as checkIsViewer,
} from '@/lib/permissions'
import type { Profile } from '@/types'

/**
 * Custom hook to manage user permissions
 * Fetches current user's role and provides permission checking functions
 */
export function usePermissions() {
    const [userRole, setUserRole] = useState<UserRole | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<Profile | null>(null)
    const [dynamicPermissions, setDynamicPermissions] = useState<Record<string, string[]> | null>(null)

    useEffect(() => {
        fetchUserRole()
    }, [])

    async function fetchUserRole() {
        try {
            // Get current authenticated user
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setUserRole(undefined)
                setCurrentUser(null)
                setLoading(false)
                return
            }

            // Fetch user profile to get role
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Error fetching user profile:', error)
                setUserRole(undefined)
                setCurrentUser(null)
            } else {
                const role = profile?.role as UserRole
                setUserRole(role)
                setCurrentUser(profile)

                // Fetch dynamic permissions for this role
                await fetchDynamicPermissions(role)
            }
        } catch (error) {
            console.error('Error in fetchUserRole:', error)
            setUserRole(undefined)
            setCurrentUser(null)
        } finally {
            setLoading(false)
        }
    }

    async function fetchDynamicPermissions(role: string) {
        try {
            const { data, error } = await supabase
                .from('role_permissions')
                .select('module, actions')
                .eq('role', role)

            if (error) throw error

            if (data && data.length > 0) {
                const permMap: Record<string, string[]> = {}
                data.forEach(p => {
                    permMap[p.module] = p.actions
                })
                setDynamicPermissions(permMap)
            } else {
                setDynamicPermissions(null)
            }
        } catch (error) {
            console.error('Error fetching role permissions:', error)
            setDynamicPermissions(null)
        }
    }

    // Permission checking functions
    const hasPermission = (module: Module, action: PermissionAction): boolean => {
        // If we have dynamic permissions loaded, use them
        if (dynamicPermissions && dynamicPermissions[module]) {
            return dynamicPermissions[module].includes(action)
        }
        // Fallback to static permissions
        return checkPermission(userRole, module, action)
    }

    const canView = (module: Module): boolean => {
        if (dynamicPermissions && dynamicPermissions[module]) {
            return dynamicPermissions[module].includes('view')
        }
        return checkCanView(userRole, module)
    }

    const canCreate = (module: Module): boolean => {
        if (dynamicPermissions && dynamicPermissions[module]) {
            return dynamicPermissions[module].includes('create')
        }
        return checkCanCreate(userRole, module)
    }

    const canEdit = (module: Module): boolean => {
        if (dynamicPermissions && dynamicPermissions[module]) {
            return dynamicPermissions[module].includes('edit')
        }
        return checkCanEdit(userRole, module)
    }

    const canDelete = (module: Module): boolean => {
        if (dynamicPermissions && dynamicPermissions[module]) {
            return dynamicPermissions[module].includes('delete')
        }
        return checkCanDelete(userRole, module)
    }

    const canApprove = (module: Module): boolean => {
        if (dynamicPermissions && dynamicPermissions[module]) {
            return dynamicPermissions[module].includes('approve')
        }
        return checkCanApprove(userRole, module)
    }

    const canPrint = (module: Module): boolean => {
        if (dynamicPermissions && dynamicPermissions[module]) {
            return dynamicPermissions[module].includes('print')
        }
        return checkCanPrint(userRole, module)
    }

    // Role checking functions
    const isAdmin = (): boolean => {
        return checkIsAdmin(userRole)
    }

    const isManagement = (): boolean => {
        return checkIsManagement(userRole)
    }

    const isManager = (): boolean => {
        return checkIsManager(userRole)
    }

    const isStoreKeeper = (): boolean => {
        return checkIsStoreKeeper(userRole)
    }

    const isViewer = (): boolean => {
        return checkIsViewer(userRole)
    }

    return {
        userRole,
        currentUser,
        loading,
        hasPermission,
        canView,
        canCreate,
        canEdit,
        canDelete,
        canApprove,
        canPrint,
        isAdmin,
        isManagement,
        isManager,
        isStoreKeeper,
        isViewer,
        refreshPermissions: fetchUserRole,
    }
}
