import { useState, useEffect } from 'react'
import { 
    Calculator, 
    ArrowLeft, 
    Search, 
    Download, 
    Plus, 
    FileText,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Building2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettings } from '@/context/SettingsContext'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

import { useFinance } from '@/hooks/useFinance'

export default function BudgetTracking() {
    const navigate = useNavigate()
    const { currencySymbol } = useSettings()
    const { fetchBudgets, addBudget } = useFinance()
    const [searchTerm, setSearchTerm] = useState('')
    const [projectFilter, setProjectFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [budgets, setBudgets] = useState<any[]>([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const data = await fetchBudgets()
        setBudgets(data)
        setLoading(false)
    }

    const handleAddBudget = async () => {
        // Mock add for now
        const newBudget = {
            category: 'Construction Materials',
            total_amount: 10000000,
            spent_amount: 0,
            fiscal_year: '2024-25',
            project_id: null // To be selected in a real dialog
        }
        await addBudget(newBudget)
        loadData()
    }

    const formatCurrency = (amount: number) => {
        return `${currencySymbol}${amount.toLocaleString()}`
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <LoadingSpinner text="Aggregating project budgets..." />
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'On Track': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            case 'Over Budget': return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            case 'Critical': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        }
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
                            <Calculator className="h-3 w-3" />
                            <span>Financials</span>
                            <span className="text-primary">/ Budget Tracking</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Project Budgeting</h1>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-2 max-w-xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by project name or ID..." 
                                className="pl-10 h-11 bg-card/40 border-border/50 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                            <SelectTrigger className="w-[180px] h-11 bg-card/40 border-border/50 rounded-xl">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="on-track">On Track</SelectItem>
                                <SelectItem value="over">Over Budget</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-11 rounded-xl border-border/50 font-bold gap-2" onClick={() => loadData()}>
                            <Download className="h-4 w-4" />
                            Refresh
                        </Button>
                        <Button className="h-11 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 gap-2 px-6" onClick={handleAddBudget}>
                            <Plus className="h-4 w-4" />
                            New Budget
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border bg-card/40 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            Budget Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <h2 className="text-2xl font-bold">82%</h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">of total portfolio</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">3 projects are under 70% utilization</p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-rose-500" />
                            Over-Budget Risk
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <h2 className="text-2xl font-bold">12.4%</h2>
                            <p className="text-[10px] font-bold text-rose-500 uppercase">Warning</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Skyline Heights exceeds budget by 3.2M</p>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-500" />
                            Total Commitment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <h2 className="text-2xl font-bold">{formatCurrency(23400000)}</h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Approved POs</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Aggregated across all active sites</p>
                    </CardContent>
                </Card>
            </div>

            {/* Budget Table */}
            <Card className="border-border bg-card/40 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-12">Project Details</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-12 text-right">Total Budget</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-12 text-right">Actual Spent</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-12 text-right">Committed</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-12 text-center">Variance</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-12 text-center">Status</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-12 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {budgets.map((budget) => {
                                const variance = budget.total_amount - budget.spent_amount
                                const variancePercent = (variance / budget.total_amount) * 100
                                const isNegative = variance < 0
                                const status = variancePercent < 10 ? 'Critical' : variancePercent < 30 ? 'Over Budget' : 'On Track'

                                return (
                                    <TableRow key={budget.id} className="border-border/50 hover:bg-muted/30 transition-colors group">
                                        <TableCell className="py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{budget.category}</span>
                                                <span className="text-[10px] font-mono text-muted-foreground">{budget.projects?.name || 'Central Budget'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-sm tabular-nums">{formatCurrency(budget.total_amount)}</TableCell>
                                        <TableCell className="text-right font-bold text-sm tabular-nums text-muted-foreground">{formatCurrency(budget.spent_amount)}</TableCell>
                                        <TableCell className="text-right font-bold text-sm tabular-nums text-blue-500">{formatCurrency(0)}</TableCell>
                                        <TableCell className="text-center">
                                            <div className={cn(
                                                "inline-flex items-center gap-1 font-bold text-[10px] tabular-nums",
                                                isNegative ? "text-rose-500" : "text-emerald-500"
                                            )}>
                                                {isNegative ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                                                {Math.abs(variancePercent || 0).toFixed(1)}%
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={cn("text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border", getStatusColor(status))}>
                                                {status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary">
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
