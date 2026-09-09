import { useVendors } from '@/hooks/useVendors'
import { AddVendorDialog } from '@/components/procurement/AddVendorDialog'
import { TableAction } from '@/components/common/TableAction'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Phone, Mail, MapPin, Eye, Edit3, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ViewVendorDialog } from '@/components/procurement/ViewVendorDialog'
import { EditVendorDialog } from '@/components/procurement/EditVendorDialog'
import { usePermissions } from '@/hooks/usePermissions'
import type { Vendor } from '@/hooks/useVendors'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Vendors() {
    const { vendors, loading, refresh, deleteVendor } = useVendors()
    const { canCreate, canEdit, canDelete } = usePermissions()
    const [searchTerm, setSearchTerm] = useState('')

    // Action states
    const [viewVendor, setViewVendor] = useState<Vendor | null>(null)
    const [editVendor, setEditVendor] = useState<Vendor | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const filteredVendors = vendors.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.contact_person && item.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
            case 'blacklisted': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
                {canCreate('vendors') && <AddVendorDialog onVendorAdded={refresh} />}
            </div>

            <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Vendor List ({filteredVendors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVendors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">No vendors found</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredVendors.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span className="text-base">{item.name}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">{item.code}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col space-y-1 text-sm">
                                                    {item.contact_person && <span className="font-semibold">{item.contact_person}</span>}
                                                    {item.email && (
                                                        <div className="flex items-center text-muted-foreground">
                                                            <Mail className="h-3 w-3 mr-1" /> {item.email}
                                                        </div>
                                                    )}
                                                    {item.phone && (
                                                        <div className="flex items-center text-muted-foreground">
                                                            <Phone className="h-3 w-3 mr-1" /> {item.phone}
                                                        </div>
                                                    )}
                                                    {item.address && (
                                                        <div className="flex items-center text-muted-foreground">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            <span className="truncate max-w-[200px]">{item.address}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(item.status)}>
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <TableAction
                                                    actions={[
                                                        {
                                                            label: 'View Vendor',
                                                            icon: <Eye className="h-3.5 w-3.5" />,
                                                            onClick: () => setViewVendor(item)
                                                        },
                                                        {
                                                            label: 'Edit Details',
                                                            icon: <Edit3 className="h-3.5 w-3.5" />,
                                                            disabled: !canEdit('vendors'),
                                                            onClick: () => setEditVendor(item)
                                                        },
                                                        {
                                                            label: 'Delete Vendor',
                                                            icon: <Trash2 className="h-3.5 w-3.5" />,
                                                            variant: 'destructive',
                                                            disabled: !canDelete('vendors'),
                                                            onClick: () => setDeleteId(item.id)
                                                        },
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

            {/* Dialogs */}
            <ViewVendorDialog
                vendor={viewVendor}
                open={!!viewVendor}
                onOpenChange={(open) => !open && setViewVendor(null)}
            />

            <EditVendorDialog
                vendor={editVendor}
                open={!!editVendor}
                onOpenChange={(open) => !open && setEditVendor(null)}
                onVendorUpdated={refresh}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the vendor
                            and move all associated data to the archive.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                            onClick={async (e) => {
                                e.preventDefault()
                                if (!deleteId) return
                                setIsDeleting(true)
                                const { error } = await deleteVendor(deleteId)
                                if (error) {
                                    toast.error("Failed to delete vendor")
                                } else {
                                    toast.success("Vendor deleted successfully")
                                    setDeleteId(null)
                                }
                                setIsDeleting(false)
                            }}
                        >
                            {isDeleting ? "Deleting..." : "Delete Vendor"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
