/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface DashboardStats {
    totalProjects: number
    totalLocations: number
    totalMaterials: number
    pendingPRs: number
    lowStockItems: number
}

export interface ActivityItem {
    id: string
    created_at: string
    description: string
    project_name?: string
    user_name?: string
    type: 'usage' | 'transfer'
}

export interface ChartData {
    name: string
    usage: number
    expense?: number
}

export interface CategoryDistribution {
    name: string
    value: number
    color: string
}

const CATEGORY_COLORS = [
    'var(--primary-color)', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#10b981', '#64748b'
]

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStats>({
        totalProjects: 0,
        totalLocations: 0,
        totalMaterials: 0,
        pendingPRs: 0,
        lowStockItems: 0,
    })
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
    const [chartData, setChartData] = useState<ChartData[]>([])
    const [categoryData, setCategoryData] = useState<CategoryDistribution[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchStats() {
        try {
            const [
                { count: projectsCount },
                { count: locationsCount },
                { count: materialsCount },
                { count: prsCount },
                { data: lowStockCount },
                { data: usageData },
                { data: chartUsageData },
                { data: materialsByCategory }
            ] = await Promise.all([
                supabase.from('projects').select('*', { count: 'exact', head: true }),
                supabase.from('locations').select('*', { count: 'exact', head: true }),
                supabase.from('materials').select('*', { count: 'exact', head: true }),
                supabase.from('purchase_requisitions').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
                supabase.rpc('count_low_stock'),
                supabase.from('material_usage')
                    .select(`
                        id, 
                        usage_date, 
                        purpose, 
                        quantity,
                        material:materials(name, unit),
                        project:projects(name),
                        user:profiles(full_name)
                    `)
                    .order('usage_date', { ascending: false })
                    .limit(5),
                supabase.from('material_usage')
                    .select('usage_date, quantity')
                    .gte('usage_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                    .order('usage_date', { ascending: true }),
                supabase.from('materials').select('category, current_stock')
            ])

            setStats({
                totalProjects: projectsCount || 0,
                totalLocations: locationsCount || 0,
                totalMaterials: materialsCount || 0,
                pendingPRs: prsCount || 0,
                lowStockItems: (lowStockCount as number) || 0,
            })

            // Map usage data to activity items
            const activities: ActivityItem[] = (usageData || []).map((item: any) => ({
                id: item.id,
                created_at: item.usage_date,
                description: `Used ${item.quantity} ${item.material?.unit} of ${item.material?.name}`,
                project_name: item.project?.name,
                user_name: item.user?.full_name,
                type: 'usage'
            }))

            // Process chart data - group by date/month and sum quantities
            const chartDataMap = new Map<string, number>()
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

                // Process usage trends (Last 30 days)
                ; (chartUsageData || []).forEach((item: any) => {
                    const dateStr = new Date(item.usage_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    const currentUsage = chartDataMap.get(dateStr) || 0
                    chartDataMap.set(dateStr, currentUsage + (item.quantity || 0))
                })

            const chartDataArray: ChartData[] = Array.from(chartDataMap.entries()).map(([name, usage]) => ({
                name,
                usage,
                expense: usage * 0.8 // Rough estimation since we don't have price history easily here
            })).slice(-9) // Last 9 data points for the bar chart

            // Process category distribution
            const categoryMap = new Map<string, number>()
                ; (materialsByCategory || []).forEach((item: any) => {
                    const cat = item.category || 'Other'
                    const current = categoryMap.get(cat) || 0
                    categoryMap.set(cat, current + (Number(item.current_stock) || 0))
                })

            const distributionArray: CategoryDistribution[] = Array.from(categoryMap.entries())
                .sort((a, b) => b[1] - a[1]) // Sort by quantity
                .slice(0, 6) // Top 6 categories
                .map(([name, value], index) => ({
                    name,
                    value,
                    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                }))

            setRecentActivity(activities)
            setChartData(chartDataArray)
            setCategoryData(distributionArray)

        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()

        const channels = supabase.channel('dashboard_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchStats)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, fetchStats)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, fetchStats)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_requisitions' }, fetchStats)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'material_usage' }, fetchStats)
            .subscribe()

        return () => {
            supabase.removeChannel(channels)
        }
    }, [])

    return { stats, recentActivity, chartData, categoryData, loading }
}

