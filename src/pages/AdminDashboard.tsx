import { useState, useEffect } from 'react'
import {
    Users,
    Shield,
    Database,
    Activity,
    MoreHorizontal,
    UserCheck,
    Clock,
    CheckCircle,
    XCircle,
    Package,
    Eye,
    Trash2,
    Mail,
    Calendar,
    BadgeCheck,
    UserPlus,
    FileText,
    ArrowRightLeft,
    Wallet
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'
import { PremiumAvatar } from '@/components/ui/PremiumAvatar'
import type { AvatarSize } from '@/components/ui/PremiumAvatar'
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders'
import { usePurchaseRequisitions } from '@/hooks/usePurchaseRequisitions'
import { useTransfers } from '@/hooks/useTransfers'
import { usePermissions } from '@/hooks/usePermissions'
import { AuditLogsDialog } from '@/components/admin/AuditLogsDialog'
import { SystemHealthDialog } from '@/components/admin/SystemHealthDialog'
import { AddUserDialog } from '@/components/admin/AddUserDialog'
import { UserPermissionsDialog } from '@/components/admin/UserPermissionsDialog'
import type { UserRole } from '@/lib/permissions'
import { useSettings } from '@/context/SettingsContext'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function AdminDashboard() {
    const { user: currentUser } = useAuth()
    const { currencySymbol } = useSettings()
    const [users, setUsers] = useState<Profile[]>([])
    const [viewUser, setViewUser] = useState<Profile | null>(null)
    const [showAuditLogs, setShowAuditLogs] = useState(false)
    const [showSystemHealth, setShowSystemHealth] = useState(false)
    const [showAddUser, setShowAddUser] = useState(false)
    const [viewPermissions, setViewPermissions] = useState<{ open: boolean; user: Profile | null }>({ open: false, user: null })
    const { orders, loading: ordersLoading, approvePO, rejectPO } = usePurchaseOrders()
    const { requisitions, updateRequisitionStatus } = usePurchaseRequisitions()
    const { transfers, approveTransfer } = useTransfers()
    const { canApprove, isAdmin } = usePermissions()
    const [sysStats, setSysStats] = useState({
        totalUsers: 0,
        activeAdmins: 0,
        pendingApprovals: 0,
        databaseSize: '124 MB', // Mock for now
        uptime: '99.9%'
    })
    const [loading, setLoading] = useState(true)

    // Filter pending orders for approval
    const pendingOrders = orders.filter(order => order.status === 'pending')
    const pendingRequisitions = requisitions?.filter(pr => pr.status === 'submitted') || []
    const pendingTransfers = transfers?.filter(tr => tr.status === 'pending') || []

    const handleApprovePR = async (prId: string, prNumber: string) => {
        const { error } = await updateRequisitionStatus(prId, 'approved')
        if (error) toast.error('Failed to approve PR')
        else toast.success(`PR ${prNumber} approved successfully`)
    }

    const handleRejectPR = async (prId: string, prNumber: string) => {
        const { error } = await updateRequisitionStatus(prId, 'rejected')
        if (error) toast.error('Failed to reject PR')
        else toast.error(`PR ${prNumber} rejected`)
    }

    const handleApproveTransfer = async (transfer: any) => {
        const result = await approveTransfer(transfer)
        if (!result.success) toast.error(result.error)
        else toast.success(`Transfer ${transfer.request_number} approved and executed.`)
    }

    const handleApprovePO = async (poId: string, poNumber: string) => {
        const { error } = await approvePO(poId)
        if (error) {
            toast.error(error)
        } else {
            toast.success(`PO ${poNumber} approved successfully`)
        }
    }

    const handleRejectPO = async (poId: string, poNumber: string) => {
        const { error } = await rejectPO(poId)
        if (error) {
            toast.error(error)
        } else {
            toast.error(`PO ${poNumber} rejected`)
        }
    }

    const handleDeleteUser = async (user: Profile) => {
        // Prevent self-deletion
        if (currentUser?.id === user.id) {
            toast.error('You cannot delete your own account')
            return
        }

        if (!window.confirm(`Are you sure you want to delete user "${user.full_name}"? This action cannot be undone.`)) {
            return
        }

        try {
            // Soft delete: Mark user as disabled/deleted instead of hard delete
            // This avoids Edge Function JWT issues
            
            // 1. Delete profile from database (soft delete by marking name)
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', user.id)

            if (profileError) throw profileError

            // 2. Delete notifications
            await supabase
                .from('notifications')
                .delete()
                .eq('user_id', user.id)

            toast.success('User deleted successfully')
            fetchAdminData()
        } catch (error: any) {
            console.error('Error deleting user:', error)
            toast.error(error.message || 'Failed to delete user')
        }
    }

    useEffect(() => {
        fetchAdminData()
    }, [])

    async function fetchAdminData() {
        try {
            setLoading(true)
            const [
                { data: profiles },
                { count: prCount }
            ] = await Promise.all([
                supabase.from('profiles').select('*').order('created_at', { ascending: false }),
                supabase.from('purchase_requisitions').select('*', { count: 'exact', head: true }).eq('status', 'submitted')
            ])

            if (profiles) {
                setUsers(profiles)
                setSysStats(prev => ({
                    ...prev,
                    totalUsers: profiles.length,
                    activeAdmins: profiles.filter(p => p.role === 'admin').length,
                    pendingApprovals: prCount || 0
                }))
            }
        } catch (error) {
            console.error('Error fetching admin data:', error)
            toast.error('Failed to load system metrics')
        } finally {
            setLoading(false)
        }
    }



    const updateUserRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error

            toast.success('Role updated successfully')
            fetchAdminData()
        } catch (error) {
            console.error('Error updating role:', error)
            toast.error('Failed to update role')
        }
    }


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner text="Securing Admin access..." />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
                        Admin Command Center
                    </h1>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold opacity-70">Internal Systems & User Governance</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-background border-border hover:bg-accent ring-1 ring-border shadow-sm" onClick={() => setShowAuditLogs(true)}>Audit Logs</Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold" onClick={() => setShowSystemHealth(true)}>System Health</Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold" onClick={() => setShowAddUser(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite User
                    </Button>
                </div>
            </div>

            {/* System Status Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: 'System Users', value: sysStats.totalUsers, icon: Users, color: 'text-primary' },
                    { title: 'Authorized Admins', value: sysStats.activeAdmins, icon: Shield, color: 'text-primary' },
                    { title: 'Pending PRs', value: sysStats.pendingApprovals, icon: Clock, color: 'text-orange-500' },
                    { title: 'DB Storage', value: sysStats.databaseSize, icon: Database, color: 'text-purple-500' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-card/50 backdrop-blur-md border-border overflow-hidden relative group hover:border-primary/30 transition-all duration-300 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                {stat.title}
                            </CardTitle>
                            <div className={cn("p-1.5 rounded-lg bg-background/80 shadow-sm border border-border", stat.color)}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-1 text-foreground">{stat.value}</div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary">
                                <Activity className="h-3 w-3" />
                                <span>SYSTEM NORMAL</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Area: User Management */}
            {isAdmin() && (
                <div className="grid gap-6 grid-cols-1">
                    <Card className="bg-card/50 border-border backdrop-blur-md shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold text-foreground">User Governance</CardTitle>
                                <CardDescription>Manage system access and privileges</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" className="bg-background border-border text-xs">Filter Roles</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-border overflow-hidden bg-background/50">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent border-border">
                                            <TableHead className="font-bold text-xs">USER</TableHead>
                                            <TableHead className="font-bold text-xs">ROLE</TableHead>
                                            <TableHead className="font-bold text-xs">JOINED</TableHead>
                                            <TableHead className="font-bold text-xs text-right">ACTIONS</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => {
                                            const size: AvatarSize = 'md'

                                            return (
                                                <TableRow key={user.id} className="hover:bg-muted/20 border-border transition-colors">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <PremiumAvatar
                                                                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email || 'User')}&background=random&color=fff`}
                                                                fallback={user.full_name?.slice(0, 2).toUpperCase() || "US"}
                                                                size={size}
                                                                badgeIcon={
                                                                    user.role === 'admin' ? Shield :
                                                                        user.role === 'manager' ? UserCheck :
                                                                            user.role === 'store_keeper' ? Package :
                                                                                user.role === 'management' ? Database :
                                                                                 user.role === 'finance_executive' ? Wallet :
                                                                                     Clock
                                                                }
                                                                badgeColor={
                                                                    user.role === 'admin' ? 'success' :
                                                                        user.role === 'manager' ? 'info' :
                                                                            user.role === 'store_keeper' ? 'warning' :
                                                                                user.role === 'management' ? 'primary' :
                                                                                 user.role === 'finance_executive' ? 'secondary' :
                                                                                     'secondary'
                                                                }
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-sm">{user.full_name || 'Incognito User'}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-muted-foreground">{user.email}</span>
                                                                    {user.job_title && (
                                                                        <>
                                                                            <span className="text-muted-foreground">•</span>
                                                                            <span className="text-[10px] font-medium text-primary/70">{user.job_title}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={cn(
                                                            "capitalize text-[10px] font-bold px-3 py-1 bg-muted/30 border-none transition-all duration-300",
                                                            user.role === 'admin' ? "bg-primary/20 text-primary" :
                                                                user.role === 'manager' ? "bg-orange-500/20 text-orange-600" :
                                                                    user.role === 'management' ? "bg-blue-500/20 text-blue-600" :
                                                                        user.role === 'finance_executive' ? "bg-purple-500/20 text-purple-600" :
                                                                            user.role === 'store_keeper' ? "bg-emerald-500/20 text-emerald-600" :
                                                                                "bg-slate-500/10 text-slate-500"
                                                        )} variant="secondary">
                                                            {user.role?.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-[10px] font-medium text-muted-foreground">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110"
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
                                                                    <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-3 py-2">Actions</DropdownMenuLabel>
                                                                    <DropdownMenuItem onClick={() => setViewUser(user)}>
                                                                        <Eye className="mr-2 h-4 w-4" /> View Profile
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => setViewPermissions({ open: true, user })}>
                                                                        <Shield className="mr-2 h-4 w-4" /> View Permissions
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-3 py-2">Change Role</DropdownMenuLabel>

                                                                    <DropdownMenuItem onClick={() => updateUserRole(user.id, 'viewer')} className="flex items-center gap-2">
                                                                        <BadgeCheck className="h-4 w-4 text-slate-500" /> Set as Viewer
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => updateUserRole(user.id, 'store_keeper')} className="flex items-center gap-2">
                                                                        <Package className="h-4 w-4 text-emerald-500" /> Set as Store Keeper
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => updateUserRole(user.id, 'manager')} className="flex items-center gap-2">
                                                                        <UserPlus className="h-4 w-4 text-orange-500" /> Set as Manager
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => updateUserRole(user.id, 'management')} className="flex items-center gap-2">
                                                                        <Activity className="h-4 w-4 text-blue-500" /> Set as Management
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => updateUserRole(user.id, 'finance_executive')} className="flex items-center gap-2">
                                                                        <Wallet className="h-4 w-4 text-purple-500" /> Set as Finance Executive
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin')} className="flex items-center gap-2">
                                                                        <Shield className="h-4 w-4 text-primary" /> Set as Admin
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className={`text-red-600 ${currentUser?.id === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        onClick={() => currentUser?.id !== user.id && handleDeleteUser(user)}
                                                                        disabled={currentUser?.id === user.id}
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete User
                                                                        {currentUser?.id === user.id && (
                                                                            <span className="ml-2 text-xs">(Self)</span>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Purchase Orders Approval Section */}
            {canApprove('purchase_orders') && (
                <Card className="bg-card/50 border-border backdrop-blur-md shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                Purchase Orders Approval
                            </CardTitle>
                            <CardDescription>Review and approve pending purchase orders</CardDescription>
                        </div>
                        <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                            {pendingOrders.length} Pending
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        {ordersLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <LoadingSpinner text="Synchronizing PO records..." />
                            </div>
                        ) : pendingOrders.length === 0 ? (
                            <div className="text-center py-10">
                                <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                                <p className="text-muted-foreground font-medium">No pending purchase orders to review</p>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-border overflow-hidden bg-background/50">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent border-border">
                                            <TableHead className="font-bold text-xs">PO Number</TableHead>
                                            <TableHead className="font-bold text-xs">Vendor</TableHead>
                                            <TableHead className="font-bold text-xs">Amount</TableHead>
                                            <TableHead className="font-bold text-xs">Date</TableHead>
                                            <TableHead className="font-bold text-xs text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingOrders.map((order) => (
                                            <TableRow key={order.id} className="hover:bg-muted/20 border-border transition-colors">
                                                <TableCell className="font-mono text-sm font-bold text-primary">
                                                    #{order.po_number}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{order.vendor?.name}</span>
                                                        <span className="text-[10px] text-muted-foreground">{order.vendor?.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-sm">
                                                    {currencySymbol}{order.total_amount?.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-[10px] font-medium text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-3 text-primary hover:bg-primary/5 hover:text-primary font-medium"
                                                            onClick={() => handleApprovePO(order.id, order.po_number)}
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
                                                            onClick={() => handleRejectPO(order.id, order.po_number)}
                                                        >
                                                            <XCircle className="h-3.5 w-3.5 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Purchase Requisitions Approval Section */}
            {canApprove('purchase_requisitions') && (
                <Card className="bg-card/50 border-border backdrop-blur-md shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Purchase Requisitions Approval
                            </CardTitle>
                            <CardDescription>Review and approve pending purchase requisitions</CardDescription>
                        </div>
                        <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                            {pendingRequisitions.length} Pending
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        {pendingRequisitions.length === 0 ? (
                            <div className="text-center py-10">
                                <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                                <p className="text-muted-foreground font-medium">No pending purchase requisitions to review</p>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-border overflow-hidden bg-background/50">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent border-border">
                                            <TableHead className="font-bold text-xs">PR Number</TableHead>
                                            <TableHead className="font-bold text-xs">Requester</TableHead>
                                            <TableHead className="font-bold text-xs">Project</TableHead>
                                            <TableHead className="font-bold text-xs">Date</TableHead>
                                            <TableHead className="font-bold text-xs text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingRequisitions.map((pr) => (
                                            <TableRow key={pr.id} className="hover:bg-muted/20 border-border transition-colors">
                                                <TableCell className="font-mono text-sm font-bold text-primary">
                                                    #{pr.pr_number}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{pr.requester?.full_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-sm">
                                                    {pr.project?.name}
                                                </TableCell>
                                                <TableCell className="text-[10px] font-medium text-muted-foreground">
                                                    {new Date(pr.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-3 text-primary hover:bg-primary/5 hover:text-primary font-medium"
                                                            onClick={() => handleApprovePR(pr.id, pr.pr_number)}
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
                                                            onClick={() => handleRejectPR(pr.id, pr.pr_number)}
                                                        >
                                                            <XCircle className="h-3.5 w-3.5 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Transfers Approval Section */}
            {canApprove('transfers') && (
                <Card className="bg-card/50 border-border backdrop-blur-md shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                                <ArrowRightLeft className="h-5 w-5 text-primary" />
                                Transfers Approval
                            </CardTitle>
                            <CardDescription>Review and execute pending material transfers</CardDescription>
                        </div>
                        <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                            {pendingTransfers.length} Pending
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        {pendingTransfers.length === 0 ? (
                            <div className="text-center py-10">
                                <ArrowRightLeft className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                                <p className="text-muted-foreground font-medium">No pending transfers to review</p>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-border overflow-hidden bg-background/50">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent border-border">
                                            <TableHead className="font-bold text-xs">TR Number</TableHead>
                                            <TableHead className="font-bold text-xs">Material</TableHead>
                                            <TableHead className="font-bold text-xs">Quantity</TableHead>
                                            <TableHead className="font-bold text-xs">Route</TableHead>
                                            <TableHead className="font-bold text-xs text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingTransfers.map((tr) => (
                                            <TableRow key={tr.id} className="hover:bg-muted/20 border-border transition-colors">
                                                <TableCell className="font-mono text-sm font-bold text-primary">
                                                    #{tr.request_number}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{tr.material?.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-sm">
                                                    {tr.quantity} {tr.material?.unit}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="inline-flex items-center gap-2 bg-muted/40 border border-border/50 rounded-full px-3 py-1.5 transition-colors hover:bg-muted/60">
                                                        <div className="flex items-center gap-1.5 max-w-[120px] overflow-hidden" title={tr.from_project?.name}>
                                                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500/80 shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                                            <span className="text-xs font-semibold text-muted-foreground truncate">{tr.from_project?.name || 'Unknown'}</span>
                                                        </div>
                                                        <ArrowRightLeft className="h-3.5 w-3.5 text-primary opacity-60 shrink-0" />
                                                        <div className="flex items-center gap-1.5 max-w-[120px] overflow-hidden" title={tr.to_project?.name}>
                                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                            <span className="text-xs font-bold text-foreground truncate">{tr.to_project?.name || 'Unknown'}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-3 text-primary hover:bg-primary/5 hover:text-primary font-medium"
                                                            onClick={() => handleApproveTransfer(tr)}
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                            Approve
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>User Profile</DialogTitle>
                        <DialogDescription>Detailed information about the selected user.</DialogDescription>
                    </DialogHeader>
                    {viewUser && (
                        <div className="flex flex-col items-center space-y-4 py-4">
                            <PremiumAvatar
                                src={viewUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewUser.full_name || viewUser.email || 'User')}&background=random&color=fff`}
                                fallback={viewUser.full_name?.slice(0, 2).toUpperCase() || "US"}
                                size="lg"
                                className="h-24 w-24 ring-4 ring-muted"
                            />
                            <div className="text-center space-y-1">
                                <h3 className="text-xl font-bold">{viewUser.full_name || 'Incognito User'}</h3>
                                <div className="flex items-center justify-center gap-2">
                                    <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                                        {viewUser.role}
                                    </Badge>
                                    {viewUser.job_title && (
                                        <Badge variant="outline" className="px-3 py-1 text-sm font-medium border-primary/20 text-primary bg-primary/5">
                                            {viewUser.job_title}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="w-full space-y-3 mt-4 border-t pt-4">
                                <div className="flex items-center p-3 rounded-lg bg-muted/50">
                                    <Mail className="h-5 w-5 text-muted-foreground mr-3" />
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-muted-foreground">Email Address</p>
                                        <p className="text-sm font-semibold">{viewUser.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-3 rounded-lg bg-muted/50">
                                    <Calendar className="h-5 w-5 text-muted-foreground mr-3" />
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-muted-foreground">Joined On</p>
                                        <p className="text-sm font-semibold">{new Date(viewUser.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-3 rounded-lg bg-muted/50">
                                    <BadgeCheck className="h-5 w-5 text-muted-foreground mr-3" />
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-muted-foreground">Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            <p className="text-sm font-semibold">Active</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <AuditLogsDialog open={showAuditLogs} onOpenChange={setShowAuditLogs} />
            <SystemHealthDialog open={showSystemHealth} onOpenChange={setShowSystemHealth} />
            <AddUserDialog
                open={showAddUser}
                onOpenChange={setShowAddUser}
                onUserAdded={fetchAdminData}
            />
            <UserPermissionsDialog
                open={viewPermissions.open}
                onOpenChange={(open) => !open && setViewPermissions({ open: false, user: null })}
                userRole={viewPermissions.user?.role as UserRole || 'viewer'}
                userName={viewPermissions.user?.full_name || 'Unknown User'}
            />

        </div>
    )
}
