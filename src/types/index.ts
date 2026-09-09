/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Profile {
    id: string
    email: string
    full_name: string | null
    role: 'admin' | 'management' | 'manager' | 'store_keeper' | 'finance_executive' | 'viewer' | 'user' // 'user' is legacy, use 'viewer' instead
    phone?: string | null
    avatar_url?: string | null
    notification_preferences?: any
    job_title?: string | null
    created_at: string
}

export interface User {
    id: string
    email?: string
    user_metadata: {
        [key: string]: any
    }
}
