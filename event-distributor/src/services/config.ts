export type AppMode = 'api' | 'supabase';

const keys = {
  apiBase: 'apiBase',
  supabaseUrl: 'supabaseUrl',
  supabaseAnon: 'supabaseAnon',
  mode: 'appMode',
};

export function getMode(): AppMode {
  if (typeof window === 'undefined') return 'supabase';
  return (localStorage.getItem(keys.mode) as AppMode) || 'supabase';
}
export function setMode(m: AppMode) {
  if (typeof window !== 'undefined') localStorage.setItem(keys.mode, m);
}

export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const ls = localStorage.getItem(keys.apiBase);
    if (ls) return ls;
  }
  const env = (import.meta as any)?.env?.VITE_API_URL;
  return env || 'http://localhost:8080';
}
export function setApiBase(url: string) {
  if (typeof window !== 'undefined') localStorage.setItem(keys.apiBase, url);
}

export function getSupabaseUrl() {
  const env = (import.meta as any)?.env?.VITE_SUPABASE_URL;
  if (env) return env;
  if (typeof window !== 'undefined') return localStorage.getItem(keys.supabaseUrl) || '';
  return '';
}
export function setSupabaseUrl(v: string) {
  if (typeof window !== 'undefined') localStorage.setItem(keys.supabaseUrl, v);
}
export function getSupabaseAnon() {
  const env = (import.meta as any)?.env?.VITE_SUPABASE_ANON;
  if (env) return env;
  if (typeof window !== 'undefined') return localStorage.getItem(keys.supabaseAnon) || '';
  return '';
}
export function setSupabaseAnon(v: string) {
  if (typeof window !== 'undefined') localStorage.setItem(keys.supabaseAnon, v);
}
