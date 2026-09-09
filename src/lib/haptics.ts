/**
 * Haptic feedback utility for mobile touch operations (tactile confirmation)
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'warning' | 'error' = 'light') => {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) {
    return
  }

  try {
    switch (type) {
      case 'light':
        window.navigator.vibrate(15)
        break
      case 'medium':
        window.navigator.vibrate(30)
        break
      case 'success':
        window.navigator.vibrate([20, 50, 20])
        break
      case 'warning':
        window.navigator.vibrate([40, 80, 40])
        break
      case 'error':
        window.navigator.vibrate([60, 50, 60, 50, 60])
        break
      default:
        window.navigator.vibrate(20)
    }
  } catch (e) {
    console.debug('Haptic feedback not supported on this device', e)
  }
}
