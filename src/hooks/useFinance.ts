import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function useFinance() {

    // Budgets
    const fetchBudgets = useCallback(async () => {
        const { data, error } = await supabase
            .from('financial_budgets')
            .select('*, projects(name)')
            .order('created_at', { ascending: false })
        if (error) {
            toast.error('Failed to fetch budgets')
            return []
        }
        return data || []
    }, [])

    const addBudget = useCallback(async (budget: any) => {
        const { data, error } = await supabase
            .from('financial_budgets')
            .insert(budget)
            .select()
        if (error) {
            toast.error('Failed to add budget')
            return null
        }
        toast.success('Budget added successfully')
        return data?.[0] || null
    }, [])

    // VAT & Tax
    const fetchTaxRecords = useCallback(async () => {
        const { data, error } = await supabase
            .from('vat_tax_records')
            .select('*, vendors(name)')
            .order('date', { ascending: false })
        if (error) {
            toast.error('Failed to fetch tax records')
            return []
        }
        return data || []
    }, [])

    const addTaxRecord = useCallback(async (record: any) => {
        const { data, error } = await supabase
            .from('vat_tax_records')
            .insert(record)
            .select()
        if (error) {
            toast.error('Failed to add tax record')
            return null
        }
        toast.success('Tax record added')
        return data?.[0] || null
    }, [])

    // Bills
    const fetchBills = useCallback(async () => {
        const { data, error } = await supabase
            .from('bills')
            .select('*, vendors(name), projects(name), purchase_orders(po_number)')
            .order('date', { ascending: false })
        if (error) {
            toast.error('Failed to fetch bills')
            return []
        }
        return data || []
    }, [])

    const updateBillStatus = useCallback(async (id: string, status: string, approvalStep?: string) => {
        const { error } = await supabase
            .from('bills')
            .update({ status, approval_step: approvalStep })
            .eq('id', id)
        if (error) {
            toast.error('Failed to update bill')
            return false
        }
        toast.success('Bill status updated')
        return true
    }, [])

    // Petty Cash
    const fetchPettyCashLedgers = useCallback(async () => {
        const { data, error } = await supabase
            .from('petty_cash_ledgers')
            .select('*, projects(name)')
            .order('created_at', { ascending: false })
        if (error) {
            toast.error('Failed to fetch petty cash ledgers')
            return []
        }
        return data || []
    }, [])

    // Bank & Cash
    const fetchBankAccounts = useCallback(async () => {
        const { data, error } = await supabase
            .from('bank_accounts')
            .select('*')
            .order('account_name')
        if (error) {
            toast.error('Failed to fetch bank accounts')
            return []
        }
        return data || []
    }, [])

    const fetchTransactions = useCallback(async (accountId?: string) => {
        let query = supabase
            .from('financial_transactions')
            .select('*, bank_accounts(account_name)')
            .order('date', { ascending: false })
        
        if (accountId) {
            query = query.eq('account_id', accountId)
        }

        const { data, error } = await query
        if (error) {
            toast.error('Failed to fetch transactions')
            return []
        }
        return data || []
    }, [])

    return {
        fetchBudgets,
        addBudget,
        fetchTaxRecords,
        addTaxRecord,
        fetchBills,
        updateBillStatus,
        fetchPettyCashLedgers,
        fetchBankAccounts,
        fetchTransactions
    }
}
