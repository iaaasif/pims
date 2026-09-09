import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, Package, AlertTriangle, Activity, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { useProjects } from '@/hooks/useProjects'
import { useInventory } from '@/hooks/useInventory'
import { useTransfers } from '@/hooks/useTransfers'
import { usePurchaseRequisitions } from '@/hooks/usePurchaseRequisitions'
import { useSettings } from '@/context/SettingsContext'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface ProjectStats {
    totalMaterials: number
    totalValue: number
    lowStockItems: number
    activeTransfers: number
    pendingRequisitions: number
    totalUsage: number
}

export default function ProjectDashboard() {
    const { id: projectId } = useParams()
    const navigate = useNavigate()
    const { currencySymbol } = useSettings()
    const { projects, loading: projectsLoading } = useProjects()
    const { inventory, loading: inventoryLoading } = useInventory(projectId)
    const { transfers, loading: transfersLoading } = useTransfers()
    const { requisitions, loading: requisitionsLoading } = usePurchaseRequisitions()
    const [stats, setStats] = useState<ProjectStats>({
        totalMaterials: 0,
        totalValue: 0,
        lowStockItems: 0,
        activeTransfers: 0,
        pendingRequisitions: 0,
        totalUsage: 0
    })
    const [activeTab, setActiveTab] = useState('overview')

    const project = projects.find(p => p.id === projectId)

    const projectTransfers = transfers.filter(t =>
        t.from_project_id === projectId || t.to_project_id === projectId
    )
    const projectRequisitions = requisitions.filter(r => r.project_id === projectId)

    useEffect(() => {
        if (project) {
            const totalMaterials = inventory.length
            const lowStockItems = inventory.filter(item => {
                const material = item.material
                return material && item.quantity <= material.min_stock_level
            }).length
            const totalUsage = inventory.reduce((sum, item) => sum + Number(item.quantity), 0)
            const totalValue = inventory.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.material.unit_price || 0)), 0)

            const activeTransfers = projectTransfers.filter(t => t.status === 'pending').length
            const pendingRequisitions = projectRequisitions.filter(r => r.status === 'submitted').length

            setStats({
                totalMaterials,
                totalValue,
                lowStockItems,
                activeTransfers,
                pendingRequisitions,
                totalUsage
            })
        }
    }, [project, inventory, transfers, requisitions, projectId])

    if (!projectId) return <div>Invalid Project ID</div>
    if (projectsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <LoadingSpinner text="Accessing project vault..." />
            </div>
        )
    }
    if (!project) return <div className="p-8 text-center text-destructive">Project not found</div>

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'completed': return 'bg-blue-100 text-blue-800'
            case 'on_hold': return 'bg-yellow-100 text-yellow-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/projects')}
                    className="hover:bg-muted"
                    title="Back to Projects"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-muted-foreground">Project dashboard and analytics</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(project.status)}>
                        {project.status}
                    </Badge>
                    <Badge variant="outline">
                        {project.code}
                    </Badge>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMaterials}</div>
                        <p className="text-xs text-muted-foreground">Unique items</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-emerald-700 uppercase tracking-widest">Total Value</CardTitle>
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-emerald-900 leading-tight">
                            {currencySymbol}{stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-tight mt-1">Net Inventory worth</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text stock text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
                        <p className="text-xs text-muted-foreground">Need reordering</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeTransfers + stats.pendingRequisitions}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activeTransfers} transfers, {stats.pendingRequisitions} requisitions
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="transfers">Transfers</TabsTrigger>
                    <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Status</span>
                                    <Badge className={getStatusColor(project.status)}>
                                        {project.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Created</span>
                                    <span className="text-sm text-muted-foreground">
                                        {format(new Date(project.created_at), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">Location</span>
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">
                                            {project.location?.name || 'Not specified'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {project.project_address || project.location?.address || 'No address available'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Total Usage</span>
                                    <span className="text-sm font-bold">{stats.totalUsage} units</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Avg Usage/Item</span>
                                    <span className="text-sm font-bold">
                                        {stats.totalMaterials > 0 ? Math.round(stats.totalUsage / stats.totalMaterials) : 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Low Stock %</span>
                                    <span className="text-sm font-bold text-orange-600">
                                        {stats.totalMaterials > 0 ? Math.round((stats.lowStockItems / stats.totalMaterials) * 100) : 0}%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {transfers.slice(0, 3).map((transfer) => (
                                    <div key={transfer.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-blue-100 rounded-full" />
                                            <div>
                                                <p className="text-sm font-medium">Transfer {transfer.request_number}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {transfer.from_project?.name} → {transfer.to_project?.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="text-xs">
                                                {transfer.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {projectTransfers.length === 0 && (
                                    <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border/50">
                                        <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30 animate-pulse" />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No recent transfers recorded</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Overview</CardTitle>
                            <CardDescription>
                                Current inventory levels and stock status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {inventoryLoading ? (
                                <div>Loading inventory...</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Material</TableHead>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Current Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Last Updated</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {inventory.slice(0, 10).map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.material.name}</TableCell>
                                                <TableCell className="font-mono text-sm">{item.material.code || '-'}</TableCell>
                                                <TableCell className="font-bold">{item.quantity}</TableCell>
                                                <TableCell>
                                                    <Badge variant={item.quantity <= item.material.min_stock_level ? "destructive" : "secondary"}>
                                                        {item.quantity <= item.material.min_stock_level ? 'Low Stock' : 'In Stock'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {format(new Date(item.usage_date), 'MMM d, yyyy')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {inventory.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No inventory data available
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transfers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transfer Requests</CardTitle>
                            <CardDescription>
                                Pending and recent transfer requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transfersLoading ? (
                                <div>Loading transfers...</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Request #</TableHead>
                                            <TableHead>From</TableHead>
                                            <TableHead>To</TableHead>
                                            <TableHead>Material</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {projectTransfers.slice(0, 10).map((transfer) => (
                                            <TableRow key={transfer.id}>
                                                <TableCell className="font-mono text-sm">{transfer.request_number}</TableCell>
                                                <TableCell>{transfer.from_project?.name}</TableCell>
                                                <TableCell>{transfer.to_project?.name}</TableCell>
                                                <TableCell>{transfer.material?.name}</TableCell>
                                                <TableCell>{transfer.quantity} {transfer.material?.unit}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {transfer.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{format(new Date(transfer.created_at), 'MMM d, yyyy')}</TableCell>
                                            </TableRow>
                                        ))}
                                        {projectTransfers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    No transfer requests
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="requisitions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase Requisitions</CardTitle>
                            <CardDescription>
                                Pending and recent purchase requisitions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {requisitionsLoading ? (
                                <div>Loading requisitions...</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>PR #</TableHead>
                                            <TableHead>Project</TableHead>
                                            <TableHead>Requested By</TableHead>
                                            <TableHead>Required Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {projectRequisitions.slice(0, 10).map((requisition) => (
                                            <TableRow key={requisition.id}>
                                                <TableCell className="font-mono text-sm">{requisition.pr_number}</TableCell>
                                                <TableCell>{requisition.project?.name}</TableCell>
                                                <TableCell>{requisition.requester?.full_name}</TableCell>
                                                <TableCell>{format(new Date(requisition.required_date), 'MMM d, yyyy')}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {requisition.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{format(new Date(requisition.created_at), 'MMM d, yyyy')}</TableCell>
                                            </TableRow>
                                        ))}
                                        {projectRequisitions.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    No purchase requisitions
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
