import { useState } from 'react'
import { useTransfers } from '@/hooks/useTransfers'
import type { TransferRequest } from '@/hooks/useTransfers'
import { CreateTransferDialog } from '@/components/inventory/CreateTransferDialog'
import { ViewTransferDialog } from '@/components/transfers/ViewTransferDialog'

import { usePermissions } from '@/hooks/usePermissions'
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
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Eye, Trash2, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Transfers() {
    const { transfers, loading, refresh, approveTransfer, deleteTransfer } = useTransfers()
    const { canCreate, canDelete, canApprove } = usePermissions()
    const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)

    // Check if user can approve transfers
    const canApproveTransfers = canApprove('transfers')
    const canCreateTransfers = canCreate('transfers')
    const canDeleteTransfers = canDelete('transfers')

    const handleReject = async (transfer: TransferRequest) => {
        if (!canApproveTransfers) {
            toast.error("You don't have permission to reject transfers")
            return
        }

        try {
            const { error } = await supabase
                .from('transfer_requests')
                .update({ status: 'rejected' })
                .eq('id', transfer.id)

            if (error) throw error

            toast.success("Transfer rejected successfully")
            refresh()
        } catch (error: any) {
            console.error("Error rejecting transfer:", error)
            toast.error("Failed to reject transfer: " + error.message)
        }
    }

    const handleDelete = async (transfer: TransferRequest) => {
        if (!window.confirm(`Delete transfer request ${transfer.request_number}? This cannot be undone.`)) {
            return
        }

        const { success, error } = await deleteTransfer(transfer)
        if (success) {
            toast.success("Transfer deleted and stock reverted successfully")
        } else {
            toast.error("Failed to delete transfer: " + error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            case 'approved': return 'bg-primary/20 text-primary border-primary/20'
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const handleApprove = async (transfer: TransferRequest) => {
        if (!canApproveTransfers) {
            toast.error("You don't have permission to approve transfers")
            return
        }

        const { success, error } = await approveTransfer(transfer)
        if (success) {
            toast.success("Transfer executed successfully")
        } else {
            toast.error("Failed to execute transfer: " + error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transfers</h1>
                    <p className="text-muted-foreground">
                        {canApproveTransfers
                            ? "You can approve or reject transfer requests"
                            : "You can view transfer details. Contact admin or manager for approvals."
                        }
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {canCreateTransfers && <CreateTransferDialog onTransferCreated={refresh} />}
                    {!canApproveTransfers && (
                        <Badge variant="outline" className="text-orange-600">
                            View Only
                        </Badge>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transfer History</CardTitle>
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
                                    <TableHead>Request #</TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Material</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transfers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center">No transfers found</TableCell>
                                    </TableRow>
                                ) : (
                                    transfers.map((tr) => (
                                        <TableRow key={tr.id}>
                                            <TableCell className="font-mono text-sm">{tr.request_number}</TableCell>
                                            <TableCell>{tr.from_project?.name}</TableCell>
                                            <TableCell>{tr.to_project?.name}</TableCell>
                                            <TableCell>{tr.material?.name}</TableCell>
                                            <TableCell>{tr.quantity} {tr.material?.unit}</TableCell>
                                            <TableCell>{format(new Date(tr.created_at), 'MMM d, yyyy')}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(tr.status)}>
                                                    {tr.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => {
                                                            setSelectedTransfer(tr)
                                                            setViewDialogOpen(true)
                                                        }}>
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </DropdownMenuItem>

                                                        {tr.status === 'pending' && canApproveTransfers && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleApprove(tr)} className="text-green-600">
                                                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleReject(tr)} className="text-red-600">
                                                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}

                                                        {canDeleteTransfers && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(tr)}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* View Transfer Dialog */}
            <ViewTransferDialog
                transfer={selectedTransfer}
                open={viewDialogOpen}
                onClose={() => {
                    setViewDialogOpen(false)
                    setSelectedTransfer(null)
                }}
            />
        </div>
    )
}
