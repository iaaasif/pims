import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { UserPlus } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface AddUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onUserAdded: () => void
}

export function AddUserDialog({ open, onOpenChange, onUserAdded }: AddUserDialogProps) {
    const { user, isAdmin } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        jobTitle: '',
        role: 'viewer' as 'admin' | 'management' | 'manager' | 'store_keeper' | 'finance_executive' | 'viewer'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.email || !formData.fullName) {
            toast.error('Please fill in all required fields')
            return
        }

        if (!isAdmin) {
            toast.error('Only administrators can invite new users')
            return
        }

        setLoading(true)

        try {
            // Call the invite-user Edge Function
            const { data, error } = await supabase.functions.invoke('invite-user', {
                body: {
                    email: formData.email,
                    fullName: formData.fullName,
                    jobTitle: formData.jobTitle,
                    role: formData.role,
                    requestingUserId: user?.id
                }
            })

            if (error) {
                console.error('Edge Function error:', error)
                throw new Error(error.message || 'Failed to invite user')
            }

            if (data?.status === 'success') {
                toast.success(`User ${formData.fullName} has been sent an invitation link!`)
            } else {
                throw new Error(data?.message || 'Failed to invite user')
            }

            // Reset form
            setFormData({
                email: '',
                fullName: '',
                jobTitle: '',
                role: 'viewer'
            })

            onUserAdded()
            onOpenChange(false)
        } catch (error: any) {
            console.error('Error inviting user:', error)
            toast.error(error.message || 'Failed to send invitation')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Invite New User
                    </DialogTitle>
                    <DialogDescription>
                        Send an invitation link to a new user and assign their role.
                        {!isAdmin && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ Only administrators can invite new users. You currently don't have admin privileges.
                                </p>
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email Address <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={!isAdmin}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                    disabled={!isAdmin}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jobTitle">Professional Title</Label>
                                <Input
                                    id="jobTitle"
                                    placeholder="Project Manager"
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                    disabled={!isAdmin}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: 'admin' | 'management' | 'manager' | 'store_keeper' | 'finance_executive' | 'viewer') =>
                                    setFormData({ ...formData, role: value })
                                }
                                disabled={!isAdmin}
                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                    <SelectItem value="store_keeper">Store Keeper</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="management">Management</SelectItem>
                                    <SelectItem value="finance_executive">Finance Executive</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Default role is Viewer with read-only access
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !isAdmin}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                        >
                            {loading ? 'Adding...' : isAdmin ? 'Add User' : 'Admin Access Required'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
