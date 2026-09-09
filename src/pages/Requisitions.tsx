import { usePurchaseRequisitions } from '@/hooks/usePurchaseRequisitions'
import { usePermissions } from '@/hooks/usePermissions'
import { CreateRequisitionDialog } from '@/components/procurement/CreateRequisitionDialog'
import { CreatePOFromPRDialog } from '@/components/procurement/CreatePOFromPRDialog'
import { TableAction } from '@/components/common/TableAction'
import { ViewRequisitionDialog } from '@/components/procurement/ViewRequisitionDialog'
import { EditRequisitionDialog } from '@/components/procurement/EditRequisitionDialog'
import { PRPrintPreview } from '@/components/procurement/PRPrintPreview'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { useState } from 'react'
import { Eye, Edit3, Trash2, Check, X, Printer } from 'lucide-react'
import { toast } from 'sonner'
import type { PurchaseRequisition } from '@/hooks/usePurchaseRequisitions'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Requisitions() {
    const { requisitions, loading, refresh, deleteRequisition, updateRequisitionStatus } = usePurchaseRequisitions()
    const { canCreate, canEdit, canDelete, canApprove } = usePermissions()
    const [selectedPr, setSelectedPr] = useState<PurchaseRequisition | null>(null)
    const [viewOpen, setViewOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [printOpen, setPrintOpen] = useState(false)
    const [createPoOpen, setCreatePoOpen] = useState(false)

    const canApproveRequisitions = canApprove('purchase_requisitions')
    const canDeleteRequisitions = canDelete('purchase_requisitions')

    const handleApprove = async (prId: string) => {
        const { error } = await updateRequisitionStatus(prId, 'approved')
        if (error) {
            toast.error('Failed to approve requisition')
        } else {
            toast.success('Requisition approved successfully')
            refresh()
        }
    }

    const handleReject = async (prId: string) => {
        const { error } = await updateRequisitionStatus(prId, 'rejected')
        if (error) {
            toast.error('Failed to reject requisition')
        } else {
            toast.success('Requisition rejected')
            refresh()
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            case 'submitted': return 'bg-primary/20 text-primary border-primary/20'
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Purchase Requisitions</h1>
                {canCreate('purchase_requisitions') && <CreateRequisitionDialog onRequisitionCreated={refresh} />}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Requisition History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>PR Number</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Requested By</TableHead>
                                    <TableHead>Required Date</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requisitions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">No requisitions found</TableCell>
                                    </TableRow>
                                ) : (
                                    requisitions.map((pr) => (
                                        <TableRow key={pr.id}>
                                            <TableCell className="font-mono text-sm">{pr.pr_number}</TableCell>
                                            <TableCell>{pr.project?.name}</TableCell>
                                            <TableCell>{pr.requester?.full_name}</TableCell>
                                            <TableCell>{format(new Date(pr.required_date), 'MMM d, yyyy')}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs space-y-1">
                                                    {pr.items?.map(item => (
                                                        <span key={item.id}>
                                                            {item.material?.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(pr.status)}>
                                                    {pr.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <TableAction
                                                    actions={[
                                                        ...(pr.status === 'submitted' && canApproveRequisitions ? [
                                                            {
                                                                label: 'Approve',
                                                                icon: <Check className="h-3.5 w-3.5" />,
                                                                onClick: () => handleApprove(pr.id)
                                                            },
                                                            {
                                                                label: 'Reject',
                                                                icon: <X className="h-3.5 w-3.5" />,
                                                                variant: 'destructive' as const,
                                                                onClick: () => handleReject(pr.id)
                                                            }
                                                        ] : []),
                                                        ...(canCreate('purchase_orders') ? [{
                                                            label: (pr.purchase_orders?.length || 0) > 0 ? 'PO Generated' : 'Create PO',
                                                            icon: <Check className="h-3.5 w-3.5" />,
                                                            variant: (pr.purchase_orders?.length || 0) > 0 ? 'success' as const : 'default' as const,
                                                            onClick: () => {
                                                                setSelectedPr(pr)
                                                                setCreatePoOpen(true)
                                                            }
                                                        }] : []),
                                                        {
                                                            label: 'View PR',
                                                            icon: <Eye className="h-3.5 w-3.5" />,
                                                            onClick: () => {
                                                                setSelectedPr(pr)
                                                                setViewOpen(true)
                                                            }
                                                        },
                                                        {
                                                            label: 'Print PR',
                                                            icon: <Printer className="h-3.5 w-3.5" />,
                                                            onClick: () => {
                                                                setSelectedPr(pr)
                                                                setPrintOpen(true)
                                                            }
                                                        },
                                                        {
                                                            label: 'Edit PR',
                                                            icon: <Edit3 className="h-3.5 w-3.5" />,
                                                            disabled: !canEdit('purchase_requisitions'),
                                                            onClick: () => {
                                                                setSelectedPr(pr)
                                                                setEditOpen(true)
                                                            }
                                                        },
                                                        {
                                                            label: 'Delete PR',
                                                            icon: <Trash2 className="h-3.5 w-3.5" />,
                                                            variant: 'destructive' as const,
                                                            disabled: !canDeleteRequisitions,
                                                            onClick: async () => {
                                                                if (!window.confirm(`Delete PR ${pr.pr_number}? This cannot be undone.`)) return
                                                                const { error } = await deleteRequisition(pr.id)
                                                                if (error) {
                                                                    toast.error('Failed to delete requisition')
                                                                } else {
                                                                    toast.success('Requisition deleted')
                                                                    refresh()
                                                                }
                                                            }
                                                        }
                                                    ]}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <ViewRequisitionDialog
                requisition={selectedPr}
                open={viewOpen}
                onClose={() => setViewOpen(false)}
            />

            <EditRequisitionDialog
                requisition={selectedPr}
                open={editOpen}
                onClose={() => {
                    setEditOpen(false)
                    refresh()
                }}
            />

            <PRPrintPreview
                open={printOpen}
                onOpenChange={setPrintOpen}
                requisition={selectedPr}
            />

            {selectedPr && (
                <CreatePOFromPRDialog
                    pr={selectedPr}
                    onPOCreated={refresh}
                    open={createPoOpen}
                    onOpenChange={setCreatePoOpen}
                />
            )}
        </div>
    )
}
