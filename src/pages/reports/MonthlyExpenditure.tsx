import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Search, DollarSign, TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettings } from '@/context/SettingsContext'

export default function MonthlyExpenditure() {
  const navigate = useNavigate()
  const { currency: systemCurrency } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('2024-01')

  const mockData = [
    { month: '2024-01', category: 'Construction Materials', amount: 45000, transactions: 23, trend: 'up', change: 12.5 },
    { month: '2024-01', category: 'Labor Costs', amount: 32000, transactions: 45, trend: 'up', change: 8.3 },
    { month: '2024-01', category: 'Equipment Rental', amount: 12000, transactions: 8, trend: 'down', change: -5.2 },
    { month: '2024-01', category: 'Transportation', amount: 8500, transactions: 15, trend: 'up', change: 3.7 },
    { month: '2024-01', category: 'Office Supplies', amount: 3200, transactions: 12, trend: 'down', change: -2.1 },
    { month: '2024-01', category: 'Utilities', amount: 5800, transactions: 6, trend: 'up', change: 1.8 },
  ]

  const filteredData = mockData.filter(item => {
    const matchesSearch = item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesMonth = monthFilter === 'all' || item.month === monthFilter
    return matchesSearch && matchesCategory && matchesMonth
  })

  const totalExpenditure = filteredData.reduce((sum, item) => sum + item.amount, 0)
  const totalTransactions = filteredData.reduce((sum, item) => sum + item.transactions, 0)
  const avgTransactionValue = totalExpenditure / totalTransactions

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
          <h1 className="text-2xl font-bold">Monthly Expenditure</h1>
          <p className="text-muted-foreground">Track monthly spending patterns and trends</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenditure</p>
                <p className="text-2xl font-bold">{formatCurrency(totalExpenditure)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold text-green-600">{totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Transaction</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(avgTransactionValue)}</p>
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
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-01">January 2024</SelectItem>
                  <SelectItem value="2023-12">December 2023</SelectItem>
                  <SelectItem value="2023-11">November 2023</SelectItem>
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
                <TableHead>Amount</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Avg per Transaction</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Change %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={`${item.category}-${index}`}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(item.amount)}</TableCell>
                  <TableCell>{item.transactions}</TableCell>
                  <TableCell>{formatCurrency(item.amount / item.transactions)}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
