import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ChartData } from '@/hooks/useDashboardStats'
import { useSettings } from '@/context/SettingsContext'

interface IncomeExpenseChartProps {
    data: ChartData[]
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
    const { currencySymbol } = useSettings()
    if (!data || data.length === 0) {
        return (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-xs italic">
                Insufficient data for usage analytics
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} stroke="#374151" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    hide
                />
                <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px'
                    }}
                    formatter={(value: any, name: string) => {
                        if (name === 'Est. Cost') return [`${currencySymbol}${Number(value).toLocaleString()}`, name]
                        return [value, name]
                    }}
                />
                <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                />
                <Bar
                    dataKey="usage"
                    fill="var(--primary-color)"
                    radius={[4, 4, 4, 4]}
                    barSize={12}
                    name="Usage Qty"
                />
                <Bar
                    dataKey="expense"
                    fill="#31525B"
                    radius={[4, 4, 4, 4]}
                    barSize={12}
                    name="Est. Cost"
                />
            </BarChart>
        </ResponsiveContainer>
    )
}

