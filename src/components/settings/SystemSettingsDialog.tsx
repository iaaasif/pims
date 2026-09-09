import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'sonner'
import { Globe, Cpu, Power, Bug, UserPlus, BellRing, Settings2, Send, Wallet } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase'
export function SystemSettingsPanel() {
    const [loading, setLoading] = useState(false)
    const [balanceDialogOpen, setBalanceDialogOpen] = useState(false)
    const [balanceInfo, setBalanceInfo] = useState<{ balance: string; loading: boolean; error: string | null }>({ balance: '', loading: false, error: null })
    const [settings, setSettings] = useState({
        dateFormat: 'MMM d, yyyy',
        timeFormat: '24h',
        language: 'en',
        timezone: 'UTC+6',
        currency: 'USD',
        autoLogout: '30',
        maintenanceMode: false,
        debugMode: false,
        publicRegistration: true,
        notifications: {
            new_user_registration: true,
            low_inventory: true,
            approval_requests: true,
            system_errors: true
        },
        sms: {
            provider: 'twilio',
            gatewayUrl: '',
            apiKey: '',
            apiSecret: '',
            senderId: '',
            adminPhone: '',
            enabled: false,
            notifications: {
                purchase_requisitions: true,
                purchase_orders: true,
                transfers: true,
                low_inventory: true
            }
        },
        templates: {
            pr_created: "New PR [{{PR_NUMBER}}] created by {{USER_EMAIL}}.",
            pr_status_changed: "PR [{{PR_NUMBER}}] has been {{STATUS}}.",
            po_created: "New PO [{{PO_NUMBER}}] for {{PROJECT_NAME}}. Items: {{ITEM_LIST}}.",
            po_approved: "PO [{{PO_NUMBER}}] has been confirmed/approved.",
            po_rejected: "PO [{{PO_NUMBER}}] has been cancelled/rejected.",
            tr_created: "New Transfer Request [{{TR_NUMBER}}] created by {{USER_EMAIL}}.",
            tr_approved: "Transfer Request [{{TR_NUMBER}}] has been approved and executed.",
            inventory_low: "LOW STOCK ALERT: {{MATERIAL_NAME}} is down to {{CURRENT_QUANTITY}} {{UNIT}} in Project Inventory. Threshold is {{MIN_STOCK}}."
        }
    })

    useEffect(() => {
        fetchSystemSettings()
    }, [])

    const fetchSystemSettings = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')

            if (error) throw error

            if (data) {
                const sms = data.find(s => s.key === 'sms_config')?.value
                const prefs = data.find(s => s.key === 'notification_prefs')?.value
                const general = data.find(s => s.key === 'general_config')?.value
                const templates = data.find(s => s.key === 'notification_templates')?.value

                if (sms || prefs || general || templates) {
                    setSettings(prev => {
                        const newSettings = {
                            ...prev,
                            ...general
                        };
                        // Explicitly set these keys to ensure they are not overwritten by legacy content in general_config
                        if (sms) newSettings.sms = { ...prev.sms, ...sms };
                        if (prefs) newSettings.notifications = { ...prev.notifications, ...prefs };
                        if (templates) newSettings.templates = { ...prev.templates, ...templates };
                        return newSettings;
                    })
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            // Extract specific settings to save separately
            const { notifications, sms, templates, ...generalConfig } = settings

            // Save General settings (excluding specific configs)
            await supabase.from('system_settings').upsert({
                key: 'general_config',
                value: generalConfig,
                updated_at: new Date().toISOString()
            })

            // Save SMS config
            await supabase.from('system_settings').upsert({
                key: 'sms_config',
                value: settings.sms,
                updated_at: new Date().toISOString()
            })

            // Save Notification prefs
            await supabase.from('system_settings').upsert({
                key: 'notification_prefs',
                value: settings.notifications,
                updated_at: new Date().toISOString()
            })

            // Save Notification templates
            await supabase.from('system_settings').upsert({
                key: 'notification_templates',
                value: settings.templates,
                updated_at: new Date().toISOString()
            })

            toast.success('System settings updated successfully')
        } catch (error) {
            console.error('Save error:', error)
            toast.error('Failed to save settings')
        } finally {
            setLoading(false)
        }
    }

    const testSmsConnection = async () => {
        if (!settings.sms.adminPhone || !settings.sms.apiKey) {
            toast.error('Please configure Admin Phone and API Key first')
            return
        }

        toast.promise(
            (async () => {
                const url = `${settings.sms.gatewayUrl}?api_key=${settings.sms.apiKey}&type=text&number=${settings.sms.adminPhone}&senderid=${settings.sms.apiSecret}&message=${encodeURIComponent('PIMS SMS Gateway Test Message')}`

                const { data: proxyData, error: proxyError } = await supabase.functions.invoke('sms-proxy', {
                    body: { url, method: 'GET' }
                })

                if (proxyError) throw proxyError
                const data = proxyData

                if (data.status === 'success' || data.response_code === 202) {
                    return 'Test SMS sent successfully!'
                } else {
                    const code = data.response_code
                    let msg = data.message || data.error_message || JSON.stringify(data)

                    if (code === 1005) msg = "Invalid Sender ID. Please ensure your Sender ID is approved in BulkSMSBD portal and includes the 880 prefix if it's a number."
                    if (code === 1001) msg = "Invalid API Key."
                    if (code === 1004) msg = "Low Balance. Please refill your BulkSMSBD account."
                    if (code === 1006) msg = "Account Validity Expired. Please check your BulkSMSBD portal for account status."
                    if (code === 1008) msg = "Invalid Phone Number format. Use 8801XXXXXXXXX."

                    throw new Error(msg)
                }
            })(),
            {
                loading: 'Sending test SMS...',
                success: (msg) => msg,
                error: (err) => `Failed to send test SMS: ${err.message}`,
            }
        )
    }

    const checkSmsBalance = async () => {
        if (!settings.sms.apiKey) {
            toast.error('Please enter your API Key first');
            return;
        }

        setBalanceDialogOpen(true)
        setBalanceInfo({ balance: '', loading: true, error: null })

        try {
            const url = `http://bulksmsbd.net/api/getBalanceApi?api_key=${settings.sms.apiKey}`;

            const { data: proxyData, error: proxyError } = await supabase.functions.invoke('sms-proxy', {
                body: { url, method: 'GET' }
            });

            if (proxyError) throw proxyError;
            const data = proxyData;

            if (data.status === 'success' || data.response_code === 202) {
                setBalanceInfo({ balance: data.balance, loading: false, error: null })
            } else {
                throw new Error(data.message || JSON.stringify(data));
            }
        } catch (err: any) {
            setBalanceInfo({ balance: '', loading: false, error: err.message || 'Failed to fetch balance' })
        }
    }

    return (
        <>
            <Card className="w-full max-w-4xl mx-auto border-none shadow-none bg-transparent">
                <div className="flex flex-col h-full space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                            <Settings2 className="h-6 w-6 text-primary" />
                            System Settings
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Configure global system preferences, localization, and mail server integrations.
                        </p>
                    </div>

                    <Tabs defaultValue="general" className="mt-4">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="localization">Locale</TabsTrigger>
                            <TabsTrigger value="sms">SMS</TabsTrigger>
                            <TabsTrigger value="templates">Templates</TabsTrigger>
                            <TabsTrigger value="advanced">Advanced</TabsTrigger>
                        </TabsList>

                    <TabsContent value="general" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>System Language</Label>
                            <Select
                                value={settings.language}
                                onValueChange={(v) => setSettings({ ...settings, language: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English (US)</SelectItem>
                                    <SelectItem value="uk">English (UK)</SelectItem>
                                    <SelectItem value="fr">Français</SelectItem>
                                    <SelectItem value="es">Español</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>System Currency</Label>
                            <Select
                                value={settings.currency}
                                onValueChange={(v) => setSettings({ ...settings, currency: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="BDT">BDT (৳)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

                    <TabsContent value="localization" className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Date Format</Label>
                                <Select
                                    value={settings.dateFormat}
                                    onValueChange={(v) => setSettings({ ...settings, dateFormat: v })}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MMM d, yyyy">Jan 25, 2026</SelectItem>
                                        <SelectItem value="dd-MMM-yyyy">25-Jan-2026</SelectItem>
                                        <SelectItem value="dd/MM/yyyy">25/01/2026</SelectItem>
                                        <SelectItem value="yyyy-MM-dd">2026-01-25</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Time Format</Label>
                                <Select
                                    value={settings.timeFormat}
                                    onValueChange={(v) => setSettings({ ...settings, timeFormat: v })}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                                        <SelectItem value="24h">24-hour</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Timezone</Label>
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-primary/60" />
                                <Select
                                    value={settings.timezone}
                                    onValueChange={(v) => setSettings({ ...settings, timezone: v })}
                                >
                                    <SelectTrigger className="flex-1 h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UTC">UTC (Greenwich)</SelectItem>
                                        <SelectItem value="UTC+6">UTC+6 (Dhaka)</SelectItem>
                                        <SelectItem value="EST">EST (New York)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="sms" className="space-y-4 py-4 min-h-[300px]">
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <Globe className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-bold uppercase tracking-wider">SMS Gateway Configuration</span>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Provider</Label>
                                        <Select
                                            value={settings.sms.provider}
                                            onValueChange={(v) => {
                                                const newSettings = { ...settings, sms: { ...settings.sms, provider: v } }
                                                if (v === 'bulksmsbd') {
                                                    newSettings.sms.gatewayUrl = 'http://bulksmsbd.net/api/smsapi'
                                                }
                                                setSettings(newSettings)
                                            }}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bulksmsbd">BulkSMSBD.COM</SelectItem>
                                                <SelectItem value="twilio">Twilio</SelectItem>
                                                <SelectItem value="vonage">Vonage</SelectItem>
                                                <SelectItem value="custom">Custom API</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {(settings.sms.provider === 'custom' || settings.sms.provider === 'bulksmsbd') && (
                                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Gateway URL</Label>
                                            <Input
                                                className="h-8 text-xs font-mono"
                                                placeholder="http://bulksmsbd.net/api/smsapi"
                                                value={settings.sms.gatewayUrl}
                                                onChange={(e) => setSettings({ ...settings, sms: { ...settings.sms, gatewayUrl: e.target.value } })}
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                                            {settings.sms.provider === 'bulksmsbd' ? 'API Key' : 'API Key / SID'}
                                        </Label>
                                        <Input
                                            className="h-8 text-xs"
                                            placeholder={settings.sms.provider === 'bulksmsbd' ? "Enter BulkSMSBD API Key" : "Enter API Key or Account SID"}
                                            value={settings.sms.apiKey}
                                            onChange={(e) => setSettings({ ...settings, sms: { ...settings.sms, apiKey: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                                            {settings.sms.provider === 'bulksmsbd' ? 'Sender ID' : 'Auth Token / Secret'}
                                        </Label>
                                        <Input
                                            className="h-8 text-xs"
                                            type={settings.sms.provider === 'bulksmsbd' ? "text" : "password"}
                                            placeholder={settings.sms.provider === 'bulksmsbd' ? "8809664902609" : "Enter Auth Token or API Secret"}
                                            value={settings.sms.apiSecret}
                                            onChange={(e) => setSettings({ ...settings, sms: { ...settings.sms, apiSecret: e.target.value } })}
                                        />
                                    </div>

                                    {settings.sms.provider !== 'bulksmsbd' && (
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Sender ID / Number</Label>
                                            <Input
                                                className="h-8 text-xs"
                                                placeholder="PIMS_ALERT"
                                                value={settings.sms.senderId}
                                                onChange={(e) => setSettings({ ...settings, sms: { ...settings.sms, senderId: e.target.value } })}
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between p-2 border rounded bg-muted/30">
                                        <div className="flex items-center gap-2">
                                            <BellRing className="h-3.5 w-3.5 text-orange-500" />
                                            <span className="text-[10px] font-bold uppercase">Enable SMS Notifications</span>
                                        </div>
                                        <Switch
                                            checked={settings.sms.enabled}
                                            onCheckedChange={(v) => setSettings({ ...settings, sms: { ...settings.sms, enabled: v } })}
                                        />
                                    </div>

                                    <div className="space-y-1.5 pt-2 border-t border-border/30">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Admin Phone Number</Label>
                                        <div className="relative">
                                            <Input
                                                className="h-8 text-xs pl-8"
                                                placeholder="8801XXXXXXXXX"
                                                value={settings.sms.adminPhone}
                                                onChange={(e) => setSettings({ ...settings, sms: { ...settings.sms, adminPhone: e.target.value } })}
                                            />
                                            <Settings2 className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground" />
                                        </div>
                                        <p className="text-[9px] text-muted-foreground">Primary number for system alerts.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-[10px] font-bold gap-2"
                                            onClick={testSmsConnection}
                                        >
                                            <Send className="h-3 w-3" />
                                            Test Gateway
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-[10px] font-bold gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-50"
                                            onClick={checkSmsBalance}
                                        >
                                            <Wallet className="h-3 w-3" />
                                            Check Balance
                                        </Button>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-2">
                                            <BellRing className="h-4 w-4 text-primary" />
                                            <span className="text-xs font-bold uppercase tracking-wider">SMS Notification Events</span>
                                        </div>
                                        <div className="space-y-3">
                                            {Object.entries(settings.sms.notifications || {}).map(([key, val]) => (
                                                <div key={key} className="flex items-center justify-between text-xs p-2 rounded-md hover:bg-muted/50 transition-colors">
                                                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                                                    <Switch
                                                        checked={val}
                                                        onCheckedChange={(v) => setSettings({
                                                            ...settings,
                                                            sms: {
                                                                ...settings.sms,
                                                                notifications: { ...settings.sms.notifications, [key]: v }
                                                            }
                                                        })}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="autoLogout">Session Timeout (minutes)</Label>
                            <Input
                                id="autoLogout"
                                type="number"
                                value={settings.autoLogout}
                                onChange={(e) => setSettings({ ...settings, autoLogout: e.target.value })}
                            />
                            <p className="text-[10px] text-muted-foreground">Automatically log out after inactivity.</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Power className="h-4 w-4 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <Label className="text-sm">Maintenance Mode</Label>
                                        <p className="text-[10px] text-muted-foreground">Disable frontend for non-admins.</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.maintenanceMode}
                                    onCheckedChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bug className="h-4 w-4 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <Label className="text-sm">Debug Mode</Label>
                                        <p className="text-[10px] text-muted-foreground">Show detailed error logs.</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.debugMode}
                                    onCheckedChange={(v) => setSettings({ ...settings, debugMode: v })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                                    <div className="space-y-0.5">
                                        <Label className="text-sm">Public Registration</Label>
                                        <p className="text-[10px] text-muted-foreground">Allow new users to sign up.</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.publicRegistration}
                                    onCheckedChange={(v) => setSettings({ ...settings, publicRegistration: v })}
                                />
                            </div>
                        </div>

                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Cpu className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-primary flex items-center gap-2">
                                    System Core
                                    <span className="text-[9px] bg-primary/20 px-1.5 rounded uppercase tracking-wider">v2.4.0</span>
                                </p>
                                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                    Only authorized administrators can modify these production-level settings.
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="templates" className="space-y-4 py-4 min-h-[300px]">
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Notification Templates</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Customize the messages sent via SMS. Use variables like {'{{PR_NUMBER}}'} to inject dynamic data.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Purchase Requisition Created</Label>
                                        <Textarea
                                            className="text-xs font-mono min-h-[60px]"
                                            value={settings.templates.pr_created}
                                            onChange={(e) => setSettings({ ...settings, templates: { ...settings.templates, pr_created: e.target.value } })}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Variables: {'{{PR_NUMBER}}'}, {'{{USER_EMAIL}}'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Purchase Requisition Status</Label>
                                        <Textarea
                                            className="text-xs font-mono min-h-[60px]"
                                            value={settings.templates.pr_status_changed}
                                            onChange={(e) => setSettings({ ...settings, templates: { ...settings.templates, pr_status_changed: e.target.value } })}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Variables: {'{{PR_NUMBER}}'}, {'{{STATUS}}'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Purchase Order Created</Label>
                                        <Textarea
                                            className="text-xs font-mono min-h-[60px]"
                                            value={settings.templates.po_created}
                                            onChange={(e) => setSettings({ ...settings, templates: { ...settings.templates, po_created: e.target.value } })}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Variables: {'{{PO_NUMBER}}'}, {'{{PROJECT_NAME}}'}, {'{{ITEM_LIST}}'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Purchase Order Approved</Label>
                                        <Textarea
                                            className="text-xs font-mono min-h-[60px]"
                                            value={settings.templates.po_approved}
                                            onChange={(e) => setSettings({ ...settings, templates: { ...settings.templates, po_approved: e.target.value } })}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Variables: {'{{PO_NUMBER}}'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Purchase Order Rejected</Label>
                                        <Textarea
                                            className="text-xs font-mono min-h-[60px]"
                                            value={settings.templates.po_rejected}
                                            onChange={(e) => setSettings({ ...settings, templates: { ...settings.templates, po_rejected: e.target.value } })}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Variables: {'{{PO_NUMBER}}'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Transfer Request Created</Label>
                                        <Textarea
                                            className="text-xs font-mono min-h-[60px]"
                                            value={settings.templates.tr_created}
                                            onChange={(e) => setSettings({ ...settings, templates: { ...settings.templates, tr_created: e.target.value } })}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Variables: {'{{TR_NUMBER}}'}, {'{{USER_EMAIL}}'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Transfer Request Approved</Label>
                                        <Textarea
                                            className="text-xs font-mono min-h-[60px]"
                                            value={settings.templates.tr_approved}
                                            onChange={(e) => setSettings({ ...settings, templates: { ...settings.templates, tr_approved: e.target.value } })}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Variables: {'{{TR_NUMBER}}'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Low Inventory Alert</Label>
                                        <Textarea
                                            className="text-xs font-mono min-h-[60px]"
                                            value={settings.templates.inventory_low}
                                            onChange={(e) => setSettings({ ...settings, templates: { ...settings.templates, inventory_low: e.target.value } })}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Variables: {'{{MATERIAL_NAME}}'}, {'{{CURRENT_QUANTITY}}'}, {'{{UNIT}}'}, {'{{MIN_STOCK}}'}</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end pt-4 border-t border-border mt-4 gap-3">
                    <Button onClick={handleSave} disabled={loading} className="min-w-[150px] font-bold shadow-md shadow-primary/20">
                        {loading ? 'Saving...' : 'Save All Settings'}
                    </Button>
                </div>
            </div>
        </Card>

        {/* Balance Check Popup */}
        <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
            <DialogContent className="sm:max-w-[350px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-amber-500" />
                        SMS Balance
                    </DialogTitle>
                    <DialogDescription>View your current SMS balance.</DialogDescription>
                </DialogHeader>
                <div className="py-6">
                    {balanceInfo.loading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-sm text-muted-foreground">Checking balance...</p>
                        </div>
                    ) : balanceInfo.error ? (
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="p-3 bg-destructive/10 rounded-full">
                                <Wallet className="h-6 w-6 text-destructive" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-destructive">Failed to fetch balance</p>
                                <p className="text-xs text-muted-foreground mt-1">{balanceInfo.error}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-amber-50 rounded-full">
                                <Wallet className="h-8 w-8 text-amber-600" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Current Balance</p>
                                <p className="text-3xl font-bold text-amber-600">{balanceInfo.balance} BDT</p>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={() => setBalanceDialogOpen(false)} className="w-full">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
}
