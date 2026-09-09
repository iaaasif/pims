import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      const isDebug = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true'

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
                An unexpected application error occurred. You can try refreshing the page or restarting the current view.
              </p>
            </div>

            {isDebug && this.state.error && (
              <div className="text-left bg-muted p-4 rounded-lg border border-border overflow-auto max-h-[400px]">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Debug Information</p>
                <pre className="text-sm font-mono text-destructive whitespace-pre-wrap">
                  {this.state.error.stack || this.state.error.message}
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
                  this.setState({ hasError: false, error: null })
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
