import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'CRITICAL: Supabase environment variables are missing!\n' +
        'Please create a .env file based on .env.example with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    )
}

// Singleton instance to prevent multiple clients across re-renders
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder-anon-key', 
    {
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        },
        auth: {
            persistSession: true,
            autoRefreshToken: true
        }
    }
)

export { createClient }
