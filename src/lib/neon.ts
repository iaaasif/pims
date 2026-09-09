import { neon } from '@neondatabase/serverless'

const connectionString = import.meta.env.VITE_NEON_DATABASE_URL || ''

if (!connectionString) {
  console.warn('VITE_NEON_DATABASE_URL is not set in environment variables.')
}

export const sql = neon(connectionString)

export async function queryNeon<T = any>(text: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await (sql as any).query(text, params)
    return result as T[]
  } catch (error) {
    console.error('Neon SQL Query Error:', error, { text, params })
    throw error
  }
}
