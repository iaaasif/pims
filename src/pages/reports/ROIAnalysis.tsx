import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Search, DollarSign, TrendingUp, Target } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettings } from '@/context/SettingsContext'

export default function ROIAnalysis() {
  const navigate = useNavigate()
  const { currency: systemCurrency } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const mockData = [
    { project: 'Project X', investment: 285000, returns: 350000, netProfit: 65000, roi: 22.8, paybackPeriod: 18, status: 'completed', category: 'Construction' },
    { project: 'Project Y', investment: 156000, returns: 195000, netProfit: 39000, roi: 25.0, paybackPeriod: 14, status: 'completed', category: 'Renovation' },
    { project: 'Project Z', investment: 198000, returns: 245000, netProfit: 47000, roi: 23.7, paybackPeriod: 16, status: 'active', category: 'Extension' },
    { project: 'Project A', investment: 45000, returns: 52000, netProfit: 7000, roi: 15.6, paybackPeriod: 22, status: 'completed', category: 'Maintenance' },
    { project: 'Project B', investment: 320000, returns: 380000, netProfit: 60000, roi: 18.8, paybackPeriod: 20, status: 'active', category: 'Construction' },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
      case 'planned':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Planned</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getROIBadge = (roi: number) => {
    if (roi >= 25) return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>
    if (roi >= 20) return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
    if (roi >= 15) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Average</Badge>
    return <Badge className="bg-red-100 text-red-800 border-red-200">Poor</Badge>
  }

  const filteredData = mockData.filter(item => {
    const matchesSearch = item.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalInvestment = filteredData.reduce((sum, item) => sum + item.investment, 0)
  const totalReturns = filteredData.reduce((sum, item) => sum + item.returns, 0)
  const totalProfit = filteredData.reduce((sum, item) => sum + item.netProfit, 0)
  const avgROI = filteredData.reduce((sum, item) => sum + item.roi, 0) / filteredData.length

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
          <h1 className="text-2xl font-bold">ROI Analysis</h1>
          <p className="text-muted-foreground">Return on investment analysis for all projects</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInvestment)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Returns</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReturns)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalProfit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg ROI</p>
                <p className="text-2xl font-bold text-emerald-600">{avgROI.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold text-orange-600">{filteredData.length}</p>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
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
                <TableHead>Investment</TableHead>
                <TableHead>Returns</TableHead>
                <TableHead>Net Profit</TableHead>
                <TableHead>ROI %</TableHead>
                <TableHead>Payback Period</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((project) => (
                <TableRow key={project.project}>
                  <TableCell className="font-medium">{project.project}</TableCell>
                  <TableCell>{project.category}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(project.investment)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(project.returns)}</TableCell>
                  <TableCell className="font-medium text-green-600">{formatCurrency(project.netProfit)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{project.roi}%</div>
                      {getROIBadge(project.roi)}
                    </div>
                  </TableCell>
                  <TableCell>{project.paybackPeriod} months</TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
