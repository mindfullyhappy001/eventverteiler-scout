import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAnon, getSupabaseUrl } from './config';

let client: SupabaseClient | null = null;

function resolveSupabaseConfig() {
  const urlCandidates: Array<string | null | undefined> = [];
  const anonCandidates: Array<string | null | undefined> = [];

  try {
    const envs: any = (import.meta as any)?.env || {};
    urlCandidates.push(envs.VITE_SUPABASE_URL, envs.NEXT_PUBLIC_SUPABASE_URL, envs.SUPABASE_URL, envs.PUBLIC_SUPABASE_URL);
    anonCandidates.push(
      envs.VITE_SUPABASE_ANON,
      envs.VITE_SUPABASE_ANON_KEY,
      envs.NEXT_PUBLIC_SUPABASE_ANON,
      envs.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      envs.SUPABASE_ANON,
      envs.SUPABASE_ANON_KEY,
      envs.PUBLIC_SUPABASE_ANON,
      envs.PUBLIC_SUPABASE_ANON_KEY
    );
  } catch {}

  try {
    if (typeof window !== 'undefined') {
      urlCandidates.push(window.localStorage.getItem('supabaseUrl'));
      anonCandidates.push(window.localStorage.getItem('supabaseAnon'));
      urlCandidates.push((window as any).__SUPABASE_URL);
      anonCandidates.push((window as any).__SUPABASE_ANON);
    }
  } catch {}

  try {
    if (typeof document !== 'undefined') {
      const mUrl = document.querySelector('meta[name="supabase-url"]')?.getAttribute('content');
      const mAnon = document.querySelector('meta[name="supabase-anon"]')?.getAttribute('content');
      urlCandidates.push(mUrl);
      anonCandidates.push(mAnon);
    }
  } catch {}

  // Final fallback to config helpers (which already check env + localStorage)
  const url = (urlCandidates.find(v => !!v && String(v).trim().length > 0) as string) || getSupabaseUrl();
  const anon = (anonCandidates.find(v => !!v && String(v).trim().length > 0) as string) || getSupabaseAnon();
  return { url, anon };
}

export function supa() {
  const { url, anon } = resolveSupabaseConfig();
  if (!url || !anon) throw new Error('Supabase URL/AnonKey nicht gesetzt');
  if (!client) client = createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}

export function resetSupa() {
  client = null;
}
