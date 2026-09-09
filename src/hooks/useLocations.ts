import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Location {
    id: string
    name: string
    code: string
    address?: string
    contact_person: string
    contact_number: string
    status: string
    created_at: string
}

export function useLocations() {
    const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchLocations() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                throw error
            }

            setLocations(data as Location[])
        } catch (error) {
            console.error('Error fetching locations:', error)
        } finally {
            setLoading(false)
        }
    }

    async function addLocation(location: Omit<Location, 'id' | 'created_at'>) {
        try {
            // Ensure address is included (even if empty) for database compatibility
            const locationData = {
                ...location,
                address: location.address || ""
            }
            
            const { data, error } = await supabase
                .from('locations')
                .insert([locationData])
                .select()
                .single()

            if (error) throw error

            setLocations((prev) => [data as Location, ...prev])
            return { data, error: null }
        } catch (error) {
            console.error('Error adding location:', error)
            return { data: null, error }
        }
    }

    async function deleteLocation(id: string) {
        try {
            const { error } = await supabase
                .from('locations')
                .delete()
                .eq('id', id)

            if (error) throw error

            setLocations((prev) => prev.filter((loc) => loc.id !== id))
        } catch (error) {
            console.error('Error deleting location:', error)
            throw error
        }
    }

    useEffect(() => {
        fetchLocations()
    }, [])

    return { locations, loading, addLocation, deleteLocation, refresh: fetchLocations }
}
