import { usePurchaseOrders } from '@/hooks/usePurchaseOrders'
import { usePermissions } from '@/hooks/usePermissions'
import type { PurchaseOrder } from '@/hooks/usePurchaseOrders'
import { TableAction } from '@/components/common/TableAction'
import { TableToolbar } from '@/components/common/TableToolbar'
import { ViewOrderDialog } from '@/components/procurement/ViewOrderDialog'
import { EditOrderDialog } from '@/components/procurement/EditOrderDialog'
import { POPrintPreview } from '@/components/procurement/POPrintPreview'
import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
    Plus,
    ChevronRight,
    Eye,
    Edit3,
    Trash2,
    Package,
    Printer,
    PackagePlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useSettings } from '@/context/SettingsContext'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Orders() {
    const { currencySymbol } = useSettings()
    const { orders, companyInfo, loading, deletePO, refresh } = usePurchaseOrders()
    const { canCreate, canEdit, canDelete } = usePermissions()
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [printPreviewOpen, setPrintPreviewOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const handleAddToInventory = async (po: PurchaseOrder) => {
        if (po.status !== 'received') {
            toast.error('Only received Purchase Orders can be added to inventory')
            return
        }

        try {
            // First check if items are already added
            const { data: checkData, error: checkError } = await supabase.rpc('check_po_items_in_inventory', {
                po_uuid: po.id
            })

            if (checkError) {
                console.error('Error checking inventory status:', checkError)
                toast.error('Failed to check inventory status')
                return
            }

            if (checkData && checkData.length > 0) {
                const checkResult = checkData[0] as any
                if (checkResult.already_added) {
                    toast.warning(checkResult.message || 'Items from this PO are already in inventory')
                    return
                }

                if (checkResult.added_items > 0) {
                    const confirmAdd = window.confirm(
                        `${checkResult.added_items} of ${checkResult.total_items} items from this PO are already in inventory. Do you want to add the remaining ${checkResult.total_items - checkResult.added_items} items?`
                    )
                    if (!confirmAdd) return
                }
            }

            // Add items to inventory
            const { data, error } = await supabase.rpc('add_inventory_from_received_po', {
                po_uuid: po.id
            })

            if (error) {
                console.error('Error adding to inventory:', error)
                toast.error('Failed to add items to inventory')
                return
            }

            if (data && data.length > 0) {
                const successCount = data.filter((item: any) => item.success).length
                const failureCount = data.filter((item: any) => !item.success).length

                if (successCount > 0) {
                    toast.success(`Successfully added ${successCount} new items to inventory`)
                }

                if (failureCount > 0) {
                    const failedItems = data.filter((item: any) => !item.success)
                    const errorMessage = failedItems[0]?.message || 'Some items failed to add'
                    toast.error(errorMessage)
                }

                // Log details for debugging
                console.log('Inventory addition results:', data)
            } else {
                toast.info('No new items were added to inventory')
            }
        } catch (error) {
            console.error('Error in handleAddToInventory:', error)
            toast.error('An error occurred while adding to inventory')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-primary/10 text-primary border-primary/20'
            case 'partially_received': return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
            case 'received': return 'bg-green-500/10 text-green-600 border-green-500/20'
            case 'pending': return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
            case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20'
            default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20'
        }
    }

    const handleDeletePO = async (poId: string, poNumber: string) => {
        if (window.confirm(`Are you sure you want to delete PO ${poNumber}? This action cannot be undone.`)) {
            const { error } = await deletePO(poId)
            if (error) {
                toast.error(error)
            } else {
                toast.success(`PO ${poNumber} deleted successfully`)
            }
        }
    }

    const handlePrintPO = (po: PurchaseOrder) => {
        setSelectedOrder(po)
        setPrintPreviewOpen(true)
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.vendor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.status.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <span>Procurement</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-primary">PO List</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                                <Package className="h-6 w-6" />
                            </span>
                            Purchase Orders
                        </h1>
                        <p className="text-muted-foreground text-xs font-medium mt-1">Manage and track all procurement activities across the organization</p>
                    </div>
                    {canCreate('purchase_orders') && (
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 px-6 shadow-lg shadow-primary/20 rounded-xl gap-2 transition-all hover:scale-[1.02]">
                            <Plus className="h-5 w-5" />
                            Add New PO
                        </Button>
                    )}
                </div>
            </div>

            <Card className="border-border bg-card/50 backdrop-blur-md shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                    <TableToolbar
                        onSearch={setSearchQuery}
                        onFilter={() => {
                            // Simple cycle through statuses for now as a quick filter button action
                            const statuses = ['all', 'pending', 'confirmed', 'received', 'cancelled']
                            const nextIndex = (statuses.indexOf(statusFilter) + 1) % statuses.length
                            const nextStatus = statuses[nextIndex]
                            setStatusFilter(nextStatus)
                            toast.info(`Filtering by: ${nextStatus === 'all' ? 'All Statuses' : nextStatus.toUpperCase()}`)
                        }}
                        searchPlaceholder="Search POs, vendors or status..."
                    />
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center p-20">
                            <LoadingSpinner text="Fetching procurement history..." />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50 border-y border-border">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="w-12 text-center text-[10px] font-bold uppercase">Sl</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase">PO Number</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase">Vendor Details</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase">Materials</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase">Issued Date</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase">Amount</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase">Status</TableHead>
                                        <TableHead className="text-right text-[10px] font-bold uppercase px-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-20 opacity-40">
                                                <Package className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No matching orders found</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredOrders.map((po, idx) => (
                                            <TableRow key={po.id} className="hover:bg-muted/20 border-border group transition-all">
                                                <TableCell className="text-center text-xs font-bold text-muted-foreground">{idx + 1}</TableCell>
                                                <TableCell className="font-mono text-xs font-bold text-primary">
                                                    #{po.po_number}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{po.vendor?.name}</span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {po.vendor?.contact_person
                                                                ? `${po.vendor.contact_person}${po.vendor.phone ? ` · ${po.vendor.phone}` : ''}`
                                                                : po.vendor?.email || po.vendor?.phone || 'No contact info'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {po.items?.slice(0, 2).map((item, i) => (
                                                            <div key={i} className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md truncate max-w-[120px]">
                                                                    {item.material?.name}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-primary whitespace-nowrap">
                                                                    {item.quantity} {item.material?.unit}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {(po.items?.length || 0) > 2 && (
                                                            <span className="text-[9px] text-muted-foreground font-bold pl-1">
                                                                + {(po.items?.length || 0) - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs font-medium text-muted-foreground">
                                                    {po.created_at ? format(new Date(po.created_at), 'MMM d, yyyy') : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-bold text-sm">{currencySymbol}{po.total_amount?.toLocaleString()}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-bold capitalize shadow-sm", getStatusColor(po.status))}>
                                                        {po.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <TableAction
                                                        actions={[
                                                            {
                                                                label: 'View Order',
                                                                icon: <Eye className="h-3.5 w-3.5" />,
                                                                onClick: () => {
                                                                    setSelectedOrder(po)
                                                                    setViewDialogOpen(true)
                                                                }
                                                            },
                                                            {
                                                                label: 'Edit Details',
                                                                icon: <Edit3 className="h-3.5 w-3.5" />,
                                                                disabled: !canEdit('purchase_orders'),
                                                                onClick: () => {
                                                                    setSelectedOrder(po)
                                                                    setEditDialogOpen(true)
                                                                }
                                                            },
                                                            {
                                                                label: 'Print PO',
                                                                icon: <Printer className="h-3.5 w-3.5" />,
                                                                onClick: () => handlePrintPO(po)
                                                            },
                                                            // Only show "Add to Inventory" for received POs that haven't been fully added yet
                                                            ...(po.status === 'received' && canCreate('inventory') ? [{
                                                                label: 'Add to Inventory',
                                                                icon: <PackagePlus className="h-3.5 w-3.5" />,
                                                                onClick: () => handleAddToInventory(po),
                                                            }] : []),
                                                            {
                                                                label: 'Delete Order',
                                                                icon: <Trash2 className="h-3.5 w-3.5" />,
                                                                variant: 'destructive',
                                                                disabled: !canDelete('purchase_orders'),
                                                                onClick: () => handleDeletePO(po.id, po.po_number)
                                                            },
                                                        ]}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
                <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Showing {filteredOrders.length} of {orders.length} orders
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase shadow-none border-border" disabled>Previous</Button>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase shadow-none border-border" disabled>Next</Button>
                    </div>
                </div>
            </Card>

            {/* View Order Dialog */}
            <ViewOrderDialog
                order={selectedOrder}
                companyInfo={companyInfo}
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
            />

            {/* Edit Order Dialog */}
            <EditOrderDialog
                order={selectedOrder}
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onOrderUpdated={refresh}
            />

            {/* Print Preview Dialog */}
            <POPrintPreview
                open={printPreviewOpen}
                onOpenChange={setPrintPreviewOpen}
                purchaseOrder={selectedOrder}
                companyInfo={companyInfo}
            />
        </div>
    )
}
