import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ActionItem {
    label: string
    icon: React.ReactNode
    onClick: () => void
    variant?: 'default' | 'destructive' | 'success'
    disabled?: boolean
}

interface TableActionProps {
    actions: ActionItem[]
    className?: string
}

export function TableAction({ actions, className }: TableActionProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "h-8 px-3 border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all font-bold gap-1 group shadow-sm",
                        className
                    )}
                >
                    Action
                    <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-300" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-2xl border-border bg-popover/95 backdrop-blur-md">
                {actions.map((action, idx) => (
                    <DropdownMenuItem
                        key={idx}
                        disabled={action.disabled}
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (action.disabled) return
                            console.log('Dropdown item clicked:', action.label)
                            action.onClick()
                        }}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-xs cursor-pointer transition-colors",
                            action.variant === 'destructive'
                                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                : action.variant === 'success'
                                    ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                            action.disabled && "opacity-50 cursor-not-allowed pointer-events-auto"
                        )}
                    >
                        <span className={cn(
                            "p-1.5 rounded-md",
                            action.variant === 'destructive' ? "bg-red-500/10" : action.variant === 'success' ? "bg-green-500/10" : "bg-muted shadow-sm"
                        )}>
                            {action.icon}
                        </span>
                        {action.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
