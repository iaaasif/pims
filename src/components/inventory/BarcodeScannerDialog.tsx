import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScanBarcode, Search, CheckCircle2, AlertCircle, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { triggerHaptic } from '@/lib/haptics'

interface BarcodeScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemFound?: (item: any) => void
}

export function BarcodeScannerDialog({ open, onOpenChange, onItemFound }: BarcodeScannerDialogProps) {
  const [barcodeInput, setBarcodeInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [scannedItem, setScannedItem] = useState<any | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleLookup = async (codeToSearch: string) => {
    const code = codeToSearch.trim()
    if (!code) return

    setLoading(true)
    setErrorMsg(null)
    setScannedItem(null)

    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .ilike('code', code)
        .maybeSingle()

      if (error) throw error

      if (data) {
        triggerHaptic('success')
        setScannedItem(data)
        if (onItemFound) onItemFound(data)
      } else {
        triggerHaptic('warning')
        setErrorMsg(`No material found matching barcode/code "${code}"`)
      }
    } catch (err: any) {
      triggerHaptic('error')
      setErrorMsg(err.message || 'Error looking up barcode')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanBarcode className="h-5 w-5 text-primary" />
            Warehouse Barcode & QR Scanner
          </DialogTitle>
          <DialogDescription>
            Scan physical warehouse barcode stickers or enter material code manually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Mock Camera Viewfinder */}
          <div className="relative border-2 border-dashed border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center bg-muted/30 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 animate-pulse">
              <Camera className="h-6 w-6" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Camera Viewfinder Ready</p>
            <p className="text-[11px] text-muted-foreground/70">Point camera at material sticker or enter code below</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleLookup(barcodeInput)
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="e.g. MAT-001, STL-12MM..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="h-10"
              autoFocus
            />
            <Button type="submit" disabled={loading || !barcodeInput.trim()} className="gap-1.5 shrink-0">
              <Search className="h-4 w-4" />
              Lookup
            </Button>
          </form>

          {scannedItem && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold text-foreground">{scannedItem.name}</div>
                <div className="text-xs text-muted-foreground">Code: {scannedItem.code} | Unit: {scannedItem.unit}</div>
                <div className="text-xs font-semibold text-primary mt-1">
                  Current Stock: {scannedItem.current_stock} {scannedItem.unit}
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
