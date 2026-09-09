// Run this in your browser console or as a temporary component
import { supabase } from '@/lib/supabase'

async function runMigration() {
  try {
    console.log('Adding contact person columns...')
    
    // This will fail if columns don't exist, which tells us we need to add them
    const { error } = await supabase
      .from('projects')
      .select('contact_person, contact_person_phone')
      .limit(1)
    
    if (error && error.message.includes('column')) {
      console.log('❌ Columns do not exist. Please run this SQL in Supabase SQL Editor:')
      console.log(`
ALTER TABLE projects 
ADD COLUMN contact_person TEXT,
ADD COLUMN contact_person_phone TEXT;
      `)
      return false
    }
    
    console.log('✅ Columns exist! Contact person functionality should work.')
    return true
  } catch (err) {
    console.error('Error:', err)
    return false
  }
}

// Export for use
export { runMigration }
