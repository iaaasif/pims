import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { sendSMS } from '@/lib/sms'

export interface InventoryItem {
    id: string
    project_id: string
    material_id: string
    quantity: number
    usage_date: string
    purpose: string
    material: {
        name: string
        code: string
        unit: string
        min_stock_level: number
        unit_price: number
    }
}

export function useInventory(projectId?: string) {
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchInventory() {
        if (!projectId) {
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('material_usage')
                .select(`
id,
    project_id,
    material_id,
    quantity,
    usage_date,
    purpose,
    material: materials(
        name,
        code,
        unit,
        min_stock_level,
        unit_price
    )
                `)
                .eq('project_id', projectId)
                .order('usage_date', { ascending: false })

            if (error) throw error

            setInventory(data as unknown as InventoryItem[])
        } catch (error) {
            console.error('Error fetching inventory:', error)
        } finally {
            setLoading(false)
        }
    }

    async function addMaterialToProject(projectId: string, materialId: string, quantity: number) {
        try {
            // Add to material_usage table
            const { data, error } = await supabase
                .from('material_usage')
                .insert([{
                    project_id: projectId,
                    material_id: materialId,
                    quantity: quantity,
                    used_by: null, // Can be set to current user if available
                    usage_date: new Date().toISOString(),
                    purpose: 'Manual inventory addition'
                }])
                .select()
                .single()

            if (error) throw error

            fetchInventory()
            return { data, error: null }
        } catch (error) {
            console.error('Error adding material:', error)
            return { data: null, error }
        }
    }

    async function updateInventory(itemId: string, newQuantity: number, type: 'usage' | 'receive' | 'adjustment', notes?: string) {
        try {
            // Get item details for transaction log from material_usage
            const { data: item, error: fetchError } = await supabase
                .from('material_usage')
                .select('*')
                .eq('id', itemId)
                .single()

            if (fetchError || !item) {
                console.error('Item not found in material_usage:', itemId)
                throw new Error('Item not found')
            }

            const diff = newQuantity - Number(item.quantity)

            const { data, error } = await supabase
                .from('material_usage')
                .update({
                    quantity: newQuantity,
                    // removed updated_at as it doesn't exist
                    // optionally set who used it if we had user context here
                })
                .eq('id', itemId)
                .select()
                .single()

            if (error) {
                console.error('Update failed:', error)
                throw error
            }

            // Log transaction with reference to the specific usage ID
            await supabase.from('inventory_transactions').insert({
                project_id: item.project_id,
                material_id: item.material_id,
                quantity: diff,
                transaction_type: type,
                reference_id: itemId,
                notes
            })

            // 3. Check for Low Stock and send SMS alert
            if (type === 'usage' || type === 'adjustment') {
                // Fetch current total stock for this material in this project
                const { data: usageLogs } = await supabase
                    .from('material_usage')
                    .select('quantity')
                    .eq('project_id', item.project_id)
                    .eq('material_id', item.material_id)

                const totalInProject = (usageLogs || []).reduce((sum, log) => sum + Number(log.quantity), 0)

                // Get material threshold
                const { data: material } = await supabase
                    .from('materials')
                    .select('name, min_stock_level, unit')
                    .eq('id', item.material_id)
                    .single()

                if (material && totalInProject <= Number(material.min_stock_level)) {
                    const message = `LOW STOCK ALERT: ${material.name} is down to ${totalInProject} ${material.unit} in Project Inventory.Threshold is ${material.min_stock_level}.`
                    sendSMS('', message, 'low_inventory', 'inventory_low', { MATERIAL_NAME: material.name, CURRENT_QUANTITY: totalInProject, UNIT: material.unit, MIN_STOCK: material.min_stock_level })
                }
            }

            fetchInventory()
            return { data, error: null }
        } catch (error) {
            console.error('Error updating inventory:', error)
            return { data: null, error }
        }
    }

    useEffect(() => {
        fetchInventory()
    }, [projectId])

    return { inventory, loading, refresh: fetchInventory, addMaterialToProject, updateInventory }
}
