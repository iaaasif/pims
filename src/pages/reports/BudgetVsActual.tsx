import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Search, DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettings } from '@/context/SettingsContext'

export default function BudgetVsActual() {
  const navigate = useNavigate()
  const { currency: systemCurrency } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const mockData = [
    { project: 'Project X', category: 'Construction', budget: 150000, actual: 142500, variance: -7500, variancePercent: -5.0, status: 'under' },
    { project: 'Project Y', category: 'Renovation', budget: 85000, actual: 92000, variance: 7000, variancePercent: 8.2, status: 'over' },
    { project: 'Project Z', category: 'Extension', budget: 120000, actual: 118000, variance: -2000, variancePercent: -1.7, status: 'under' },
    { project: 'Project A', category: 'Maintenance', budget: 45000, actual: 45000, variance: 0, variancePercent: 0.0, status: 'on' },
    { project: 'Project B', category: 'Construction', budget: 200000, actual: 185000, variance: -15000, variancePercent: -7.5, status: 'under' },
    { project: 'Project C', category: 'Renovation', budget: 75000, actual: 82000, variance: 7000, variancePercent: 9.3, status: 'over' },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'under':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><TrendingDown className="w-3 h-3 mr-1" />Under Budget</Badge>
      case 'over':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><TrendingUp className="w-3 h-3 mr-1" />Over Budget</Badge>
      case 'on':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">On Budget</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const filteredData = mockData.filter(item => {
    const matchesSearch = item.project.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = projectFilter === 'all' || item.project === projectFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesProject && matchesStatus
  })

  const totalBudget = filteredData.reduce((sum, item) => sum + item.budget, 0)
  const totalActual = filteredData.reduce((sum, item) => sum + item.actual, 0)
  const totalVariance = totalActual - totalBudget
  const totalVariancePercent = totalBudget > 0 ? (totalVariance / totalBudget) * 100 : 0

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
          <h1 className="text-2xl font-bold">Budget vs Actual</h1>
          <p className="text-muted-foreground">Compare planned budgets with actual spending across projects</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Actual</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalActual)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Variance</p>
                <p className={`text-2xl font-bold ${totalVariance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Variance %</p>
                <p className={`text-2xl font-bold ${totalVariancePercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {totalVariancePercent >= 0 ? '+' : ''}{totalVariancePercent.toFixed(1)}%
                </p>
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
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {mockData.map(item => (
                    <SelectItem key={item.project} value={item.project}>{item.project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="under">Under Budget</SelectItem>
                  <SelectItem value="over">Over Budget</SelectItem>
                  <SelectItem value="on">On Budget</SelectItem>
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
                <TableHead>Budget</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Variance %</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.project}>
                  <TableCell className="font-medium">{item.project}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(item.budget)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(item.actual)}</TableCell>
                  <TableCell className={`font-medium ${item.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
                  </TableCell>
                  <TableCell className={`font-medium ${item.variancePercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {item.variancePercent >= 0 ? '+' : ''}{item.variancePercent.toFixed(1)}%
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
