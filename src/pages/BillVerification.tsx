import { useState, useEffect } from 'react'
import { 
    FileCheck, 
    ArrowLeft, 
    Search, 
    FileText,
    Clock,
    Building2,
    CheckCircle2,
    AlertCircle,
    UserCheck,
    Calculator,
    Plus,
    ShieldCheck
} from 'lucide-react'
import { ThreeWayMatchingDialog } from '@/components/finance/ThreeWayMatchingDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function BillVerification() {
    const navigate = useNavigate()
    const { profile } = useAuth()
    const { currencySymbol } = useSettings()
    const { fetchBills, updateBillStatus } = useFinance()
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [bills, setBills] = useState<any[]>([])
    const [auditOpen, setAuditOpen] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    useEffect(() => {
        let isMounted = true
        fetchBills().then(data => {
            if (isMounted) {
                setBills(data)
                setLoading(false)
            }
        })
        return () => {
            isMounted = false
        }
    }, [fetchBills, refreshTrigger])

    const handleVerify = async (id: string) => {
        setLoading(true)
        await updateBillStatus(id, 'Verified', 'Manager')
        setRefreshTrigger(prev => prev + 1)
    }

    const formatCurrency = (amount: number) => {
        return `${currencySymbol}${amount.toLocaleString()}`
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <LoadingSpinner text="Reconciling invoices..." />
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
                            <FileCheck className="h-3 w-3" />
                            <span>{profile?.role?.replace('_', ' ') || 'Finance Executive'}</span>
                            <span className="text-primary">/ Bill Verification</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoice Reconciliation</h1>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-2 max-w-xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search bills, vendors or PO numbers..." 
                                className="pl-10 h-11 bg-card/40 border-border/50 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="h-11 rounded-xl border-primary/30 text-primary hover:bg-primary/10 font-bold gap-2 px-4 shadow-sm"
                            onClick={() => setAuditOpen(true)}
                        >
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            3-Way Match Audit
                        </Button>
                        <Button className="h-11 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 gap-2 px-6" onClick={() => toast.info("Manual submission form coming soon!")}>
                            <Plus className="h-4 w-4" />
                            Submit New Bill
                        </Button>
                    </div>
                    <ThreeWayMatchingDialog open={auditOpen} onOpenChange={setAuditOpen} />
                </div>
            </div>

            {/* Reconciliation Logic Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border bg-card/40 backdrop-blur-sm">
                    <CardHeader className="p-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Verification Pipeline</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="space-y-4">
                            {[
                                { label: 'GRN Matching', status: 'Passed', icon: CheckCircle2, color: 'text-emerald-500' },
                                { label: 'PO Rate Check', status: 'Failed', icon: AlertCircle, color: 'text-rose-500' },
                                { label: 'Tax/VAT Math', status: 'Passed', icon: CheckCircle2, color: 'text-emerald-500' }
                            ].map((step, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/50">
                                    <div className="flex items-center gap-2 text-xs font-semibold">
                                        <step.icon className={cn("h-4 w-4", step.color)} />
                                        {step.label}
                                    </div>
                                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest">{step.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-border bg-card/40 backdrop-blur-sm">
                    <CardHeader className="p-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bill Approval Workflow (Bangladesh Real Estate Standard)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <div className="flex items-center justify-between relative px-4">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 -z-10" />
                            {[
                                { label: 'Executive', icon: UserCheck, status: 'current' },
                                { label: 'Manager', icon: FileText, status: 'pending' },
                                { label: 'Accounts', icon: Calculator, status: 'pending' },
                                { label: 'Director', icon: CheckCircle2, status: 'pending' }
                            ].map((step, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center border-2 bg-background transition-all",
                                        step.status === 'current' ? "border-primary text-primary shadow-lg shadow-primary/20 scale-110" : "border-muted text-muted-foreground"
                                    )}>
                                        <step.icon className="h-5 w-5" />
                                    </div>
                                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", step.status === 'current' ? "text-primary" : "text-muted-foreground")}>{step.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bill List */}
            <Card className="border-border bg-card/40 backdrop-blur-sm overflow-hidden shadow-xl">
                <CardHeader className="border-b border-border/50 bg-muted/20 py-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Pending Bill Verification
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/50">
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Bill ID</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Vendor & PO</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Site</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10 text-right">Amount</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10 text-center">Verify Status</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10 text-center">Step</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills.map((bill) => (
                                <TableRow key={bill.id} className="border-border/50 hover:bg-muted/20 transition-colors group">
                                    <TableCell className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-xs">{bill.bill_number}</span>
                                            <span className="text-[9px] text-muted-foreground">{bill.date}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold">{bill.vendors?.name || 'Unknown Vendor'}</span>
                                            <span className="text-[10px] font-mono text-primary">{bill.purchase_orders?.po_number || 'No PO'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <Building2 className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs font-medium">{bill.projects?.name || 'Central'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-xs tabular-nums">{formatCurrency(bill.amount)}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={cn(
                                            "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border",
                                            bill.status === 'Verified' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                        )}>
                                            {bill.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{bill.approval_step}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-background text-foreground border border-border hover:bg-primary hover:text-primary-foreground shadow-sm" onClick={() => handleVerify(bill.id)}>
                                            Verify Now
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
