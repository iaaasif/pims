import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { MinusCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Textarea } from '@/components/ui/textarea'
import { useInventory, type InventoryItem } from '@/hooks/useInventory'

const formSchema = z.object({
    quantity: z.coerce.number().min(0.001, "Quantity must be positive"),
    notes: z.string().optional(),
})

export function RecordProjectUsageDialog({ item, onUsageRecorded }: { item: InventoryItem, onUsageRecorded: () => void }) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { updateInventory } = useInventory()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            quantity: 0,
            notes: ""
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (values.quantity > item.quantity) {
            form.setError('quantity', { message: `Cannot use more than current stock (${item.quantity})` })
            return
        }

        setIsSubmitting(true)
        try {
            const newQuantity = item.quantity - values.quantity
            const { error } = await updateInventory(item.id, newQuantity, 'usage', values.notes)

            if (error) {
                toast.error('Failed to record usage')
                console.error(error)
                return
            }

            toast.success('Usage recorded successfully')
            setOpen(false)
            form.reset()
            onUsageRecorded()
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MinusCircle className="h-4 w-4" />
                    <span className="sr-only">Record Usage</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Usage: {item.material.name}</DialogTitle>
                    <DialogDescription>
                        Deduct material from project stock. Current stock: {item.quantity} {item.material.unit}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity Used</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="any" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Purpose / Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="What was this used for?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting} variant="destructive">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Recording...' : 'Confirm Usage'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
