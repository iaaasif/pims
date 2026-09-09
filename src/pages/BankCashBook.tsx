import { useState, useEffect } from 'react'
import { 
    Library, 
    ArrowLeft, 
    Search, 
    Plus, 
    Building2, 
    CreditCard, 
    Coins, 
    ArrowUpRight, 
    ArrowDownRight,
    History,
    Filter,
    Banknote,
    ArrowRight,
    TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useSettings } from '@/context/SettingsContext'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

import { useFinance } from '@/hooks/useFinance'

import { useAuth } from '@/context/AuthContext'

export default function BankCashBook() {
    const navigate = useNavigate()
    const { profile } = useAuth()
    const { currencySymbol } = useSettings()
    const { fetchBankAccounts, fetchTransactions } = useFinance()
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [accounts, setAccounts] = useState<any[]>([])
    const [transactions, setTransactions] = useState<any[]>([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [accs, trxs] = await Promise.all([
            fetchBankAccounts(),
            fetchTransactions()
        ])
        setAccounts(accs)
        setTransactions(trxs)
        setLoading(false)
    }

    const formatCurrency = (amount: number) => {
        return `${currencySymbol}${amount.toLocaleString()}`
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <LoadingSpinner text="Syncing bank statements..." />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-background shadow-sm border border-border/50">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                            <Library className="h-3 w-3" />
                            <span>{profile?.role?.replace('_', ' ') || 'Finance Executive'}</span>
                            <span className="text-primary">/ Bank & Cash Book</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Accounts & Cash Flow</h1>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-2 max-w-xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search accounts or transactions..." 
                                className="pl-10 h-11 bg-card/40 border-border/50 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-11 rounded-xl border-border/50 font-bold gap-2 px-6" onClick={() => loadData()}>
                            <History className="h-4 w-4" />
                            Refresh
                        </Button>
                        <Button className="h-11 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 gap-2 px-6" onClick={() => toast.info("Transfer form coming soon!")}>
                            <ArrowUpRight className="h-4 w-4" />
                            Fund Transfer
                        </Button>
                    </div>
                </div>
            </div>

            {/* Account Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {accounts.map((acc, i) => (
                    <Card key={i} className="border-border bg-card/40 backdrop-blur-sm shadow-sm hover:border-primary/20 transition-all group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 rounded-xl bg-background border border-border shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    {acc.type === 'Cash' ? <Coins className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                                </div>
                                <Badge variant="secondary" className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">{acc.type}</Badge>
                            </div>
                            <h4 className="text-sm font-bold text-foreground truncate">{acc.account_name}</h4>
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">{acc.bank_name}</p>
                            <div className="mt-4 pt-4 border-t border-border/50">
                                <p className="text-lg font-bold tracking-tight">{formatCurrency(acc.balance)}</p>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Available Balance</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                <Button variant="outline" className="h-auto min-h-[160px] border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center gap-3 group hover:bg-muted/10 transition-all rounded-xl">
                    <div className="p-3 rounded-full bg-background border border-border group-hover:border-primary/50 group-hover:text-primary transition-all">
                        <Plus className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Add New Account</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transaction Ledger */}
                <Card className="lg:col-span-2 border-border bg-card/40 backdrop-blur-sm shadow-xl">
                    <CardHeader className="border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold">Transaction History</CardTitle>
                            <CardDescription className="text-[10px]">Real-time cash flow across all accounts</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg border border-border bg-background">
                                <Filter className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-border/50">
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Date & Desc</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Account</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10 text-right">Amount</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10 text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((trx) => (
                                    <TableRow key={trx.id} className="border-border/50 hover:bg-muted/20 transition-colors group">
                                        <TableCell className="py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground">{trx.description}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] font-mono text-muted-foreground">{trx.id.split('-')[0]}</span>
                                                    <span className="h-0.5 w-0.5 rounded-full bg-border" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{new Date(trx.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">{trx.bank_accounts?.account_name || 'General'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className={cn(
                                                "flex items-center justify-end gap-1.5 font-bold text-xs tabular-nums",
                                                trx.type === 'Debit' ? "text-rose-500" : "text-emerald-500"
                                            )}>
                                                {trx.type === 'Debit' ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                                                {formatCurrency(trx.amount)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">
                                                Completed
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-primary h-12 border-t border-border/50 rounded-none hover:bg-primary/5 transition-all">
                            View Comprehensive Statement <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Quick Actions & Quick Stats */}
                <div className="space-y-6">
                    <Card className="border-border bg-card/40 backdrop-blur-sm shadow-xl">
                        <CardHeader className="border-b border-border/50 bg-muted/20 py-4">
                            <CardTitle className="text-sm font-bold">Quick Financial Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {[
                                { label: 'Internal Fund Transfer', icon: ArrowUpRight, desc: 'Move funds between accounts' },
                                { label: 'Bank Reconciliation', icon: History, desc: 'Sync with monthly statement' },
                                { label: 'Project Fund Request', icon: Banknote, desc: 'Top-up site accounts' },
                            ].map((action, i) => (
                                <button key={i} className="w-full flex items-center gap-4 p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all group text-left">
                                    <div className="p-2 rounded-lg bg-muted border border-border group-hover:bg-white/10 group-hover:text-white group-hover:border-white/20 transition-all">
                                        <action.icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">{action.label}</p>
                                        <p className="text-[9px] opacity-70 font-medium">{action.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-primary/5 backdrop-blur-sm shadow-xl overflow-hidden relative">
                        <div className="absolute -right-8 -bottom-8 opacity-10">
                            <Building2 className="h-32 w-32" />
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <div className="p-3 rounded-2xl bg-primary text-primary-foreground w-fit shadow-lg shadow-primary/20">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold">Net Position</h3>
                                <p className="text-xs text-muted-foreground font-medium">Consolidated liquidity across all Bangladeshi banks</p>
                            </div>
                            <h2 className="text-3xl font-extrabold tracking-tighter">{formatCurrency(66550000)}</h2>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
                                <ArrowUpRight className="h-3 w-3" />
                                14.5% Growth from last month
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
