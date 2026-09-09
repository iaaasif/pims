import React, { useState } from 'react'
import { User, Settings2, Bell, Shield, Palette, ChevronRight, Building2, Tags, Database, Download } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ProfileSettingsPanel } from '@/components/settings/ProfileSettingsDialog'
import { ThemeSettingsPanel } from '@/components/settings/ThemeSettingsDialog'
import { DataExportPanel } from '@/components/settings/DataExportDialog'
import { SystemSettingsPanel } from '@/components/settings/SystemSettingsDialog'
import { NotificationSettingsPanel } from '@/components/settings/NotificationSettingsDialog'
import { SecuritySettingsPanel } from '@/components/settings/SecuritySettingsDialog'
import { DataManagementPanel } from '@/components/settings/DataManagementDialog'
import { CategoryUnitSettingsPanel } from '@/components/settings/CategoryUnitSettingsDialog'
import { CompanyInformationPanel } from '@/components/settings/CompanyInformation'
import { RolePermissionsPanel } from '@/components/admin/RolePermissionsEditor'
import { cn } from '@/lib/utils'
export default function Settings() {
    const { profile, isAdmin } = useAuth()
    const [activeCategory, setActiveCategory] = useState('profile')

    const settingsMenu = [
        { id: 'profile', title: 'Profile Settings', icon: User, component: <ProfileSettingsPanel /> },
        { id: 'appearance', title: 'Theme & Appearance', icon: Palette, component: <ThemeSettingsPanel /> },
        { id: 'system', title: 'System Preferences', icon: Settings2, component: <SystemSettingsPanel />, adminOnly: true },
        { id: 'notifications', title: 'Notification Center', icon: Bell, component: <NotificationSettingsPanel /> },
        { id: 'security', title: 'Security & Access', icon: Shield, component: <SecuritySettingsPanel /> },
        { id: 'roles', title: 'Role Permissions', icon: Shield, component: <RolePermissionsPanel />, adminOnly: true },
        { id: 'company', title: 'Company Profile', icon: Building2, component: <CompanyInformationPanel />, adminOnly: true },
        { id: 'data', title: 'Data Management', icon: Database, component: <DataManagementPanel />, adminOnly: true },
        { id: 'categories', title: 'Category & Unit Management', icon: Tags, component: <CategoryUnitSettingsPanel />, adminOnly: true },
        { id: 'export', title: 'Export Data', icon: Download, component: <DataExportPanel />, adminOnly: true },
    ]

    // Reset to Profile Settings if admin-only category is selected but user is not admin
    React.useEffect(() => {
        const currentItem = settingsMenu.find(item => item.id === activeCategory)
        if (currentItem?.adminOnly && !isAdmin) {
            setActiveCategory('profile')
        }
    }, [activeCategory, isAdmin])

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your workspace and account preferences.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full shadow-sm">
                    <span className="font-bold text-xs uppercase tracking-wider">{profile?.role || 'viewer'}</span>
                    <span className="h-3 w-[1px] bg-primary/30 mx-1" />
                    <span className="text-xs font-semibold opacity-80">{profile?.full_name || profile?.email || 'User'}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="flex md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 w-full md:w-64 gap-1 shrink-0 custom-scrollbar scrollbar-hide">
                    {settingsMenu.filter(item => !item.adminOnly || isAdmin).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveCategory(item.id)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all whitespace-nowrap text-left",
                                activeCategory === item.id
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105 z-10"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1 text-left">{item.title}</span>
                            {activeCategory === item.id && (
                                <ChevronRight className="h-4 w-4 ml-auto hidden md:block" />
                            )}
                        </button>
                    ))}
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="p-1 md:p-6 bg-card rounded-xl border shadow-sm h-full min-h-[600px]">
                        {settingsMenu.find(item => item.id === activeCategory)?.component && 
                            React.cloneElement(settingsMenu.find(item => item.id === activeCategory)!.component as React.ReactElement, { key: activeCategory })}
                    </div>
                </div>
            </div>
        </div>
    )
}

