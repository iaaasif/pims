import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'

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

import { useInventory } from '@/hooks/useInventory'
import { useMaterials } from '@/hooks/useMaterials'

const formSchema = z.object({
    material_id: z.string().min(1, "Material is required"),
    quantity: z.coerce.number().min(0, "Quantity must be positive"),
})

export function AddProjectMaterialDialog({ projectId, onMaterialAdded }: { projectId: string, onMaterialAdded: () => void }) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { addMaterialToProject } = useInventory(projectId)
    const { materials } = useMaterials()

    // Filter out materials that might strictly belong to other locations if needed, 
    // but requirement says "Global master list", so we show all.

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            material_id: "",
            quantity: 0,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const { error } = await addMaterialToProject(projectId, values.material_id, values.quantity)

            if (error) {
                toast.error('Failed to add material')
                console.error(error)
                return
            }

            toast.success('Material added to project successfully')
            setOpen(false)
            form.reset()
            onMaterialAdded()
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
                    <Plus className="mr-2 h-4 w-4" /> Add Material
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Material to Project</DialogTitle>
                    <DialogDescription>
                        Select a material from the master list to add to this project's inventory.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="material_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Material</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select material" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {materials.map((mat) => (
                                                <SelectItem key={mat.id} value={mat.id}>
                                                    {mat.name} ({mat.code}) - {mat.unit}
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
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Initial Quantity</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="any" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Adding...' : 'Add to Project'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
