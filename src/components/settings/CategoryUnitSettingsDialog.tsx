import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Pencil, Trash2, Tags } from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useCategories, type MaterialCategory } from '@/hooks/useCategories'
import { useUnits, type MaterialUnit } from '@/hooks/useUnits'

const categorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
})

const unitSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    abbreviation: z.string().min(1, 'Abbreviation is required').max(10, 'Abbreviation too long'),
    description: z.string().optional(),
})

export function CategoryUnitSettingsPanel() {
    const { categories, loading: loadingCategories, addCategory, updateCategory, deleteCategory } = useCategories()
    const { units, loading: loadingUnits, addUnit, updateUnit, deleteUnit } = useUnits()

    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [unitDialogOpen, setUnitDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<MaterialCategory | null>(null)
    const [editingUnit, setEditingUnit] = useState<MaterialUnit | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'unit'; id: string; name: string } | null>(null)

    const categoryForm = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            description: '',
        },
    })

    const unitForm = useForm<z.infer<typeof unitSchema>>({
        resolver: zodResolver(unitSchema),
        defaultValues: {
            name: '',
            abbreviation: '',
            description: '',
        },
    })

    const handleAddCategory = () => {
        setEditingCategory(null)
        categoryForm.reset({ name: '', description: '' })
        setCategoryDialogOpen(true)
    }

    const handleEditCategory = (category: MaterialCategory) => {
        setEditingCategory(category)
        categoryForm.reset({
            name: category.name,
            description: category.description || '',
        })
        setCategoryDialogOpen(true)
    }

    const handleAddUnit = () => {
        setEditingUnit(null)
        unitForm.reset({ name: '', abbreviation: '', description: '' })
        setUnitDialogOpen(true)
    }

    const handleEditUnit = (unit: MaterialUnit) => {
        setEditingUnit(unit)
        unitForm.reset({
            name: unit.name,
            abbreviation: unit.abbreviation,
            description: unit.description || '',
        })
        setUnitDialogOpen(true)
    }

    const onCategorySubmit = async (values: z.infer<typeof categorySchema>) => {
        if (editingCategory) {
            await updateCategory(editingCategory.id, values)
        } else {
            await addCategory(values)
        }
        setCategoryDialogOpen(false)
        categoryForm.reset()
    }

    const onUnitSubmit = async (values: z.infer<typeof unitSchema>) => {
        if (editingUnit) {
            await updateUnit(editingUnit.id, values)
        } else {
            await addUnit(values)
        }
        setUnitDialogOpen(false)
        unitForm.reset()
    }

    const handleDeleteClick = (type: 'category' | 'unit', id: string, name: string) => {
        setDeleteTarget({ type, id, name })
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return

        if (deleteTarget.type === 'category') {
            await deleteCategory(deleteTarget.id)
        } else {
            await deleteUnit(deleteTarget.id)
        }
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
    }

    return (
        <>
        <div className="w-full max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl shadow-sm border border-primary/20">
                            <Tags className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Category & Unit Hub</h2>
                            <p className="text-sm text-muted-foreground font-medium">
                                Manage definitions and measurements
                            </p>
                        </div>
                    </div>
                </div>

                    <Tabs defaultValue="categories" className="mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="categories">Categories</TabsTrigger>
                            <TabsTrigger value="units">Units</TabsTrigger>
                        </TabsList>

                        <TabsContent value="categories" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Material Categories</CardTitle>
                                            <CardDescription>
                                                Organize materials into categories
                                            </CardDescription>
                                        </div>
                                        <Button onClick={handleAddCategory} size="sm">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Category
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {loadingCategories ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="w-[200px] px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Name</TableHead>
                                                    <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Description</TableHead>
                                                    <TableHead className="w-[100px] text-right px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {categories.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                            No categories found. Add your first category to get started.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    categories.map((category) => (
                                                        <TableRow key={category.id} className="hover:bg-muted/30 border-border group transition-all">
                                                            <TableCell className="px-6 py-4">
                                                                <span className="font-bold text-sm text-foreground">{category.name}</span>
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4">
                                                                <span className="text-xs text-muted-foreground font-medium">
                                                                    {category.description || '-'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right px-6 py-4">
                                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleEditCategory(category)}
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleDeleteClick('category', category.id, category.name)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="units" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Material Units</CardTitle>
                                            <CardDescription>
                                                Define units of measurement for materials
                                            </CardDescription>
                                        </div>
                                        <Button onClick={handleAddUnit} size="sm">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Unit
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {loadingUnits ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="w-[180px] px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Name</TableHead>
                                                    <TableHead className="w-[120px] px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Abbr.</TableHead>
                                                    <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Description</TableHead>
                                                    <TableHead className="w-[100px] text-right px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {units.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                            No units found. Add your first unit to get started.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    units.map((unit) => (
                                                        <TableRow key={unit.id} className="hover:bg-muted/30 border-border group transition-all">
                                                            <TableCell className="px-6 py-4">
                                                                <span className="font-bold text-sm text-foreground">{unit.name}</span>
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4">
                                                                <code className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold uppercase tracking-tighter">
                                                                    {unit.abbreviation}
                                                                </code>
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4">
                                                                <span className="text-xs text-muted-foreground font-medium">
                                                                    {unit.description || '-'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right px-6 py-4">
                                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleEditUnit(unit)}
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleDeleteClick('unit', unit.id, unit.name)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

            {/* Category Add/Edit Dialog */}
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? 'Update the category details' : 'Create a new material category'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...categoryForm}>
                        <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                            <FormField
                                control={categoryForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Construction" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={categoryForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Brief description..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingCategory ? 'Update' : 'Add'} Category
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Unit Add/Edit Dialog */}
            <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUnit ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
                        <DialogDescription>
                            {editingUnit ? 'Update the unit details' : 'Create a new unit of measurement'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...unitForm}>
                        <form onSubmit={unitForm.handleSubmit(onUnitSubmit)} className="space-y-4">
                            <FormField
                                control={unitForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Kilograms" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={unitForm.control}
                                name="abbreviation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Abbreviation</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., kg" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={unitForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Brief description..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setUnitDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingUnit ? 'Update' : 'Add'} Unit
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete the {deleteTarget?.type} "{deleteTarget?.name}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
