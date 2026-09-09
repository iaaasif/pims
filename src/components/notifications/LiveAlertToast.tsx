import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LiveAlertToastProps {
    title: string
    description: string
    variant?: 'warning' | 'info' | 'success' | 'destructive'
    onClose: () => void
    onAction?: () => void
    actionLabel?: string
}

export function LiveAlertToast({
    title,
    description,
    variant = 'warning',
    onClose,
    onAction,
    actionLabel
}: LiveAlertToastProps) {
    const variants = {
        warning: "bg-orange-500/10 border-orange-500/50 text-orange-600 dark:text-orange-400",
        info: "bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400",
        success: "bg-primary/10 border-primary/50 text-primary dark:text-primary",
        destructive: "bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400"
    }

    return (
        <div className={cn(
            "flex flex-col gap-3 p-4 rounded-xl border-2 backdrop-blur-md shadow-2xl min-w-[320px] pointer-events-auto",
            variants[variant]
        )}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                    <div className="mt-0.5">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <strong className="text-sm font-bold block mb-1">{title}</strong>
                        <p className="text-xs opacity-90 leading-relaxed font-medium">
                            {description}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {onAction && actionLabel && (
                <div className="flex justify-end pt-1">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-[10px] font-bold uppercase tracking-wider bg-transparent border-current hover:bg-current hover:text-white dark:hover:text-black transition-all"
                        onClick={onAction}
                    >
                        {actionLabel}
                    </Button>
                </div>
            )}
        </div>
    )
}
