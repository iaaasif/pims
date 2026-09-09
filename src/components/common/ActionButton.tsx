import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ActionButtonProps {
    actions: Array<{
        label: string
        icon?: React.ReactNode
        onClick?: () => void
        variant?: 'default' | 'destructive'
        separator?: boolean
        disabled?: boolean
    }>
}

export function ActionButton({ actions }: ActionButtonProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {actions.map((action) => (
                    <div key={action.label}>
                        <DropdownMenuItem
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className={action.variant === 'destructive' ? 'text-destructive' : ''}
                        >
                            <div className="flex items-center gap-2">
                                {action.icon}
                                <span>{action.label}</span>
                            </div>
                        </DropdownMenuItem>
                        {action.separator && <DropdownMenuSeparator />}
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

