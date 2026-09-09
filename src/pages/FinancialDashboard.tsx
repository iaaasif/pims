import { useState, useEffect } from 'react'
import { 
    DollarSign, 
    TrendingUp, 
    PieChart, 
    Wallet, 
    ArrowUpRight, 
    ArrowDownRight,
    Briefcase,
    Calendar,
    Filter
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useSettings } from '@/context/SettingsContext'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function FinancialDashboard() {
    const navigate = useNavigate()
    const { profile } = useAuth()
    const { currencySymbol } = useSettings()
    const [loading, setLoading] = useState(true)

    const handleAction = (action: string) => {
        toast.info(`${action} feature is coming soon!`, {
            description: "We are currently aggregating real-time data from all project sites."
        })
    }
    const [stats, setStats] = useState({
        totalBudget: 0,
        totalSpent: 0,
        pendingPayments: 0,
        activeProjects: 0
    })
    const [recentTransactions, setRecentTransactions] = useState<any[]>([])
    const [projectBudgets, setProjectBudgets] = useState<any[]>([])

    useEffect(() => {
        fetchFinancialStats()
    }, [])

    const fetchFinancialStats = async () => {
        try {
            setLoading(true)
            const { data: budgets } = await supabase.from('financial_budgets').select('total_amount, spent_amount, projects(name)')
            const { data: projects } = await supabase.from('projects').select('id')
            const { data: pos } = await supabase.from('purchase_orders').select('total_amount, status')
            const { data: transactions } = await supabase.from('financial_transactions').select('*, bank_accounts(account_name)').limit(5).order('date', { ascending: false })

            const totalBudget = budgets?.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0) || 0
            const totalSpent = budgets?.reduce((sum, b) => sum + (Number(b.spent_amount) || 0), 0) || 0
            const pendingPayments = pos?.filter(po => po.status === 'pending').reduce((sum, po) => sum + (Number(po.total_amount) || 0), 0) || 0
            
            setStats({
                totalBudget,
                totalSpent,
                pendingPayments,
                activeProjects: projects?.length || 0
            })
            setProjectBudgets(budgets || [])
            setRecentTransactions(transactions || [])
        } catch (error) {
            console.error('Error fetching financial stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <LoadingSpinner text="Analyzing financial landscape..." />
            </div>
        )
    }

    const budgetUtilization = (stats.totalSpent / stats.totalBudget) * 100

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <DollarSign className="h-3 w-3" />
                    <span>{profile?.role?.replace('_', ' ') || 'Financials'}</span>
                    <span className="text-primary">/ Dashboard</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial Overview</h1>
                        <p className="text-muted-foreground text-sm">Real-time financial performance and budget health across all project sites.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 h-10 font-semibold border-border/50" onClick={() => handleAction('Timeline Filter')}>
                            <Calendar className="h-4 w-4" />
                            This Quarter
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6 shadow-lg shadow-primary/20 rounded-xl gap-2" onClick={() => handleAction('Advanced Filters')}>
                            <Filter className="h-4 w-4" />
                            Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Budget', value: formatCurrency(stats.totalBudget), icon: Wallet, color: 'text-blue-500', trend: '+12%', isPositive: true },
                    { label: 'Total Expenditure', value: formatCurrency(stats.totalSpent), icon: TrendingUp, color: 'text-orange-500', trend: '+8%', isPositive: false },
                    { label: 'Pending Payments', value: formatCurrency(stats.pendingPayments), icon: DollarSign, color: 'text-purple-500', trend: '-5%', isPositive: true },
                    { label: 'Active Projects', value: stats.activeProjects.toString(), icon: Briefcase, color: 'text-emerald-500', trend: 'Steady', isPositive: true },
                ].map((stat, i) => (
                    <Card key={i} className="border-border bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden group hover:border-primary/20 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2.5 rounded-xl bg-background border border-border group-hover:scale-110 transition-transform shadow-sm", stat.color)}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                    stat.isPositive ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10" : "text-rose-500 border-rose-500/20 bg-rose-500/10"
                                )}>
                                    {stat.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Budget Utilization */}
                <Card className="lg:col-span-2 border-border bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Budget Utilization</CardTitle>
                                <CardDescription>Expenditure relative to total project budgets</CardDescription>
                            </div>
                            <PieChart className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-muted-foreground">Overall Allocation</span>
                                <span className="font-bold">{budgetUtilization.toFixed(1)}%</span>
                            </div>
                            <Progress value={budgetUtilization} className="h-3 bg-muted" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projectBudgets.length > 0 ? projectBudgets.map((proj, i) => (
                                <div key={i} className="p-4 rounded-xl border border-border/50 bg-background/50 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-sm">{proj.projects?.name || 'Central'}</span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                            {((proj.spent_amount / proj.total_amount) * 100 || 0).toFixed(0)}%
                                        </span>
                                    </div>
                                    <Progress value={(proj.spent_amount / proj.total_amount) * 100 || 0} className="h-1.5 bg-primary" />
                                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <span>Spent: {formatCurrency(proj.spent_amount)}</span>
                                        <span>Rem: {formatCurrency(proj.total_amount - proj.spent_amount)}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 py-10 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">
                                    No budget data found
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="border-border bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Recent Cash Outflow</CardTitle>
                        <CardDescription>Latest approved purchase orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentTransactions.length > 0 ? recentTransactions.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => handleAction(`Transaction: ${item.description}`)}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {item.type[0]}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold truncate max-w-[120px]">{item.description}</p>
                                            <p className="text-[10px] text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("text-xs font-bold", item.type === 'Debit' ? 'text-rose-500' : 'text-emerald-500')}>
                                            {item.type === 'Debit' ? '-' : '+'}{formatCurrency(item.amount)}
                                        </p>
                                        <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{item.bank_accounts?.account_name}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">
                                    No recent transactions
                                </div>
                            )}
                            <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5" onClick={() => navigate('/financial/bank-cash')}>
                                View All Transactions
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
