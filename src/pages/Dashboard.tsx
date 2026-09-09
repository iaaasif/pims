import {
    TrendingUp,
    TrendingDown,
    Building2,
    Package,
    FileText,
    MoreHorizontal,
    MapPin,
    ChevronDown,
    Camera,
    Plus,
    Edit3,
    Settings,
} from 'lucide-react'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { PremiumAvatar } from '@/components/ui/PremiumAvatar'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatsDonutChart } from '@/components/charts/StatsDonutChart'
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart'
import { TrendAreaChart } from '@/components/charts/TrendAreaChart'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Dashboard() {
    const { stats, recentActivity, chartData, categoryData, loading } = useDashboardStats()

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const statCards = [
        {
            title: 'Total Projects',
            value: stats.totalProjects.toString(),
            trend: '+1.78%',
            isPositive: true,
            icon: <Building2 className="h-4 w-4" />,
            color: 'text-primary'
        },
        {
            title: 'Locations',
            value: stats.totalLocations.toString(),
            trend: '+2.45%',
            isPositive: true,
            icon: <MapPin className="h-4 w-4" />,
            color: 'text-primary'
        },
        {
            title: 'Total Materials',
            value: stats.totalMaterials.toString(),
            trend: stats.lowStockItems > 0 ? `-${stats.lowStockItems} low` : 'Healthy',
            isPositive: stats.lowStockItems === 0,
            icon: <Package className="h-4 w-4" />,
            color: 'text-orange-500'
        },
        {
            title: 'Pending PRs',
            value: stats.pendingPRs.toString(),
            trend: '+1.24%',
            isPositive: true,
            icon: <FileText className="h-4 w-4" />,
            color: 'text-purple-500'
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner text="Synchronizing PIMS data..." />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">{today}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-accent ring-1 ring-border shadow-sm">Export Data</Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold">View Reports</Button>
                </div>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="bg-card/50 backdrop-blur-sm border-border overflow-hidden relative group hover:border-primary/30 transition-all duration-300 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                {stat.title}
                            </CardTitle>
                            <div className={cn("p-1 sm:p-1.5 rounded-lg bg-background/80 shadow-sm border border-border", stat.color)}>
                                {stat.icon}
                            </div>
                        </CardHeader>
                        <CardContent className="pb-2 sm:pb-4">
                            <div className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 text-foreground">{stat.value}</div>
                            <div className="flex items-center justify-between">
                                <div className={cn(
                                    "px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold flex items-center gap-1",
                                    stat.isPositive ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-600 dark:text-red-500"
                                )}>
                                    {stat.isPositive ? <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                                    {stat.trend}
                                </div>
                                <MoreHorizontal className="h-3 w-3 sm:h-4 w-4 text-muted-foreground opacity-30 group-hover:opacity-100 cursor-pointer transition-opacity" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Middle Row: Statistic & Charts */}
            <div className="grid gap-6 md:grid-cols-12 lg:grid-cols-12">
                {/* Statistic Donut */}
                <Card className="md:col-span-12 lg:col-span-3 bg-card/50 border-border backdrop-blur-sm shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-foreground">Stock by Category</CardTitle>
                        <div className="flex gap-2 text-[10px] bg-primary/10 p-1 rounded-md font-bold border border-primary/20">
                            <span className="px-2 py-0.5 text-primary uppercase tracking-tighter">Distribution</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <StatsDonutChart data={categoryData} total={stats.totalMaterials} />
                    </CardContent>
                </Card>

                {/* Main Graph: Material Usage */}
                <Card className="md:col-span-12 lg:col-span-6 overflow-hidden bg-card/50 border-border backdrop-blur-sm shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold text-foreground">Usage Analytics</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors">
                            Last 30 days <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        <IncomeExpenseChart data={chartData} />
                        <div className="mt-16">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Consumption Trends</h4>
                            <p className="text-[10px] text-muted-foreground mb-4 font-medium italic text-primary/80">Qty used across all projects</p>
                            <TrendAreaChart data={chartData} />
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Activity */}
                <div className="md:col-span-12 lg:col-span-3">
                    <Card className="bg-card/50 border-border backdrop-blur-sm min-h-[460px] shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold text-foreground">Recent Activity</CardTitle>
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="space-y-6">
                                {recentActivity.length > 0 ? (
                                    recentActivity.slice(0, 4).map((item, idx) => {
                                        const badgeConfigs = [
                                            { icon: Camera, color: 'success' },
                                            { icon: Edit3, color: 'info' },
                                            { icon: Plus, color: 'warning' },
                                            { icon: Settings, color: 'secondary' }
                                        ] as const
                                        const config = badgeConfigs[idx % 4]

                                        return (
                                            <div key={idx} className="flex gap-3 group">
                                                <PremiumAvatar
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_name || 'US'}`}
                                                    fallback={item.user_name?.slice(0, 2).toUpperCase() || "US"}
                                                    size="md"
                                                    badgeIcon={config.icon}
                                                    badgeColor={config.color}
                                                />
                                                <div className="flex-1 space-y-0.5 min-w-0">
                                                    <p className="text-sm leading-tight text-foreground transition-colors line-clamp-2">
                                                        <span className="font-bold text-primary">{item.user_name || 'System'}</span> {item.description}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-medium flex items-center justify-between">
                                                        <span>{item.project_name || 'Global'}</span>
                                                        <span className="opacity-60">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-20 opacity-40">
                                        <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No activity</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
