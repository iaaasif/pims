/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Material {
    id: string
    name: string
    code: string | null
    category: string | null
    unit: string
    current_stock: number
    min_stock_level: number
    description: string | null
    project_id: string | null
    location_id: string | null
    project?: { name: string }
    location?: { name: string }
}

export function useMaterials() {
    const [materials, setMaterials] = useState<Material[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchMaterials() {
        setLoading(true)
        try {
            const { data: materialsData, error: materialsError } = await supabase
                .from('materials')
                .select(`
          *,
          project:projects (name),
          location:locations (name)
        `)
                .order('name')

            if (materialsError) throw materialsError

            // Fetch inventory items to calculate total stock
            const { data: inventoryData, error: inventoryError } = await supabase
                .from('material_usage')
                .select('material_id, quantity, project_id')

            if (inventoryError) throw inventoryError

            // Map materials to include aggregated stock
            const materialsWithStock = materialsData.map((material: any) => {
                const totalStock = inventoryData
                    .filter((item: any) => item.material_id === material.id)
                    .reduce((sum: number, item: any) => sum + Number(item.quantity), 0)

                // Use aggregated stock if available, otherwise fallback to material.current_stock (for migrated/legacy data)
                // actually, for the master list, we should probably prefer the sum if we are moving to project-based inventory.
                // But let's add them: Base Stock (Warehouse/Unassigned) + Project Stock?
                // The current schema has `current_stock` in materials table. Let's assume that is "Unassigned/Warehouse" stock
                // and we add project stock to it? Or rewrite it?
                // requirement: "Total Stock not show".
                // Let's summing project stock.

                return {
                    ...material,
                    current_stock: totalStock + (Number(material.current_stock) || 0)
                }
            })

            setMaterials(materialsWithStock as Material[])
        } catch (error) {
            console.error('Error fetching materials:', error)
        } finally {
            setLoading(false)
        }
    }

    async function addMaterial(material: Omit<Material, 'id' | 'created_at'>) {
        try {
            const { data, error } = await supabase
                .from('materials')
                .insert([material])
                .select()

            if (error) throw error
            await fetchMaterials()
            return { data, error: null }
        } catch (error) {
            console.error("Error adding material:", error)
            return { data: null, error }
        }
    }

    async function updateMaterial(id: string, material: Partial<Material>) {
        try {
            const { error } = await supabase
                .from('materials')
                .update(material)
                .eq('id', id)

            if (error) throw error
            await fetchMaterials()
            return { error: null }
        } catch (error) {
            console.error('Error updating material:', error)
            return { error }
        }
    }

    async function deleteMaterial(id: string) {
        try {
            const { error } = await supabase
                .from('materials')
                .delete()
                .eq('id', id)

            if (error) throw error
            await fetchMaterials()
            return { error: null }
        } catch (error) {
            console.error('Error deleting material:', error)
            return { error }
        }
    }

    useEffect(() => {
        fetchMaterials()

        const subscription = supabase
            .channel('materials_channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'materials' },
                (payload: any) => {
                    console.log('Material change received!', payload)
                    fetchMaterials()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

    return { materials, loading, addMaterial, updateMaterial, deleteMaterial, refresh: fetchMaterials }
}
