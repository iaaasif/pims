import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Search, Package, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface Material {
  id: string
  name: string
  quantity?: number
  min_level?: number
  max_level?: number
  unit?: string
  category?: string
  location_id?: string
}

interface Location {
  id: string
  name: string
}

export default function CurrentStockStatus() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [materials, setMaterials] = useState<Material[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch materials and locations from database
      const [materialsData, locationsData] = await Promise.all([
        supabase.from('materials').select('*'),
        supabase.from('locations').select('*')
      ])

      if (materialsData.error) throw materialsData.error
      if (locationsData.error) throw locationsData.error

      setMaterials(materialsData.data || [])
      setLocations(locationsData.data || [])
    } catch (error) {
      console.error('Error fetching stock data:', error)
      toast.error('Failed to load stock data')
      setMaterials([])
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="Loading stock data..." />
      </div>
    )
  }

  const getStatusBadge = (quantity: number, minLevel: number, maxLevel: number) => {
    if (quantity <= minLevel * 0.2) {
      return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" />Critical</Badge>
    } else if (quantity < minLevel) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" />Low</Badge>
    } else if (quantity > maxLevel) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200"><AlertTriangle className="w-3 h-3 mr-1" />Overstock</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Optimal</Badge>
    }
  }

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === 'all' || material.location_id === locationFilter
    const quantity = material.quantity || 0
    const minLevel = material.min_level || 0
    const maxLevel = material.max_level || 0
    
    let matchesStatus = statusFilter === 'all'
    if (statusFilter === 'optimal') matchesStatus = quantity >= minLevel && quantity <= maxLevel
    if (statusFilter === 'low') matchesStatus = quantity < minLevel && quantity > minLevel * 0.2
    if (statusFilter === 'critical') matchesStatus = quantity <= minLevel * 0.2
    if (statusFilter === 'overstock') matchesStatus = quantity > maxLevel
    
    return matchesSearch && matchesLocation && matchesStatus
  })

  const totalItems = filteredMaterials.length
  const optimalItems = filteredMaterials.filter(m => {
    const quantity = m.quantity || 0
    const minLevel = m.min_level || 0
    const maxLevel = m.max_level || 0
    return quantity >= minLevel && quantity <= maxLevel
  }).length
  const lowItems = filteredMaterials.filter(m => {
    const quantity = m.quantity || 0
    const minLevel = m.min_level || 0
    return quantity < minLevel && quantity > minLevel * 0.2
  }).length
  const criticalItems = filteredMaterials.filter(m => {
    const quantity = m.quantity || 0
    const minLevel = m.min_level || 0
    return quantity <= minLevel * 0.2
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Current Stock Status</h1>
          <p className="text-muted-foreground">Real-time inventory levels across all locations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
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
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Optimal</p>
                <p className="text-2xl font-bold text-green-600">{optimalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{lowItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalItems}</p>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="optimal">Optimal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
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
                <TableHead>Status</TableHead>
                <TableHead>Min/Max Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.map((material) => {
                const quantity = material.quantity || 0
                const minLevel = material.min_level || 0
                const maxLevel = material.max_level || 0
                const location = locations.find(loc => loc.id === material.location_id)
                
                return (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.id}</TableCell>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>{material.category || 'N/A'}</TableCell>
                    <TableCell>{location?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{quantity}</span>
                        <span className="text-muted-foreground text-sm">{material.unit || 'units'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(quantity, minLevel, maxLevel)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Min: {minLevel}</div>
                        <div>Max: {maxLevel}</div>
                      </div>
                    </TableCell>
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
