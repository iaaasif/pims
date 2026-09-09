import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Search, Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ProjectTimeline() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const mockData = [
    { project: 'Project X', startDate: '2024-01-01', endDate: '2024-03-31', plannedEnd: '2024-03-15', status: 'delayed', progress: 65, daysRemaining: 45, daysDelayed: 16 },
    { project: 'Project Y', startDate: '2024-01-15', endDate: '2024-04-30', plannedEnd: '2024-04-30', status: 'on-track', progress: 40, daysRemaining: 75, daysDelayed: 0 },
    { project: 'Project Z', startDate: '2024-02-01', endDate: '2024-05-31', plannedEnd: '2024-06-15', status: 'ahead', progress: 55, daysRemaining: 90, daysDelayed: -15 },
    { project: 'Project A', startDate: '2023-12-01', endDate: '2024-02-28', plannedEnd: '2024-02-28', status: 'completed', progress: 100, daysRemaining: 0, daysDelayed: 0 },
    { project: 'Project B', startDate: '2024-01-10', endDate: '2024-06-30', plannedEnd: '2024-06-15', status: 'delayed', progress: 25, daysRemaining: 140, daysDelayed: 15 },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case 'on-track':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Clock className="w-3 h-3 mr-1" />On Track</Badge>
      case 'ahead':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200"><CheckCircle className="w-3 h-3 mr-1" />Ahead</Badge>
      case 'delayed':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" />Delayed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const filteredData = mockData.filter(item => {
    const matchesSearch = item.project.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalProjects = filteredData.length
  const completedProjects = filteredData.filter(p => p.status === 'completed').length
  const delayedProjects = filteredData.filter(p => p.status === 'delayed').length
  const onTrackProjects = filteredData.filter(p => p.status === 'on-track').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Project Timeline</h1>
          <p className="text-muted-foreground">Track project schedules and completion status</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{totalProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold text-blue-600">{onTrackProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delayed</p>
                <p className="text-2xl font-bold text-red-600">{delayedProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-track">On Track</SelectItem>
                  <SelectItem value="ahead">Ahead</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Planned End</TableHead>
                <TableHead>Current End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Days Remaining</TableHead>
                <TableHead>Days Delayed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((project) => (
                <TableRow key={project.project}>
                  <TableCell className="font-medium">{project.project}</TableCell>
                  <TableCell>{project.startDate}</TableCell>
                  <TableCell>{project.plannedEnd}</TableCell>
                  <TableCell>{project.endDate}</TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            project.progress >= 80 ? 'bg-green-500' : 
                            project.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${project.daysRemaining <= 30 ? 'text-red-600' : 'text-green-600'}`}>
                      {project.daysRemaining}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${project.daysDelayed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {project.daysDelayed > 0 ? '+' : ''}{project.daysDelayed}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
