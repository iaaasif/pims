/**
 * PIMS Backend Adapter
 * Migrated from Supabase to:
 * - Neon Serverless PostgreSQL (Database operations via HTTP)
 * - Firebase (Real-time notifications and live event pub/sub)
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { neonDb } from './neonPostgresClient'

// Export singleton instance mapped to Neon DB + Firebase live notifications with full SupabaseClient typing
export const supabase = neonDb as unknown as SupabaseClient

export { neonDb }
