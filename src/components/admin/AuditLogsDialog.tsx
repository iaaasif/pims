import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, User, Shield, AlertTriangle, CheckCircle, FileText, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

interface AuditLog {
    id: string
    timestamp: string
    user: string
    role: string
    action: string
    target: string
    status: 'success' | 'warning' | 'error'
    details: string
}

const MOCK_LOGS: AuditLog[] = [
    {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
        user: 'Abdullah Al Asif',
        role: 'Admin',
        action: 'System Access',
        target: 'Admin Dashboard',
        status: 'success',
        details: 'User accessed Admin Command Center'
    },
    {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
        user: 'System',
        role: 'System',
        action: 'Backup',
        target: 'Database',
        status: 'success',
        details: 'Automated hourly backup completed'
    },
    {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        user: 'Jane Smith',
        role: 'Manager',
        action: 'Update Stock',
        target: 'Material: Cement',
        status: 'success',
        details: 'Updated stock count for Project A'
    },
    {
        id: '4',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        user: 'Unknown',
        role: 'Guest',
        action: 'Login Attempt',
        target: 'Auth System',
        status: 'warning',
        details: 'Failed login attempt from IP 192.168.1.1'
    },
    {
        id: '5',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        user: 'Admin User',
        role: 'Super Admin',
        action: 'Delete User',
        target: 'User: John Doe',
        status: 'error',
        details: 'User deletion failed: Constraint violation'
    },
]

interface AuditLogsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AuditLogsDialog({ open, onOpenChange }: AuditLogsDialogProps) {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (open) {
            fetchLogs()
        }
    }, [open])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(50)

            if (error) throw error

            if (data && data.length > 0) {
                // Map DB schema to AuditLog interface
                const dbLogs: AuditLog[] = data.map(item => ({
                    id: item.id,
                    timestamp: item.timestamp,
                    user: item.user_name || 'Unknown',
                    role: item.role || (item.user_name === 'System' ? 'System' : 'User'),
                    action: item.action,
                    target: item.target || 'System',
                    status: item.status as any,
                    details: item.details || ''
                }))
                setLogs(dbLogs)
            } else {
                setLogs(MOCK_LOGS)
            }
        } catch (error) {
            console.error('Error fetching logs:', error)
            setLogs(MOCK_LOGS)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        System Audit Logs
                    </DialogTitle>
                    <DialogDescription>
                        A chronological record of system activities and security events.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 -mx-6 px-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-sm">Fetching system logs...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-sm z-10">
                                <TableRow>
                                    <TableHead className="w-[180px]">Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id} className="group cursor-default hover:bg-muted/30">
                                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3" />
                                                {new Date(log.timestamp).toLocaleString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric'
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium flex items-center gap-1.5">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    {log.user}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Shield className="h-3 w-3" />
                                                    {log.role}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{log.action}</span>
                                                <span className="text-xs text-muted-foreground">{log.details}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                variant="outline"
                                                className={`
                                                ${log.status === 'success' ? 'bg-primary/10 text-primary border-primary/20' : ''}
                                                ${log.status === 'warning' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : ''}
                                                ${log.status === 'error' ? 'bg-red-500/10 text-red-600 border-red-500/20' : ''}
                                            `}
                                            >
                                                {log.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                {log.status === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                                {log.status === 'error' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                                {log.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
