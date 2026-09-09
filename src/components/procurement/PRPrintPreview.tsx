import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Building2, Printer, Download } from 'lucide-react'
import type { PurchaseRequisition } from '@/hooks/usePurchaseRequisitions'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useCompanyInformation } from '@/hooks/useCompanyInformation'

import { toast } from 'sonner'

interface PRPrintPreviewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    requisition: PurchaseRequisition | null
}

export function PRPrintPreview({ open, onOpenChange, requisition }: PRPrintPreviewProps) {
    const [isPrinting, setIsPrinting] = useState(false)
    const { company } = useCompanyInformation()

    const handlePrint = () => {
        setIsPrinting(true)
        window.print()
        setTimeout(() => setIsPrinting(false), 1000)
    }

    if (!requisition) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[950px] max-h-[95vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="p-6 border-b bg-muted/30 print:hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl">Purchase Requisition Preview</DialogTitle>
                            <DialogDescription>
                                PR #{requisition.pr_number} • {format(new Date(requisition.created_at), 'PPP')}
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => toast.info('PDF Export coming soon')} className="gap-2">
                                <Download className="h-4 w-4" />
                                Export PDF
                            </Button>
                            <Button onClick={handlePrint} disabled={isPrinting} size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                                <Printer className="h-4 w-4" />
                                {isPrinting ? 'Printing...' : 'Print PR'}
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
                            {/* Header */}
                            <div className="flex justify-end items-start">
                                <div className="text-right space-y-1">
                                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Purchase Requisition</h1>
                                    <div className="inline-flex flex-col items-end">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Document No.</span>
                                        <span className="text-lg font-mono font-bold text-primary">#{requisition.pr_number}</span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-x-6 text-right">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Date</p>
                                            <p className="text-xs font-bold text-slate-700">{format(new Date(requisition.created_at), 'dd MMM, yyyy')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                                            <p className={cn(
                                                "text-[9px] font-black uppercase px-2 py-0.5 rounded inline-block border",
                                                requisition.status === 'approved' ? "bg-green-100 text-green-800 border-green-200" :
                                                requisition.status === 'submitted' ? "bg-blue-100 text-blue-800 border-blue-200" :
                                                requisition.status === 'rejected' ? "bg-red-100 text-red-800 border-red-200" :
                                                "bg-slate-50 text-slate-700 border-slate-200"
                                            )}>
                                                {requisition.status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Addresses Grid */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-b pb-1 border-slate-100">Project / Site</p>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-900 text-xs leading-tight">
                                            {requisition.project?.name || 'Project Name Not Listed'}
                                        </p>
                                        <p className="text-[10px] text-slate-600 font-semibold flex items-center gap-1.5 pt-0.5">
                                            <Building2 className="h-2.5 w-2.5 opacity-50" />
                                            Required By: {requisition.required_date ? format(new Date(requisition.required_date), 'dd MMM, yyyy') : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-b pb-1 border-slate-100">Requested By</p>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-900 text-xs leading-tight">
                                            {requisition.requester?.full_name || 'System User'}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                            {company?.company_name || 'Landora Real Estate Ltd.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Justification */}
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-b pb-1 border-slate-100">Justification</p>
                                <p className="text-[10px] text-slate-700 leading-relaxed">
                                    {requisition.justification || 'No justification provided.'}
                                </p>
                            </div>

                            {/* Items Table */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b pb-1.5 border-slate-100">Requisition Particulars</p>
                                <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-900 text-white">
                                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider w-12">#</th>
                                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider">Description</th>
                                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-center">Required Date</th>
                                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-center w-32">Quantity Required</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {requisition.items?.map((item, idx) => (
                                                <tr key={item.id || item.material_id} className="text-slate-700">
                                                    <td className="py-2.5 px-4 text-[10px] font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                                                    <td className="py-2.5 px-4">
                                                        <div className="space-y-0.5">
                                                            <p className="font-bold text-slate-900 text-xs leading-none">{item.material?.name}</p>
                                                            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
                                                                {item.material?.code && `Code: ${item.material.code}`}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-4 text-center">
                                                        <span className="text-[10px] font-bold text-slate-900">
                                                            {item.required_date ? format(new Date(item.required_date), 'dd MMM, yyyy') : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-4 text-center">
                                                        <span className="text-[10px] font-bold text-slate-900">{item.quantity}</span>
                                                        <span className="text-[9px] font-medium text-slate-400 ml-1 uppercase">{item.material?.unit}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bottom Section: System Verification */}
                            <div className="pt-6 space-y-12">
                                <div className="grid grid-cols-2 gap-16">
                                    <div className="space-y-4">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-b pb-1 border-slate-100">System Verification</p>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 border-dashed space-y-2">
                                            <p className="text-[9px] text-slate-500 leading-normal font-medium">
                                                This document is generated by <span className="text-primary font-bold">{company?.company_name || 'Landora Real Estate Ltd.'} PIMS</span> and serves as an internal requisition document.
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Document ID</span>
                                                <span className="text-[10px] font-mono font-bold text-slate-700">#{requisition.id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* Reserved for Future info or specific signatures if needed */}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-50">
                                    <div className="flex justify-between items-start">
                                        <div className="text-center space-y-3 relative">
                                            <div className="w-56 border-b-2 border-slate-900 mx-auto h-8"></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Requested By</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{requisition.requester?.full_name}</p>
                                                {requisition.requester?.job_title && (
                                                    <p className="text-[7px] font-medium text-slate-400 uppercase tracking-tight italic">
                                                        {requisition.requester.job_title}
                                                    </p>
                                                )}
                                                <p className="text-[7px] font-bold text-slate-900 uppercase tracking-tighter mt-0.5">
                                                    {company?.company_name || 'Landora Real Estate Ltd.'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-center space-y-3 relative">
                                            <div className="w-56 border-b-2 border-slate-900 mx-auto h-8"></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Authorized By</p>
                                                <p className="text-[8px] font-bold text-primary uppercase tracking-tighter mt-1 leading-none">{company?.company_name || 'LANDORA REAL ESTATE LTD.'}</p>
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
