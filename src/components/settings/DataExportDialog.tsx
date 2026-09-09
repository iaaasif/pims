import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function DataExportPanel() {
    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState({
        projects: true,
        inventory: true,
        vendors: true,
        requisitions: false,
    })

    const handleExport = async () => {
        setLoading(true)
        
        try {
            const exportData: any = {}
            
            if (items.projects) {
                const { data: projects } = await supabase.from('projects').select('*')
                exportData.projects = projects
            }
            
            if (items.inventory) {
                const { data: materials } = await supabase.from('materials').select('*')
                const { data: locations } = await supabase.from('locations').select('*')
                exportData.inventory = { materials, locations }
            }
            
            if (items.vendors) {
                const { data: vendors } = await supabase.from('vendors').select('*')
                exportData.vendors = vendors
            }
            
            if (items.requisitions) {
                const { data: requisitions } = await supabase.from('purchase_requisitions').select('*')
                exportData.requisitions = requisitions
            }
            
            // Create and download CSV
            const csvContent = convertToCSV(exportData)
            downloadCSV(csvContent, 'pims_export.csv')
            
            toast.success('Data exported successfully!')
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export data')
        } finally {
            setLoading(false)
        }
    }

    const convertToCSV = (data: any): string => {
        const rows: string[] = []
        
        // Add headers based on selected items
        const headers: string[] = []
        if (items.projects) headers.push('Project ID', 'Project Name', 'Status', 'Start Date', 'End Date')
        if (items.inventory) headers.push('Material ID', 'Material Name', 'Quantity', 'Location', 'Category')
        if (items.vendors) headers.push('Vendor ID', 'Vendor Name', 'Category', 'Contact Person')
        if (items.requisitions) headers.push('Requisition ID', 'Title', 'Status', 'Request Date')
        
        rows.push(headers.join(','))
        
        // Add data rows
        if (items.projects && data.projects) {
            data.projects.forEach((project: any) => {
                rows.push([project.id, project.name, project.status, project.start_date, project.end_date].join(','))
            })
        }
        
        if (items.inventory && data.inventory?.materials) {
            data.inventory.materials.forEach((material: any) => {
                rows.push([material.id, material.name, material.quantity, material.location_id, material.category].join(','))
            })
        }
        
        if (items.vendors && data.vendors) {
            data.vendors.forEach((vendor: any) => {
                rows.push([vendor.id, vendor.name, vendor.category, vendor.contact_person].join(','))
            })
        }
        
        if (items.requisitions && data.requisitions) {
            data.requisitions.forEach((req: any) => {
                rows.push([req.id, req.title, req.status, req.created_at].join(','))
            })
        }
        
        return rows.join('\n')
    }

    const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Card className="w-full max-w-4xl mx-auto border-none shadow-none bg-transparent">
            <div className="flex flex-col h-full space-y-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                        <Download className="h-6 w-6 text-primary" />
                        Export Data
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Select the data you want to export. The data will be downloaded in Excel format.
                    </p>
                </div>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="projects"
                            checked={items.projects}
                            onCheckedChange={(checked) => setItems({ ...items, projects: !!checked })}
                        />
                        <Label htmlFor="projects">Projects Data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="inventory"
                            checked={items.inventory}
                            onCheckedChange={(checked) => setItems({ ...items, inventory: !!checked })}
                        />
                        <Label htmlFor="inventory">Inventory & Materials</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="vendors"
                            checked={items.vendors}
                            onCheckedChange={(checked) => setItems({ ...items, vendors: !!checked })}
                        />
                        <Label htmlFor="vendors">Vendor List</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="requisitions"
                            checked={items.requisitions}
                            onCheckedChange={(checked) => setItems({ ...items, requisitions: !!checked })}
                        />
                        <Label htmlFor="requisitions">Purchase Requisitions</Label>
                    </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-border mt-4">
                    <Button onClick={handleExport} disabled={loading} className="w-full sm:w-auto font-bold shadow-md shadow-primary/20">
                        <Download className="mr-2 h-4 w-4" />
                        {loading ? 'Preparing Export...' : 'Download Export'}
                    </Button>
                </div>
            </div>
        </Card>
    )
}
