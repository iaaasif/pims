import { useState, useEffect } from 'react'
import { 
    Wallet, 
    ArrowLeft, 
    Search, 
    Download, 
    Plus, 
    Receipt, 
    Coffee, 
    Car, 
    Wrench,
    TrendingUp,
    AlertCircle,
    ChevronRight,
    MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useSettings } from '@/context/SettingsContext'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

import { useFinance } from '@/hooks/useFinance'

import { useAuth } from '@/context/AuthContext'

export default function PettyCash() {
    const navigate = useNavigate()
    const { profile } = useAuth()
    const { currencySymbol } = useSettings()
    const { fetchPettyCashLedgers } = useFinance()
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [siteLedgers, setSiteLedgers] = useState<any[]>([])
    const [recentExpenses, setRecentExpenses] = useState<any[]>([])
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    useEffect(() => {
        let isMounted = true
        fetchPettyCashLedgers().then(data => {
            if (isMounted) {
                setSiteLedgers(data)
                setRecentExpenses([])
                setLoading(false)
            }
        })
        return () => {
            isMounted = false
        }
    }, [fetchPettyCashLedgers, refreshTrigger])

    const formatCurrency = (amount: number) => {
        return `${currencySymbol}${amount.toLocaleString()}`
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <LoadingSpinner text="Auditing site expenditures..." />
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
                            <Wallet className="h-3 w-3" />
                            <span>{profile?.role?.replace('_', ' ') || 'Finance Executive'}</span>
                            <span className="text-primary">/ Petty Cash</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Site Petty Cash Management</h1>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-2 max-w-xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by site, supervisor or voucher ID..." 
                                className="pl-10 h-11 bg-card/40 border-border/50 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-11 rounded-xl border-border/50 font-bold gap-2" onClick={() => { setLoading(true); setRefreshTrigger(prev => prev + 1); }}>
                            <Download className="h-4 w-4" />
                            Refresh
                        </Button>
                        <Button className="h-11 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 gap-2 px-6" onClick={() => toast.info("Allocation form coming soon!")}>
                            <Plus className="h-4 w-4" />
                            Allocate Fund
                        </Button>
                    </div>
                </div>
            </div>

            {/* Site Allocation Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border bg-card/40 backdrop-blur-sm shadow-xl">
                    <CardHeader className="border-b border-border/50 bg-muted/20">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Active Site Ledgers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                             {siteLedgers.map((ledger, i) => (
                                <div key={i} className="p-4 hover:bg-muted/30 transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{ledger.projects?.name || 'Site Office'}</h4>
                                            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Sup: {ledger.supervisor_name}</p>
                                        </div>
                                        <Badge className={cn(
                                            "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border",
                                            ledger.status === 'Healthy' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                        )}>
                                            {ledger.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className="text-muted-foreground uppercase">Utilization</span>
                                            <span className="text-foreground">{((ledger.spent / ledger.allocation) * 100).toFixed(0)}%</span>
                                        </div>
                                        <Progress value={(ledger.spent / ledger.allocation) * 100} className={cn(
                                            "h-1.5",
                                            ledger.status === 'Healthy' ? "bg-emerald-500" : "bg-rose-500"
                                        )} />
                                        <div className="flex justify-between text-[10px] font-bold mt-2">
                                            <span className="text-muted-foreground">Allocation: {formatCurrency(ledger.allocation)}</span>
                                            <span className="text-foreground font-bold">Balance: {formatCurrency(ledger.allocation - ledger.spent)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-border bg-card/40 backdrop-blur-sm shadow-xl">
                        <CardHeader className="border-b border-border/50 bg-muted/20">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-primary" />
                                Recent Daily Expenses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {recentExpenses.map((exp, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-background border border-border">
                                                {exp.category === 'Entertainment' ? <Coffee className="h-4 w-4 text-orange-500" /> : 
                                                 exp.category === 'Conveyance' ? <Car className="h-4 w-4 text-blue-500" /> : 
                                                 <Wrench className="h-4 w-4 text-purple-500" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold">{exp.description}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{exp.site}</span>
                                                    <span className="h-1 w-1 rounded-full bg-border" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary">{exp.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-foreground">{formatCurrency(exp.amount)}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase">{exp.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-primary h-12 border-t border-border/50 rounded-none hover:bg-primary/5">
                                View Full Cash Book <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-sm">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monthly Site Avg</h4>
                                <p className="text-lg font-bold">{formatCurrency(125000)}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-orange-500/20 bg-orange-500/5 backdrop-blur-sm">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-500" />
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pending Refills</h4>
                                <p className="text-lg font-bold">2 Sites</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
