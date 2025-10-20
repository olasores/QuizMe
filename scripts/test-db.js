// This script tests the connection to your Supabase database
// Run with: node --experimental-modules scripts/test-db.js

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testDatabaseConnection() {
  console.log('Testing connection to Supabase...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local file');
    console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE set');
    process.exit(1);
  }
  
  console.log(`Connecting to Supabase URL: ${supabaseUrl}`);
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test query to check if we can connect
    const { data, error } = await supabase.from('quizzes').select('count(*)');
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('Database query result:', data);
    
    // Test if tables exist
    const tables = ['quizzes', 'questions', 'quiz_attempts', 'activities'];
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count(*)');
      if (error) {
        console.error(`⚠️ Error accessing table '${table}':`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    console.error('Please check your credentials and make sure the database is set up correctly.');
    process.exit(1);
  }
}

testDatabaseConnection();