import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function useIdleTimeout(timeoutMinutes: number, enabled: boolean) {
    const timeoutId = useRef<NodeJS.Timeout | null>(null)

    const resetTimer = () => {
        if (timeoutId.current) clearTimeout(timeoutId.current)
        
        if (!enabled || timeoutMinutes <= 0) return

        timeoutId.current = setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                await supabase.auth.signOut()
                toast.info('Session expired due to inactivity.', {
                    description: 'Please login again to continue.',
                    duration: 10000,
                })
                window.location.href = '/login'
            }
        }, timeoutMinutes * 60 * 1000)
    }

    useEffect(() => {
        if (!enabled || timeoutMinutes <= 0) {
            if (timeoutId.current) clearTimeout(timeoutId.current)
            return
        }

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
        
        const handleEvent = () => resetTimer()

        events.forEach(event => document.addEventListener(event, handleEvent))
        
        // Initial timer set
        resetTimer()

        return () => {
            events.forEach(event => document.removeEventListener(event, handleEvent))
            if (timeoutId.current) clearTimeout(timeoutId.current)
        }
    }, [timeoutMinutes, enabled])
}
