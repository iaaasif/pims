import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield, Check, X, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { UserRole, Module } from "@/lib/permissions"
import { getRolePermissions } from "@/lib/permissions"

interface UserPermissionsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    userRole: UserRole
    userName: string
}

const MODULE_LABELS: Record<Module, string> = {
    projects: 'Projects',
    locations: 'Locations',
    materials: 'Materials',
    inventory: 'Inventory',
    vendors: 'Vendors',
    purchase_requisitions: 'Purchase Requisitions',
    purchase_orders: 'Purchase Orders',
    admin_dashboard: 'Admin Dashboard',
    users: 'User Management',
    reports: 'Reports',
    transfers: 'Transfers',
}


export function UserPermissionsDialog({
    open,
    onOpenChange,
    userRole,
    userName
}: UserPermissionsDialogProps) {
    const [permissions, setPermissions] = useState<Record<string, string[]>>({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            fetchPermissions()
        }
    }, [open, userRole])

    const fetchPermissions = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('role_permissions')
                .select('module, actions')
                .eq('role', userRole)

            if (error) throw error

            if (data && data.length > 0) {
                const permMap: Record<string, string[]> = {}
                data.forEach(p => {
                    permMap[p.module] = p.actions
                })
                setPermissions(permMap)
            } else {
                // Fallback to static permissions
                setPermissions(getRolePermissions(userRole))
            }
        } catch (error) {
            console.error('Error fetching user permissions:', error)
            setPermissions(getRolePermissions(userRole))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col bg-card/95 backdrop-blur-xl border-border/50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        User Permissions - {userName}
                    </DialogTitle>
                    <DialogDescription>
                        Permission matrix for role: <Badge variant="secondary" className="ml-2 capitalize">{userRole.replace('_', ' ')}</Badge>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 -mx-6 px-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[400px] gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading permissions...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-sm z-10 border-b">
                                <TableRow>
                                    <TableHead className="w-[200px] font-bold uppercase text-[10px] tracking-wider">Module</TableHead>
                                    <TableHead className="text-center font-bold uppercase text-[10px] tracking-wider">View</TableHead>
                                    <TableHead className="text-center font-bold uppercase text-[10px] tracking-wider">Create</TableHead>
                                    <TableHead className="text-center font-bold uppercase text-[10px] tracking-wider">Edit</TableHead>
                                    <TableHead className="text-center font-bold uppercase text-[10px] tracking-wider">Delete</TableHead>
                                    <TableHead className="text-center font-bold uppercase text-[10px] tracking-wider">Approve</TableHead>
                                    <TableHead className="text-center font-bold uppercase text-[10px] tracking-wider">Print</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(permissions).map(([module, actions]) => (
                                    <TableRow key={module} className="hover:bg-primary/5 transition-colors border-border/30">
                                        <TableCell className="font-bold py-4">
                                            {MODULE_LABELS[module as Module] || module}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {actions.includes('view') ? (
                                                <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <X className="h-4 w-4 text-muted-foreground/20 mx-auto" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {actions.includes('create') ? (
                                                <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <X className="h-4 w-4 text-muted-foreground/20 mx-auto" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {actions.includes('edit') ? (
                                                <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <X className="h-4 w-4 text-muted-foreground/20 mx-auto" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {actions.includes('delete') ? (
                                                <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <X className="h-4 w-4 text-muted-foreground/20 mx-auto" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {actions.includes('approve') ? (
                                                <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <X className="h-4 w-4 text-muted-foreground/20 mx-auto" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {actions.includes('print') ? (
                                                <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                            ) : (
                                                <X className="h-4 w-4 text-muted-foreground/20 mx-auto" />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </ScrollArea>

                <div className="rounded-xl bg-muted/30 p-4 text-xs text-muted-foreground border border-border/50">
                    <p className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Authorized</span>
                        <span className="flex items-center gap-1.5"><X className="h-3.5 w-3.5 text-muted-foreground/30" /> Restricted Access</span>
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
