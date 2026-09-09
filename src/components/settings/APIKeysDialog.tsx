import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Key, Plus, Trash2, Copy, Check, Loader2, Shield } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface APIKey {
    id: string
    name: string
    key_value: string
    key_prefix: string
    created_at: string
    last_used_at: string | null
    is_active: boolean
}

interface APIKeysDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function APIKeysDialog({ open, onOpenChange }: APIKeysDialogProps) {
    const { user } = useAuth()
    const [keys, setKeys] = useState<APIKey[]>([])
    const [loading, setLoading] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newKeyName, setNewKeyName] = useState('')
    const [generatedKey, setGeneratedKey] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (open && user) {
            fetchKeys()
        }
    }, [open, user])

    const fetchKeys = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('api_keys')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setKeys(data || [])
        } catch (error: any) {
            console.error('Error fetching API keys:', error)
            toast.error('Failed to load API keys')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateKey = async () => {
        if (!newKeyName.trim() || !user) return

        try {
            setLoading(true)
            const keyValue = `pims_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
            const keyPrefix = keyValue.substring(0, 8) + '...'

            const { error } = await supabase
                .from('api_keys')
                .insert({
                    user_id: user.id,
                    name: newKeyName,
                    key_value: keyValue,
                    key_prefix: keyPrefix,
                    is_active: true
                })
                .select()
                .single()

            if (error) throw error

            setGeneratedKey(keyValue)
            setNewKeyName('')
            setIsCreating(false)
            fetchKeys()
            toast.success('API key generated successfully')
        } catch (error: any) {
            console.error('Error creating API key:', error)
            toast.error('Failed to create API key')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteKey = async (id: string) => {
        if (!confirm('Are you sure you want to delete this API key? This cannot be undone.')) return

        try {
            setLoading(true)
            const { error } = await supabase
                .from('api_keys')
                .delete()
                .eq('id', id)

            if (error) throw error

            setKeys(keys.filter(k => k.id !== id))
            toast.success('API key deleted')
        } catch (error: any) {
            console.error('Error deleting API key:', error)
            toast.error('Failed to delete API key')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) setGeneratedKey(null)
            onOpenChange(val)
        }}>
            <DialogContent className="sm:max-w-[600px] h-[70vh] flex flex-col bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
                        <Key className="h-6 w-6 text-primary" />
                        Manage API Keys
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium">
                        Generate and manage API keys for authenticated access to PIMS.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col py-4 gap-4">
                    {generatedKey ? (
                        <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-primary flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Your New API Key
                                </Label>
                                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                                    Make sure to copy your API key now. You won't be able to see it again!
                                    Store it securely as it provides full access to your account data.
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="relative flex-1">
                                        <Input
                                            readOnly
                                            value={generatedKey}
                                            className="font-mono text-xs bg-background/50 border-primary/30 h-10 pr-10"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Key className="h-3 w-3 text-primary opacity-50" />
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        className="h-10 w-10 shrink-0 shadow-lg shadow-primary/20"
                                        onClick={() => copyToClipboard(generatedKey)}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <Button className="w-full font-bold shadow-lg shadow-primary/20" onClick={() => setGeneratedKey(null)}>
                                I've saved it securely
                            </Button>
                        </div>
                    ) : isCreating ? (
                        <div className="p-6 border border-border/50 rounded-xl space-y-4 bg-accent/5 animate-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="keyName" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Key Label</Label>
                                <Input
                                    id="keyName"
                                    placeholder="e.g. VS Code Extension, Mobile App"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    autoFocus
                                    className="h-11 bg-background"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" className="font-bold" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button
                                    onClick={handleCreateKey}
                                    disabled={!newKeyName.trim() || loading}
                                    className="font-bold shadow-lg shadow-primary/20 px-6"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 animate-spin mr-2" />}
                                    Generate Access Key
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Authorized Access Tokens</h4>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">Active keys used for API communication.</p>
                                </div>
                                <Button size="sm" onClick={() => setIsCreating(true)} className="h-8 gap-2 font-bold shadow-md shadow-primary/10">
                                    <Plus className="h-3.5 w-3.5" />
                                    New Token
                                </Button>
                            </div>

                            <ScrollArea className="flex-1 border border-border/50 rounded-xl bg-background/30 overflow-hidden">
                                {loading && keys.length === 0 ? (
                                    <div className="flex items-center justify-center h-48">
                                        <LoadingSpinner text="Loading API keys..." />
                                    </div>
                                ) : keys.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground px-6 text-center">
                                        <div className="p-4 bg-accent/50 rounded-full mb-4">
                                            <Key className="h-8 w-8 opacity-20" />
                                        </div>
                                        <h5 className="text-sm font-bold text-foreground">No active keys</h5>
                                        <p className="text-xs mt-1 max-w-[240px]">You haven't generated any API tokens yet for this account.</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                                            <TableRow className="hover:bg-transparent border-border/50">
                                                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Token Name</TableHead>
                                                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Key Prefix</TableHead>
                                                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Generated</TableHead>
                                                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {keys.map((key) => (
                                                <TableRow key={key.id} className="hover:bg-accent/30 border-border/30 transition-colors">
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-sm font-bold text-foreground">{key.name}</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                                                <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Active</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-[10px] text-muted-foreground tracking-tighter">
                                                        {key.key_prefix}
                                                    </TableCell>
                                                    <TableCell className="text-[10px] text-muted-foreground font-medium">
                                                        {new Date(key.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                            onClick={() => handleDeleteKey(key.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </ScrollArea>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-2 pt-4 border-t border-border/50">
                    <Button variant="ghost" className="font-bold text-xs" onClick={() => onOpenChange(false)}>
                        Close System Access Settings
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
