import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Search, Users, Package, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ResourceAllocation() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [resourceFilter, setResourceFilter] = useState('all')

  const mockData = [
    { project: 'Project X', resource: 'John Doe', type: 'Labor', allocated: 160, used: 145, remaining: 15, unit: 'hours', utilization: 91 },
    { project: 'Project X', resource: 'Cement Mixer', type: 'Equipment', allocated: 200, used: 180, remaining: 20, unit: 'hours', utilization: 90 },
    { project: 'Project Y', resource: 'Jane Smith', type: 'Labor', allocated: 120, used: 100, remaining: 20, unit: 'hours', utilization: 83 },
    { project: 'Project Y', resource: 'Scaffolding', type: 'Equipment', allocated: 150, used: 150, remaining: 0, unit: 'days', utilization: 100 },
    { project: 'Project Z', resource: 'Mike Johnson', type: 'Labor', allocated: 140, used: 120, remaining: 20, unit: 'hours', utilization: 86 },
    { project: 'Project Z', resource: 'Excavator', type: 'Equipment', allocated: 80, used: 60, remaining: 20, unit: 'hours', utilization: 75 },
  ]

  const getUtilizationBadge = (utilization: number) => {
    if (utilization >= 95) return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>
    if (utilization >= 80) return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>
    if (utilization >= 60) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
    return <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>
  }

  const filteredData = mockData.filter(item => {
    const matchesSearch = item.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.project.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = projectFilter === 'all' || item.project === projectFilter
    const matchesResource = resourceFilter === 'all' || item.type === resourceFilter
    return matchesSearch && matchesProject && matchesResource
  })

  const totalResources = filteredData.length
  const laborResources = filteredData.filter(r => r.type === 'Labor').length
  const equipmentResources = filteredData.filter(r => r.type === 'Equipment').length
  const avgUtilization = filteredData.reduce((sum, r) => sum + r.utilization, 0) / totalResources

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Resource Allocation</h1>
          <p className="text-muted-foreground">Track resource utilization across all projects</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Resources</p>
                <p className="text-2xl font-bold">{totalResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Labor</p>
                <p className="text-2xl font-bold text-green-600">{laborResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Equipment</p>
                <p className="text-2xl font-bold text-orange-600">{equipmentResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Utilization</p>
                <p className="text-2xl font-bold text-purple-600">{avgUtilization.toFixed(1)}%</p>
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
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="Project X">Project X</SelectItem>
                  <SelectItem value="Project Y">Project Y</SelectItem>
                  <SelectItem value="Project Z">Project Z</SelectItem>
                </SelectContent>
              </Select>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Labor">Labor</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
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
                <TableHead>Resource</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Allocated</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={`${item.project}-${item.resource}-${index}`}>
                  <TableCell className="font-medium">{item.project}</TableCell>
                  <TableCell className="font-medium">{item.resource}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.allocated}</span>
                      <span className="text-muted-foreground text-sm">{item.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.used}</span>
                      <span className="text-muted-foreground text-sm">{item.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.remaining}</span>
                      <span className="text-muted-foreground text-sm">{item.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.utilization >= 95 ? 'bg-red-500' :
                            item.utilization >= 80 ? 'bg-orange-500' :
                              item.utilization >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          style={{ width: `${item.utilization}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{item.utilization}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getUtilizationBadge(item.utilization)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
