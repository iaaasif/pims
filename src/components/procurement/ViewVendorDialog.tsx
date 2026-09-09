import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import type { Vendor } from '@/hooks/useVendors'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, MapPin, User, Hash, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface ViewVendorDialogProps {
    vendor: Vendor | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ViewVendorDialog({ vendor, open, onOpenChange }: ViewVendorDialogProps) {
    if (!vendor) return null

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-primary/10 text-primary border-primary/20'
            case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
            case 'blacklisted': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-6">
                        <DialogTitle className="text-2xl font-bold">{vendor.name}</DialogTitle>
                        <Badge className={getStatusColor(vendor.status)}>
                            {vendor.status}
                        </Badge>
                    </div>
                    <DialogDescription>
                        Vendor Profile & Contact Information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Hash className="h-3 w-3" /> Vendor Code
                            </span>
                            <p className="text-sm font-mono font-semibold">{vendor.code || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Registered On
                            </span>
                            <p className="text-sm font-semibold">{format(new Date(vendor.created_at), 'PPP')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <User className="h-3 w-3" /> Contact Person
                            </span>
                            <p className="text-sm font-semibold">{vendor.contact_person || 'No primary contact'}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> Email Address
                                </span>
                                <p className="text-sm truncate">
                                    {vendor.email ? (
                                        <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">
                                            {vendor.email}
                                        </a>
                                    ) : (
                                        'N/A'
                                    )}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> Phone Number
                                </span>
                                <p className="text-sm">
                                    {vendor.phone ? (
                                        <a href={`tel:${vendor.phone}`} className="hover:text-primary">
                                            {vendor.phone}
                                        </a>
                                    ) : (
                                        'N/A'
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> Address
                            </span>
                            <p className="text-sm leading-relaxed whitespace-pre-line">
                                {vendor.address || 'No address provided'}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
