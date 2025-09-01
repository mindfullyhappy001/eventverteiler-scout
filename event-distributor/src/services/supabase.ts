import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnon, getSupabaseUrl } from './config';

let client: ReturnType<typeof createClient> | null = null;

export function supa() {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnon();
  if (!url || !anon) throw new Error('Supabase URL/AnonKey nicht gesetzt');
  if (!client) client = createClient(url, anon);
  return client;
}
