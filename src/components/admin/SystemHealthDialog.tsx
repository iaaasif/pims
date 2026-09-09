import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Database, HardDrive, Cpu, Wifi } from "lucide-react"

// Simple Progress component
const Progress = ({ value, className = "" }: { value: number; className?: string }) => (
    <div className={`w-full bg-muted rounded-full overflow-hidden ${className}`}>
        <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${value}%` }}
        />
    </div>
)

interface SystemHealthDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SystemHealthDialog({ open, onOpenChange }: SystemHealthDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        System Health Monitor
                    </DialogTitle>
                    <DialogDescription>
                        Real-time system performance and operational status.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <Card className="bg-muted/30 border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
                            <Database className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">Healthy</div>
                            <p className="text-xs text-muted-foreground">PostgreSQL 14.1 connection active</p>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span>Pool Usage</span>
                                    <span>24/100</span>
                                </div>
                                <Progress value={24} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/30 border-blue-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">API Latency</CardTitle>
                            <Wifi className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">45ms</div>
                            <p className="text-xs text-muted-foreground">Average response time</p>
                            <div className="grid grid-cols-4 gap-2 mt-4 text-center text-xs">
                                <div className="bg-background rounded p-1 border">
                                    <span className="block font-bold text-primary">28ms</span>
                                    <span className="text-[10px] text-muted-foreground">Min</span>
                                </div>
                                <div className="bg-background rounded p-1 border">
                                    <span className="block font-bold text-blue-500">45ms</span>
                                    <span className="text-[10px] text-muted-foreground">Avg</span>
                                </div>
                                <div className="bg-background rounded p-1 border">
                                    <span className="block font-bold text-orange-500">112ms</span>
                                    <span className="text-[10px] text-muted-foreground">Max</span>
                                </div>
                                <div className="bg-background rounded p-1 border">
                                    <span className="block font-bold text-purple-500">99.9%</span>
                                    <span className="text-[10px] text-muted-foreground">Up</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Server Load</CardTitle>
                            <Cpu className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary">
                                        <Activity className="h-3 w-3" />
                                        <span>SYSTEM NORMAL</span>
                                    </div>
                                    <Progress value={12} className="h-1.5" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Memory (RAM)</span>
                                        <span className="font-bold">4.2 / 8 GB</span>
                                    </div>
                                    <Progress value={52} className="h-1.5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Storage</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">124 MB</div>
                            <p className="text-xs text-muted-foreground">of 500 MB allocated</p>

                            <div className="mt-4 flex gap-2">
                                <div className="h-2 flex-1 rounded-full bg-primary" />
                                <div className="h-2 w-1/4 rounded-full bg-muted" />
                            </div>
                            <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                                <span>Used: 25%</span>
                                <span>Free: 75%</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-md bg-muted p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-sm font-medium text-primary">All systems operational</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Last checked: Just now</span>
                </div>
            </DialogContent>
        </Dialog>
    )
}
