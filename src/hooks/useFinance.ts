import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function useFinance() {

    // Budgets
    const fetchBudgets = async () => {
        const { data, error } = await supabase
            .from('financial_budgets')
            .select('*, projects(name)')
            .order('created_at', { ascending: false })
        if (error) {
            toast.error('Failed to fetch budgets')
            return []
        }
        return data
    }

    const addBudget = async (budget: any) => {
        const { data, error } = await supabase
            .from('financial_budgets')
            .insert(budget)
            .select()
        if (error) {
            toast.error('Failed to add budget')
            return null
        }
        toast.success('Budget added successfully')
        return data[0]
    }

    // VAT & Tax
    const fetchTaxRecords = async () => {
        const { data, error } = await supabase
            .from('vat_tax_records')
            .select('*, vendors(name)')
            .order('date', { ascending: false })
        if (error) {
            toast.error('Failed to fetch tax records')
            return []
        }
        return data
    }

    const addTaxRecord = async (record: any) => {
        const { data, error } = await supabase
            .from('vat_tax_records')
            .insert(record)
            .select()
        if (error) {
            toast.error('Failed to add tax record')
            return null
        }
        toast.success('Tax record added')
        return data[0]
    }

    // Bills
    const fetchBills = async () => {
        const { data, error } = await supabase
            .from('bills')
            .select('*, vendors(name), projects(name), purchase_orders(po_number)')
            .order('date', { ascending: false })
        if (error) {
            toast.error('Failed to fetch bills')
            return []
        }
        return data
    }

    const updateBillStatus = async (id: string, status: string, approvalStep?: string) => {
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
    }

    // Petty Cash
    const fetchPettyCashLedgers = async () => {
        const { data, error } = await supabase
            .from('petty_cash_ledgers')
            .select('*, projects(name)')
            .order('created_at', { ascending: false })
        if (error) {
            toast.error('Failed to fetch petty cash ledgers')
            return []
        }
        return data
    }

    // Bank & Cash
    const fetchBankAccounts = async () => {
        const { data, error } = await supabase
            .from('bank_accounts')
            .select('*')
            .order('account_name')
        if (error) {
            toast.error('Failed to fetch bank accounts')
            return []
        }
        return data
    }

    const fetchTransactions = async (accountId?: string) => {
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
        return data
    }

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
