// Role-Based Permission System
// Defines what each user role can do across all modules

export type UserRole = 'admin' | 'management' | 'manager' | 'store_keeper' | 'viewer'

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'print'

export type Module =
    | 'projects'
    | 'locations'
    | 'materials'
    | 'inventory'
    | 'vendors'
    | 'purchase_requisitions'
    | 'purchase_orders'
    | 'admin_dashboard'
    | 'users'
    | 'reports'
    | 'transfers'

// Permission matrix: defines what each role can do
export const PERMISSIONS: Record<UserRole, Record<Module, PermissionAction[]>> = {
    admin: {
        projects: ['view', 'create', 'edit', 'delete', 'print'],
        locations: ['view', 'create', 'edit', 'delete', 'print'],
        materials: ['view', 'create', 'edit', 'delete', 'print'],
        inventory: ['view', 'create', 'edit', 'delete', 'print'],
        vendors: ['view', 'create', 'edit', 'delete', 'print'],
        purchase_requisitions: ['view', 'create', 'edit', 'delete', 'approve', 'print'],
        purchase_orders: ['view', 'create', 'edit', 'delete', 'approve', 'print'],
        admin_dashboard: ['view', 'create', 'edit', 'delete'],
        users: ['view', 'create', 'edit', 'delete'],
        reports: ['view', 'print'],
        transfers: ['view', 'create', 'edit', 'delete', 'approve', 'print'],
    },
    management: {
        projects: ['view', 'print'],
        locations: ['view', 'print'],
        materials: ['view', 'print'],
        inventory: ['view', 'print'],
        vendors: ['view', 'print'],
        purchase_requisitions: ['view', 'approve', 'print'],
        purchase_orders: ['view', 'approve', 'print'],
        admin_dashboard: [],
        users: ['view'],
        reports: ['view', 'print'],
        transfers: ['view', 'approve', 'print'],
    },
    manager: {
        projects: ['view', 'create', 'edit', 'print'],
        locations: ['view', 'create', 'edit', 'print'],
        materials: ['view', 'create', 'edit', 'print'],
        inventory: ['view', 'create', 'edit', 'print'],
        vendors: ['view', 'create', 'edit', 'print'],
        purchase_requisitions: ['view', 'create', 'edit', 'approve', 'print'],
        purchase_orders: ['view', 'create', 'edit', 'approve', 'print'],
        admin_dashboard: ['view'],
        users: ['view'],
        reports: ['view', 'print'],
        transfers: ['view', 'create', 'edit', 'approve', 'print'],
    },
    store_keeper: {
        projects: ['view', 'print'],
        locations: ['view', 'print'],
        materials: ['view', 'edit', 'print'],
        inventory: ['view', 'create', 'edit', 'print'],
        vendors: ['view', 'print'],
        purchase_requisitions: ['view', 'create', 'edit', 'print'],
        purchase_orders: ['view', 'create', 'edit', 'print'],
        admin_dashboard: [],
        users: [],
        reports: ['view', 'print'],
        transfers: ['view', 'create', 'edit', 'print'],
    },
    viewer: {
        projects: ['view', 'print'],
        locations: ['view', 'print'],
        materials: ['view', 'print'],
        inventory: ['view', 'print'],
        vendors: ['view', 'print'],
        purchase_requisitions: ['view', 'print'],
        purchase_orders: ['view', 'print'],
        admin_dashboard: [],
        users: [],
        reports: ['view', 'print'],
        transfers: ['view', 'print'],
    },
}

/**
 * Check if a role has permission to perform an action on a module
 */
export function hasPermission(
    role: UserRole | undefined,
    module: Module,
    action: PermissionAction
): boolean {
    if (!role) return false

    const modulePermissions = PERMISSIONS[role]?.[module]
    if (!modulePermissions) return false

    return modulePermissions.includes(action)
}

/**
 * Check if user can view a module
 */
export function canView(role: UserRole | undefined, module: Module): boolean {
    return hasPermission(role, module, 'view')
}

/**
 * Check if user can create in a module
 */
export function canCreate(role: UserRole | undefined, module: Module): boolean {
    return hasPermission(role, module, 'create')
}

/**
 * Check if user can edit in a module
 */
export function canEdit(role: UserRole | undefined, module: Module): boolean {
    return hasPermission(role, module, 'edit')
}

/**
 * Check if user can delete in a module
 */
export function canDelete(role: UserRole | undefined, module: Module): boolean {
    return hasPermission(role, module, 'delete')
}

/**
 * Check if user can approve in a module
 */
export function canApprove(role: UserRole | undefined, module: Module): boolean {
    return hasPermission(role, module, 'approve')
}

/**
 * Check if user can print in a module
 */
export function canPrint(role: UserRole | undefined, module: Module): boolean {
    return hasPermission(role, module, 'print')
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Record<Module, PermissionAction[]> {
    return PERMISSIONS[role]
}

/**
 * Check if role is admin
 */
export function isAdmin(role: UserRole | undefined): boolean {
    return role === 'admin'
}

/**
 * Check if role is management
 */
export function isManagement(role: UserRole | undefined): boolean {
    return role === 'management'
}

/**
 * Check if role is manager
 */
export function isManager(role: UserRole | undefined): boolean {
    return role === 'manager'
}

/**
 * Check if role is store keeper
 */
export function isStoreKeeper(role: UserRole | undefined): boolean {
    return role === 'store_keeper'
}

/**
 * Check if role is viewer
 */
export function isViewer(role: UserRole | undefined): boolean {
    return role === 'viewer'
}
