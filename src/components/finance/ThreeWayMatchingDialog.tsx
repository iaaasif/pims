import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertTriangle, ShieldCheck, FileCheck } from 'lucide-react'

interface ThreeWayMatchingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  poNumber?: string
  orderedAmount?: number
  receivedAmount?: number
  invoicedAmount?: number
}

export function ThreeWayMatchingDialog({
  open,
  onOpenChange,
  poNumber = 'PO-2026-001',
  orderedAmount = 250000,
  receivedAmount = 250000,
  invoicedAmount = 250000,
}: ThreeWayMatchingDialogProps) {
  const isAmountMatched = orderedAmount === invoicedAmount && receivedAmount === invoicedAmount
  const variance = invoicedAmount - receivedAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            3-Way Financial Match Verification
          </DialogTitle>
          <DialogDescription>
            Audit control comparing Purchase Order (PO), Goods Received Note (GRN), and Vendor Invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purchase Order Ref</span>
            <span className="text-sm font-bold">{poNumber}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-muted/40 rounded-lg border">
              <div className="text-[11px] text-muted-foreground font-medium">1. PO Ordered</div>
              <div className="text-sm font-bold text-foreground mt-1">৳{orderedAmount.toLocaleString()}</div>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border">
              <div className="text-[11px] text-muted-foreground font-medium">2. GRN Received</div>
              <div className="text-sm font-bold text-foreground mt-1">৳{receivedAmount.toLocaleString()}</div>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border">
              <div className="text-[11px] text-muted-foreground font-medium">3. Vendor Invoice</div>
              <div className="text-sm font-bold text-foreground mt-1">৳{invoicedAmount.toLocaleString()}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isAmountMatched ? (
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              )}
              <div>
                <div className="text-sm font-bold">
                  {isAmountMatched ? 'Full 3-Way Match Verified' : 'Discrepancy Detected'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isAmountMatched
                    ? 'All documents match 100%. Approved for disbursement.'
                    : `Variance of ৳${Math.abs(variance).toLocaleString()} detected between bill and goods received.`}
                </div>
              </div>
            </div>

            <Badge variant={isAmountMatched ? 'default' : 'destructive'} className="shrink-0">
              {isAmountMatched ? 'APPROVED' : 'HOLD'}
            </Badge>
          </div>

          <div className="bg-muted/20 p-3 rounded-lg text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <FileCheck className="h-4 w-4 text-primary" />
              Finance Controller Sign-off Rule:
            </div>
            <p>Bills exceeding goods received amount are automatically blocked from disbursement until discrepancy approval.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
