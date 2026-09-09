import { useLocations } from '@/hooks/useLocations'
import { AddLocationDialog } from '@/components/locations/AddLocationDialog'
import { ActionButton } from '@/components/common/ActionButton'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useState } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
    Dialog,
    DialogContent,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Locations() {
    const { locations, loading, refresh } = useLocations()
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; location: any | null }>({ open: false, location: null })
    const [editDialog, setEditDialog] = useState<{ open: boolean; location: any | null }>({ open: false, location: null })
    const [viewDialog, setViewDialog] = useState<{ open: boolean; location: any | null }>({ open: false, location: null })
    const [isDeleting, setIsDeleting] = useState(false)
    const { canCreate, canEdit, canDelete } = usePermissions()

    const handleDelete = async () => {
        if (!deleteDialog.location) return

        setIsDeleting(true)
        try {
            const { error } = await supabase
                .from('locations')
                .delete()
                .eq('id', deleteDialog.location.id)

            if (error) throw error

            toast.success('Location deleted successfully')
            setDeleteDialog({ open: false, location: null })
            refresh()
        } catch {
            toast.error('Failed to delete location')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
                {canCreate('locations') && (
                    <AddLocationDialog onLocationAdded={refresh} />
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Locations</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner text="Syncing logistics data..." />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {locations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">No locations found</TableCell>
                                    </TableRow>
                                ) : (
                                    locations.map((loc) => (
                                        <TableRow key={loc.id}>
                                            <TableCell className="font-medium">{loc.code}</TableCell>
                                            <TableCell>{loc.name}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{loc.contact_person}</span>
                                                    <span className="text-sm text-muted-foreground">{loc.contact_number}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${loc.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {loc.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <ActionButton
                                                    actions={[
                                                        {
                                                            label: 'View Details',
                                                            icon: <Eye className="h-4 w-4" />,
                                                            onClick: () => setViewDialog({ open: true, location: loc })
                                                        },
                                                        {
                                                            label: 'Edit',
                                                            icon: <Edit className="h-4 w-4" />,
                                                            disabled: !canEdit('locations'),
                                                            onClick: () => setEditDialog({ open: true, location: loc })
                                                        },
                                                        {
                                                            label: 'Delete',
                                                            icon: <Trash2 className="h-4 w-4" />,
                                                            disabled: !canDelete('locations'),
                                                            variant: 'destructive',
                                                            onClick: () => setDeleteDialog({ open: true, location: loc })
                                                        }
                                                    ]}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <DeleteConfirmationDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, location: null })}
                onConfirm={handleDelete}
                itemName={deleteDialog.location?.name || ''}
                itemType="locations"
                isDeleting={isDeleting}
            />

            <AddLocationDialog
                open={editDialog.open}
                onOpenChange={(open) => setEditDialog({ open, location: null })}
                onLocationAdded={() => {
                    setEditDialog({ open: false, location: null })
                    refresh()
                }}
                editMode={true}
                initialData={editDialog.location}
            />

            <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open, location: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Location Details</DialogTitle>
                    </DialogHeader>
                    {viewDialog.location && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Code</label>
                                    <p className="text-base">{viewDialog.location.code}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <p className="text-base capitalize">{viewDialog.location.status}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Name</label>
                                <p className="text-base font-medium">{viewDialog.location.name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                                    <p className="text-base">{viewDialog.location.contact_person}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                                    <p className="text-base">{viewDialog.location.contact_number}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
