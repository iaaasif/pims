import { useState } from 'react'
import { toast } from 'sonner'
import { FileText } from 'lucide-react'

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { usePurchaseOrders } from '@/hooks/usePurchaseOrders'
import { useVendors } from '@/hooks/useVendors'
import type { PurchaseRequisition } from '@/hooks/usePurchaseRequisitions'

export function CreatePOFromPRDialog({ pr, onPOCreated, open: externalOpen, onOpenChange: externalOnOpenChange }: { 
    pr: PurchaseRequisition, 
    onPOCreated: () => void,
    open?: boolean,
    onOpenChange?: (open: boolean) => void
}) {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = externalOpen !== undefined ? externalOpen : internalOpen
    const setOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedVendorId, setSelectedVendorId] = useState<string>("")
    const [termsAndConditions, setTermsAndConditions] = useState<string>(
        "1. Payment will be made within 30 days from delivery date\n2. All materials must meet Bangladesh Standards (BDS)\n3. Goods once delivered cannot be returned\n4. Company is not responsible for any damage during transit"
    )

    const { createPOFromPR } = usePurchaseOrders()
    const { vendors } = useVendors()

    async function handleCreate() {
        if (!selectedVendorId) {
            toast.error("Please select a vendor")
            return
        }

        setIsSubmitting(true)
        try {
            const { error } = await createPOFromPR(pr, selectedVendorId, termsAndConditions)

            if (error) {
                toast.error('Failed to create PO')
                console.error(error)
                return
            }

            toast.success('Purchase Order created successfully')
            setOpen(false)
            onPOCreated()
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {externalOpen === undefined && (
                <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                        <FileText className="mr-2 h-3 w-3" /> Create PO
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Purchase Order</DialogTitle>
                    <DialogDescription>
                        Convert PR #{pr.pr_number} to a Purchase Order.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="vendor" className="text-right">
                            Vendor
                        </Label>
                        <Select onValueChange={setSelectedVendorId} value={selectedVendorId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select vendor" />
                            </SelectTrigger>
                            <SelectContent>
                                {vendors.filter(v => v.status === 'active').map((vendor) => (
                                    <SelectItem key={vendor.id} value={vendor.id}>
                                        {vendor.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="terms" className="text-right pt-2">
                            Terms & Conditions
                        </Label>
                        <Textarea
                            id="terms"
                            placeholder="Enter terms and conditions..."
                            value={termsAndConditions}
                            onChange={(e) => setTermsAndConditions(e.target.value)}
                            className="col-span-3"
                            rows={4}
                        />
                    </div>
                    <div className="text-sm text-muted-foreground p-2">
                        This will create a draft PO with {pr.items?.length || 0} items.
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleCreate} disabled={isSubmitting || !selectedVendorId}>
                        {isSubmitting ? 'Creating...' : 'Create PO'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
