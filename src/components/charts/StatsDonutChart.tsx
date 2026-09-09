import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { CategoryDistribution } from '@/hooks/useDashboardStats'

interface StatsDonutChartProps {
    data: CategoryDistribution[]
    total: number
}

export function StatsDonutChart({ data, total }: StatsDonutChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[240px] flex items-center justify-center text-muted-foreground text-xs italic">
                No inventory data available
            </div>
        )
    }

    return (
        <div className="h-[340px] w-full relative">
            <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[100px] left-0 right-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Total Stock</span>
                <span className="text-xl font-bold text-white">{total.toLocaleString()}</span>
            </div>

            <div className="mt-4 space-y-2 max-h-[100px] overflow-y-auto custom-scrollbar pr-2">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-bold text-white">{item.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

