import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Search, DollarSign, TrendingUp, PieChart, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettings } from '@/context/SettingsContext'

export default function SpendAnalysis() {
  const navigate = useNavigate()
  const { currency: systemCurrency } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateRange, setDateRange] = useState('90days')

  const mockData = [
    { category: 'Construction Materials', totalSpent: 285000, percentage: 35.2, trend: 'up', change: 12.5, orders: 145 },
    { category: 'Electrical Components', totalSpent: 156000, percentage: 19.3, trend: 'up', change: 8.3, orders: 89 },
    { category: 'Plumbing Supplies', totalSpent: 123000, percentage: 15.2, trend: 'down', change: -3.2, orders: 67 },
    { category: 'Safety Equipment', totalSpent: 98000, percentage: 12.1, trend: 'up', change: 5.7, orders: 45 },
    { category: 'Office Supplies', totalSpent: 76000, percentage: 9.4, trend: 'down', change: -1.8, orders: 78 },
    { category: 'Tools & Equipment', totalSpent: 72000, percentage: 8.8, trend: 'up', change: 15.2, orders: 34 },
  ]

  const filteredData = mockData.filter(item => {
    const matchesSearch = item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalSpend = filteredData.reduce((sum, item) => sum + item.totalSpent, 0)
  const totalOrders = filteredData.reduce((sum, item) => sum + item.orders, 0)
  const avgOrderValue = totalSpend / totalOrders

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
          <h1 className="text-2xl font-bold">Spend Analysis</h1>
          <p className="text-muted-foreground">Detailed breakdown of procurement spending by category</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSpend)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-green-600">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(avgOrderValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
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
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
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
                <TableHead>Total Spent</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Avg Order Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(item.totalSpent)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm">{item.percentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {item.trend === 'up' ?
                        <TrendingUp className="w-4 h-4 text-green-500" /> :
                        <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                      }
                      <span className="text-sm">{item.trend === 'up' ? 'Increasing' : 'Decreasing'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change}%
                    </span>
                  </TableCell>
                  <TableCell>{item.orders}</TableCell>
                  <TableCell>{formatCurrency(item.totalSpent / item.orders)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Categories:</span>
                <span className="ml-2 font-medium">{filteredData.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Spend:</span>
                <span className="ml-2 font-medium">{formatCurrency(totalSpend)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Orders:</span>
                <span className="ml-2 font-medium">{totalOrders}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Order Value:</span>
                <span className="ml-2 font-medium">{formatCurrency(avgOrderValue)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
