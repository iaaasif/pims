import { usePermissions } from '@/hooks/usePermissions'
import type { UserRole } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: UserRole | UserRole[]
}

/**
 * Protected Route Component
 * Wraps routes that require specific role permissions
 * Redirects unauthorized users to fallback path or shows access denied message
 */
export function ProtectedRoute({
    children,
    requiredRole,
}: ProtectedRouteProps) {
    const { userRole, loading } = usePermissions()

    // Show loading state while checking permissions
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    // If no role requirement, allow access
    if (!requiredRole) {
        return <>{children}</>
    }

    // Check if user has required role
    const hasAccess = Array.isArray(requiredRole)
        ? requiredRole.includes(userRole!)
        : userRole === requiredRole

    // If user doesn't have access, show access denied or redirect
    if (!hasAccess) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="max-w-md w-full border-destructive/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-6 w-6 text-destructive" />
                            <CardTitle className="text-destructive">Access Denied</CardTitle>
                        </div>
                        <CardDescription>
                            You don't have permission to access this page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Your current role: <span className="font-semibold">{userRole || 'Unknown'}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Required role: <span className="font-semibold">
                                {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}
                            </span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-4">
                            Please contact your administrator if you believe this is an error.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return <>{children}</>
}
