import { neon } from '@neondatabase/serverless'

const connectionString = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_NEON_DATABASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_NEON_DATABASE_URL) ||
  'postgresql://neondb_owner:npg_tTj9wfPXEo1b@ep-curly-unit-b3kptnnt-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

if (!connectionString) {
  console.warn('VITE_NEON_DATABASE_URL is not set in environment variables.')
}

export const sql = neon(connectionString, { disableWarningInBrowsers: true })

export async function queryNeon<T = any>(text: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await (sql as any).query(text, params)
    return result as T[]
  } catch (error) {
    console.error('Neon SQL Query Error:', error, { text, params })
    throw error
  }
}
