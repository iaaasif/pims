import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { LiveAlertToast } from '@/components/notifications/LiveAlertToast'

export function useRealTimeAlerts() {
    const navigate = useNavigate()

    useEffect(() => {
        // 1. Listen for new Purchase Requisitions
        const prChannel = supabase
            .channel('public:purchase_requisitions')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'purchase_requisitions',
                },
                (payload) => {
                    if (payload.new.status === 'submitted') {
                        toast.custom((t) => (
                            <LiveAlertToast
                                title="New Requisition Submitted"
                                description={`PR #${payload.new.pr_number} requires your attention.`}
                                variant="success"
                                onClose={() => toast.dismiss(t)}
                                actionLabel="Review Now"
                                onAction={() => navigate('/procurement/requisitions')}
                            />
                        ), { duration: 10000 })
                    }
                }
            )
            .subscribe()

        // 2. Listen for Low Stock Alerts
        const materialChannel = supabase
            .channel('public:materials')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'materials',
                },
                (payload) => {
                    const { name, current_stock, min_stock_level, unit } = payload.new
                    const oldStock = payload.old.current_stock

                    if (Number(current_stock) <= Number(min_stock_level) && Number(current_stock) < Number(oldStock)) {
                        toast.custom((t) => (
                            <LiveAlertToast
                                title="Holy guacamole! Low Stock"
                                description={`${name} is running dangerously low (${current_stock} ${unit} left).`}
                                variant="warning"
                                onClose={() => toast.dismiss(t)}
                                actionLabel="Restock Inventory"
                                onAction={() => navigate('/inventory')}
                            />
                        ), { duration: 15000 })
                    }
                }
            )
            .subscribe()

        // 3. Listen for completed transfers
        const transferChannel = supabase
            .channel('public:transfers')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'transfers',
                },
                (payload) => {
                    if (payload.new.status === 'completed') {
                        toast.custom((t) => (
                            <LiveAlertToast
                                title="Transfer Finalized"
                                description={`Material transfer #${payload.new.transfer_number} has been completed.`}
                                variant="info"
                                onClose={() => toast.dismiss(t)}
                            />
                        ), { duration: 6000 })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(prChannel)
            supabase.removeChannel(materialChannel)
            supabase.removeChannel(transferChannel)
        }
    }, [])
}
