import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Building2, Package, FileText, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Building2, label: 'Projects', path: '/projects' },
    { icon: Package, label: 'Inventory', path: '/inventory', featured: true },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Menu, label: 'Menu', path: '/settings' },
]

export function MobileBottomNav() {
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 border-t border-border backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <nav className="flex items-center justify-around px-4 py-3 max-w-md mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group",
                                item.featured ? "scale-110" : ""
                            )}
                        >
                            {/* Icon container */}
                            <div
                                className={cn(
                                    "relative flex items-center justify-center rounded-2xl transition-all duration-300",
                                    item.featured
                                        ? "w-14 h-14 bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/50"
                                        : "w-12 h-12",
                                    isActive && !item.featured && "bg-accent",
                                    !isActive && !item.featured && "hover:bg-accent/50"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "transition-all duration-300",
                                        item.featured
                                            ? "w-7 h-7 text-primary-foreground"
                                            : "w-5 h-5",
                                        isActive && !item.featured
                                            ? "text-primary"
                                            : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                />

                                {/* Active indicator */}
                                {isActive && !item.featured && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                                )}
                            </div>

                            {/* Label */}
                            {!item.featured && (
                                <span
                                    className={cn(
                                        "text-[10px] font-medium transition-colors duration-300",
                                        isActive
                                            ? "text-primary"
                                            : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                >
                                    {item.label}
                                </span>
                            )}
                        </button>
                    )
                })}
            </nav>
        </div>
    )
}
