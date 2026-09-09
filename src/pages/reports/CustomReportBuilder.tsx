import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Plus, Trash2, TrendingUp, BarChart3, PieChart, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

interface ReportField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage'
  category: string
  selected: boolean
}

interface FilterCondition {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between'
  value: string
  value2?: string
}

export default function CustomReportBuilder() {
  const navigate = useNavigate()
  const [reportName, setReportName] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [selectedDataSource, setSelectedDataSource] = useState('inventory')
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [filters, setFilters] = useState<FilterCondition[]>([])
  const [groupBy, setGroupBy] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [chartType, setChartType] = useState<'table' | 'bar' | 'pie' | 'line'>('table')

  const availableFields: ReportField[] = [
    // Inventory fields
    { id: 'item_id', name: 'Item ID', type: 'text', category: 'inventory', selected: false },
    { id: 'item_name', name: 'Item Name', type: 'text', category: 'inventory', selected: false },
    { id: 'category', name: 'Category', type: 'text', category: 'inventory', selected: false },
    { id: 'quantity', name: 'Quantity', type: 'number', category: 'inventory', selected: false },
    { id: 'unit_cost', name: 'Unit Cost', type: 'currency', category: 'inventory', selected: false },
    { id: 'total_value', name: 'Total Value', type: 'currency', category: 'inventory', selected: false },
    { id: 'location', name: 'Location', type: 'text', category: 'inventory', selected: false },
    { id: 'last_updated', name: 'Last Updated', type: 'date', category: 'inventory', selected: false },

    // Project fields
    { id: 'project_name', name: 'Project Name', type: 'text', category: 'projects', selected: false },
    { id: 'project_status', name: 'Project Status', type: 'text', category: 'projects', selected: false },
    { id: 'budget', name: 'Budget', type: 'currency', category: 'projects', selected: false },
    { id: 'actual_cost', name: 'Actual Cost', type: 'currency', category: 'projects', selected: false },
    { id: 'start_date', name: 'Start Date', type: 'date', category: 'projects', selected: false },
    { id: 'end_date', name: 'End Date', type: 'date', category: 'projects', selected: false },
    { id: 'progress', name: 'Progress', type: 'percentage', category: 'projects', selected: false },

    // Vendor fields
    { id: 'vendor_name', name: 'Vendor Name', type: 'text', category: 'vendors', selected: false },
    { id: 'vendor_category', name: 'Vendor Category', type: 'text', category: 'vendors', selected: false },
    { id: 'total_orders', name: 'Total Orders', type: 'number', category: 'vendors', selected: false },
    { id: 'total_spent', name: 'Total Spent', type: 'currency', category: 'vendors', selected: false },
    { id: 'on_time_delivery', name: 'On-Time Delivery', type: 'percentage', category: 'vendors', selected: false },
    { id: 'quality_score', name: 'Quality Score', type: 'number', category: 'vendors', selected: false },
  ]

  const filteredFields = availableFields.filter(field => field.category === selectedDataSource)

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: ''
    }
    setFilters([...filters, newFilter])
  }

  const removeFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId))
  }

  const updateFilter = (filterId: string, updates: Partial<FilterCondition>) => {
    setFilters(filters.map(f =>
      f.id === filterId ? { ...f, ...updates } : f
    ))
  }

  const generateReport = () => {
    // In a real app, this would call an API to generate the report
    console.log('Generating report with:', {
      name: reportName,
      description: reportDescription,
      dataSource: selectedDataSource,
      fields: selectedFields,
      filters,
      groupBy,
      sortBy,
      sortOrder,
      chartType
    })

    // Navigate to a preview page or show the generated report
    alert('Custom report generated successfully! (This would show the actual report in production)')
  }

  const mockData = [
    { item_id: 'ITM001', item_name: 'Cement Bags', category: 'Construction', quantity: 450, unit_cost: 12.50, total_value: 5625, location: 'Warehouse A' },
    { item_id: 'ITM002', item_name: 'Steel Rods', category: 'Construction', quantity: 85, unit_cost: 850.00, total_value: 72250, location: 'Warehouse B' },
    { item_id: 'ITM003', item_name: 'Paint White', category: 'Finishing', quantity: 120, unit_cost: 25.00, total_value: 3000, location: 'Warehouse A' },
  ]

  const formatValue = (value: any, type: string) => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
      case 'percentage':
        return `${value}%`
      case 'date':
        return new Date(value).toLocaleDateString()
      default:
        return value
    }
  }

  const selectedFieldsData = filteredFields.filter(f => selectedFields.includes(f.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Custom Report Builder</h1>
          <p className="text-muted-foreground">Create personalized reports with custom parameters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Report Name</label>
                <Input
                  placeholder="Enter report name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe your custom report"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Source */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Source</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="vendors">Vendors</SelectItem>
                  <SelectItem value="procurement">Procurement</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Field Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                  <label htmlFor={field.id} className="text-sm font-medium cursor-pointer">
                    {field.name}
                  </label>
                  <Badge variant="outline" className="text-xs">
                    {field.type}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filters</CardTitle>
                <Button size="sm" onClick={addFilter}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filters.map((filter) => (
                <div key={filter.id} className="flex items-center gap-2 p-3 border rounded-lg">
                  <Select value={filter.field} onValueChange={(value) => updateFilter(filter.id, { field: value })}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredFields.map(field => (
                        <SelectItem key={field.id} value={field.id}>{field.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filter.operator} onValueChange={(value: any) => updateFilter(filter.id, { operator: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                      <SelectItem value="between">Between</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Value"
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    className="flex-1"
                  />

                  <Button variant="ghost" size="sm" onClick={() => removeFilter(filter.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Display Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Display Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Chart Type</label>
                <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Group By</label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {filteredFields.map(field => (
                      <SelectItem key={field.id} value={field.id}>{field.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Sort By</label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {selectedFieldsData.map(field => (
                        <SelectItem key={field.id} value={field.id}>{field.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">ASC</SelectItem>
                      <SelectItem value="desc">DESC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Report Preview</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button onClick={generateReport} disabled={!reportName || selectedFields.length === 0}>
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedFields.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select fields to preview your report</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Chart Type Indicator */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {chartType === 'table' && <Filter className="h-3 w-3 mr-1" />}
                      {chartType === 'bar' && <BarChart3 className="h-3 w-3 mr-1" />}
                      {chartType === 'pie' && <PieChart className="h-3 w-3 mr-1" />}
                      {chartType === 'line' && <TrendingUp className="h-3 w-3 mr-1" />}
                      {chartType.charAt(0).toUpperCase() + chartType.slice(1)} View
                    </Badge>
                    {selectedFields.length > 0 && (
                      <Badge variant="outline">
                        {selectedFields.length} fields selected
                      </Badge>
                    )}
                  </div>

                  {/* Data Table Preview */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {selectedFieldsData.map((field) => (
                            <TableHead key={field.id}>{field.name}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockData.map((row, index) => (
                          <TableRow key={index}>
                            {selectedFieldsData.map((field) => (
                              <TableCell key={field.id}>
                                {formatValue(row[field.id as keyof typeof row], field.type)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Sample Chart Preview */}
                  {chartType !== 'table' && (
                    <div className="bg-muted/50 rounded-lg p-8 text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart would be displayed here
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
