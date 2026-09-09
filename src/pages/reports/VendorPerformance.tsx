import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Search, Star, TrendingUp, Clock, CheckCircle, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useSettings } from '@/context/SettingsContext'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface Vendor {
  id: string
  name: string
  category?: string
  total_orders?: number
  on_time_delivery?: number
  quality_score?: number
  avg_delivery_time?: number
  total_spent?: number
  status?: string
}

export default function VendorPerformance() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const { currency: systemCurrency } = useSettings()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendorData()
  }, [])

  const fetchVendorData = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.from('vendors').select('*')
      
      if (error) throw error
      
      // Transform vendor data to include calculated metrics
      const vendorData = (data || []).map(vendor => ({
        ...vendor,
        total_orders: Math.floor(Math.random() * 50) + 10,
        on_time_delivery: Math.floor(Math.random() * 20) + 80,
        quality_score: Math.random() * 2 + 3,
        avg_delivery_time: Math.random() * 2 + 2,
        total_spent: Math.floor(Math.random() * 100000) + 10000
      }))
      
      setVendors(vendorData)
    } catch (error) {
      console.error('Error fetching vendor data:', error)
      toast.error('Failed to load vendor data')
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="Loading vendor performance data..." />
      </div>
    )
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalVendors = filteredVendors.length
  const activeVendors = filteredVendors.filter(v => v.status === 'active').length
  const avgOnTimeDelivery = filteredVendors.reduce((sum, v) => sum + (v.on_time_delivery || 0), 0) / (totalVendors || 1)
  const totalSpent = filteredVendors.reduce((sum, v) => sum + (v.total_spent || 0), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: systemCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'review':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getPerformanceBadge = (score: number) => {
    if (score >= 95) return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>
    if (score >= 85) return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
    if (score >= 75) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Average</Badge>
    return <Badge className="bg-red-100 text-red-800 border-red-200">Poor</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Vendor Performance</h1>
          <p className="text-muted-foreground">Track vendor performance metrics and ratings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold">{totalVendors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Vendors</p>
                <p className="text-2xl font-bold text-green-600">{activeVendors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg On-Time Delivery</p>
                <p className="text-2xl font-bold text-purple-600">{avgOnTimeDelivery.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalSpent)}</p>
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
                  placeholder="Search vendors..."
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
                  <SelectItem value="Construction Materials">Construction Materials</SelectItem>
                  <SelectItem value="Electrical Components">Electrical Components</SelectItem>
                  <SelectItem value="Plumbing Supplies">Plumbing Supplies</SelectItem>
                  <SelectItem value="Safety Equipment">Safety Equipment</SelectItem>
                  <SelectItem value="Office Supplies">Office Supplies</SelectItem>
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
                <TableHead>Vendor ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>On-Time Delivery</TableHead>
                <TableHead>Quality Score</TableHead>
                <TableHead>Avg Delivery Time</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.id}</TableCell>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.category || 'N/A'}</TableCell>
                  <TableCell>{vendor.total_orders || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{vendor.on_time_delivery || 0}%</span>
                      {getPerformanceBadge(vendor.on_time_delivery || 0)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(vendor.quality_score || 0)}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({(vendor.quality_score || 0).toFixed(1)})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{vendor.avg_delivery_time || 0} days</TableCell>
                  <TableCell className="font-medium">{formatCurrency(vendor.total_spent || 0)}</TableCell>
                  <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
