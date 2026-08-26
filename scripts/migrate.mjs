import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nsitkygdnifujmygruza.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zaXRreWdkbmlmdWpteWdydXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY3NjU4OCwiZXhwIjoyMTAzMjUyNTg4fQ.KxfVxkUcjWQ9RQ6bbvUSgSP4LRLkfPEjRZGF5sovkT4';

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('categories').select('*').limit(5);
    if (error) {
      console.log('Note: Tables not yet created in Supabase. Please paste schema.sql in Supabase SQL Editor.');
    } else {
      console.log('Successfully connected to Supabase! Existing categories:', data);
    }
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testConnection();
