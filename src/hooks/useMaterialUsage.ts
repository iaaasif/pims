/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export interface MaterialUsage {
    id: string
    material_id: string
    project_id: string
    quantity: number
    usage_date: string
    purpose: string | null
    used_by: string
}

export function useMaterialUsage() {
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()

    async function recordUsage(
        data: {
            material_id: string
            project_id: string
            quantity: number
            purpose: string
            usage_date: string
        }
    ) {
        setLoading(true)
        try {
            if (!user) throw new Error("User not authenticated")

            const { data: result, error } = await supabase.rpc('record_material_usage', {
                p_material_id: data.material_id,
                p_quantity: data.quantity,
                p_project_id: data.project_id,
                p_used_by: user.id,
                p_purpose: data.purpose,
                p_date: data.usage_date
            })

            if (error) throw error

            // RPC returns JSONB
            if (result && !result.success) {
                throw new Error(result.error || "Failed to record usage")
            }

            return { success: true, error: null }

        } catch (error: any) {
            console.error('Error recording usage:', error)
            return { success: false, error: error.message || error }
        } finally {
            setLoading(false)
        }
    }

    return { recordUsage, loading }
}
