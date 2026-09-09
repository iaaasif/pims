import { useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'

// Access StatusBar through Capacitor.Plugins (as confirmed working in DevTools)
declare global {
  interface Window {
    Capacitor: any
  }
}

export function useStatusBar() {
  const { theme } = useTheme()

  useEffect(() => {
    const setupStatusBar = async () => {
      try {
        // Check if running in native app environment
        const isNativeApp = window.Capacitor?.getPlatform() !== 'web'
        
        if (!isNativeApp) {
          return // Silently return on web - no logging
        }

        // Check if StatusBar plugin is available
        if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.StatusBar) {
          return // Silently return if plugin not available
        }

        // Force show status bar
        await window.Capacitor.Plugins.StatusBar.show()

        const isDark = theme === 'dark' ||
          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

        // Set status bar style and background based on theme
        if (isDark) {
          // Dark theme: Light icons on dark background
          await window.Capacitor.Plugins.StatusBar.setStyle({ style: 'LIGHT' })
          await window.Capacitor.Plugins.StatusBar.setBackgroundColor({ color: '#000000' })
        } else {
          // Light theme: Dark icons on light background
          await window.Capacitor.Plugins.StatusBar.setStyle({ style: 'DARK' })
          await window.Capacitor.Plugins.StatusBar.setBackgroundColor({ color: '#FFFFFF' })
        }
      } catch (error) {
        // Completely silent on web platform - no logging at all
        if (window.Capacitor?.getPlatform() !== 'web') {
          console.error('StatusBar setup error:', error)
        }
      }
    }

    // Setup immediately and also delay a bit for Android
    setupStatusBar()
    setTimeout(setupStatusBar, 1000)
  }, [theme])
}

// Direct theme toggle function for manual control
export const toggleThemeWithStatusBar = async () => {
  const isNowDarkMode = document.body.classList.toggle('dark');

  // Only apply StatusBar changes in native app
  const isNativeApp = window.Capacitor?.getPlatform() !== 'web'
  
  if (isNativeApp && window.Capacitor?.Plugins?.StatusBar) {
    if (isNowDarkMode) {
      // Dark Mode: Light icons on dark background
      await window.Capacitor.Plugins.StatusBar.setStyle({ style: 'LIGHT' });
      await window.Capacitor.Plugins.StatusBar.setBackgroundColor({ color: '#000000' });
    } else {
      // Light Mode: Dark icons on light background
      await window.Capacitor.Plugins.StatusBar.setStyle({ style: 'DARK' });
      await window.Capacitor.Plugins.StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    }
  }

  return isNowDarkMode;
}
