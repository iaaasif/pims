import { useProjects } from '@/hooks/useProjects'
import { usePermissions } from '@/hooks/usePermissions'
import { AddProjectDialog } from '@/components/projects/AddProjectDialog'
import { EditProjectDialog } from '@/components/projects/EditProjectDialog'
import { TableAction } from '@/components/common/TableAction'
import {
    Edit,
    Trash2,
    Briefcase,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Search,
    LayoutGrid,
    List,
    ArrowDown,
    ArrowUp,
    Clock,
    MapPin,
    Calendar,
    ArrowRight,
    Activity
} from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '@/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Projects() {
    const { projects, loading, refresh, deleteProject } = useProjects()
    const { canCreate, canEdit, canDelete } = usePermissions()
    const [searchTerm, setSearchTerm] = useState('')
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [deletingProject, setDeletingProject] = useState<Project | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [sortBy, setSortBy] = useState<'name' | 'code' | 'status' | 'created_at' | 'progress'>('created_at')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const navigate = useNavigate()

    // Status color helper function
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/10 text-green-600 border-green-500/20'
            case 'on_hold':
                return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
            case 'completed':
                return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
            case 'cancelled':
                return 'bg-red-500/10 text-red-600 border-red-500/20'
            default:
                return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
        }
    }

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort projects based on selected criteria
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        let comparison = 0

        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name)
                break
            case 'code':
                comparison = a.code.localeCompare(b.code)
                break
            case 'status': {
                const statusPriority = {
                    'active': 1,
                    'on_hold': 2,
                    'completed': 3,
                    'cancelled': 4
                }
                comparison = statusPriority[a.status] - statusPriority[b.status]
                break
            }
            case 'progress':
                comparison = (a.progress || 0) - (b.progress || 0)
                break
            case 'created_at':
                comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                break
        }

        return sortOrder === 'asc' ? comparison : -comparison
    })

    const stats = [
        { label: 'Active', count: projects.filter(p => p.status === 'active').length, icon: Clock, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
        { label: 'On Hold', count: projects.filter(p => p.status === 'on_hold').length, icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
        { label: 'Completed', count: projects.filter(p => p.status === 'completed').length, icon: CheckCircle2, color: 'text-primary', bgColor: 'bg-primary/10' },
    ]

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active': return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600'
            case 'completed': return 'border-primary/20 bg-primary/5 text-primary'
            case 'on_hold': return 'border-orange-500/20 bg-orange-500/5 text-orange-600'
            case 'cancelled': return 'border-red-500/20 bg-red-500/5 text-red-600'
            default: return 'border-slate-500/20 bg-slate-500/5 text-slate-600'
        }
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header Area */}
            <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <span>Application</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-primary">Projects Center</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                                <Briefcase className="h-6 w-6" />
                            </span>
                            Workspace Projects
                        </h1>
                        <p className="text-muted-foreground text-xs font-medium mt-1">Manage construction sites, operational timelines, and active resources</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border/50">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="h-8 w-8 p-0"
                                title="Grid View"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="h-8 w-8 p-0"
                                title="List View"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border/50">
                            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                <SelectTrigger className="h-8 w-auto px-3 border-0 bg-transparent text-xs font-medium">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="code">Code</SelectItem>
                                    <SelectItem value="status">Status</SelectItem>
                                    <SelectItem value="progress">Progress</SelectItem>
                                    <SelectItem value="created_at">Date</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="h-8 w-8 p-0"
                                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                            >
                                {sortOrder === 'asc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                            </Button>
                        </div>
                        {canCreate('projects') && <AddProjectDialog onProjectAdded={refresh} />}
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-border bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden group hover:border-primary/20 transition-all">
                        <CardContent className="p-2 sm:p-5 flex flex-col items-center justify-center text-center">
                            <div className={cn("p-1.5 sm:p-2.5 rounded-lg bg-background border border-border group-hover:scale-110 transition-transform shadow-sm mb-2", stat.color)}>
                                <stat.icon className="h-3 w-3 sm:h-5 sm:w-5" />
                            </div>
                            <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                            <p className="text-lg sm:text-2xl font-bold tracking-tight">{stat.count}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 bg-muted/20 p-2 sm:p-3 rounded-xl border border-border/50">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2 sm:px-4 rounded-lg bg-background shadow-sm text-primary font-bold text-[10px] uppercase tracking-widest">
                        <LayoutGrid className="mr-1 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden sm:inline">Grid View</span>
                    </Button>
                    <div className="h-4 w-px bg-border" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
                        {filteredProjects.length} Projects
                    </span>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, code or location..."
                        className="pl-10 h-9 sm:h-10 bg-background/50 border-border/50 shadow-none focus-visible:ring-primary/20 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Projects Grid/List */}
            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <LoadingSpinner text="Syncing project timelines..." />
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sortedProjects.map((project) => (
                        <Card
                            key={project.id}
                            className="border-border bg-card/50 backdrop-blur-md shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300"
                        >
                            <CardHeader className="pb-4 relative">
                                <div className="absolute top-4 right-4 z-10">
                                    <TableAction
                                        actions={[
                                            {
                                                label: 'Edit Project',
                                                icon: <Edit className="h-3.5 w-3.5" />,
                                                disabled: !canEdit('projects'),
                                                onClick: () => setEditingProject(project)
                                            },
                                            {
                                                label: 'Delete Project',
                                                icon: <Trash2 className="h-3.5 w-3.5" />,
                                                variant: 'destructive',
                                                disabled: !canDelete('projects'),
                                                onClick: () => setDeletingProject(project)
                                            },
                                        ]}
                                    />
                                </div>
                                <div className="space-y-1 pr-10">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter opacity-70">
                                            {project.code}
                                        </Badge>
                                        <Badge variant="outline" className={cn(
                                            "px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter",
                                            getStatusStyle(project.status)
                                        )}>
                                            {project.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                                        {project.name}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="p-1.5 rounded-lg bg-muted/50 border border-border/50 group-hover:text-primary transition-colors">
                                            <MapPin className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-widest leading-none mb-1">Site</span>
                                            <span className="text-xs font-bold leading-tight truncate max-w-[100px]">{project.location?.name}</span>
                                            <span className="text-xs text-muted-foreground leading-tight truncate max-w-[100px]">
                                                {project.project_address || project.location?.address || 'No address'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="p-1.5 rounded-lg bg-muted/50 border border-border/50 group-hover:text-primary transition-colors">
                                            <Calendar className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-widest leading-none mb-1">Timeline</span>
                                            <span className="text-xs font-bold leading-tight">
                                                {format(new Date(project.start_date), 'MMM d, yyyy')}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground leading-tight">
                                                {project.end_date ? `to ${format(new Date(project.end_date), 'MMM d, yyyy')}` : 'No end date'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-1.5 pt-2">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-muted-foreground/60">Execution Progress</span>
                                        <span className="text-primary">{project.progress || 0}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden border border-border/30">
                                        <div
                                            className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                                            style={{ width: `${project.progress || 0}%` }}
                                        />
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between group/btn text-xs font-bold uppercase tracking-widest h-10 hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/20 transition-all mt-2"
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    Project Dashboard <ArrowRight className="h-3.5 w-3.5 -translate-x-2 group-hover/btn:translate-x-0 opacity-0 group-hover/btn:opacity-100 transition-all" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredProjects.length === 0 && (
                        <div className="col-span-full border-2 border-dashed border-border rounded-2xl py-20 flex flex-col items-center justify-center opacity-50 bg-muted/5">
                            <LayoutGrid className="h-10 w-10 mb-4 text-muted-foreground" />
                            <p className="text-sm font-bold uppercase tracking-widest">No matching projects found</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedProjects.map((project) => (
                        <Card
                            key={project.id}
                            className="border-border bg-card/50 backdrop-blur-md shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                                            <Briefcase className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{project.name}</h3>
                                                <Badge className={getStatusColor(project.status)}>
                                                    {project.status}
                                                </Badge>
                                                <Badge variant="outline">{project.code}</Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    <span>{project.location?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>{format(new Date(project.start_date), 'MMM d, yyyy')}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Activity className="h-3.5 w-3.5" />
                                                    <span>{project.progress || 0}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            className="group/btn text-xs font-bold uppercase tracking-widest h-10 hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/20 transition-all"
                                            onClick={() => navigate(`/projects/${project.id}`)}
                                        >
                                            Project Dashboard <ArrowRight className="h-3.5 w-3.5 -translate-x-2 group-hover/btn:translate-x-0 opacity-0 group-hover/btn:opacity-100 transition-all" />
                                        </Button>
                                        <TableAction
                                            actions={[
                                                {
                                                    label: 'Edit',
                                                    icon: <Edit className="h-4 w-4" />,
                                                    disabled: !canEdit('projects'),
                                                    onClick: () => setEditingProject(project),
                                                },
                                                {
                                                    label: 'Delete',
                                                    icon: <Trash2 className="h-4 w-4" />,
                                                    onClick: () => setDeletingProject(project),
                                                    variant: 'destructive',
                                                    disabled: !canDelete('projects'),
                                                },
                                            ]}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <EditProjectDialog
                project={editingProject}
                open={!!editingProject}
                onOpenChange={(open) => !open && setEditingProject(null)}
            />

            <AlertDialog open={!!deletingProject} onOpenChange={(open) => !open && setDeletingProject(null)}>
                <AlertDialogContent className="border-border bg-card/95 backdrop-blur-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">Terminate Project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to permanently delete <strong>{deletingProject?.name}</strong>. This will archive all site data and remove associated resource allocations. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="font-bold">Abort Action</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white font-bold"
                            onClick={async () => {
                                if (deletingProject) {
                                    const { error } = await deleteProject(deletingProject.id)
                                    if (error) {
                                        toast.error("Failed to delete project")
                                    } else {
                                        toast.success("Project terminated successfully")
                                    }
                                    setDeletingProject(null)
                                }
                            }}
                        >
                            Confirm Termination
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    )
}
