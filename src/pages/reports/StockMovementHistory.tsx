import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Search, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function StockMovementHistory() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [movementType, setMovementType] = useState('all')
  const [dateRange, setDateRange] = useState('7days')

  const mockData = [
    { id: 'MOV001', item: 'Cement Bags', itemId: 'ITM001', type: 'in', quantity: 100, from: 'Supplier A', to: 'Warehouse A', date: '2024-01-15', user: 'John Doe' },
    { id: 'MOV002', item: 'Steel Rods', itemId: 'ITM002', type: 'out', quantity: 25, from: 'Warehouse B', to: 'Project X', date: '2024-01-14', user: 'Jane Smith' },
    { id: 'MOV003', item: 'Paint White', itemId: 'ITM003', type: 'transfer', quantity: 50, from: 'Warehouse A', to: 'Warehouse B', date: '2024-01-14', user: 'Mike Johnson' },
    { id: 'MOV004', item: 'Electrical Wires', itemId: 'ITM004', type: 'in', quantity: 500, from: 'Supplier B', to: 'Warehouse C', date: '2024-01-13', user: 'Sarah Wilson' },
    { id: 'MOV005', item: 'PVC Pipes', itemId: 'ITM005', type: 'out', quantity: 20, from: 'Warehouse B', to: 'Project Y', date: '2024-01-13', user: 'Tom Brown' },
    { id: 'MOV006', item: 'Cement Bags', itemId: 'ITM001', type: 'out', quantity: 75, from: 'Warehouse A', to: 'Project Z', date: '2024-01-12', user: 'John Doe' },
  ]

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'in':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><TrendingUp className="w-3 h-3 mr-1" />Stock In</Badge>
      case 'out':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><TrendingDown className="w-3 h-3 mr-1" />Stock Out</Badge>
      case 'transfer':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Minus className="w-3 h-3 mr-1" />Transfer</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const filteredData = mockData.filter(movement => {
    const matchesSearch = movement.item.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         movement.itemId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = movementType === 'all' || movement.type === movementType
    return matchesSearch && matchesType
  })

  const totalMovements = filteredData.length
  const stockIn = filteredData.filter(m => m.type === 'in').length
  const stockOut = filteredData.filter(m => m.type === 'out').length
  const transfers = filteredData.filter(m => m.type === 'transfer').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Stock Movement History</h1>
          <p className="text-muted-foreground">Track all inventory movements and transfers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Movements</p>
                <p className="text-2xl font-bold">{totalMovements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock In</p>
                <p className="text-2xl font-bold text-green-600">{stockIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Out</p>
                <p className="text-2xl font-bold text-red-600">{stockOut}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Minus className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transfers</p>
                <p className="text-2xl font-bold text-blue-600">{transfers}</p>
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
              <Select value={movementType} onValueChange={setMovementType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Movement Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="in">Stock In</SelectItem>
                  <SelectItem value="out">Stock Out</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
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
                <TableHead>Movement ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">{movement.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{movement.item}</div>
                      <div className="text-sm text-muted-foreground">{movement.itemId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getMovementBadge(movement.type)}</TableCell>
                  <TableCell className="font-medium">{movement.quantity}</TableCell>
                  <TableCell>{movement.from}</TableCell>
                  <TableCell>{movement.to}</TableCell>
                  <TableCell>{movement.date}</TableCell>
                  <TableCell>{movement.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
