import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface RealTimeInventoryItem {
    material_id: string
    material_name: string
    material_code: string
    unit: string
    total_quantity: number
    last_updated: string
    sources: string
}

export interface ProjectInventorySummary {
    project_id: string
    project_name: string
    total_materials: number
    total_quantity: number
    last_updated: string
}

export function useRealTimeInventory(projectId?: string) {
    const [inventory, setInventory] = useState<RealTimeInventoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

    async function fetchRealTimeInventory() {
        if (!projectId) return

        console.log('fetchRealTimeInventory called for projectId:', projectId)
        setLoading(true)
        try {
            const { data, error } = await supabase.rpc('get_project_inventory', {
                project_uuid: projectId
            })

            console.log('fetchRealTimeInventory result:', { data, error })

            if (error) throw error

            setInventory(data as RealTimeInventoryItem[])
            setLastUpdate(new Date())
        } catch (error) {
            console.error('Error fetching real-time inventory:', error)
        } finally {
            setLoading(false)
        }
    }

    // Set up real-time subscription
    useEffect(() => {
        if (!projectId) return

        // Initial fetch
        fetchRealTimeInventory()

        // Set up subscription for real-time updates
        const channel = supabase
            .channel('inventory_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'material_usage',
                    filter: `project_id=eq.${projectId}`
                },
                () => {
                    console.log('Inventory updated, refreshing...')
                    fetchRealTimeInventory()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [projectId])

    return {
        inventory,
        loading,
        lastUpdate,
        refresh: fetchRealTimeInventory
    }
}

export function useAllProjectsInventorySummary() {
    const [summary, setSummary] = useState<ProjectInventorySummary[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchSummary() {
        setLoading(true)
        try {
            const { data, error } = await supabase.rpc('get_all_projects_inventory_summary')

            if (error) throw error

            setSummary(data as ProjectInventorySummary[])
        } catch (error) {
            console.error('Error fetching inventory summary:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSummary()

        // Set up subscription for real-time updates
        const channel = supabase
            .channel('inventory_summary_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'material_usage'
                },
                () => {
                    console.log('Inventory summary updated, refreshing...')
                    fetchSummary()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return {
        summary,
        loading,
        refresh: fetchSummary
    }
}
