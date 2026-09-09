import { useState } from 'react'
import { Eye, Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PurchaseOrder, CompanyInfo } from '@/hooks/usePurchaseOrders'
import { POPrintPreview } from './POPrintPreview'

interface ViewOrderDialogProps {
    order: PurchaseOrder | null
    companyInfo?: CompanyInfo | null
    open: boolean
    onClose: () => void
}

export function ViewOrderDialog({ order, companyInfo, open, onClose }: ViewOrderDialogProps) {
    const [printPreviewOpen, setPrintPreviewOpen] = useState(false)

    if (!order) return null

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
            case 'confirmed': return 'bg-primary/10 text-primary border-primary/20'
            case 'partially_received': return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
            case 'received': return 'bg-green-500/10 text-green-600 border-green-500/20'
            case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20'
            default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Purchase Order Details
                    </DialogTitle>
                    <DialogDescription>
                        View complete information for PO #{order.po_number}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Order Header */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Order Information</span>
                                <Badge className={getStatusColor(order.status)}>
                                    {order.status}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">PO Number</label>
                                <p className="font-mono font-bold">{order.po_number}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                                <p>{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                                <p className="font-bold text-lg">${order.total_amount?.toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <p className="capitalize">{order.status}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vendor Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vendor Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Vendor Name</label>
                                    <p className="font-bold">{order.vendor?.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p>{order.vendor?.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.items && order.items.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Material</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Unit Price</TableHead>
                                            <TableHead>Total Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{item.material?.name}</p>
                                                        <p className="text-sm text-muted-foreground">{item.material?.code}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{item.quantity} {item.material?.unit}</TableCell>
                                                <TableCell>${item.unit_price?.toLocaleString()}</TableCell>
                                                <TableCell>${item.total_price?.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-center text-muted-foreground py-4">No items found for this order</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setPrintPreviewOpen(true)}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print Preview
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>

                {/* Print Preview Dialog */}
                <POPrintPreview
                    open={printPreviewOpen}
                    onOpenChange={setPrintPreviewOpen}
                    purchaseOrder={order}
                    companyInfo={companyInfo}
                />
            </DialogContent>
        </Dialog>
    )
}
