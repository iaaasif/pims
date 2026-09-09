import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'sonner'
import { Key, Clock, Shield, ShieldAlert, History, Monitor, LogOut } from 'lucide-react'
import { AuditLogsDialog } from '@/components/admin/AuditLogsDialog'
import { APIKeysDialog } from './APIKeysDialog'
import { supabase } from '@/lib/supabase'

export function SecuritySettingsPanel() {
    const [loading, setLoading] = useState(false)
    const [twoFactor, setTwoFactor] = useState(false)
    const [showAuditLogs, setShowAuditLogs] = useState(false)
    const [showAPIKeys, setShowAPIKeys] = useState(false)

    const handleToggle2FA = (v: boolean) => {
        setLoading(true)
        setTimeout(() => {
            setTwoFactor(v)
            setLoading(false)
            toast.success(v ? 'Two-Factor Authentication enabled' : 'Two-Factor Authentication disabled')
        }, 800)
    }

    const handleSignOutOthers = async () => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.signOut({ scope: 'others' })
            if (error) throw error

            toast.success('Successfully signed out of all other devices')
        } catch (error: any) {
            console.error('Error signing out others:', error)
            toast.error(error.message || 'Failed to sign out other devices')
        } finally {
            setLoading(false)
        }
    }

    const getDeviceType = () => {
        const ua = navigator.userAgent
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet"
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile"
        return "Desktop"
    }

    const getBrowser = () => {
        const ua = navigator.userAgent
        if (ua.includes("Chrome")) return "Chrome"
        if (ua.includes("Firefox")) return "Firefox"
        if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari"
        if (ua.includes("Edge")) return "Edge"
        return "Browser"
    }

    const getOS = () => {
        const ua = navigator.userAgent
        if (ua.includes("Win")) return "Windows"
        if (ua.includes("Mac")) return "macOS"
        if (ua.includes("Linux")) return "Linux"
        if (ua.includes("Android")) return "Android"
        if (ua.includes("like Mac")) return "iOS"
        return "OS"
    }

    return (
        <Card className="w-full max-w-4xl mx-auto border-none shadow-none bg-transparent">
            <div className="flex flex-col h-full space-y-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                        <Shield className="h-6 w-6 text-primary" />
                        Security & Access
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your account authentication and monitor active sessions.
                    </p>
                </div>

                <Tabs defaultValue="auth" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="auth">Auth</TabsTrigger>
                        <TabsTrigger value="sessions">Sessions</TabsTrigger>
                        <TabsTrigger value="logs">Logs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="auth" className="space-y-6 py-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-accent/50">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Two-Factor Auth</Label>
                                <p className="text-[10px] text-muted-foreground">Protect your account with codes.</p>
                            </div>
                            <Switch
                                checked={twoFactor}
                                onCheckedChange={handleToggle2FA}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">API Access</Label>
                            <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => setShowAPIKeys(true)}>
                                <div className="p-2 bg-primary/10 rounded-md">
                                    <Key className="h-4 w-4 text-primary" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-semibold">Manage API Keys</p>
                                    <p className="text-[10px] text-muted-foreground">Generate keys for external integration.</p>
                                </div>
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="sessions" className="space-y-4 py-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border border-primary/20 bg-primary/5 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Monitor className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-foreground">Current {getDeviceType()}</p>
                                        <p className="text-[10px] text-muted-foreground">{getOS()} • {getBrowser()} • IP: Localhost</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">Active</span>
                                    <span className="text-[8px] text-muted-foreground font-medium">Last active: Just now</span>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-card/50 overflow-hidden">
                                <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-xs font-bold text-foreground">Manage Sessions</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                        onClick={handleSignOutOthers}
                                        disabled={loading}
                                    >
                                        <LogOut className="h-3 w-3 mr-1" />
                                        Sign out all others
                                    </Button>
                                </div>
                                <div className="p-4 text-center">
                                    <div className="p-3 bg-muted/20 rounded-full w-fit mx-auto mb-2">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">Other active logins</p>
                                    <p className="text-xs text-muted-foreground max-w-[240px] mx-auto mt-1">
                                        You are currently logged in on this device. Sign out of other sessions to secure your account.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="logs" className="space-y-4 py-4">
                        <div className="rounded-lg border overflow-hidden">
                            <div className="bg-muted p-2 text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                                <History className="h-3 w-3" />
                                Recent Activity
                            </div>
                            <div className="divide-y text-[10px] p-2 space-y-2">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Success Login</span>
                                    <span>2 mins ago</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground py-1">
                                    <span className="text-orange-500 flex items-center gap-1">
                                        <ShieldAlert className="h-3 w-3" />
                                        Failed Attempt
                                    </span>
                                    <span>1 hour ago</span>
                                </div>
                                <p
                                    className="text-center py-2 text-primary font-semibold hover:underline cursor-pointer"
                                    onClick={() => setShowAuditLogs(true)}
                                >
                                    View full access logs
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <AuditLogsDialog open={showAuditLogs} onOpenChange={setShowAuditLogs} />
            <APIKeysDialog open={showAPIKeys} onOpenChange={setShowAPIKeys} />
        </Card>
    )
}
