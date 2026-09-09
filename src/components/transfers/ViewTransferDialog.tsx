import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import type { TransferRequest } from '@/hooks/useTransfers'

interface ViewTransferDialogProps {
    transfer: TransferRequest | null
    open: boolean
    onClose: () => void
}

export function ViewTransferDialog({ transfer, open, onClose }: ViewTransferDialogProps) {
    if (!transfer) return null

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            case 'approved': return 'bg-primary/20 text-primary border-primary/20'
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Transfer Request Details</DialogTitle>
                    <DialogDescription>
                        Request #{transfer.request_number}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">From Project</label>
                            <p className="font-semibold">{transfer.from_project?.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">To Project</label>
                            <p className="font-semibold">{transfer.to_project?.name}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Material</label>
                            <p className="font-semibold">{transfer.material?.name}</p>
                            <p className="text-sm text-muted-foreground">{transfer.material?.code}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                            <p className="font-semibold">{transfer.quantity} {transfer.material?.unit}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            <div className="mt-1">
                                <Badge className={getStatusColor(transfer.status)}>
                                    {transfer.status}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                            <p className="font-semibold">{format(new Date(transfer.created_at), 'MMM d, yyyy HH:mm')}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
