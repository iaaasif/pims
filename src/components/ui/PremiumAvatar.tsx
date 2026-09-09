import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState } from 'react'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

interface PremiumAvatarProps {
    src?: string
    fallback: string
    size?: AvatarSize
    badgeIcon?: LucideIcon
    badgeColor?: 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'secondary'
    className?: string
}

export function PremiumAvatar({
    src,
    fallback,
    size = 'md',
    badgeIcon: BadgeIcon,
    badgeColor = 'success',
    className
}: PremiumAvatarProps) {
    const [imageError, setImageError] = useState(false)

    const sizeClasses = {
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
        xxl: "h-20 w-20"
    }

    const badgeSizeClasses = {
        xs: "h-2 w-2 p-0",
        sm: "h-3 w-3 p-0",
        md: "h-4 w-4 p-0.5",
        lg: "h-5 w-5 p-1",
        xl: "h-6 w-6 p-1",
        xxl: "h-7 w-7 p-1"
    }

    const colorClasses = {
        primary: "bg-primary text-primary-foreground",
        success: "bg-primary text-primary-foreground",
        warning: "bg-orange-500 text-white",
        info: "bg-blue-500 text-white",
        danger: "bg-red-500 text-white",
        secondary: "bg-slate-500 text-white"
    }

    const handleImageError = () => {
        setImageError(true)
    }

    // Ensure fallback is always a string
    const safeFallback = fallback || 'U'

    return (
        <div className={cn("relative inline-block shrink-0", className)}>
            <Avatar className={cn(sizeClasses[size], "border border-border shadow-sm")}>
                {src && !imageError && (
                    <AvatarImage 
                        src={src} 
                        className="object-cover" 
                        onError={handleImageError}
                    />
                )}
                <AvatarFallback className="bg-muted text-primary font-bold text-[0.6em]">
                    {safeFallback}
                </AvatarFallback>
            </Avatar>

            {BadgeIcon && (
                <div className={cn(
                    "absolute -bottom-1 -right-1 rounded-full flex items-center justify-center border-2 border-background shadow-lg transition-transform hover:scale-110 cursor-pointer",
                    badgeSizeClasses[size],
                    colorClasses[badgeColor]
                )}>
                    <BadgeIcon className="h-full w-full" />
                </div>
            )}
        </div>
    )
}
