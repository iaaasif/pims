import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Vendor {
    id: string
    name: string
    code: string | null
    contact_person: string | null
    email: string | null
    phone: string | null
    address: string | null
    status: 'active' | 'inactive' | 'blacklisted'
    created_at: string
}

export function useVendors() {
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchVendors() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error

            setVendors(data as Vendor[])
        } catch (error) {
            console.error('Error fetching vendors:', error)
        } finally {
            setLoading(false)
        }
    }

    async function addVendor(vendor: Omit<Vendor, 'id' | 'created_at'>) {
        try {
            const { data, error } = await supabase
                .from('vendors')
                .insert([vendor])
                .select()
                .single()

            if (error) throw error

            setVendors((prev) => [data as Vendor, ...prev])
            return { data, error: null }
        } catch (error) {
            console.error('Error adding vendor:', error)
            return { data: null, error }
        }
    }

    async function updateVendor(id: string, vendor: Partial<Vendor>) {
        try {
            const { data, error } = await supabase
                .from('vendors')
                .update(vendor)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            setVendors((prev) => prev.map((v) => (v.id === id ? (data as Vendor) : v)))
            return { data, error: null }
        } catch (error) {
            console.error('Error updating vendor:', error)
            return { data: null, error }
        }
    }

    async function deleteVendor(id: string) {
        try {
            const { error } = await supabase
                .from('vendors')
                .delete()
                .eq('id', id)

            if (error) throw error

            setVendors((prev) => prev.filter((v) => v.id !== id))
            return { error: null }
        } catch (error) {
            console.error('Error deleting vendor:', error)
            return { error }
        }
    }

    useEffect(() => {
        fetchVendors()
    }, [])

    return { vendors, loading, addVendor, updateVendor, deleteVendor, refresh: fetchVendors }
}
