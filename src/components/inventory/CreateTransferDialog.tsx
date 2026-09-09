import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { ArrowLeftRight } from 'lucide-react'

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

import { useTransfers } from '@/hooks/useTransfers'
import { useProjects } from '@/hooks/useProjects'
import { useMaterials } from '@/hooks/useMaterials'
import { useInventory } from '@/hooks/useInventory'

const formSchema = z.object({
    from_project_id: z.string().min(1, "Source project is required"),
    to_project_id: z.string().min(1, "Destination project is required"),
    material_id: z.string().min(1, "Material is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1")
}).refine(data => data.from_project_id !== data.to_project_id, {
    message: "Source and destination projects must be different",
    path: ["to_project_id"]
})

export function CreateTransferDialog({ onTransferCreated }: { onTransferCreated: () => void }) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { createTransferRequest } = useTransfers()
    const { projects, loading: projectsLoading } = useProjects()
    const { materials, loading: materialsLoading } = useMaterials()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            quantity: 1
        },
    })

    const sourceProjectId = form.watch("from_project_id")
    const { inventory: projectInventory } = useInventory(sourceProjectId) // Get inventory for selected source project

    console.log('Hooks loading state:', { 
        projectsLoading, 
        materialsLoading, 
        projectsCount: projects.length, 
        materialsCount: materials.length, 
        sourceProjectId,
        inventoryCount: projectInventory.length 
    })

    // Filter materials based on source project (using project inventory)
    const availableMaterials = projectInventory.filter(item => item.project_id === sourceProjectId)
    
    // Filter projects for "To Project" dropdown - exclude the selected "From Project"
    const availableDestinationProjects = projects.filter(proj => proj.id !== sourceProjectId)

    // Debug logging
    console.log('Debug Info:', {
        sourceProjectId,
        totalMaterials: materials.length,
        totalInventory: projectInventory.length,
        availableMaterials: availableMaterials.length,
        materials: materials,
        inventory: projectInventory,
        availableMaterialsList: availableMaterials
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const { error } = await createTransferRequest(values)

            if (error) {
                toast.error('Failed to create transfer request')
                console.error(error)
                return
            }

            toast.success('Transfer request created successfully')
            setOpen(false)
            form.reset()
            onTransferCreated()
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
                    <ArrowLeftRight className="mr-2 h-4 w-4" /> New Transfer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>New Transfer Request</DialogTitle>
                    <DialogDescription>
                        Request to move materials between projects.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="from_project_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>From Project</FormLabel>
                                        <Select onValueChange={(val) => {
                                            field.onChange(val)
                                            form.setValue("material_id", "") // Reset material when project changes
                                            form.setValue("to_project_id", "") // Reset destination project when source changes
                                        }} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Source" />
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
                                name="to_project_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>To Project</FormLabel>
                                        <Select onValueChange={(val) => {
                                            field.onChange(val)
                                        }} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Destination" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {availableDestinationProjects.map((proj) => (
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
                        </div>

                        <FormField
                            control={form.control}
                            name="material_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Material</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!sourceProjectId}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={sourceProjectId ? "Select material" : "Select source project first"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableMaterials.length > 0 ? (
                                                availableMaterials.map((item) => (
                                                    <SelectItem key={item.id} value={item.material_id}>
                                                        {item.material.name} (Stock: {item.quantity} {item.material.unit})
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-center text-sm text-muted-foreground">
                                                    {sourceProjectId ? 'No materials available in this project' : 'Select source project first'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="1" {...field} />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">
                                        {sourceProjectId && form.watch('material_id') ? (
                                            (() => {
                                                const item = availableMaterials.find(x => x.material_id === form.watch('material_id'))
                                                return item ? `Available: ${item.quantity} ${item.material.unit}` : ''
                                            })()
                                        ) : ''}
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Transfer Request'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
