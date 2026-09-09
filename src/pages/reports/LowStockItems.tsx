import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Search, AlertTriangle, Package, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
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
  created_at?: string
}

interface Location {
  id: string
  name: string
}

export default function LowStockItems() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [materials, setMaterials] = useState<Material[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      const [materialsData, locationsData] = await Promise.all([
        supabase.from('materials').select('*'),
        supabase.from('locations').select('*')
      ])

      if (materialsData.error) throw materialsData.error
      if (locationsData.error) throw locationsData.error

      setMaterials(materialsData.data || [])
      setLocations(locationsData.data || [])
    } catch (error) {
      console.error('Error fetching low stock data:', error)
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
        <LoadingSpinner text="Loading low stock items..." />
      </div>
    )
  }

  const getUrgencyBadge = (quantity: number, minLevel: number) => {
    const percentage = (quantity / minLevel) * 100
    if (percentage <= 20) {
      return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" />Critical</Badge>
    } else if (percentage <= 50) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200"><AlertTriangle className="w-3 h-3 mr-1" />High</Badge>
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Medium</Badge>
    }
  }

  const getStockPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100)
  }

  const filteredMaterials = materials.filter(material => {
    const quantity = material.quantity || 0
    const minLevel = material.min_level || 0
    const isLowStock = quantity < minLevel

    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === 'all' || material.location_id === locationFilter

    let matchesUrgency = urgencyFilter === 'all'
    const percentage = (quantity / minLevel) * 100
    if (urgencyFilter === 'critical') matchesUrgency = percentage <= 20
    if (urgencyFilter === 'high') matchesUrgency = percentage <= 50
    if (urgencyFilter === 'medium') matchesUrgency = percentage > 50 && percentage <= 100

    return isLowStock && matchesSearch && matchesLocation && matchesUrgency
  })

  const totalItems = filteredMaterials.length
  const criticalItems = filteredMaterials.filter(m => {
    const quantity = m.quantity || 0
    const minLevel = m.min_level || 0
    const percentage = (quantity / minLevel) * 100
    return percentage <= 20
  }).length
  const highItems = filteredMaterials.filter(m => {
    const quantity = m.quantity || 0
    const minLevel = m.min_level || 0
    const percentage = (quantity / minLevel) * 100
    return percentage > 20 && percentage <= 50
  }).length
  const mediumItems = filteredMaterials.filter(m => {
    const quantity = m.quantity || 0
    const minLevel = m.min_level || 0
    const percentage = (quantity / minLevel) * 100
    return percentage > 50 && percentage <= 100
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Low Stock Items</h1>
          <p className="text-muted-foreground">Items that need immediate restocking attention</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Low Stock</p>
                <p className="text-2xl font-bold">{totalItems}</p>
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{highItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medium Priority</p>
                <p className="text-2xl font-bold text-yellow-600">{mediumItems}</p>
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
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Urgency Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
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
                <TableHead>Item ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Min/Max</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead>Supplier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.map((material) => {
                const quantity = material.quantity || 0
                const minLevel = material.min_level || 0
                const maxLevel = material.max_level || 0
                const percentage = getStockPercentage(quantity, maxLevel)
                const location = locations.find(loc => loc.id === material.location_id)

                return (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.id}</TableCell>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{material.category || 'N/A'}</TableCell>
                    <TableCell>{location?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{quantity}</span>
                          <span className="text-muted-foreground text-sm">{material.unit || 'units'}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="text-xs text-muted-foreground">{percentage}% of max</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Min: {minLevel}</div>
                        <div>Max: {maxLevel}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getUrgencyBadge(quantity, minLevel)}</TableCell>
                    <TableCell>{material.created_at ? new Date(material.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>N/A</TableCell>
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
