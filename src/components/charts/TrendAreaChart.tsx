import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { ChartData } from '@/hooks/useDashboardStats'

interface TrendAreaChartProps {
    data: ChartData[]
}

export function TrendAreaChart({ data }: TrendAreaChartProps) {
    if (!data || data.length === 0) return null

    return (
        <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} stroke="#374151" />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '10px'
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="usage"
                    stroke="var(--primary-color)"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    strokeWidth={2}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

