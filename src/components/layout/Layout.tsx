import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Outlet, useNavigate } from "react-router-dom"
import { Search, Bell, Settings, Moon, Sun } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/components/theme-provider"
import { useNotifications } from "@/context/SystemNotificationContext"
import { NotificationList } from "@/components/notifications/NotificationList"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PremiumAvatar } from "@/components/ui/PremiumAvatar"
import { useAuth } from "@/context/AuthContext"
import { MobileBottomNav } from "./MobileBottomNav"
import { useMobileSafeAreas } from "@/hooks/useMobileSafeAreas"
import { toggleThemeWithStatusBar } from "@/hooks/useStatusBar"
import { useEffect } from "react"

export default function Layout() {
    const navigate = useNavigate()
    const { theme, setTheme } = useTheme()
    const { profile } = useAuth()


    // Activate Mobile Safe Area & System Bar styling
    useMobileSafeAreas()

    const { unreadCount } = useNotifications()

    // Listen for custom event to open System Settings
    useEffect(() => {
        const handleOpenSettings = () => {
            navigate('/settings')
        }
        window.addEventListener('open-system-settings', handleOpenSettings)
        return () => window.removeEventListener('open-system-settings', handleOpenSettings)
    }, [navigate])

    const handleThemeToggle = async () => {
        const isNowDark = await toggleThemeWithStatusBar()
        setTheme(isNowDark ? "dark" : "light")
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full flex flex-col h-screen overflow-hidden bg-background">
                <header className="flex items-center gap-4 border-b border-border bg-background px-6 shrink-0 shadow-sm">
                    <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />

                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search here..."
                            className="h-9 w-full bg-muted/50 border-none text-xs pl-8 focus-visible:ring-1 focus-visible:ring-primary/50"
                        />
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        <button
                            onClick={handleThemeToggle}
                            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-accent"
                            title="Toggle Theme"
                        >
                            {theme === "dark" ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            className="text-muted-foreground hover:text-primary transition-all p-2 rounded-lg hover:bg-primary/10 group"
                            title="Settings"
                        >
                            <Settings className="h-5 w-5 group-hover:rotate-45 transition-transform" />
                        </button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className="text-muted-foreground hover:text-primary transition-all relative p-2 rounded-lg hover:bg-primary/10 group"
                                    title="Notifications"
                                >
                                    <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-primary rounded-full border-2 border-background shadow-[0_0_8px_rgba(var(--primary),0.8)] animate-pulse" />
                                    )}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 border-none bg-transparent shadow-none mt-2" align="end">
                                <NotificationList />
                            </PopoverContent>
                        </Popover>
                        <div
                            onClick={() => navigate('/settings')}
                            className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-all ml-2"
                            title="Profile Settings"
                        >
                            <PremiumAvatar
                                src={profile?.avatar_url || undefined}
                                fallback={profile?.full_name?.slice(0, 2).toUpperCase() || "P"}
                                size="sm"
                                badgeIcon={Settings}
                                badgeColor="primary"
                            />
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8 custom-scrollbar bg-muted/20">
                    <Outlet />
                </div>

                {/* Mobile Bottom Navigation */}
                <MobileBottomNav />
            </main>

        </SidebarProvider>
    )
}
