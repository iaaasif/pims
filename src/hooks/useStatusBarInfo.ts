import { StatusBar } from '@capacitor/status-bar'
import { useState, useEffect } from 'react'

export interface StatusBarInfo {
  visible: boolean
  style: 'LIGHT' | 'DARK' | 'DEFAULT'
  color?: string
  overlays?: boolean
}

export function useStatusBarInfo() {
  const [statusBarInfo, setStatusBarInfo] = useState<StatusBarInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Method 1: Using the modern StatusBar.getInfo()
      const info = await StatusBar.getInfo()
      setStatusBarInfo(info)
      
      // Method 2: Alternative using Capacitor.Plugins (older syntax)
      // const info = await Capacitor.Plugins.StatusBar.getInfo()
      
      return info
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get status bar info'
      setError(errorMessage)
      console.error('StatusBar getInfo error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getInfo()
  }, [])

  return {
    statusBarInfo,
    loading,
    error,
    refresh: getInfo
  }
}
