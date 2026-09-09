import React, { useState, useEffect } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { debugMode } = useSettings()

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true)
      setError(event.error)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Oops! Something went wrong</h1>
            <p className="text-muted-foreground">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
          </div>

          {debugMode && error && (
            <div className="text-left bg-muted p-4 rounded-lg border border-border overflow-auto max-h-[400px]">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Debug Information</p>
              <pre className="text-sm font-mono text-destructive">
                {error.stack || error.message}
              </pre>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Refresh Page
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setHasError(false)
                setError(null)
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
