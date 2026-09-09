import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield, Save, Loader2, RotateCcw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { UserRole, Module, PermissionAction } from "@/lib/permissions"


const MODULES: Module[] = [
    'projects', 'locations', 'materials', 'inventory', 'vendors',
    'purchase_requisitions', 'purchase_orders', 'admin_dashboard', 'users', 'reports', 'transfers'
]

const ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'approve', 'print']

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

export function RolePermissionsPanel() {
    const [selectedRole, setSelectedRole] = useState<UserRole>('manager')
    const [permissions, setPermissions] = useState<Record<string, string[]>>({})
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchPermissions(selectedRole)
    }, [selectedRole])

    const fetchPermissions = async (role: string) => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('role_permissions')
                .select('module, actions')
                .eq('role', role)

            if (error) throw error

            const permMap: Record<string, string[]> = {}
            data?.forEach(p => {
                permMap[p.module] = p.actions
            })
            setPermissions(permMap)
        } catch (error) {
            console.error('Error fetching permissions:', error)
            toast.error('Failed to load permissions')
        } finally {
            setLoading(false)
        }
    }

    const togglePermission = (module: Module, action: PermissionAction) => {
        setPermissions(prev => {
            const currentActions = prev[module] || []
            const newActions = currentActions.includes(action)
                ? currentActions.filter(a => a !== action)
                : [...currentActions, action]

            return {
                ...prev,
                [module]: newActions
            }
        })
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            const updates = Object.entries(permissions).map(([module, actions]) => ({
                role: selectedRole,
                module,
                actions,
                updated_at: new Date().toISOString()
            }))

            const { error } = await supabase
                .from('role_permissions')
                .upsert(updates, { onConflict: 'role,module' })

            if (error) throw error

            toast.success(`Permissions updated for ${selectedRole}`)
        } catch (error) {
            console.error('Save error:', error)
            toast.error('Failed to save permissions')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Card className="w-full max-w-5xl mx-auto border-none shadow-none bg-transparent">
            <div className="flex flex-col h-[85vh]">
                <div className="space-y-4">
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Role Permissions Editor</h2>
                                <p className="text-muted-foreground font-medium">
                                    Configure granular access controls for each user role.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg border border-border/50">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2">Role:</span>
                            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                                <SelectTrigger className="w-[180px] h-9 bg-background font-bold capitalize">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                    <SelectItem value="management">Management</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="store_keeper">Store Keeper</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden mt-6 border border-border/50 rounded-2xl bg-background/50 relative group">
                    <ScrollArea className="h-full">
                        <Table>
                            <TableHeader className="bg-muted/80 sticky top-0 z-20 backdrop-blur-md border-b">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="w-[220px] font-bold uppercase text-[10px] tracking-widest pl-6">Module Name</TableHead>
                                    {ACTIONS.map(action => (
                                        <TableHead key={action} className="text-center font-bold uppercase text-[10px] tracking-widest px-2">
                                            {action}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={ACTIONS.length + 1} className="h-[400px]">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                                                <p className="text-xs font-medium text-muted-foreground animate-pulse">Loading permission matrix...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    MODULES.map((module) => (
                                        <TableRow key={module} className="hover:bg-primary/5 border-border/30 transition-colors group/row">
                                            <TableCell className="font-bold py-4 pl-6">
                                                <span className="text-sm group-hover/row:text-primary transition-colors">
                                                    {MODULE_LABELS[module]}
                                                </span>
                                            </TableCell>
                                            {ACTIONS.map(action => (
                                                <TableCell key={action} className="text-center py-4">
                                                    <div className="flex justify-center">
                                                        <Checkbox
                                                            checked={(permissions[module] || []).includes(action)}
                                                            onCheckedChange={() => togglePermission(module, action)}
                                                            className="h-5 w-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-200"
                                                        />
                                                    </div>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-border/50 gap-3">
                    <Button
                        variant="outline"
                        className="font-bold h-11 px-6 gap-2"
                        onClick={() => fetchPermissions(selectedRole)}
                        disabled={loading || saving}
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset to Defaults
                    </Button>
                    <Button
                        className="font-bold h-11 px-8 gap-2 shadow-lg shadow-primary/20"
                        onClick={handleSave}
                        disabled={loading || saving}
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin text-inherit" /> : <Save className="h-4 w-4" />}
                        Save Permissions
                    </Button>
                </div>
            </div>
        </Card>
    )
}
