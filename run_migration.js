import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('Adding contact person columns to projects table...')
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE projects 
        ADD COLUMN IF NOT EXISTS contact_person TEXT,
        ADD COLUMN IF NOT EXISTS contact_person_phone TEXT;
      `
    })
    
    if (error) {
      console.error('Migration failed:', error)
    } else {
      console.log('Migration completed successfully!')
    }
  } catch (err) {
    console.error('Error running migration:', err)
  }
}

runMigration()
