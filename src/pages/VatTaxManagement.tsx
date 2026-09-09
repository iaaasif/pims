import { useState, useEffect } from 'react'
import { 
    ShieldCheck, 
    ArrowLeft, 
    Search, 
    Download, 
    Plus, 
    FileText, 
    Calculator,
    AlertTriangle,
    Printer
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

export default function VatTaxManagement() {
    const navigate = useNavigate()
    const { profile } = useAuth()
    const { currencySymbol } = useSettings()
    const { fetchTaxRecords, addTaxRecord } = useFinance()
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [taxRecords, setTaxRecords] = useState<any[]>([])
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    useEffect(() => {
        let isMounted = true
        fetchTaxRecords().then(data => {
            if (isMounted) {
                setTaxRecords(data)
                setLoading(false)
            }
        })
        return () => {
            isMounted = false
        }
    }, [fetchTaxRecords, refreshTrigger])

    const handleAction = (action: string) => {
        toast.info(`${action} feature coming soon`, {
            description: "This functionality is currently under development for the compliance module."
        })
    }

    const handleAddRecord = async () => {
        // For demonstration, adding a random record to the DB
        const newRecord = {
            bill_id: `TX-${Math.floor(100 + Math.random() * 900)}`,
            bill_amount: 500000 + Math.random() * 1000000,
            vat_amount: 37500,
            ait_amount: 15000,
            mushak_number: '6.3-GEN',
            status: 'Pending',
            date: new Date().toISOString().split('T')[0]
        }
        await addTaxRecord(newRecord)
        setRefreshTrigger(prev => prev + 1)
    }

    const formatCurrency = (amount: number) => {
        return `${currencySymbol}${amount.toLocaleString()}`
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
                <LoadingSpinner text="Synchronizing tax compliance data..." />
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
                            <ShieldCheck className="h-3 w-3" />
                            <span>{profile?.role?.replace('_', ' ') || 'Finance Executive'}</span>
                            <span className="text-primary">/ VAT & Tax (AIT)</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tax Compliance Hub</h1>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-2 max-w-xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by vendor, bill ID or Mushak number..." 
                                className="pl-10 h-11 bg-card/40 border-border/50 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-11 rounded-xl border-border/50 font-bold gap-2" onClick={() => { setLoading(true); setRefreshTrigger(prev => prev + 1); }}>
                            <Printer className="h-4 w-4" />
                            Refresh Records
                        </Button>
                        <Button className="h-11 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 gap-2 px-6" onClick={handleAddRecord}>
                            <Plus className="h-4 w-4" />
                            Add Tax Record
                        </Button>
                    </div>
                </div>
            </div>

            {/* BD Context Insights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border bg-card/40 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total VAT Payable</p>
                            <h3 className="text-xl font-bold text-blue-500">{formatCurrency(1245000)}</h3>
                            <div className="flex items-center gap-1 mt-1">
                                <Calculator className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[9px] font-bold text-muted-foreground">Standard 7.5% - 15% rate</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total AIT Deducted</p>
                            <h3 className="text-xl font-bold text-orange-500">{formatCurrency(485000)}</h3>
                            <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">Ready for Treasury Challan</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-sm">
                    <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mushak 6.3 Compliance</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">94%</span>
                            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '94%' }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-rose-500/20 bg-rose-500/5 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Urgent Task</p>
                                <p className="text-[11px] font-semibold text-foreground mt-0.5">12 Challans pending submission for May 2024</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tax Ledger */}
            <Card className="border-border bg-card/40 backdrop-blur-sm overflow-hidden shadow-xl">
                <CardHeader className="border-b border-border/50 bg-muted/20 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-background border border-border">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold">VAT & AIT Ledger</CardTitle>
                                <CardDescription className="text-[10px]">Tracking deductions as per Bangladesh Income Tax Act</CardDescription>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest gap-2" onClick={() => handleAction('Export Ledger')}>
                            <Download className="h-3.5 w-3.5" />
                            Download Challan Data
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/50">
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Bill Details</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10">Vendor</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10 text-right">Bill Amt</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10 text-right">VAT (BD)</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10 text-right">AIT</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10 text-right font-bold">Net Payable</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10 text-center">Mushak #</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest h-10 text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taxRecords.map((rec) => (
                                <TableRow key={rec.id} className="border-border/50 hover:bg-muted/20 transition-colors group">
                                    <TableCell className="py-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-xs text-foreground">{rec.bill_id}</span>
                                            <span className="text-[9px] text-muted-foreground">{rec.date}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                {(rec.vendors?.name || 'U')[0]}
                                            </div>
                                            <span className="text-xs font-semibold">{rec.vendors?.name || 'Standard Supplier'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-xs tabular-nums">{formatCurrency(rec.bill_amount)}</TableCell>
                                    <TableCell className="text-right font-bold text-xs text-blue-500 tabular-nums">+{formatCurrency(rec.vat_amount)}</TableCell>
                                    <TableCell className="text-right font-bold text-xs text-rose-500 tabular-nums">-{formatCurrency(rec.ait_amount)}</TableCell>
                                    <TableCell className="text-right font-bold text-xs text-foreground tabular-nums">{formatCurrency(rec.bill_amount + rec.vat_amount - rec.ait_amount)}</TableCell>
                                    <TableCell className="text-center">
                                        <span className={cn(
                                            "text-[10px] font-mono px-2 py-0.5 rounded-full border",
                                            rec.mushak_number === 'Pending' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-muted text-muted-foreground border-border"
                                        )}>
                                            {rec.mushak_number}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={cn(
                                            "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border",
                                            rec.status === 'Submitted' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                                            rec.status === 'Critical' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                        )}>
                                            {rec.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Form Links for BD Executive */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Mushak 6.3 Generator', desc: 'Generate standard VAT invoice for projects', icon: FileText },
                    { title: 'Challan 12 Form', desc: 'Pre-filled treasury challan for AIT/VAT deposit', icon: Calculator },
                    { title: 'Tax Certificate', desc: 'Download vendor-wise annual tax deduction report', icon: ShieldCheck }
                ].map((item, i) => (
                    <Card key={i} className="border-border bg-card/20 hover:bg-muted/30 transition-all cursor-pointer group" onClick={() => handleAction(item.title)}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-background border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold">{item.title}</h4>
                                <p className="text-[10px] text-muted-foreground font-medium">{item.desc}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
