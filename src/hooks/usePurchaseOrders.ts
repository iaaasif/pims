import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PurchaseRequisition } from './usePurchaseRequisitions'
import { sendSMS } from '@/lib/sms'
import { notifyAdmins } from '@/lib/notifications'

export interface POItem {
    id: string
    po_id: string
    material_id: string
    quantity: number
    received_quantity?: number
    unit_price: number
    total_price: number
    material?: {
        name: string
        code: string
        unit: string
    }
}

export interface PurchaseOrder {
    id: string
    po_number: string
    vendor_id: string
    project_id: string | null
    status: 'pending' | 'confirmed' | 'partially_received' | 'received' | 'cancelled'
    total_amount: number
    created_at: string
    terms_and_conditions?: string
    vendor?: { name: string; email: string | null; phone: string | null; address: string | null; contact_person?: string | null }
    project?: {
        name: string;
        project_address?: string | null;
        location?: { address: string };
        contact_person?: string;
        contact_person_phone?: string;
    }
    items?: POItem[]
}

export interface CompanyInfo {
    company_name: string
    address: string
    city: string
    state: string
    postal_code: string
    country: string
    phone: string
    email: string
    website: string
    ship_to_name?: string
    ship_to_address?: string
    ship_to_title?: string
    ship_to_phone?: string
    ship_to_email?: string
}

export function usePurchaseOrders() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([])
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
    const [loading, setLoading] = useState(true)

    async function fetchOrders() {
        setLoading(true)
        try {
            // Fetch Company Info
            const { data: companyData } = await supabase
                .from('company_information')
                .select('*')
                .limit(1)
                .single()

            if (companyData) setCompanyInfo(companyData as CompanyInfo)

            const { data, error } = await supabase
                .from('purchase_orders')
                .select(`
                  id,
                  po_number,
                  vendor_id,
                  status,
                  total_amount,
                  created_at,
                  terms_and_conditions,
                  vendor:vendors (name, email, phone, address, contact_person),
                  project:projects (
                    name,
                    project_address,
                    contact_person,
                    contact_person_phone,
                    location:locations (address)
                  ),
                  items:purchase_order_items (
                    id,
                    po_id,
                    material_id,
                    quantity,
                    received_quantity,
                    unit_price,
                    total_price,
                    material:materials (name, code, unit)
                  )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error

            setOrders(data as unknown as PurchaseOrder[])
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    async function createPOFromPR(pr: PurchaseRequisition, vendorId: string, termsAndConditions?: string) {
        // Create PO logic
        // 1. Create PO Header
        // 2. Copy Items from PR
        try {
            const poNumber = `PO-${Date.now().toString().slice(-6)}`

            const prProjectId = (pr as any).project_id ?? null

            const { data: po, error: poError } = await supabase
                .from('purchase_orders')
                .insert([{
                    po_number: poNumber,
                    pr_id: pr.id,
                    vendor_id: vendorId,
                    project_id: prProjectId,
                    status: 'pending',
                    total_amount: 0, // Calculate 
                    terms_and_conditions: termsAndConditions || null,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single()

            if (poError) throw poError

            let itemsToInsert: Array<{
                po_id: string
                material_id: string
                name: string | undefined
                quantity: number
                unit_price: number
                total_price: number
            }> = []

            if (pr.items && pr.items.length > 0) {
                const materialIds = pr.items
                    .filter((it: any) => it.material_id)
                    .map((it: any) => it.material_id)

                const { data: materialRows, error: materialError } = await supabase
                    .from('materials')
                    .select('id, name, unit_price')
                    .in('id', materialIds)

                if (materialError) throw materialError

                const priceByMaterialId = new Map<string, number>()
                const nameByMaterialId = new Map<string, string>()
                for (const m of materialRows ?? []) {
                    const raw = (m as any).unit_price
                    const unitPrice = raw === null || raw === undefined ? 0 : Number(raw)
                    priceByMaterialId.set((m as any).id, Number.isFinite(unitPrice) ? unitPrice : 0)
                    nameByMaterialId.set((m as any).id, (m as any).name || 'Unknown Item')
                }

                itemsToInsert = pr.items
                    .filter((it: any) => it.material_id)
                    .map((item: any) => {
                        const prUnitPriceRaw = item.unit_price
                        const prUnitPrice = prUnitPriceRaw === null || prUnitPriceRaw === undefined ? 0 : Number(prUnitPriceRaw)
                        const unitPrice = (Number.isFinite(prUnitPrice) && prUnitPrice > 0)
                            ? prUnitPrice
                            : (priceByMaterialId.get(item.material_id) ?? 0)
                        const qty = Number(item.quantity)
                        const totalPrice = (Number.isFinite(qty) ? qty : 0) * unitPrice
                        return {
                            po_id: po.id,
                            material_id: item.material_id,
                            name: nameByMaterialId.get(item.material_id), // Temporary storage for SMS
                            quantity: qty,
                            unit_price: unitPrice,
                            total_price: totalPrice,
                        }
                    })

                const totalAmount = itemsToInsert.reduce((sum, it) => sum + (Number(it.total_price) || 0), 0)

                const { error: itemsError } = await supabase
                    .from('purchase_order_items')
                    .insert(itemsToInsert.map(({ name, ...rest }) => rest))

                if (itemsError) throw itemsError

                const { error: totalError } = await supabase
                    .from('purchase_orders')
                    .update({ total_amount: totalAmount as any })
                    .eq('id', po.id)

                if (totalError) throw totalError
            }

            // Send SMS notification to Project Contact Person
            if (prProjectId) {
                try {
                    const { data: projectData } = await supabase
                        .from('projects')
                        .select('name, contact_person_phone')
                        .eq('id', prProjectId)
                        .single()

                    if (projectData?.contact_person_phone) {
                        const itemList = itemsToInsert
                            .map(item => `${item.name} (${item.quantity})`)
                            .join(', ')
                        const truncatedList = itemList.length > 100 ? itemList.substring(0, 97) + '...' : itemList
                        
                        // 1. Send SMS (Backend)
                        const message = `New PO [${poNumber}] for ${projectData.name}. Items: ${truncatedList}.`
                        sendSMS(projectData.contact_person_phone, message, 'purchase_orders', 'po_created', { PO_NUMBER: poNumber, PROJECT_NAME: projectData.name, ITEM_LIST: truncatedList })

                        // 2. Open WhatsApp (Frontend Link)
                        const whatsappPhone = projectData.contact_person_phone.startsWith('88') 
                            ? projectData.contact_person_phone 
                            : `88${projectData.contact_person_phone.replace(/^0+/, '')}`
                        
                        const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
                        window.open(whatsappUrl, '_blank')
                    }
                } catch (error) {
                    console.error('Error sending notification to project contact:', error)
                }
            }

            // Database Notification for PO creation (Notify admin)
            await notifyAdmins({
                title: 'Purchase Order Created',
                message: `PO ${poNumber} has been generated from PR ${pr.pr_number}.`,
                type: 'success',
                link: '/procurement/orders'
            })

            await fetchOrders()
            return { data: po, error: null }
        } catch (error) {
            console.error('Error creating PO:', error)
            return { data: null, error: 'An unexpected error occurred' }
        }
    }

    async function approvePO(poId: string) {
        try {
            // Fetch PO details first to get the po_number
            const { data: poData, error: fetchError } = await supabase
                .from('purchase_orders')
                .select('po_number')
                .eq('id', poId)
                .single()

            if (fetchError) throw fetchError

            const { error } = await supabase
                .from('purchase_orders')
                .update({ status: 'confirmed' })
                .eq('id', poId)

            if (error) throw error

            await fetchOrders()

            const poNumber = poData?.po_number || poId

            // Send SMS notification
            sendSMS('', `PO [${poNumber}] has been confirmed/approved.`, 'purchase_orders', 'po_approved', { PO_NUMBER: poNumber })

            // Database Notification (Notify relevant parties)
            await notifyAdmins({
                title: 'Purchase Order Confirmed',
                message: `PO ${poNumber} has been confirmed.`,
                type: 'success',
                link: '/procurement/orders'
            })

            return { error: null }
        } catch (error) {
            console.error('Error approving PO:', error)
            return { error: 'Failed to approve Purchase Order' }
        }
    }

    async function rejectPO(poId: string) {
        try {
            // Fetch PO details first to get the po_number
            const { data: poData, error: fetchError } = await supabase
                .from('purchase_orders')
                .select('po_number')
                .eq('id', poId)
                .single()

            if (fetchError) throw fetchError

            const { error } = await supabase
                .from('purchase_orders')
                .update({ status: 'cancelled' })
                .eq('id', poId)

            if (error) throw error

            await fetchOrders()

            const poNumber = poData?.po_number || poId

            // Send SMS notification
            sendSMS('', `PO [${poNumber}] has been cancelled/rejected.`, 'purchase_orders', 'po_rejected', { PO_NUMBER: poNumber })

            return { error: null }
        } catch (error) {
            console.error('Error rejecting PO:', error)
            return { error: 'Failed to reject Purchase Order' }
        }
    }

    async function deletePO(poId: string) {
        try {
            const { error } = await supabase
                .from('purchase_orders')
                .delete()
                .eq('id', poId)

            if (error) throw error

            await fetchOrders()
            return { error: null }
        } catch (error) {
            console.error('Error deleting PO:', error)
            return { error: 'Failed to delete Purchase Order' }
        }
    }

    useEffect(() => {
        fetchOrders()

        // Realtime subscription — auto-refresh whenever any PO is inserted/updated/deleted
        const channel = supabase
            .channel('purchase_orders_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'purchase_orders' },
                () => { fetchOrders() }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    return { orders, companyInfo, loading, createPOFromPR, approvePO, rejectPO, deletePO, refresh: fetchOrders }
}
