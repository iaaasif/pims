import { useNotifications, type SystemNotification } from '@/context/SystemNotificationContext'
import { Bell, Check, Trash2, Clock, Inbox, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useState } from 'react'

export function NotificationList() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } = useNotifications()
    const [selectedNotification, setSelectedNotification] = useState<SystemNotification | null>(null)

    if (loading) {
        return (
            <div className="p-8 text-center bg-background rounded-lg border border-border shadow-xl w-[350px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground font-medium italic">Synchronizing alerts...</p>
            </div>
        )
    }

    return (
        <div className="w-[350px] bg-background rounded-xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold tracking-tight">System Alerts</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                            {unreadCount} UNREAD NOTIFICATIONS
                        </p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-[11px] font-bold gap-1.5 hover:bg-primary/10 text-primary"
                        onClick={markAllAsRead}
                    >
                        <Check className="h-3 w-3" />
                        Mark All
                    </Button>
                )}
            </div>

            <ScrollArea className="h-[400px]">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-border">
                        {notifications.map((n: SystemNotification) => (
                            <div 
                                key={n.id} 
                                className={cn(
                                    "p-4 hover:bg-muted/50 transition-colors relative cursor-pointer group",
                                    !n.read && "bg-primary/5 border-l-2 border-primary"
                                )}
                                onClick={(e) => {
                                    // Only open popup if not clicking the delete button
                                    const target = e.target as HTMLElement
                                    if (!target.closest('button')) {
                                        setSelectedNotification(n)
                                        if (!n.read) {
                                            markAsRead(n.id)
                                        }
                                    }
                                }}
                            >
                                <div className="flex gap-3">
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm",
                                        n.type === 'info' && "bg-blue-100 text-blue-600",
                                        n.type === 'success' && "bg-green-100 text-green-600",
                                        n.type === 'warning' && "bg-orange-100 text-orange-600",
                                        n.type === 'error' && "bg-destructive/10 text-destructive"
                                    )}>
                                        {getIconForType(n.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className={cn("text-sm font-semibold leading-none", !n.read && "text-primary")}>
                                                {n.title}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-medium bg-muted px-1.5 py-0.5 rounded">
                                                    <Clock className="h-2 w-2" />
                                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        deleteNotification(n.id)
                                                    }}
                                                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {n.message}
                                        </p>
                                    </div>
                                </div>
                                {!n.read && (
                                    <div className="absolute top-4 right-12 h-2 w-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center space-y-4 h-full flex flex-col items-center justify-center">
                        <div className="p-4 bg-muted rounded-full">
                            <Inbox className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-muted-foreground">Inbox is Empty</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">No recent notifications found</p>
                        </div>
                    </div>
                )}
            </ScrollArea>

            <div className="p-3 border-t border-border bg-muted/10 text-center">
                <Button 
                    variant="link" 
                    size="sm" 
                    className="text-[11px] font-bold text-muted-foreground hover:text-primary p-0 h-auto"
                    onClick={() => {
                        // Dispatch custom event to open System Settings
                        window.dispatchEvent(new CustomEvent('open-system-settings'))
                    }}
                >
                    View Alert Management Settings
                </Button>
            </div>

            {/* Notification Detail Popup */}
            <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                selectedNotification?.type === 'info' && "bg-blue-100 text-blue-600",
                                selectedNotification?.type === 'success' && "bg-green-100 text-green-600",
                                selectedNotification?.type === 'warning' && "bg-orange-100 text-orange-600",
                                selectedNotification?.type === 'error' && "bg-destructive/10 text-destructive"
                            )}>
                                {selectedNotification && getIconForType(selectedNotification.type)}
                            </div>
                            <div>
                                <DialogTitle className="text-base">{selectedNotification?.title}</DialogTitle>
                                <p className="text-xs text-muted-foreground">
                                    {selectedNotification && formatDistanceToNow(new Date(selectedNotification.created_at), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>
                    <DialogDescription className="text-sm pt-4">
                        {selectedNotification?.message}
                    </DialogDescription>
                    {selectedNotification?.link && (
                        <div className="pt-4">
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full gap-2"
                                onClick={() => {
                                    if (selectedNotification.link) {
                                        window.location.href = selectedNotification.link
                                    }
                                }}
                            >
                                <ExternalLink className="h-4 w-4" />
                                View Details
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

function getIconForType(type: string) {
    switch (type) {
        case 'success': return <Check className="h-4 w-4" />
        case 'warning': return <Bell className="h-4 w-4" />
        case 'info': return <Inbox className="h-4 w-4" />
        case 'error': return <Trash2 className="h-4 w-4" />
        default: return <Bell className="h-4 w-4" />
    }
}
