import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface MaterialUnit {
    id: string
    name: string
    abbreviation: string
    description: string | null
    created_at: string
    updated_at: string
}

export function useUnits() {
    const [units, setUnits] = useState<MaterialUnit[]>([])
    const [loading, setLoading] = useState(true)

    const fetchUnits = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('material_units')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setUnits(data || [])
        } catch (error: any) {
            console.error('Error fetching units:', error)
            toast.error('Failed to load units')
        } finally {
            setLoading(false)
        }
    }

    const addUnit = async (unitData: { name: string; abbreviation: string; description?: string }) => {
        try {
            const { data, error } = await supabase
                .from('material_units')
                .insert([unitData])
                .select()
                .single()

            if (error) throw error

            toast.success('Unit added successfully')
            await fetchUnits()
            return { data, error: null }
        } catch (error: any) {
            console.error('Error adding unit:', error)
            toast.error(error.message || 'Failed to add unit')
            return { data: null, error }
        }
    }

    const updateUnit = async (id: string, unitData: { name?: string; abbreviation?: string; description?: string }) => {
        try {
            const { data, error } = await supabase
                .from('material_units')
                .update(unitData)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            toast.success('Unit updated successfully')
            await fetchUnits()
            return { data, error: null }
        } catch (error: any) {
            console.error('Error updating unit:', error)
            toast.error(error.message || 'Failed to update unit')
            return { data: null, error }
        }
    }

    const deleteUnit = async (id: string) => {
        try {
            const { error } = await supabase
                .from('material_units')
                .delete()
                .eq('id', id)

            if (error) throw error

            toast.success('Unit deleted successfully')
            await fetchUnits()
            return { error: null }
        } catch (error: any) {
            console.error('Error deleting unit:', error)
            toast.error(error.message || 'Failed to delete unit')
            return { error }
        }
    }

    useEffect(() => {
        fetchUnits()
    }, [])

    return {
        units,
        loading,
        fetchUnits,
        addUnit,
        updateUnit,
        deleteUnit
    }
}
