import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Upload, RotateCcw, Database } from 'lucide-react'

export function DataManagementPanel() {
    const [loading, setLoading] = useState(false)

    const handleImport = () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            toast.success('Data import simulation complete')
        }, 2000)
    }

    return (
        <Card className="w-full max-w-4xl mx-auto border-none shadow-none bg-transparent">
            <div className="flex flex-col h-full space-y-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                        <Database className="h-6 w-6 text-primary" />
                        Data Management
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Perform bulk data operations and system backups.
                    </p>
                </div>
                <div className="space-y-4 py-4">
                    <div className="grid gap-4">
                        <Button variant="outline" className="h-20 flex-col gap-2" onClick={handleImport} disabled={loading}>
                            <Upload className="h-6 w-6 text-primary" />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Bulk Import</span>
                                <span className="text-xs text-muted-foreground">Upload Excel/CSV files</span>
                            </div>
                        </Button>

                        <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => toast.info('Backup creation starting...')}>
                            <Database className="h-6 w-6 text-primary" />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Create Backup</span>
                                <span className="text-xs text-muted-foreground">Full system snapshot</span>
                            </div>
                        </Button>

                        <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => toast.info('Restore list loading...')}>
                            <RotateCcw className="h-6 w-6 text-primary" />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Restore Data</span>
                                <span className="text-xs text-muted-foreground">Restore from previous backup</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}
