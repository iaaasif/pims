import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Search, DollarSign, TrendingUp, PieChart, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettings } from '@/context/SettingsContext'

export default function InventoryValuation() {
  const navigate = useNavigate()
  const { currency: systemCurrency } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  const mockData = [
    { id: 'ITM001', name: 'Cement Bags', category: 'Construction', location: 'Warehouse A', quantity: 450, unitCost: 12.50, unitValue: 15.00, totalValue: 6750, unit: 'bags' },
    { id: 'ITM002', name: 'Steel Rods', category: 'Construction', location: 'Warehouse B', quantity: 85, unitCost: 850.00, unitValue: 950.00, totalValue: 80750, unit: 'tons' },
    { id: 'ITM003', name: 'Paint White', category: 'Finishing', location: 'Warehouse A', quantity: 120, unitCost: 25.00, unitValue: 32.00, totalValue: 3840, unit: 'liters' },
    { id: 'ITM004', name: 'Electrical Wires', category: 'Electrical', location: 'Warehouse C', quantity: 2500, unitCost: 2.50, unitValue: 3.20, totalValue: 8000, unit: 'meters' },
    { id: 'ITM005', name: 'PVC Pipes', category: 'Plumbing', location: 'Warehouse B', quantity: 45, unitCost: 45.00, unitValue: 55.00, totalValue: 2475, unit: 'pieces' },
    { id: 'ITM006', name: 'Ceramic Tiles', category: 'Finishing', location: 'Warehouse A', quantity: 450, unitCost: 8.00, unitValue: 12.00, totalValue: 5400, unit: 'sqm' },
  ]

  const filteredData = mockData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesLocation = locationFilter === 'all' || item.location === locationFilter
    return matchesSearch && matchesCategory && matchesLocation
  })

  const totalItems = filteredData.length
  const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0)
  const totalCost = filteredData.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
  const totalValue = filteredData.reduce((sum, item) => sum + item.totalValue, 0)
  const totalProfit = totalValue - totalCost

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: systemCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
          <h1 className="text-2xl font-bold">Inventory Valuation</h1>
          <p className="text-muted-foreground">Current value of all inventory across locations</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Quantity</p>
                <p className="text-2xl font-bold">{totalQuantity.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Profit</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalProfit)}</p>
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
                  placeholder="Search items..."
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
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Finishing">Finishing</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                  <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                  <SelectItem value="Warehouse C">Warehouse C</SelectItem>
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
                <TableHead>Item ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Unit Value</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Profit Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => {
                const itemCost = item.quantity * item.unitCost
                const itemProfit = item.totalValue - itemCost
                const profitMargin = ((itemProfit / itemCost) * 100).toFixed(1)
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.quantity}</span>
                        <span className="text-muted-foreground text-sm">{item.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.unitCost)}</TableCell>
                    <TableCell>{formatCurrency(item.unitValue)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(item.totalValue)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{profitMargin}%</div>
                        <div className="text-muted-foreground">{formatCurrency(itemProfit)}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {/* Summary Row */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Items:</span>
                <span className="ml-2 font-medium">{totalItems}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="ml-2 font-medium">{formatCurrency(totalCost)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Value:</span>
                <span className="ml-2 font-medium">{formatCurrency(totalValue)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Profit:</span>
                <span className="ml-2 font-medium text-emerald-600">{formatCurrency(totalProfit)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
