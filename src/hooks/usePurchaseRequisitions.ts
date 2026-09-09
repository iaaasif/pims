import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { sendSMS } from '@/lib/sms'
import { notifyAdmins, createNotification } from '@/lib/notifications'

export interface PRItem {
    id?: string
    material_id: string
    quantity: number
    required_date?: string
    unit_price?: number
    material?: {
        name: string
        code: string
        unit: string
    }
}

export interface PurchaseRequisition {
    id: string
    pr_number: string
    project_id: string
    requested_by: string
    required_date: string
    status: 'draft' | 'submitted' | 'approved' | 'rejected'
    justification: string | null
    total_amount: number | null
    created_at: string
    project?: { name: string }
    requester?: { full_name: string; job_title?: string | null }
    items?: PRItem[]
    purchase_orders?: { id: string }[]
}

export function usePurchaseRequisitions() {
    const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    async function fetchRequisitions() {
        setLoading(true)
        try {
            const { data: fullPrs, error: joinError } = await supabase
                .from('purchase_requisitions')
                .select(`
          *,
          project:projects (name),
          requester:profiles!purchase_requisitions_requested_by_fkey (full_name, job_title),
            items:purchase_requisition_items (
            id,
            material_id,
            quantity,
            required_date,
            unit_price,
            material:materials (name, code, unit)
          ),
          purchase_orders (id)
        `)
                .order('created_at', { ascending: false })

            if (joinError) throw joinError

            setRequisitions(fullPrs as PurchaseRequisition[])
        } catch (error) {
            console.error('Error fetching requisitions:', error)
        } finally {
            setLoading(false)
        }
    }

    async function updateRequisition(
        prId: string,
        updates: Pick<PurchaseRequisition, 'required_date' | 'justification' | 'status' | 'total_amount'>
    ) {
        try {
            const { error } = await supabase
                .from('purchase_requisitions')
                .update({
                    required_date: updates.required_date as any,
                    justification: updates.justification,
                    status: updates.status as any,
                    total_amount: updates.total_amount as any,
                })
                .eq('id', prId)

            if (error) throw error

            await fetchRequisitions()
            return { error: null }
        } catch (error) {
            console.error('Error updating requisition:', error)
            return { error }
        }
    }

    async function deleteRequisition(prId: string) {
        try {
            const { error: itemsError } = await supabase
                .from('purchase_requisition_items')
                .delete()
                .eq('pr_id', prId)

            if (itemsError) throw itemsError

            const { error } = await supabase
                .from('purchase_requisitions')
                .delete()
                .eq('id', prId)

            if (error) throw error

            await fetchRequisitions()
            return { error: null }
        } catch (error) {
            console.error('Error deleting requisition:', error)
            return { error }
        }
    }

    async function createRequisition(
        prData: Omit<PurchaseRequisition, 'id' | 'pr_number' | 'created_at' | 'status' | 'requester' | 'items' | 'project' | 'requested_by'>,
        items: { material_id: string; quantity: number; required_date: string; unit_price: number }[]
    ) {
        try {
            if (!user) throw new Error("User not authenticated")

            // Generate PR Number (Simple timestamp based or random for now, ideally DB trigger or sequential)
            const prNumber = `PR-${Date.now().toString().slice(-6)}`

            // 1. Create PR Header
            const { data: pr, error: prError } = await supabase
                .from('purchase_requisitions')
                .insert([{
                    ...prData,
                    status: 'submitted', // Or draft
                    pr_number: prNumber,
                    requested_by: user.id
                }])
                .select()
                .single()

            if (prError) throw prError

            // 2. Create PR Items
            if (items.length > 0) {
                const itemsToInsert = items.map(item => ({
                    pr_id: pr.id,
                    material_id: item.material_id,
                    quantity: item.quantity,
                    required_date: item.required_date,
                    unit_price: item.unit_price
                }))

                const { error: itemsError } = await supabase
                    .from('purchase_requisition_items')
                    .insert(itemsToInsert)

                if (itemsError) {
                    // Rollback? complex. For now just throw.
                    console.error("Error inserting items", itemsError)
                    throw itemsError
                }
            }

            await fetchRequisitions()

            // Send SMS notification
            sendSMS('', `New PR [${prNumber}] created by ${user?.email || 'User'}.`, 'purchase_requisitions', 'pr_created', { PR_NUMBER: prNumber, USER_EMAIL: user?.email || 'User' })

            // Create persistent database notification for admins
            await notifyAdmins({
                title: 'New Requisition Submitted',
                message: `PR ${prNumber} has been submitted by ${user?.email || 'User'} and requires review.`,
                type: 'info',
                link: '/procurement/requisitions'
            })

            return { data: pr, error: null }

        } catch (error) {
            console.error('Error creating requisition:', error)
            return { data: null, error }
        }
    }

    async function updateRequisitionStatus(prId: string, status: 'approved' | 'rejected') {
        try {
            // Fetch PR details first to get the pr_number
            const { data: prData, error: fetchError } = await supabase
                .from('purchase_requisitions')
                .select('requested_by, pr_number')
                .eq('id', prId)
                .single()

            if (fetchError) throw fetchError

            const prNumber = prData?.pr_number || prId

            const { error } = await supabase
                .from('purchase_requisitions')
                .update({ status })
                .eq('id', prId)

            if (error) throw error

            await fetchRequisitions()

            // Send SMS notification
            sendSMS('', `PR [${prNumber}] has been ${status}.`, 'purchase_requisitions', 'pr_status_changed', { PR_NUMBER: prNumber, STATUS: status })

            if (prData) {
                await createNotification({
                    userId: prData.requested_by,
                    title: `Requisition ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                    message: `Your PR ${prData.pr_number} has been ${status} by the administrator.`,
                    type: status === 'approved' ? 'success' : 'error',
                    link: '/procurement/requisitions'
                })
            }

            return { error: null }
        } catch (error) {
            console.error('Error updating requisition status:', error)
            return { error }
        }
    }

    // TODO: Approve/Reject functions

    useEffect(() => {
        fetchRequisitions()
    }, [])

    return { requisitions, loading, createRequisition, updateRequisition, deleteRequisition, updateRequisitionStatus, refresh: fetchRequisitions }
}
