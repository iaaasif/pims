import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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
import { useLocations } from '@/hooks/useLocations'

const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    code: z.string().min(2, "Code is required"),
    contact_person: z.string().optional(),
    contact_number: z.string().optional(),
})

interface AddLocationDialogProps {
    onLocationAdded: () => void
    editMode?: boolean
    initialData?: any
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function AddLocationDialog({
    onLocationAdded,
    editMode = false,
    initialData = null,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange
}: AddLocationDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { addLocation } = useLocations()

    // Use controlled or internal state
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = controlledOnOpenChange || setInternalOpen

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            code: "",
            contact_person: "",
            contact_number: "",
        },
    })

    // Update form when initialData changes (for edit mode)
    useEffect(() => {
        if (editMode && initialData) {
            form.reset({
                name: initialData.name || "",
                code: initialData.code || "",
                contact_person: initialData.contact_person || "",
                contact_number: initialData.contact_number || "",
            })
        } else if (!editMode) {
            form.reset({
                name: "",
                code: "",
                contact_person: "",
                contact_number: "",
            })
        }
    }, [editMode, initialData, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            if (editMode && initialData) {
                // Update existing location
                const { error } = await supabase
                    .from('locations')
                    .update({
                        ...values,
                        contact_person: values.contact_person || "",
                        contact_number: values.contact_number || "",
                    })
                    .eq('id', initialData.id)

                if (error) {
                    toast.error('Failed to update location')
                    console.error(error)
                    return
                }

                toast.success('Location updated successfully')
            } else {
                // Add new location
                const { error } = await addLocation({
                    ...values,
                    contact_person: values.contact_person || "",
                    contact_number: values.contact_number || "",
                    status: 'active'
                })

                if (error) {
                    toast.error('Failed to add location')
                    console.error(error)
                    return
                }

                toast.success('Location added successfully')
            }

            setOpen(false)
            form.reset()
            onLocationAdded()
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!editMode && (
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Location
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editMode ? 'Edit Location' : 'Add New Location'}</DialogTitle>
                    <DialogDescription>
                        {editMode ? 'Update location information.' : 'Create a new warehouse or project site location.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Main Warehouse" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="WH-01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contact_person"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Person</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="contact_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editMode ? 'Update Location' : 'Save Location')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
