import { useStatusBar } from './useStatusBar';

/**
 * Mobile Safe Areas & System Bars hook.
 * Safe area insets (notches, home bars) are handled via CSS env(safe-area-inset-*).
 * System bars (StatusBar & NavigationBar) are managed cleanly by useStatusBar with full dark/light theme support.
 */
export function useMobileSafeAreas() {
    useStatusBar();
}

