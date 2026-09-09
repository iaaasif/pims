import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Building2, Phone, Printer, Download } from 'lucide-react'
import type { PurchaseOrder, CompanyInfo } from '@/hooks/usePurchaseOrders'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

import { toast } from 'sonner'
import { numberToWords } from '@/lib/numberToWords'

interface POPrintPreviewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    purchaseOrder: PurchaseOrder | null
    companyInfo?: CompanyInfo | null
}

export function POPrintPreview({ open, onOpenChange, purchaseOrder, companyInfo }: POPrintPreviewProps) {
    const [isPrinting, setIsPrinting] = useState(false)

    const handlePrint = () => {
        setIsPrinting(true)
        window.print()
        setTimeout(() => setIsPrinting(false), 1000)
    }

    if (!purchaseOrder) return null

    // Debug logs to check project data
    console.log('Purchase Order Project:', purchaseOrder.project)
    console.log('Project Location Address:', purchaseOrder.project?.location?.address)

    const formatTerms = (terms?: string) => {
        if (!terms) return []
        return terms.split('\n').filter(line => line.trim())
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[950px] max-h-[95vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="p-6 border-b bg-muted/30 print:hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl">Purchase Order Preview</DialogTitle>
                            <DialogDescription>
                                PO #{purchaseOrder.po_number} • {format(new Date(purchaseOrder.created_at), 'PPP')}
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => toast.info('PDF Export coming soon')} className="gap-2">
                                <Download className="h-4 w-4" />
                                Export PDF
                            </Button>
                            <Button onClick={handlePrint} disabled={isPrinting} size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                                <Printer className="h-4 w-4" />
                                {isPrinting ? 'Printing...' : 'Print PO'}
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Print Container */}
                <div className="bg-slate-50 p-8 min-h-screen print:p-0 print:bg-white flex justify-center">
                    <div className="bg-white shadow-2xl print:shadow-none"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            padding: '1.4in 0.8in 0.8in 0.8in',
                            boxSizing: 'border-box',
                            fontFamily: "'Inter', sans-serif"
                        }}>

                        {/* Print Only Styles */}
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @media print {
                                @page { 
                                    size: A4; 
                                    margin: 0; 
                                }
                                body * { 
                                    visibility: hidden !important; 
                                }
                                .print-content, .print-content * { 
                                    visibility: visible !important; 
                                }
                                .print-content { 
                                    position: fixed !important; 
                                    left: 0 !important; 
                                    top: 0 !important; 
                                    width: 210mm !important; 
                                    height: 297mm !important;
                                    padding: 1.4in 0.8in 0.8in 0.8in !important;
                                    margin: 0 !important;
                                    background: white !important;
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                }
                            }
                        ` }} />

                        <div className="print-content space-y-10">
                            {/* Header: PO Meta (Company Logo Removed for Letterhead) */}
                            <div className="flex justify-end items-start">
                                <div className="text-right space-y-1">
                                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Purchase Order</h1>
                                    <div className="inline-flex flex-col items-end">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Document No.</span>
                                        <span className="text-lg font-mono font-bold text-primary">#{purchaseOrder.po_number}</span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-x-6 text-right">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Date</p>
                                            <p className="text-xs font-bold text-slate-700">{format(new Date(purchaseOrder.created_at), 'dd MMM, yyyy')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                                            <p className={cn(
                                                "text-[9px] font-black uppercase px-2 py-0.5 rounded inline-block border",
                                                purchaseOrder.status === 'confirmed' ? "bg-primary/10 text-primary border-primary/20" :
                                                    purchaseOrder.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                        "bg-slate-50 text-slate-700 border-slate-200"
                                            )}>
                                                {purchaseOrder.status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Addresses Grid */}
                            <div className="grid grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-b pb-1 border-slate-100">Vendor Information</p>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-900 text-xs leading-tight">{purchaseOrder.vendor?.name || '---'}</p>
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{purchaseOrder.vendor?.address || 'Address not listed'}</p>
                                        {purchaseOrder.vendor?.phone && (
                                            <p className="text-[10px] text-slate-600 font-semibold flex items-center gap-1.5 pt-0.5">
                                                <Phone className="h-2.5 w-2.5 opacity-50" /> {purchaseOrder.vendor.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-b pb-1 border-slate-100">Ship To</p>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-900 text-xs leading-tight">
                                            {purchaseOrder.project?.name || 'Project Site'}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                            {purchaseOrder.project?.project_address || purchaseOrder.project?.location?.address || 'Address not listed'}
                                        </p>
                                        <p className="text-[10px] text-slate-600 font-semibold flex items-center gap-1.5 pt-0.5">
                                            <Building2 className="h-2.5 w-2.5 opacity-50" />
                                            {purchaseOrder.project?.contact_person || 'N/A'}
                                        </p>
                                        {purchaseOrder.project?.contact_person_phone && (
                                            <p className="text-[10px] text-slate-600 font-semibold flex items-center gap-1.5 pt-0.5">
                                                <Phone className="h-2.5 w-2.5 opacity-50" /> {purchaseOrder.project.contact_person_phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-b pb-1 border-slate-100">Bill To</p>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-900 text-xs leading-tight">
                                            {companyInfo?.company_name || 'LANDORA Real Estate Ltd.'}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                            {companyInfo?.address || 'JCX Business Tower (Level-6), Japan Street, Block I, Bashundhara R/A'}{companyInfo?.city ? `, ${companyInfo.city}` : ', Dhaka'}
                                            {companyInfo?.postal_code ? ` - ${companyInfo.postal_code}` : ' - 1229'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b pb-1.5 border-slate-100">Order Particulars</p>
                                <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-900 text-white">
                                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider w-12">#</th>
                                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider">Description</th>
                                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-center w-24">Quantity</th>
                                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-right w-32">Unit Price</th>
                                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-right w-36">Total Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {purchaseOrder.items?.map((item, idx) => (
                                                <tr key={item.id} className="text-slate-700">
                                                    <td className="py-2.5 px-4 text-[10px] font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                                                    <td className="py-2.5 px-4">
                                                        <div className="space-y-0.5">
                                                            <p className="font-bold text-slate-900 text-xs leading-none">{item.material?.name}</p>
                                                            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
                                                                {item.material?.code && `Code: ${item.material.code}`}
                                                                {item.material?.unit && ` • Pack: ${item.material.unit}`}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-4 text-center">
                                                        <span className="text-[10px] font-bold text-slate-900">{item.quantity}</span>
                                                        <span className="text-[9px] font-medium text-slate-400 ml-1 uppercase">{item.material?.unit}</span>
                                                    </td>
                                                    <td className="py-2.5 px-4 text-right text-[10px] font-medium">৳ {item.unit_price.toLocaleString()}</td>
                                                    <td className="py-2.5 px-4 text-right text-xs font-black text-slate-900">৳ {item.total_price.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary Section */}
                                <div className="grid grid-cols-2 gap-12 mt-6">
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Amount in Words</p>
                                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg min-h-[60px] flex items-center">
                                            <p className="text-[11px] font-black text-slate-700 italic uppercase leading-relaxed">
                                                {numberToWords(purchaseOrder.total_amount)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <div className="w-full max-w-[240px] flex items-center justify-end">
                                            <div className="flex justify-between items-center bg-slate-900 text-white rounded-lg py-2.5 px-4 w-full shadow-lg shadow-slate-200">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Total Amount</span>
                                                <span className="text-lg font-black">৳ {purchaseOrder.total_amount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Section: Terms & Conditions and Authorization */}
                            <div className="pt-6 space-y-12">
                                <div className="grid grid-cols-2 gap-16">
                                    <div className="space-y-4">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-b pb-1 border-slate-100">Terms & Conditions</p>
                                        <div className="space-y-2">
                                            {formatTerms(purchaseOrder.terms_and_conditions).map((term, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <span className="text-[9px] font-bold text-slate-300">{(index + 1).toString().padStart(2, '0')}</span>
                                                    <p className="text-[10px] text-slate-600 font-medium leading-[1.4]">{term}</p>
                                                </div>
                                            )) || (
                                                    <div className="space-y-1.5">
                                                        <div className="flex gap-2">
                                                            <span className="text-[9px] font-bold text-slate-300">01</span>
                                                            <p className="text-[10px] text-slate-600 font-medium leading-[1.4]">Materials must be as per specified quality standards.</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="text-[9px] font-bold text-slate-300">02</span>
                                                            <p className="text-[10px] text-slate-600 font-medium leading-[1.4]">Payment terms: Within 30 days of receiving invoice.</p>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-b pb-1 border-slate-100 text-right">System Verification</p>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 border-dashed space-y-2">
                                            <p className="text-[9px] text-slate-500 leading-normal font-medium">
                                                This document is generated by <span className="text-primary font-bold">Landora PIMS</span> and is a secured digital procurement document.
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Document ID</span>
                                                <span className="text-[10px] font-mono font-bold text-slate-700">#{purchaseOrder.id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-50">
                                    <div className="flex justify-between items-start">
                                        <div className="text-center space-y-3">
                                            <div className="w-48 border-b-2 border-slate-900 mx-auto h-8"></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Vendor Accepted</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Seal & Signature</p>
                                            </div>
                                        </div>

                                        <div className="text-center space-y-3 relative">
                                            <div className="w-56 border-b-2 border-slate-900 mx-auto h-8"></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Authorizer</p>
                                                <p className="text-[8px] font-bold text-primary uppercase tracking-tighter mt-1 leading-none">LANDORA REAL ESTATE LTD.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
