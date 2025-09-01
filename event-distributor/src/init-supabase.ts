// Auto-configure Supabase credentials for immediate use
import { setMode, setSupabaseUrl, setSupabaseAnon } from './services/config';

// Set up the provided Supabase credentials
export function initializeSupabaseConfig() {
  const supabaseUrl = 'https://owkkygszfljtkhjidmnv.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93a2t5Z3N6ZmxqdGtoamlkbW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzIzMzYsImV4cCI6MjA3MjMwODMzNn0.9H6ifHfZi4QG4dAcsBm3P6f0DZDgKvTv5onL6ZTj-Fc';
  
  setMode('supabase');
  setSupabaseUrl(supabaseUrl);
  setSupabaseAnon(supabaseAnonKey);
  
  console.log('✅ Supabase configuration initialized');
}