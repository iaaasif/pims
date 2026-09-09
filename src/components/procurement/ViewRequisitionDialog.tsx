import { useState } from 'react'
import { format } from 'date-fns'
import { Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PRPrintPreview } from './PRPrintPreview'
import { useCompanyInformation } from '@/hooks/useCompanyInformation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import type { PurchaseRequisition } from '@/hooks/usePurchaseRequisitions'

interface ViewRequisitionDialogProps {
    requisition: PurchaseRequisition | null
    open: boolean
    onClose: () => void
}

export function ViewRequisitionDialog({ requisition, open, onClose }: ViewRequisitionDialogProps) {
    const [printPreviewOpen, setPrintPreviewOpen] = useState(false)
    const { company } = useCompanyInformation()

    if (!requisition) return null

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            case 'draft': return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300'
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-start justify-between pr-8">
                    <div>
                        <DialogTitle>Purchase Requisition Details</DialogTitle>
                        <DialogDescription>
                            PR #{requisition.pr_number}
                        </DialogDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setPrintPreviewOpen(true)} className="flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        Print Preview
                    </Button>
                </DialogHeader>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Requisition Info</span>
                                <Badge className={getStatusColor(requisition.status)}>{requisition.status}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Project</p>
                                <p className="font-bold">{requisition.project?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Requested By</p>
                                <p className="font-bold">{requisition.requester?.full_name || '-'}</p>
                                {requisition.requester?.job_title && (
                                    <p className="text-xs text-muted-foreground">{requisition.requester.job_title}</p>
                                )}
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{company?.company_name || 'Landora Real Estate Ltd.'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Required Date</p>
                                <p className="font-medium">{requisition.required_date ? format(new Date(requisition.required_date), 'MMM d, yyyy') : '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Amount</p>
                                <p className="font-bold">{requisition.total_amount ?? 0}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Justification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{requisition.justification || '-'}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {requisition.items && requisition.items.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Material</TableHead>
                                            <TableHead className="text-center">Required Date</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {requisition.items.map((it) => (
                                            <TableRow key={it.id ?? it.material_id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{it.material?.name}</span>
                                                        <span className="text-xs text-muted-foreground">{it.material?.code}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-medium">
                                                    {it.required_date ? format(new Date(it.required_date), 'MMM d, yyyy') : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">{it.quantity} {it.material?.unit}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-sm text-muted-foreground">No items</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>

            {/* Print Preview Dialog */}
            <PRPrintPreview 
                open={printPreviewOpen} 
                onOpenChange={setPrintPreviewOpen} 
                requisition={requisition} 
            />
        </Dialog>
    )
}
