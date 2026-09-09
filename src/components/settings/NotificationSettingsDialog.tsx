import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'sonner'
import { Bell, AlertCircle, Save } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

export function NotificationSettingsPanel() {
    const { profile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [prefs, setPrefs] = useState({
        email_orders: true,
        email_requisitions: true,
        email_weekly_summary: false,
        push_low_stock: true,
        push_approvals: true,
        push_price_updates: false,
        sys_errors: true,
        sys_logins: false,
    })

    // Load preferences from profile
    useEffect(() => {
        if (profile?.notification_preferences) {
            setPrefs(prev => ({
                ...prev,
                ...profile.notification_preferences
            }))
        }
    }, [profile])

    const handleSave = async () => {
        if (!profile?.id) return
        
        setLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    notification_preferences: prefs,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id)

            if (error) throw error

            toast.success('Notification preferences updated permanently')
        } catch (error) {
            console.error('Error saving notification preferences:', error)
            toast.error('Failed to save preferences. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-4xl mx-auto border-none shadow-none bg-transparent">
            <div className="flex flex-col h-full space-y-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                        <Bell className="h-6 w-6 text-primary" />
                        Notification Center
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Control how you receive alerts and updates from the system.
                    </p>
                </div>

                <Tabs defaultValue="email" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="email">Email</TabsTrigger>
                        <TabsTrigger value="push">Push</TabsTrigger>
                        <TabsTrigger value="system">System</TabsTrigger>
                    </TabsList>

                    <TabsContent value="email" className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Purchase Orders</Label>
                                <p className="text-[10px] text-muted-foreground">Receive copies of generated POs.</p>
                            </div>
                            <Switch
                                checked={prefs.email_orders}
                                onCheckedChange={(v: boolean) => setPrefs({ ...prefs, email_orders: v })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">New Requisitions</Label>
                                <p className="text-[10px] text-muted-foreground">Alerts for items needing attention.</p>
                            </div>
                            <Switch
                                checked={prefs.email_requisitions}
                                onCheckedChange={(v: boolean) => setPrefs({ ...prefs, email_requisitions: v })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Weekly Summary</Label>
                                <p className="text-[10px] text-muted-foreground">Brief of activity every Monday.</p>
                            </div>
                            <Switch
                                checked={prefs.email_weekly_summary}
                                onCheckedChange={(v: boolean) => setPrefs({ ...prefs, email_weekly_summary: v })}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="push" className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Low Stock Alerts</Label>
                                <p className="text-[10px] text-muted-foreground">Real-time inventory warnings.</p>
                            </div>
                            <Switch
                                checked={prefs.push_low_stock}
                                onCheckedChange={(v: boolean) => setPrefs({ ...prefs, push_low_stock: v })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Approval Requests</Label>
                                <p className="text-[10px] text-muted-foreground">Immediate notification for pending PRs.</p>
                            </div>
                            <Switch
                                checked={prefs.push_approvals}
                                onCheckedChange={(v: boolean) => setPrefs({ ...prefs, push_approvals: v })}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="system" className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Critical Errors</Label>
                                <p className="text-[10px] text-muted-foreground">Notifications for system instability.</p>
                            </div>
                            <Switch
                                checked={prefs.sys_errors}
                                onCheckedChange={(v: boolean) => setPrefs({ ...prefs, sys_errors: v })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Security Alerts</Label>
                                <p className="text-[10px] text-muted-foreground">Notify on new device logins.</p>
                            </div>
                            <Switch
                                checked={prefs.sys_logins}
                                onCheckedChange={(v: boolean) => setPrefs({ ...prefs, sys_logins: v })}
                            />
                        </div>
                        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-start gap-3 mt-4">
                            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                            <p className="text-[10px] text-muted-foreground">System alerts are also visible in the live notification bell in the header.</p>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end pt-4 border-t border-border mt-4 gap-3">
                    <Button onClick={handleSave} disabled={loading} className="min-w-[140px] gap-2 font-bold shadow-md shadow-primary/20">
                        {loading ? 'Saving Settings...' : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Preferences
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    )
}
