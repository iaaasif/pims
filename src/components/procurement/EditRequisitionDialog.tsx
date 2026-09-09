import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import type { PurchaseRequisition } from '@/hooks/usePurchaseRequisitions'
import { usePurchaseRequisitions } from '@/hooks/usePurchaseRequisitions'
import { useAuth } from '@/context/AuthContext'

const formSchema = z.object({
    required_date: z.string().min(1, 'Required date is required'),
    justification: z.string().min(1, 'Justification is required'),
    status: z.enum(['draft', 'submitted', 'approved', 'rejected']),
    total_amount: z.coerce.number().min(0),
})

type EditRequisitionForm = z.infer<typeof formSchema>

interface EditRequisitionDialogProps {
    requisition: PurchaseRequisition | null
    open: boolean
    onClose: () => void
}

export function EditRequisitionDialog({ requisition, open, onClose }: EditRequisitionDialogProps) {
    const { updateRequisition } = usePurchaseRequisitions()
    const { isAdmin, isManager } = useAuth()
    const [submitting, setSubmitting] = useState(false)

    const form = useForm<EditRequisitionForm>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            required_date: requisition?.required_date ? requisition.required_date.slice(0, 10) : '',
            justification: requisition?.justification || '',
            status: requisition?.status || 'draft',
            total_amount: requisition?.total_amount ?? 0,
        },
    })

    useEffect(() => {
        if (!requisition) return
        form.reset({
            required_date: requisition.required_date ? requisition.required_date.slice(0, 10) : '',
            justification: requisition.justification || '',
            status: requisition.status,
            total_amount: requisition.total_amount ?? 0,
        })
    }, [requisition, form])

    const canEditStatus = isAdmin || isManager

    async function onSubmit(values: EditRequisitionForm) {
        if (!requisition) return
        setSubmitting(true)
        try {
            const { error } = await updateRequisition(requisition.id, {
                required_date: values.required_date,
                justification: values.justification,
                status: values.status,
                total_amount: values.total_amount,
            })

            if (error) {
                toast.error('Failed to update requisition')
                return
            }

            toast.success('Requisition updated')
            onClose()
        } finally {
            setSubmitting(false)
        }
    }

    if (!requisition) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit Purchase Requisition</DialogTitle>
                    <DialogDescription>PR #{requisition.pr_number}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="required_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Required Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="justification"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Justification</FormLabel>
                                    <FormControl>
                                        <Textarea rows={4} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
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

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={!canEditStatus}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="submitted">Submitted</SelectItem>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
