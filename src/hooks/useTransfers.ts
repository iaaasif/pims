import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { sendSMS } from '@/lib/sms'

export interface TransferRequest {
    id: string
    request_number: string
    from_project_id: string
    to_project_id: string
    material_id: string
    quantity: number
    status: 'pending' | 'approved' | 'rejected' | 'completed'
    created_at: string
    created_by: string
    from_project?: { name: string }
    to_project?: { name: string }
    material?: { name: string; unit: string; code: string }
    creator?: { full_name: string }
}

export function useTransfers() {
    const [transfers, setTransfers] = useState<TransferRequest[]>([])
    const [loading, setLoading] = useState(true)
    const { user, isAdmin, isManager } = useAuth()

    async function fetchTransfers() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('transfer_requests')
                .select(`
          *,
          from_project:projects!transfer_requests_from_project_id_fkey (name),
          to_project:projects!transfer_requests_to_project_id_fkey (name),
          material:materials (name, unit, code),
          creator:profiles (full_name)
        `)
                .order('created_at', { ascending: false })

            if (error) throw error

            setTransfers(data as TransferRequest[])
        } catch (error) {
            console.error('Error fetching transfers:', error)
        } finally {
            setLoading(false)
        }
    }

    async function createTransferRequest(data: {
        from_project_id: string
        to_project_id: string
        material_id: string
        quantity: number
    }) {
        try {
            if (!user) throw new Error("User not authenticated")

            const requestNumber = `TR-${Date.now().toString().slice(-6)}`

            const { data: newTr, error } = await supabase
                .from('transfer_requests')
                .insert([{
                    ...data,
                    request_number: requestNumber,
                    created_by: user.id
                }])
                .select()
                .single()

            if (error) throw error

            await fetchTransfers()

            // Send SMS notification
            sendSMS('', `New Transfer Request [${requestNumber}] created by ${user?.email || 'User'}.`, 'transfers', 'tr_created', { TR_NUMBER: requestNumber, USER_EMAIL: user?.email || 'User' })

            return { data: newTr, error: null }
        } catch (error) {
            console.error("Error creating transfer request:", error)
            return { data: null, error }
        }
    }

    async function approveTransfer(transfer: TransferRequest) {
        try {
            // 1. Fetch available stock in source project
            const { data: sourceItems, error: srcErr } = await supabase
                .from('material_usage')
                .select('id, quantity')
                .eq('project_id', transfer.from_project_id)
                .eq('material_id', transfer.material_id)
                .gt('quantity', 0)
                .order('usage_date', { ascending: true })

            if (srcErr) throw srcErr;

            const totalSourceStock = (sourceItems || []).reduce((sum, item) => sum + Number(item.quantity), 0);

            if (totalSourceStock < transfer.quantity) {
                throw new Error('Insufficient source stock across all batches');
            }

            // 2. Deduct from source project (FIFO)
            let remainingToTransfer = transfer.quantity;
            for (const item of sourceItems || []) {
                if (remainingToTransfer <= 0) break;

                const deductAmount = Math.min(Number(item.quantity), remainingToTransfer);
                const newQuantity = Number(item.quantity) - deductAmount;
                remainingToTransfer -= deductAmount;

                const { error: updateErr } = await supabase
                    .from('material_usage')
                    .update({ quantity: newQuantity })
                    .eq('id', item.id);

                if (updateErr) throw updateErr;

                // Log deduction
                await supabase.from('inventory_transactions').insert({
                    project_id: transfer.from_project_id,
                    material_id: transfer.material_id,
                    quantity: -deductAmount,
                    transaction_type: 'transfer_out',
                    reference_id: item.id,
                    notes: `Transfer Out: ${transfer.request_number}`
                });
            }

            // 3. Add to destination project
            const { data: newDest, error: insertErr } = await supabase
                .from('material_usage')
                .insert([{
                    project_id: transfer.to_project_id,
                    material_id: transfer.material_id,
                    quantity: transfer.quantity,
                    // Optionally set used_by if needed
                    usage_date: new Date().toISOString(),
                    purpose: `Transfer from ${transfer.from_project?.name || 'another project'} (Ref: ${transfer.request_number})`
                }]).select().single()

            if (insertErr) throw insertErr;

            await supabase.from('inventory_transactions').insert({
                project_id: transfer.to_project_id,
                material_id: transfer.material_id,
                quantity: transfer.quantity,
                transaction_type: 'transfer_in',
                reference_id: newDest.id,
                notes: `Transfer In: ${transfer.request_number}`
            });

            // 4. Update Transfer Request status
            const { error: trErr } = await supabase
                .from('transfer_requests')
                .update({ status: 'completed' })
                .eq('id', transfer.id);

            if (trErr) throw trErr;

            await fetchTransfers();
            sendSMS('', `Transfer Request [${transfer.request_number}] has been approved and executed.`, 'transfers', 'tr_approved', { TR_NUMBER: transfer.request_number });

            return { success: true, error: null };

        } catch (error: any) {
            console.error("Error approving transfer:", error)
            return { success: false, error: error.message || "Transfer failure" }
        }
    }

    async function deleteTransfer(transfer: TransferRequest) {
        try {
            if (!user) throw new Error("User not authenticated");

            // Check if user is creator OR admin/manager
            const isCreator = transfer.created_by === user.id;
            const canDelete = isCreator || isAdmin || isManager;

            if (!canDelete) {
                throw new Error("You don't have permission to delete this transfer. Only the creator, admins, or managers can delete transfers.");
            }

            // 1. Delete using RPC to bypass RLS with admin check
            const { data: rpcResult, error: rpcError } = await supabase
                .rpc('delete_transfer', { transfer_id: transfer.id });

            if (rpcError) {
                throw new Error(rpcError.message || "Failed to delete transfer");
            }
            if (!rpcResult) {
                throw new Error("Transfer deletion failed");
            }

            // 2. If it was already completed AND we successfully deleted it, we MUST revert the inventory deductions AND additions
            if (transfer.status === 'completed') {
                // A) Return the stock back to the origin project
                const { data: returnOrigin, error: originErr } = await supabase
                    .from('material_usage')
                    .insert([{
                        project_id: transfer.from_project_id,
                        material_id: transfer.material_id,
                        quantity: transfer.quantity,
                        usage_date: new Date().toISOString(),
                        purpose: `Revert Transfer ${transfer.request_number} deletion`
                    }]).select().single()

                if (originErr) throw originErr;

                await supabase.from('inventory_transactions').insert({
                    project_id: transfer.from_project_id,
                    material_id: transfer.material_id,
                    quantity: transfer.quantity,
                    transaction_type: 'transfer_revert_in',
                    reference_id: returnOrigin.id,
                    notes: `Stock returned from Transfer ${transfer.request_number} deletion`
                });

                // B) Safely deduct the falsely added stock from the destination project via FIFO
                const { data: destItems, error: destErr } = await supabase
                    .from('material_usage')
                    .select('id, quantity')
                    .eq('project_id', transfer.to_project_id)
                    .eq('material_id', transfer.material_id)
                    .gt('quantity', 0)
                    .order('usage_date', { ascending: true })

                if (destErr) throw destErr;

                let remainingToRevert = transfer.quantity;
                for (const item of destItems || []) {
                    if (remainingToRevert <= 0) break;

                    const deductAmount = Math.min(Number(item.quantity), remainingToRevert);
                    const newQuantity = Number(item.quantity) - deductAmount;
                    remainingToRevert -= deductAmount;

                    const { error: updateErr } = await supabase
                        .from('material_usage')
                        .update({ quantity: newQuantity })
                        .eq('id', item.id);

                    if (updateErr) throw updateErr;

                    // Log deduction
                    await supabase.from('inventory_transactions').insert({
                        project_id: transfer.to_project_id,
                        material_id: transfer.material_id,
                        quantity: -deductAmount,
                        transaction_type: 'transfer_revert_out',
                        reference_id: item.id,
                        notes: `Stock removed from Transfer ${transfer.request_number} deletion`
                    });
                }
            }

            await fetchTransfers();
            return { success: true, error: null };

        } catch (error: any) {
            console.error("Error deleting transfer:", error)
            return { success: false, error: error.message || "Failed to delete transfer" }
        }
    }

    useEffect(() => {
        fetchTransfers()
    }, [])

    return { transfers, loading, createTransferRequest, approveTransfer, deleteTransfer, refresh: fetchTransfers }
}
