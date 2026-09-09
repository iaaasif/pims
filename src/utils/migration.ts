import { supabase } from '@/lib/supabase'

export async function addContactPersonColumns() {
  try {
    console.log('Adding contact person columns to projects table...')
    
    // Try to add the columns using raw SQL
    const { error } = await supabase
      .from('projects')
      .select('contact_person, contact_person_phone')
      .limit(1)
    
    if (error && error.message.includes('column')) {
      // Columns don't exist, need to add them
      console.log('Columns do not exist. Please run this SQL in Supabase SQL Editor:')
      console.log(`
        ALTER TABLE projects 
        ADD COLUMN contact_person TEXT,
        ADD COLUMN contact_person_phone TEXT;
      `)
      return { success: false, needsManualMigration: true }
    }
    
    console.log('Columns already exist or migration completed!')
    return { success: true }
  } catch (err) {
    console.error('Error checking columns:', err)
    return { success: false, error: err }
  }
}
