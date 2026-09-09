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

export default function BudgetVariance() {
  const navigate = useNavigate()
  const { currency: systemCurrency } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const mockData = [
    { category: 'Materials', budgeted: 500000, actual: 485000, variance: -15000, variancePercent: -3.0, status: 'favorable' },
    { category: 'Labor', budgeted: 300000, actual: 325000, variance: 25000, variancePercent: 8.3, status: 'unfavorable' },
    { category: 'Equipment', budgeted: 150000, actual: 142000, variance: -8000, variancePercent: -5.3, status: 'favorable' },
    { category: 'Transportation', budgeted: 80000, actual: 92000, variance: 12000, variancePercent: 15.0, status: 'unfavorable' },
    { category: 'Utilities', budgeted: 50000, actual: 48000, variance: -2000, variancePercent: -4.0, status: 'favorable' },
    { category: 'Miscellaneous', budgeted: 70000, actual: 75000, variance: 5000, variancePercent: 7.1, status: 'unfavorable' },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'favorable':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><TrendingDown className="w-3 h-3 mr-1" />Favorable</Badge>
      case 'unfavorable':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><TrendingUp className="w-3 h-3 mr-1" />Unfavorable</Badge>
      default:
        return <Badge variant="secondary">Neutral</Badge>
    }
  }

  const filteredData = mockData.filter(item => {
    const matchesSearch = item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalBudgeted = filteredData.reduce((sum, item) => sum + item.budgeted, 0)
  const totalActual = filteredData.reduce((sum, item) => sum + item.actual, 0)
  const totalVariance = totalActual - totalBudgeted
  const totalVariancePercent = totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0

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
          <h1 className="text-2xl font-bold">Budget Variance</h1>
          <p className="text-muted-foreground">Analyze budget deviations across expense categories</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budgeted</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</p>
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
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {mockData.map(item => (
                    <SelectItem key={item.category} value={item.category}>{item.category}</SelectItem>
                  ))}
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
                <TableHead>Category</TableHead>
                <TableHead>Budgeted</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Variance %</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(item.budgeted)}</TableCell>
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
