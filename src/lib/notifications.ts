import { supabase } from './supabase'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export async function createNotification(params: {
    userId?: string | null
    title: string
    message: string
    type?: NotificationType
    link?: string
}) {
    try {
        // If userId is provided, send to that user. 
        // If userId is null/undefined, we might want to broadcast to all admins or similar logic.
        // For simplicity, if userId is null, it's a "global" alert.
        
        const { data, error } = await supabase
            .from('notifications')
            .insert([{
                user_id: params.userId,
                title: params.title,
                message: params.message,
                type: params.type || 'info',
                link: params.link,
                read: false
            }])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating notification:', error)
        return { data: null, error }
    }
}

/**
 * Sends a notification to all administrators
 */
export async function notifyAdmins(params: {
    title: string
    message: string
    type?: NotificationType
    link?: string
}) {
    try {
        // Fetch all admin and manager IDs
        const { data: admins, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .in('role', ['admin', 'manager', 'management'])

        if (fetchError) throw fetchError

        if (admins && admins.length > 0) {
            const notifications = admins.map(admin => ({
                user_id: admin.id,
                title: params.title,
                message: params.message,
                type: params.type || 'info',
                link: params.link
            }))

            const { error: insertError } = await supabase
                .from('notifications')
                .insert(notifications)

            if (insertError) throw insertError
        }
        
        return { success: true, error: null }
    } catch (error) {
        console.error('Error notifying admins:', error)
        return { success: false, error }
    }
}
