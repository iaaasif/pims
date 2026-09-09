import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Search, Package, TrendingUp, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettings } from '@/context/SettingsContext'

export default function ProjectMaterialUsage() {
  const navigate = useNavigate()
  const { currency: systemCurrency } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [dateRange, setDateRange] = useState('30days')

  const mockData = [
    { project: 'Project X', material: 'Cement Bags', category: 'Construction', planned: 500, used: 450, remaining: 50, unit: 'bags', costPerUnit: 12.50, totalCost: 5625 },
    { project: 'Project X', material: 'Steel Rods', category: 'Construction', planned: 100, used: 85, remaining: 15, unit: 'tons', costPerUnit: 850.00, totalCost: 72250 },
    { project: 'Project Y', material: 'Paint White', category: 'Finishing', planned: 150, used: 120, remaining: 30, unit: 'liters', costPerUnit: 25.00, totalCost: 3000 },
    { project: 'Project Y', material: 'Electrical Wires', category: 'Electrical', planned: 3000, used: 2500, remaining: 500, unit: 'meters', costPerUnit: 2.50, totalCost: 6250 },
    { project: 'Project Z', material: 'PVC Pipes', category: 'Plumbing', planned: 60, used: 45, remaining: 15, unit: 'pieces', costPerUnit: 45.00, totalCost: 2025 },
    { project: 'Project Z', material: 'Ceramic Tiles', category: 'Finishing', planned: 500, used: 450, remaining: 50, unit: 'sqm', costPerUnit: 8.00, totalCost: 3600 },
  ]

  const filteredData = mockData.filter(item => {
    const matchesSearch = item.material.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.project.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = projectFilter === 'all' || item.project === projectFilter
    return matchesSearch && matchesProject
  })

  const totalMaterials = filteredData.length
  const totalPlanned = filteredData.reduce((sum, item) => sum + item.planned, 0)
  const totalUsed = filteredData.reduce((sum, item) => sum + item.used, 0)
  const totalRemaining = filteredData.reduce((sum, item) => sum + item.remaining, 0)
  const totalCost = filteredData.reduce((sum, item) => sum + item.totalCost, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: systemCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getUsagePercentage = (used: number, planned: number) => {
    return Math.round((used / planned) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Project Material Usage</h1>
          <p className="text-muted-foreground">Track material consumption across all projects</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Materials</p>
                <p className="text-2xl font-bold">{totalMaterials}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Planned</p>
                <p className="text-2xl font-bold text-green-600">{totalPlanned.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Used</p>
                <p className="text-2xl font-bold text-orange-600">{totalUsed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Remaining</p>
                <p className="text-2xl font-bold text-purple-600">{totalRemaining.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalCost)}</p>
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
                  placeholder="Search materials or projects..."
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
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
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
                <TableHead>Material</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Planned</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Usage %</TableHead>
                <TableHead>Cost/Unit</TableHead>
                <TableHead>Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => {
                const usagePercentage = getUsagePercentage(item.used, item.planned)
                return (
                  <TableRow key={`${item.project}-${item.material}-${index}`}>
                    <TableCell className="font-medium">{item.project}</TableCell>
                    <TableCell className="font-medium">{item.material}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.planned}</span>
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
                            className={`h-2 rounded-full ${
                              usagePercentage >= 90 ? 'bg-red-500' : 
                              usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${usagePercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{usagePercentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.costPerUnit)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(item.totalCost)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
