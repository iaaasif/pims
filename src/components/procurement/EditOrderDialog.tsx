import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Edit3 } from 'lucide-react'

import { supabase } from '@/lib/supabase'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PurchaseOrder } from '@/hooks/usePurchaseOrders'

const formSchema = z.object({
    status: z.string().min(1, "Status is required"),
    total_amount: z.coerce.number().min(0, "Total amount must be at least 0"),
})

interface EditOrderDialogProps {
    order: PurchaseOrder | null
    open: boolean
    onClose: () => void
    onOrderUpdated: () => void
}

export function EditOrderDialog({ order, open, onClose, onOrderUpdated }: EditOrderDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [partialItems, setPartialItems] = useState<any[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            status: order?.status || '',
            total_amount: order?.total_amount || 0,
        },
    })

    useEffect(() => {
        if (order) {
            form.reset({
                status: order.status,
                total_amount: order.total_amount,
            })
            setPartialItems(order.items?.map(item => ({
                id: item.id,
                name: item.material?.name,
                unit: item.material?.unit,
                ordered: item.quantity,
                received: item.received_quantity || 0
            })) || [])
        }
    }, [order, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!order) return

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('purchase_orders')
                .update({
                    status: values.status as any,
                    total_amount: values.total_amount as any,
                })
                .eq('id', order.id)

            if (error) throw error

            // Update partial quantities if status is partially_received
            if (values.status === 'partially_received') {
                const updates = partialItems.map(item => 
                    supabase
                        .from('purchase_order_items')
                        .update({ received_quantity: item.received })
                        .eq('id', item.id)
                )
                await Promise.all(updates)
            }

            toast.success(`PO ${order.po_number} updated successfully`)
            onClose()
            onOrderUpdated()
        } catch (error) {
            toast.error('Failed to update order')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!order) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit3 className="h-5 w-5" />
                        Edit Purchase Order
                    </DialogTitle>
                    <DialogDescription>
                        Update details for PO #{order.po_number}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Order Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">PO Number</label>
                                        <p className="font-mono font-bold">{order.po_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                                        <p className="font-bold">{order.vendor?.name}</p>
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                                    <SelectItem value="partially_received">Partially Received</SelectItem>
                                                    <SelectItem value="received">Received</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="total_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {form.watch('status') === 'partially_received' && (
                                    <div className="space-y-3 pt-4 border-t">
                                        <label className="text-sm font-bold uppercase tracking-wider text-primary">Received Quantities</label>
                                        <div className="space-y-2">
                                            {partialItems.map((item, index) => (
                                                <div key={item.id} className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold">{item.name}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase font-medium">Ordered: {item.ordered} {item.unit}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input 
                                                            type="number" 
                                                            className="w-24 h-9 font-bold"
                                                            value={item.received}
                                                            onChange={(e) => {
                                                                const newItems = [...partialItems]
                                                                newItems[index].received = Number(e.target.value)
                                                                setPartialItems(newItems)
                                                            }}
                                                        />
                                                        <span className="text-xs font-bold text-muted-foreground w-8">{item.unit}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Updating...' : 'Update Order'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
