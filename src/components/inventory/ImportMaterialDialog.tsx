import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Upload, Loader2, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ImportMaterialDialog({ onImportComplete }: { onImportComplete: () => void }) {
    const [open, setOpen] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile)
        } else {
            toast.error('Please select a valid CSV file')
            setFile(null)
        }
    }

    const downloadTemplate = () => {
        const headers = ["Material Name", "Code", "Category", "Standard Unit", "Min Stock Level"]
        const csvContent = headers.join(',') + '\nExample Item,EXT-001,Construction,bags,50'
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'material_import_template.csv'
        a.click()
    }

    const processImport = async () => {
        if (!file) return

        setIsImporting(true)
        try {
            const text = await file.text()
            const lines = text.split('\n')
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

            // Map headers to DB columns
            const materialsToImport = lines.slice(1)
                .filter(line => line.trim())
                .map(line => {
                    const values = line.split(',').map(v => v.trim())
                    const item: any = {}

                    headers.forEach((header, index) => {
                        const val = values[index]
                        if (header.includes('name')) item.name = val
                        else if (header.includes('code')) item.code = val
                        else if (header.includes('category')) item.category = val
                        else if (header.includes('unit')) item.unit = val
                        else if (header.includes('min') || header.includes('threshold')) item.min_stock_level = parseFloat(val) || 0
                    })

                    return item
                })
                .filter(item => item.name) // name is required

            if (materialsToImport.length === 0) {
                toast.error('No valid items found in CSV')
                return
            }

            const { error } = await supabase
                .from('materials')
                .insert(materialsToImport)

            if (error) throw error

            toast.success(`Successfully imported ${materialsToImport.length} materials`)
            setOpen(false)
            setFile(null)
            onImportComplete()
        } catch (error: any) {
            console.error('Import Error:', error)
            toast.error('Failed to import CSV: ' + (error.message || 'Unknown error'))
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-colors">
                    <Upload className="mr-2 h-3.5 w-3.5" /> Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Master Catalog</DialogTitle>
                    <DialogDescription>
                        Bulk add materials via CSV. You can download the template below to ensure correct formatting.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                        <p className="text-sm font-medium text-center">
                            {file ? file.name : "Click to browse or drag & drop CSV file"}
                        </p>
                        <input
                            type="file"
                            className="hidden"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>

                    <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase text-muted-foreground hover:text-primary h-8" onClick={downloadTemplate}>
                        <Download className="mr-2 h-3 w-3" /> Download Import Template
                    </Button>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isImporting}>Cancel</Button>
                    <Button onClick={processImport} disabled={!file || isImporting}>
                        {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isImporting ? 'Importing...' : 'Confirm Import'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
