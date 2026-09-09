import {
    LayoutDashboard,
    MapPin,
    Briefcase,
    Package,
    ShoppingCart,
    Truck,
    Users,
    ArrowLeftRight,
    BarChart,
    Settings,
    LogOut,
    Shield,
    DollarSign,
    Wallet,
    BarChart3,
    Calculator,
    ShieldCheck,
    FileCheck,
    Library
} from "lucide-react"
import { PremiumAvatar } from "@/components/ui/PremiumAvatar"
import { useAuth } from "@/context/AuthContext"
import { useCompanyInformation } from "@/hooks/useCompanyInformation"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { NavLink, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleThemeWithStatusBar } from "@/hooks/useStatusBar"

export function AppSidebar() {
    const navigate = useNavigate()
    const { theme, setTheme } = useTheme()
    const { profile } = useAuth()
    const { company } = useCompanyInformation()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/login")
    }

    return (
        <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
            <SidebarHeader className="py-8 px-6">
                <div className="flex items-center gap-4">
                    {company?.logo_url ? (
                        <div className="h-12 w-12 rounded-xl overflow-hidden shadow-lg shadow-primary/10 flex items-center justify-center bg-background border border-border/50 shrink-0">
                            <img src={company.logo_url} alt={company.company_name} className="h-10 w-10 object-contain" />
                        </div>
                    ) : (
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
                            <LayoutDashboard className="h-7 w-7" />
                        </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-2xl tracking-tight text-foreground truncate leading-tight">
                            {company?.site_title || 'PIMS'}
                        </span>
                        <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mt-0.5 truncate">
                            {company?.company_name || 'Workspace'}
                        </span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="px-3 custom-scrollbar bg-sidebar">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 py-4">Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {[
                                { to: "/", icon: LayoutDashboard, label: "Dashboard" },
                                { to: "/locations", icon: MapPin, label: "Locations" },
                                { to: "/projects", icon: Briefcase, label: "Projects" },
                                { to: "/inventory", icon: Package, label: "Inventory" },
                            ].map((item) => (
                                <SidebarMenuItem key={item.to}>
                                    <SidebarMenuButton asChild tooltip={item.label} className="py-6 transition-all duration-200 hover:translate-x-1 hover:bg-primary/10 hover:text-primary dark:hover:text-primary-foreground group">
                                        <NavLink to={item.to} className={({ isActive }) => cn(
                                            "flex items-center gap-3 w-full",
                                            isActive ? "text-primary dark:text-primary font-bold" : "text-muted-foreground group-hover:text-primary dark:group-hover:text-primary-foreground"
                                        )}>
                                            <item.icon className={cn("h-5 w-5", "group-hover:text-primary dark:group-hover:text-primary transition-colors")} />
                                            <span>{item.label}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 py-4">Procurement</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {[
                                { to: "/procurement/requisitions", icon: ShoppingCart, label: "Requisitions" },
                                { to: "/procurement/orders", icon: Truck, label: "Purchase Orders" },
                                { to: "/vendors", icon: Users, label: "Vendors" },
                            ].map((item) => (
                                <SidebarMenuItem key={item.to}>
                                    <SidebarMenuButton asChild tooltip={item.label} className="py-6 transition-all duration-200 hover:translate-x-1 hover:bg-primary/10 hover:text-primary dark:hover:text-primary-foreground group">
                                        <NavLink to={item.to} className={({ isActive }) => cn(
                                            "flex items-center gap-3 w-full",
                                            isActive ? "text-primary dark:text-primary font-bold" : "text-muted-foreground group-hover:text-primary dark:group-hover:text-primary-foreground"
                                        )}>
                                            <item.icon className={cn("h-5 w-5", "group-hover:text-primary dark:group-hover:text-primary transition-colors")} />
                                            <span>{item.label}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {(profile?.role === 'admin' || profile?.role === 'finance_executive') && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 py-4">Finance & Accounts</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {[
                                    { to: "/financial/dashboard", icon: DollarSign, label: "Overview" },
                                    { to: "/financial/budgets", icon: Calculator, label: "Budgets" },
                                    { to: "/financial/expenses", icon: BarChart3, label: "Expenses" },
                                    { to: "/financial/vat-tax", icon: ShieldCheck, label: "VAT & Tax" },
                                    { to: "/financial/bills", icon: FileCheck, label: "Bills" },
                                    { to: "/financial/petty-cash", icon: Wallet, label: "Petty Cash" },
                                    { to: "/financial/bank-cash", icon: Library, label: "Cash & Bank" },
                                ].map((item) => (
                                    <SidebarMenuItem key={item.to}>
                                        <SidebarMenuButton asChild tooltip={item.label} className="py-6 transition-all duration-200 hover:translate-x-1 hover:bg-primary/10 hover:text-primary dark:hover:text-primary-foreground group">
                                            <NavLink to={item.to} className={({ isActive }) => cn(
                                                "flex items-center gap-3 w-full",
                                                isActive ? "text-primary dark:text-primary font-bold" : "text-muted-foreground group-hover:text-primary dark:group-hover:text-primary-foreground"
                                            )}>
                                                <item.icon className={cn("h-5 w-5", "group-hover:text-primary dark:group-hover:text-primary transition-colors")} />
                                                <span>{item.label}</span>
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 py-4">Operations</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {[
                                { to: "/transfers", icon: ArrowLeftRight, label: "Transfers" },
                                { to: "/reports", icon: BarChart, label: "Reports" },
                                { to: "/settings", icon: Settings, label: "Settings" },
                            ].map((item) => (
                                <SidebarMenuItem key={item.to}>
                                    <SidebarMenuButton asChild tooltip={item.label} className="py-6 transition-all duration-200 hover:translate-x-1 hover:bg-primary/10 hover:text-primary dark:hover:text-primary-foreground group">
                                        <NavLink to={item.to} className={({ isActive }) => cn(
                                            "flex items-center gap-3 w-full",
                                            isActive ? "text-primary dark:text-primary font-bold" : "text-muted-foreground group-hover:text-primary dark:group-hover:text-primary-foreground"
                                        )}>
                                            <item.icon className={cn("h-5 w-5", "group-hover:text-primary dark:group-hover:text-primary transition-colors")} />
                                            <span>{item.label}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* I'll use the profile from useAuth which I already have access to in AppSidebar */}
                {profile?.role === 'admin' && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-primary/80 px-3 py-4">Administration</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Command Center" className="py-6 transition-all duration-200 hover:translate-x-1 hover:bg-primary/10 hover:text-primary dark:hover:text-primary-foreground group">
                                        <NavLink to="/admin" className={({ isActive }) => cn(
                                            "flex items-center gap-3 w-full",
                                            isActive ? "text-primary dark:text-primary font-bold" : "text-muted-foreground group-hover:text-primary dark:group-hover:text-primary-foreground"
                                        )}>
                                            <Shield className={cn("h-5 w-5", "group-hover:text-primary dark:group-hover:text-primary transition-colors")} />
                                            <span>Command Center</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
                
                </SidebarContent>

            <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar gap-4">
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-muted/30 border border-border/50">
                    <PremiumAvatar
                        src={profile?.avatar_url || undefined}
                        fallback={profile?.full_name?.slice(0, 2).toUpperCase() || 'P'}
                        size="sm"
                        badgeIcon={profile?.role === 'admin' ? Shield : Settings}
                        badgeColor="success"
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold truncate text-foreground">{profile?.full_name || 'User'}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{profile?.role || 'user'}</span>
                    </div>
                </div>
                <SidebarMenu>
                    <SidebarMenuItem className="flex gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-muted-foreground hover:text-primary dark:hover:text-primary-foreground hover:bg-primary/10 shadow-none border-none" 
                            onClick={async () => {
                                const isDark = await toggleThemeWithStatusBar()
                                setTheme(isDark ? "dark" : "light")
                            }}
                        >
                            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5 text-primary" />}
                        </Button>
                        <SidebarMenuButton onClick={handleLogout} className="h-9 flex-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>

    )
}


