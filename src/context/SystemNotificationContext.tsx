import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { toast } from 'sonner'

export interface SystemNotification {
    id: string
    user_id: string | null
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    read: boolean
    link?: string
    created_at: string
}

// Temporary constant to fix hidden imports causing SyntaxError
export const Notification = {} as any

interface NotificationContextType {
    notifications: SystemNotification[]
    unreadCount: number
    loading: boolean
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    deleteNotification: (id: string) => Promise<void>
    refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<SystemNotification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    const fetchNotifications = useCallback(async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .or(`user_id.eq.${user.id},user_id.is.null`)
                .order('created_at', { ascending: false })
                .limit(20)

            if (error) throw error

            if (data) {
                setNotifications(data as SystemNotification[])
                setUnreadCount(data.filter(n => !n.read).length)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (!user) {
            setNotifications([])
            setUnreadCount(0)
            setLoading(false)
            return
        }

        fetchNotifications()

        // Subscribe to real-time notifications with error handling
        let retryCount = 0
        const maxRetries = 3
        
        const subscribeToChannel = () => {
            const channel = supabase
                .channel(`user-notifications-${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        const newNotification = payload.new as SystemNotification
                        setNotifications(prev => [newNotification, ...prev].slice(0, 20))
                        setUnreadCount(prev => prev + 1)
                        
                        // Show a toast for the new notification
                        toast(newNotification.title, {
                            description: newNotification.message,
                            action: newNotification.link ? {
                                label: 'View',
                                onClick: () => window.location.href = newNotification.link!
                            } : undefined
                        })
                    }
                )
                .subscribe((status) => {
                    if (status === 'CHANNEL_ERROR') {
                        console.error('Notification channel error - WebSocket failed')
                        // Retry subscription if under max retries
                        if (retryCount < maxRetries) {
                            retryCount++
                            console.log(`Retrying subscription (attempt ${retryCount}/${maxRetries})...`)
                            setTimeout(subscribeToChannel, 2000)
                        }
                    } else if (status === 'CLOSED') {
                        console.log('Notification channel closed')
                    } else if (status === 'SUBSCRIBED') {
                        console.log('Notification channel subscribed successfully')
                        retryCount = 0 // Reset retry count on success
                    }
                })

            return channel
        }

        const channel = subscribeToChannel()

        return () => {
            if (channel) {
                try {
                    const removal = supabase.removeChannel(channel)
                    if (removal && typeof (removal as any).catch === 'function') {
                        (removal as any).catch(() => {})
                    }
                } catch {
                    // Ignore cleanup error
                }
            }
        }
    }, [user, fetchNotifications])

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id)

            if (error) throw error

            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const markAllAsRead = async () => {
        if (!user) return
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', user.id)
                .eq('read', false)

            if (error) throw error

            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
        }
    }

    const deleteNotification = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id)

            if (error) throw error

            setNotifications(prev => prev.filter(n => n.id !== id))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error deleting notification:', error)
        }
    }

    const value = {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications: fetchNotifications
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}
