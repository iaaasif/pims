import { useState, useEffect } from 'react'
import { 
    BarChart3, 
    ArrowLeft, 
    Search, 
    Download, 
    Calendar, 
    TrendingUp, 
    Package, 
    Users, 
    ArrowRight,
    PieChart,
    ChevronDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useSettings } from '@/context/SettingsContext'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuth } from '@/context/AuthContext'

export default function ExpenseAnalysis() {
    const navigate = useNavigate()
    const { profile } = useAuth()
    const { currencySymbol } = useSettings()
    const [viewMode, setViewMode] = useState<'category' | 'vendor' | 'project'>('category')
    const [loading, setLoading] = useState(true)

    const handleAction = (action: string) => {
        toast.info(`${action} feature is coming soon!`, {
            description: "Advanced analytics and report generation is being prepared."
        })
    }

    const [expensesByCategory, setExpensesByCategory] = useState<any[]>([])
    const [totalExpense, setTotalExpense] = useState(0)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const { data: trxs } = await supabase.from('financial_transactions').select('amount, category')
            
            if (trxs) {
                const total = trxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
                setTotalExpense(total)

                const categories: Record<string, number> = {}
                trxs.forEach(t => {
                    const cat = t.category || 'Miscellaneous'
                    categories[cat] = (categories[cat] || 0) + (Number(t.amount) || 0)
                })

                const processed = Object.entries(categories).map(([name, amount], i) => ({
                    name,
                    amount,
                    percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
                    color: i % 2 === 0 ? 'bg-primary' : 'bg-orange-500', // Simple color toggle
                    icon: Package
                }))
                setExpensesByCategory(processed)
            }
        } catch (error) {
            console.error('Error loading expense data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return `${currencySymbol}${amount.toLocaleString()}`
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <LoadingSpinner text="Analyzing expenditure patterns..." />
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
                            <BarChart3 className="h-3 w-3" />
                            <span>{profile?.role?.replace('_', ' ') || 'Financials'}</span>
                            <span className="text-primary">/ Expense Analysis</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Spending Analytics</h1>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border border-border/50">
                        <Button 
                            variant={viewMode === 'category' ? 'default' : 'ghost'} 
                            size="sm" 
                            onClick={() => setViewMode('category')}
                            className={cn("h-9 rounded-lg px-4 text-xs font-bold uppercase tracking-widest transition-all", viewMode === 'category' && "shadow-lg shadow-primary/20")}
                        >
                            By Category
                        </Button>
                        <Button 
                            variant={viewMode === 'vendor' ? 'default' : 'ghost'} 
                            size="sm" 
                            onClick={() => setViewMode('vendor')}
                            className={cn("h-9 rounded-lg px-4 text-xs font-bold uppercase tracking-widest transition-all", viewMode === 'vendor' && "shadow-lg shadow-primary/20")}
                        >
                            By Vendor
                        </Button>
                        <Button 
                            variant={viewMode === 'project' ? 'default' : 'ghost'} 
                            size="sm" 
                            onClick={() => setViewMode('project')}
                            className={cn("h-9 rounded-lg px-4 text-xs font-bold uppercase tracking-widest transition-all", viewMode === 'project' && "shadow-lg shadow-primary/20")}
                        >
                            By Project
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-11 rounded-xl border-border/50 font-bold gap-2 px-6">
                                    <Calendar className="h-4 w-4" />
                                    Last 6 Months
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/50 bg-popover/90 backdrop-blur-md">
                                <DropdownMenuItem className="font-semibold text-xs py-2.5">Current Month</DropdownMenuItem>
                                <DropdownMenuItem className="font-semibold text-xs py-2.5">Last Quarter</DropdownMenuItem>
                                <DropdownMenuItem className="font-semibold text-xs py-2.5">Year to Date</DropdownMenuItem>
                                <DropdownMenuItem className="font-semibold text-xs py-2.5">Lifetime</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button className="h-11 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 gap-2 px-6 hover:scale-[1.02] transition-all" onClick={() => loadData()}>
                            <Download className="h-4 w-4" />
                            Refresh Analysis
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Analysis */}
                <div className="space-y-6">
                    <Card className="border-border bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/20">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <PieChart className="h-5 w-5 text-primary" />
                                    Allocation Distribution
                                </CardTitle>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aggregate Total</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="flex items-center justify-center h-64 relative">
                                {/* Simulated Donut Chart */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-48 w-48 rounded-full border-[12px] border-primary/40 border-r-orange-500 border-b-primary border-l-orange-200 opacity-80 animate-spin-slow" />
                                </div>
                                <div className="text-center z-10 bg-background/40 backdrop-blur-md p-6 rounded-full border border-border/50 shadow-xl">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Grand Total</p>
                                    <h2 className="text-3xl font-extrabold tracking-tighter">{formatCurrency(totalExpense)}</h2>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-12">
                                {expensesByCategory.map((cat, i) => (
                                    <div key={i} className="flex flex-col gap-1.5 group cursor-default">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("h-3 w-3 rounded-full shadow-sm group-hover:scale-125 transition-transform", cat.color)} />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{cat.name}</span>
                                        </div>
                                        <p className="text-sm font-bold pl-5">{cat.percentage}%</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card/40 backdrop-blur-sm overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Financial Insights</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {expensesByCategory.length > 0 ? `The largest expenditure category is ${expensesByCategory[0].name} contributing ${expensesByCategory[0].percentage}% of total spending.` : 'No significant spending trends detected yet.'}
                                    </p>
                                    <Button variant="link" className="p-0 h-auto text-orange-500 font-bold text-xs mt-3 group" onClick={() => navigate('/financial/budgets')}>
                                        View Budget Tracking <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed List */}
                <Card className="border-border bg-card/40 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Category Breakdown</CardTitle>
                                <CardDescription>Consolidated spending by material category</CardDescription>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input placeholder="Find category..." className="h-9 w-40 pl-9 bg-muted/30 border-border/50 text-xs rounded-lg" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                            {expensesByCategory.map((cat, i) => (
                                <div key={i} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-all group cursor-pointer" onClick={() => handleAction(`${cat.name} Details`)}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-2.5 rounded-xl border border-border shadow-sm group-hover:scale-110 transition-all", cat.color.replace('bg-', 'text-').replace('-500', '-500/10'), cat.color.replace('bg-', 'bg-').replace('-500', '-500/10'))}>
                                            <cat.icon className={cn("h-5 w-5", cat.color.replace('bg-', 'text-'))} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold">{cat.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden">
                                                    <div className={cn("h-full rounded-full transition-all duration-1000", cat.color)} style={{ width: `${cat.percentage}%` }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground">{cat.percentage}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold tabular-nums">{formatCurrency(cat.amount)}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Invested</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-muted/10">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Highest Single Expense</h4>
                                <Badge variant="secondary" className="text-[8px] font-bold px-2 py-0.5">Alert</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">Latest Transaction</p>
                                        <p className="text-[10px] text-muted-foreground">General Ledger</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold tabular-nums">{formatCurrency(expensesByCategory[0]?.amount || 0)}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Volume</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
