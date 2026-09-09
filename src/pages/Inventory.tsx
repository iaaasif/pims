import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    MapPin,
    Search,
    ArrowRight,
    Trash2,
    Package,
    ChevronRight,
    Boxes,
    AlertTriangle,
    Layers,
} from 'lucide-react'

import { useMaterials } from '@/hooks/useMaterials'
import { useProjects } from '@/hooks/useProjects'
import { usePermissions } from '@/hooks/usePermissions'
import { exportToCSV } from '@/lib/export'
import { sendSMS } from '@/lib/sms'
import { toast } from 'sonner'
import { AddMaterialDialog } from '@/components/inventory/AddMaterialDialog'
import { EditMaterialDialog } from '@/components/inventory/EditMaterialDialog'
import { ImportMaterialDialog } from '@/components/inventory/ImportMaterialDialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export default function Inventory() {
    const { materials, loading: loadingMaterials, refresh: refreshMaterials, deleteMaterial } = useMaterials()
    const { projects, loading: loadingProjects } = useProjects()
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()
    const { canCreate, canEdit, canDelete } = usePermissions()

    const lowStockCount = materials.filter(m => m.current_stock <= m.min_stock_level).length

    const filteredMaterials = materials.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.code && material.code.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleExportMaster = () => {
        const dataToExport = filteredMaterials.map(m => ({
            'Material Name': m.name,
            'Code': m.code || 'N/A',
            'Category': m.category || 'General',
            'Standard Unit': m.unit,
            'Current Total Stock': m.current_stock,
            'Min Stock Level': m.min_stock_level,
            'Status': m.current_stock > m.min_stock_level ? 'Optimal' : 'Low'
        }))
        exportToCSV(dataToExport, `PIMS_Master_Catalog_${new Date().toISOString().split('T')[0]}`)
        toast.success('Master Catalog exported to CSV')
    }

    const handleNotifyAdmin = async (item: any) => {
        const message = `MANUAL ALERT: ${item.name} (${item.code}) is at threshold level. Total Stock: ${item.current_stock} ${item.unit}.`
        toast.promise(
            sendSMS('', message, 'low_inventory'),
            {
                loading: 'Sending alert to Admin...',
                success: 'Admin notified successfully',
                error: (err) => `Failed to notify Admin: ${err.message}`
            }
        )
    }

    const stats = [
        { label: 'Total Items', value: materials.length, icon: Boxes, color: 'text-primary' },
        { label: 'Low Stock', value: lowStockCount, icon: AlertTriangle, color: 'text-orange-500' },
        { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length, icon: Layers, color: 'text-emerald-500' },
    ]

    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col space-y-2 sm:space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <span>Application</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-primary">Inventory Hub</span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                                <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                            </span>
                            Inventory Control
                        </h1>
                        <p className="text-muted-foreground text-xs font-medium mt-1">Manage global materials and project-specific stock levels</p>
                    </div>
                    {canCreate('materials') && (
                        <AddMaterialDialog onMaterialAdded={refreshMaterials} />
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-border bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden group hover:border-primary/20 transition-all">
                        <CardContent className="p-2 sm:p-5 flex flex-col items-center justify-center text-center">
                            <div className={cn("p-1.5 sm:p-2.5 rounded-lg bg-background border border-border group-hover:scale-110 transition-transform shadow-sm mb-2", stat.color)}>
                                <stat.icon className="h-3 w-3 sm:h-5 sm:w-5" />
                            </div>
                            <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                            <p className="text-lg sm:text-2xl font-bold tracking-tight">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="projects" className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
                    <TabsList className="bg-transparent h-auto p-0 gap-1 sm:gap-2 w-full sm:w-auto flex-1">
                        <TabsTrigger
                            value="projects"
                            className="flex-1 px-2 sm:px-6 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold text-xs uppercase tracking-widest transition-all"
                        >
                            <span className="hidden sm:inline">Project Stock</span>
                            <span className="sm:hidden">Projects</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="master-list"
                            className="flex-1 px-2 sm:px-6 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold text-xs uppercase tracking-widest transition-all"
                        >
                            <span className="hidden sm:inline">Master Catalog</span>
                            <span className="sm:hidden">Catalog</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search catalog..."
                            className="pl-10 h-9 sm:h-10 bg-background/50 border-border/50 shadow-none focus-visible:ring-primary/20 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="projects" className="space-y-6">
                    {loadingProjects ? (
                        <div className="flex items-center justify-center p-20">
                            <LoadingSpinner text="Syncing project stock..." />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredProjects.map((project) => (
                                <Card
                                    key={project.id}
                                    className="cursor-pointer border-border bg-card/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group overflow-hidden"
                                    onClick={() => navigate(`/inventory/${project.id}`)}
                                >
                                    <div className="h-2 w-full bg-muted group-hover:bg-primary/20 transition-colors" />
                                    <CardHeader className="pb-2 sm:pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-xs sm:text-sm lg:text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
                                                    {project.name}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1.5 font-medium">
                                                    <MapPin className="h-3.5 w-3.5 text-primary/60" />
                                                    {project.location?.name || 'Unknown Location'}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline" className={cn(
                                                "px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter",
                                                project.status === 'active' ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600" : "border-slate-500/20 bg-slate-500/5 text-slate-600"
                                            )}>
                                                {project.status === 'active' ? 'Operational' : project.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/50">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                                                        {project.name[i - 1]}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                                                Details <ArrowRight className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredProjects.length === 0 && (
                                <div className="col-span-full text-center py-20 opacity-40">
                                    <Boxes className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No projects matching your search</p>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="master-list">
                    <Card className="border-border bg-card/50 backdrop-blur-md shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold">Master Catalog</CardTitle>
                                    <CardDescription>Global definitions for {filteredMaterials.length} materials</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    {canCreate('materials') && <ImportMaterialDialog onImportComplete={refreshMaterials} />}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-colors"
                                        onClick={handleExportMaster}
                                        disabled={filteredMaterials.length === 0}
                                    >
                                        Export CSV
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingMaterials ? (
                                <div className="flex items-center justify-center p-20">
                                    <LoadingSpinner text="Loading master catalog..." />
                                </div>
                            ) : (
                                <div className="overflow-x-auto custom-scrollbar">
                                    <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="text-[10px] font-bold uppercase px-6">Definition</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase">Classification</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase">Standard Unit</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase">Status</TableHead>
                                            <TableHead className="text-right text-[10px] font-bold uppercase px-6">Tools</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredMaterials.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-20 opacity-40">
                                                    <Package className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Empty catalog</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredMaterials.map((item) => (
                                                <TableRow key={item.id} className="hover:bg-muted/30 border-border group transition-all">
                                                    <TableCell className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm text-foreground">{item.name}</span>
                                                            <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-tighter">REF: {item.code || 'N/A'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter bg-muted/50 border-border/50">
                                                            {item.category || 'General'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-medium text-muted-foreground">{item.unit}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={cn(
                                                            "px-2 py-0.5 text-[10px] font-bold uppercase shadow-sm",
                                                            item.current_stock > item.min_stock_level
                                                                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
                                                                : "border-orange-500/20 bg-orange-500/5 text-orange-600"
                                                        )}>
                                                            {item.current_stock > item.min_stock_level ? 'Optimal' : 'Threshold Alert'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right px-6">
                                                        <div className="flex justify-end gap-1 transition-opacity">
                                                            {item.current_stock <= item.min_stock_level && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                                                                    title="Notify Admin"
                                                                    onClick={() => handleNotifyAdmin(item)}
                                                                >
                                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                            {canEdit('materials') && (
                                                                <EditMaterialDialog
                                                                    material={item}
                                                                    onMaterialUpdated={refreshMaterials}
                                                                />
                                                            )}
                                                            {canDelete('materials') && (
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Archive Definition?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                You are about to delete <strong>{item.name}</strong>. This will remove it from the global catalog. This action cannot be reversed.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Keep Item</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={async () => {
                                                                                    await deleteMaterial(item.id)
                                                                                    refreshMaterials()
                                                                                }}
                                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
                                                                            >
                                                                                Delete Forever
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
