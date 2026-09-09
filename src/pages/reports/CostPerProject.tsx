import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Search, DollarSign, TrendingUp, BarChart3, Package } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettings } from '@/context/SettingsContext'

export default function CostPerProject() {
  const navigate = useNavigate()
  const { currency: systemCurrency } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const mockData = [
    { project: 'Project X', category: 'Construction', totalCost: 285000, materialCost: 142500, laborCost: 95000, equipmentCost: 30000, otherCost: 17500, status: 'active', progress: 65 },
    { project: 'Project Y', category: 'Renovation', totalCost: 156000, materialCost: 78000, laborCost: 46800, equipmentCost: 20000, otherCost: 11200, status: 'active', progress: 40 },
    { project: 'Project Z', category: 'Extension', totalCost: 198000, materialCost: 99000, laborCost: 59400, equipmentCost: 25000, otherCost: 14600, status: 'active', progress: 55 },
    { project: 'Project A', category: 'Maintenance', totalCost: 45000, materialCost: 18000, laborCost: 18000, equipmentCost: 5000, otherCost: 4000, status: 'completed', progress: 100 },
    { project: 'Project B', category: 'Construction', totalCost: 320000, materialCost: 160000, laborCost: 96000, equipmentCost: 40000, otherCost: 24000, status: 'planning', progress: 10 },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
      case 'planning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Planning</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const filteredData = mockData.filter(item => {
    const matchesSearch = item.project.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalProjectCost = filteredData.reduce((sum, item) => sum + item.totalCost, 0)
  const totalMaterialCost = filteredData.reduce((sum, item) => sum + item.materialCost, 0)
  const totalLaborCost = filteredData.reduce((sum, item) => sum + item.laborCost, 0)
  const totalEquipmentCost = filteredData.reduce((sum, item) => sum + item.equipmentCost, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: systemCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Cost Per Project</h1>
          <p className="text-muted-foreground">Detailed cost breakdown for each project</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(totalProjectCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Materials</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalMaterialCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Labor</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalLaborCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Equipment</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalEquipmentCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold text-emerald-600">{filteredData.length}</p>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
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
                <TableHead>Category</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Materials</TableHead>
                <TableHead>Labor</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Other</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((project) => (
                <TableRow key={project.project}>
                  <TableCell className="font-medium">{project.project}</TableCell>
                  <TableCell>{project.category}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(project.totalCost)}</TableCell>
                  <TableCell>{formatCurrency(project.materialCost)}</TableCell>
                  <TableCell>{formatCurrency(project.laborCost)}</TableCell>
                  <TableCell>{formatCurrency(project.equipmentCost)}</TableCell>
                  <TableCell>{formatCurrency(project.otherCost)}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
