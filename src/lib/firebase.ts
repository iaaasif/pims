import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase, ref, onValue, push, set, off } from 'firebase/database'

const getEnv = (key: string, fallback = '') => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) return import.meta.env[key]
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key]
  return fallback
}

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', 'mock-api-key'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'pims-app.firebaseapp.com'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', 'pims-app'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', 'pims-app.appspot.com'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '1234567890'),
  appId: getEnv('VITE_FIREBASE_APP_ID', '1:1234567890:web:mockappid'),
  databaseURL: getEnv('VITE_FIREBASE_DATABASE_URL', 'https://pims-app-default-rtdb.firebaseio.com')
}

export const isFirebaseConfigured = Boolean(
  getEnv('VITE_FIREBASE_API_KEY') &&
  getEnv('VITE_FIREBASE_API_KEY') !== 'AIzaSyPlaceholderKeyForPims' &&
  getEnv('VITE_FIREBASE_PROJECT_ID') &&
  getEnv('VITE_FIREBASE_PROJECT_ID') !== 'pims-app'
)

// Initialize Firebase safely
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const firebaseAuth = getAuth(firebaseApp)

// Initialize Realtime Database (with error catcher for offline / mock)
let dbInstance: ReturnType<typeof getDatabase> | null = null
try {
  dbInstance = getDatabase(firebaseApp)
} catch (e) {
  console.warn('Firebase Realtime Database initialization:', e)
}

export const firebaseDb = dbInstance

/**
 * Publish a real-time event/notification via Firebase.
 */
export async function sendLiveNotification(channel: string, payload: any) {
  if (!isFirebaseConfigured || !firebaseDb) {
    // In local/mock mode, dispatch a local CustomEvent so real-time features continue to work!
    window.dispatchEvent(new CustomEvent(`live-notification:${channel}`, { detail: payload }))
    return
  }

  try {
    const channelRef = ref(firebaseDb, `notifications/${channel}`)
    const newRef = push(channelRef)
    await set(newRef, {
      ...payload,
      timestamp: Date.now()
    })
  } catch (err) {
    console.warn('Failed to send Firebase notification, falling back to local bus:', err)
    window.dispatchEvent(new CustomEvent(`live-notification:${channel}`, { detail: payload }))
  }
}

/**
 * Subscribe to a real-time channel via Firebase with local bus fallback.
 */
export function subscribeLiveNotifications(channel: string, callback: (payload: any) => void) {
  // Local bus listener (always active for immediate UI feedback & fallback)
  const localHandler = (e: Event) => {
    callback((e as CustomEvent).detail)
  }
  window.addEventListener(`live-notification:${channel}`, localHandler)

  if (!isFirebaseConfigured || !firebaseDb) {
    return () => {
      window.removeEventListener(`live-notification:${channel}`, localHandler)
    }
  }

  try {
    const channelRef = ref(firebaseDb, `notifications/${channel}`)
    const unsubscribe = onValue(channelRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // Find latest item
        const keys = Object.keys(data)
        const latestKey = keys[keys.length - 1]
        if (latestKey) {
          callback(data[latestKey])
        }
      }
    })

    return () => {
      window.removeEventListener(`live-notification:${channel}`, localHandler)
      unsubscribe()
      off(channelRef)
    }
  } catch (err) {
    console.warn('Error subscribing to Firebase channel:', err)
    return () => {
      window.removeEventListener(`live-notification:${channel}`, localHandler)
    }
  }
}
