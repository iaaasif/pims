import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '../types/index.js'
import { SyncLoader } from '@/components/ui/sync-loader'

interface AuthContextType {
    user: User | null
    profile: Profile | null
    session: Session | null
    loading: boolean
    isAdmin: boolean
    isManager: boolean
    canEdit: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    isAdmin: false,
    isManager: false,
    canEdit: false,
})

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function fetchProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                // Handle specific error codes
                if (error.code === 'PGRST116') { // No rows returned
                    await createProfileForUser(userId)
                } else if (error.code === '406') { // Not acceptable - RLS issue
                    console.error('RLS policy error, user may not have permission')
                    toast.error('Permission denied. Please contact admin.')
                } else {
                    console.error('Profile fetch error:', error.message)
                    toast.error('Failed to load profile')
                }
            } else {
                setProfile(data)
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            toast.error('Failed to load user profile')
        } finally {
            setLoading(false)
        }
    }

    async function createProfileForUser(userId: string) {
        try {
            // Get user data from auth
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                console.error('Could not get user data:', userError)
                return
            }

            // Create profile
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || 'New User',
                    role: 'viewer', // Default role
                    created_at: new Date().toISOString(),
                })

            if (insertError) {
                console.error('Failed to create profile:', insertError)
                toast.error('Failed to create user profile')
            } else {
                console.log('Profile created successfully')
                toast.success('Profile created successfully')
                // Try fetching again
                await fetchProfile(userId)
            }
        } catch (error) {
            console.error('Error creating profile:', error)
            toast.error('Failed to create profile')
        }
    }


    const isAdmin = profile?.role === 'admin'
    const isManager = profile?.role === 'manager' || profile?.role === 'management' || isAdmin
    const canEdit = isAdmin || isManager // Only admins and managers can edit, viewers cannot

    const value = {
        user,
        profile,
        session,
        loading,
        isAdmin,
        isManager,
        canEdit,
    }

    if (loading) {
        return <SyncLoader fullScreen />
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
