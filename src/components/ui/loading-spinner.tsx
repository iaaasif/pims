import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ className, size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-24 w-24 border-8'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
      <div 
        className={cn(
          'animate-spin rounded-full border-primary border-t-transparent',
          sizeClasses[size]
        )} 
      />
      {text && (
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse text-center">
          {text}
        </p>
      )}
    </div>
  )
}
