import { useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { StatusBar, Style } from '@capacitor/status-bar'
import { NavigationBar } from '@capgo/capacitor-navigation-bar'
import { Capacitor } from '@capacitor/core'

/**
 * Applies proper status bar and navigation bar styling based on active theme.
 *
 * In Capacitor @capacitor/status-bar:
 * - Style.Dark  ("DARK"): Tells the OS the background is dark -> displays LIGHT/WHITE icons.
 * - Style.Light ("LIGHT"): Tells the OS the background is light -> displays DARK/BLACK icons.
 *
 * In @capgo/capacitor-navigation-bar:
 * - darkButtons: true -> dark/black buttons (for light background)
 * - darkButtons: false -> light/white buttons (for dark background)
 */
export const applySystemBarsTheme = async (isDark: boolean) => {
  if (!Capacitor.isNativePlatform()) return

  // 1. Status Bar
  try {
    await StatusBar.show()

    if (isDark) {
      // Dark Mode: White icons on dark background
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: '#020817' })
    } else {
      // Light Mode: Black icons on light background
      await StatusBar.setStyle({ style: Style.Light })
      await StatusBar.setBackgroundColor({ color: '#FFFFFF' })
    }
  } catch (error) {
    console.warn('StatusBar update failed:', error)
  }

  // 2. Android Navigation Bar
  if (Capacitor.getPlatform() === 'android') {
    try {
      if (isDark) {
        // Dark Mode: White buttons on dark background
        await NavigationBar.setNavigationBarColor({
          color: '#020817',
          darkButtons: false
        })
      } else {
        // Light Mode: Black buttons on white background
        await NavigationBar.setNavigationBarColor({
          color: '#FFFFFF',
          darkButtons: true
        })
      }
    } catch (error) {
      console.warn('NavigationBar update failed:', error)
    }
  }
}

export function useStatusBar() {
  const { theme } = useTheme()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const getIsDark = () => {
      if (theme === 'dark') return true
      if (theme === 'light') return false
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    const update = () => {
      applySystemBarsTheme(getIsDark())
    }

    // Apply immediately and after brief delay for Android window attachment
    update()
    const timer = setTimeout(update, 300)

    // Listen for system theme changes when theme is set to 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleMediaChange = () => {
      if (theme === 'system') {
        applySystemBarsTheme(mediaQuery.matches)
      }
    }

    mediaQuery.addEventListener('change', handleMediaChange)

    return () => {
      clearTimeout(timer)
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [theme])
}

// Helper function for manual theme toggling from header/sidebar
export const toggleThemeWithStatusBar = async () => {
  const isCurrentlyDark = document.documentElement.classList.contains('dark')
  const willBeDark = !isCurrentlyDark
  await applySystemBarsTheme(willBeDark)
  return willBeDark
}

