import { LoadingSpinner } from './loading-spinner'

interface SyncLoaderProps {
  className?: string
  fullScreen?: boolean
}

export function SyncLoader({ className, fullScreen = false }: SyncLoaderProps) {
  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex items-center justify-center'
    : 'flex items-center justify-center min-h-[200px]'

  return (
    <div className={`${containerClasses} ${className || ''}`}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">
            Synchronizing PIMS data...
          </h3>
          <p className="text-sm text-gray-300">
            Please wait while we sync your inventory management system
          </p>
        </div>
      </div>
    </div>
  )
}
