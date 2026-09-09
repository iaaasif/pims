import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import { useInventory } from '@/hooks/useInventory'
import { useProjects } from '@/hooks/useProjects'
import { AddProjectMaterialDialog } from '@/components/inventory/AddProjectMaterialDialog'
import { RecordProjectUsageDialog } from '@/components/inventory/RecordProjectUsageDialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'


export default function ProjectInventory() {
    const { projectId } = useParams()
    const navigate = useNavigate()
    const { inventory, loading: loadingInventory, refresh } = useInventory(projectId)
    const { projects, loading: loadingProjects } = useProjects()
    const [searchTerm, setSearchTerm] = useState('')

    const project = projects.find(p => p.id === projectId)

    const filteredInventory = inventory.filter(item =>
        item.material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.material.code?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Debug logging
    console.log('ProjectInventory Debug:', {
        projectId,
        project: project?.name,
        inventoryLength: inventory.length,
        filteredLength: filteredInventory.length,
        inventory: inventory,
        loadingInventory,
        loadingProjects
    })

    if (!projectId) return <div>Invalid Project ID</div>
    if (loadingProjects) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner text="Accessing project records..." />
            </div>
        )
    }
    if (!project) return <div className="p-8 text-center text-destructive">Project not found or you do not have permission to view it.</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/inventory')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{project?.name || 'Project Inventory'}</h1>
                    <p className="text-muted-foreground">{project?.location?.name || 'Location details'}</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" size="sm" onClick={refresh} disabled={loadingInventory}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {loadingInventory ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <AddProjectMaterialDialog projectId={projectId} onMaterialAdded={refresh} />
                </div>
            </div>

            <div className="flex w-full max-w-sm items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search material..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventory List</CardTitle>
                    <CardDescription>Stock levels for this project.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingInventory ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner text="Syncing stock levels..." />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Material</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Added Date</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInventory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No materials in this project. Add one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInventory.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-xs">{item.material.code || '-'}</TableCell>
                                            <TableCell className="font-medium">{item.material.name}</TableCell>
                                            <TableCell>{item.material.unit}</TableCell>
                                            <TableCell className="font-bold">{item.quantity}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {format(new Date(item.usage_date), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell className="text-xs max-w-xs truncate" title={item.purpose}>
                                                {item.purpose}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <RecordProjectUsageDialog
                                                    item={item}
                                                    onUsageRecorded={refresh}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
