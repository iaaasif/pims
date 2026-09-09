import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

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

import { useMaterials } from '@/hooks/useMaterials'
import { useLocations } from '@/hooks/useLocations'
import { useProjects } from '@/hooks/useProjects'
import { useCategories } from '@/hooks/useCategories'
import { useUnits } from '@/hooks/useUnits'

const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    code: z.string().optional(),
    category: z.string().optional(),
    unit: z.string().min(1, "Unit is required"),
    description: z.string().optional(),
    min_stock_level: z.coerce.number().min(0),
    current_stock: z.coerce.number().min(0),
    unit_price: z.coerce.number().min(0).optional(),
    location_id: z.string().optional(),
    project_id: z.string().optional(),
})

export function AddMaterialDialog({ onMaterialAdded }: { onMaterialAdded: () => void }) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { addMaterial } = useMaterials()
    const { locations } = useLocations()
    const { projects } = useProjects()
    const { categories } = useCategories()
    const { units } = useUnits()

    // Toggle for Location / Project selection could be added
    // For now, I'll allow selecting either Location (Warehouse) or Project
    // Or maybe a tab? I'll just list both or separate selects.

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            code: "",
            category: "",
            unit: "pcs",
            description: "",
            min_stock_level: 10,
            current_stock: 0,
            unit_price: 0,
            location_id: "none", // Special handling? Or ""?
            project_id: "none"
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const materialData = {
                ...values,
                code: values.code || null,
                category: values.category || null,
                description: values.description || null,
                unit_price: values.unit_price || 0,
                location_id: values.location_id === "none" || !values.location_id ? null : values.location_id,
                project_id: values.project_id === "none" || !values.project_id ? null : values.project_id,
                supplier_id: null // Pending vendor selection
            }

            // Ensure at least one is selected? Not enforcing for now.

            const { error } = await addMaterial(materialData)

            if (error) {
                toast.error('Failed to add material')
                console.error(error)
                return
            }

            toast.success('Material added successfully')
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Material</DialogTitle>
                    <DialogDescription>
                        Register new inventory item at a location or project site.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Material Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Cement Bags" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="MAT-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.name}>
                                                        {cat.name}
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
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {units.map((unit) => (
                                                    <SelectItem key={unit.id} value={unit.abbreviation}>
                                                        {unit.name} ({unit.abbreviation})
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
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="current_stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Stock</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="min_stock_level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Min Level</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unit_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Est. Unit Price</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                            <FormField
                                control={form.control}
                                name="location_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location (Warehouse)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.watch('project_id') !== "none" && !!form.watch('project_id')}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select location" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {locations.map((loc) => (
                                                    <SelectItem key={loc.id} value={loc.id}>
                                                        {loc.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-center font-bold text-muted-foreground">OR</div>

                            <FormField
                                control={form.control}
                                name="project_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project Site</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={form.watch('location_id') !== "none" && !!form.watch('location_id')}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select project" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
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
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Adding...' : 'Add Material'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
