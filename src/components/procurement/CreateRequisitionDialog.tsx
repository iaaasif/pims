import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Plus, Trash2, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

import { usePurchaseRequisitions } from '@/hooks/usePurchaseRequisitions'
import { useProjects } from '@/hooks/useProjects'
import { useMaterials } from '@/hooks/useMaterials'

// Define form type explicitly
const formSchema = z.object({
    project_id: z.string().min(1, "Project is required"),
    required_date: z.date(),
    justification: z.string().min(1, "Justification is required"),
    items: z.array(z.object({
        material_id: z.string().min(1, "Material is required"),
        quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
        required_date: z.date(),
        unit_price: z.coerce.number().min(0, "Unit price must be at least 0")
    })).min(1, "At least one item is required")
})

type RequisitionForm = z.infer<typeof formSchema>

export function CreateRequisitionDialog({ onRequisitionCreated }: { onRequisitionCreated: () => void }) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { createRequisition } = usePurchaseRequisitions()
    const { projects } = useProjects()
    const { materials } = useMaterials()

    const form = useForm<RequisitionForm>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            project_id: "",
            required_date: new Date(),
            justification: "",
            items: [{ material_id: "", quantity: 1, required_date: new Date(), unit_price: 0 }]
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    })

    async function onSubmit(values: RequisitionForm) {
        setIsSubmitting(true)
        try {
            const items = values.items.map((item) => ({
                material_id: item.material_id,
                quantity: item.quantity,
                required_date: item.required_date.toISOString(),
                unit_price: item.unit_price,
            }))

            const totalAmount = items.reduce(
                (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
                0
            )

            const { error } = await createRequisition({
                project_id: values.project_id,
                required_date: values.required_date.toISOString(),
                justification: values.justification,
                total_amount: totalAmount,
            }, items)

            if (error) {
                toast.error('Failed to create requisition')
                console.error(error)
                return
            }

            toast.success('Requisition created successfully')
            setOpen(false)
            form.reset()
            onRequisitionCreated()
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Requisition
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Purchase Requisition</DialogTitle>
                    <DialogDescription>
                        Request materials for a project.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="project_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select project" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {projects.map((proj) => (
                                                    <SelectItem key={proj.id} value={proj.id}>
                                                        {proj.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="required_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Required Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date()
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="justification"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Justification / Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Explain why these items are needed..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Items</label>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => append({ 
                                        material_id: "", 
                                        quantity: 1, 
                                        required_date: form.getValues('required_date') || new Date(), 
                                        unit_price: 0 
                                    })}
                                >
                                    <Plus className="mr-2 h-3 w-3" /> Add Item
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-end">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.material_id`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select material" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {materials.map((mat) => (
                                                            <SelectItem key={mat.id} value={mat.id}>
                                                                {mat.name} ({mat.current_stock} {mat.unit})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem className="w-[100px]">
                                                <FormControl>
                                                    <Input type="number" min="1" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.required_date`}
                                        render={({ field }) => (
                                            <FormItem className="w-[150px]">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal h-10 px-2",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "MMM d, yy")
                                                                ) : (
                                                                    <span className="text-[10px]">Pick date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => date < new Date()}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.unit_price`}
                                        render={({ field }) => (
                                            <FormItem className="w-[100px]">
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" placeholder="Price" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            {form.formState.errors.items && <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Submit Request'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}