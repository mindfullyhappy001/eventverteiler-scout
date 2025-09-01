export type AppMode = 'api' | 'supabase';

const keys = {
  apiBase: 'apiBase',
  supabaseUrl: 'supabaseUrl',
  supabaseAnon: 'supabaseAnon',
  mode: 'appMode',
};

export function getMode(): AppMode {
  if (typeof window === 'undefined') return 'api';
  return (localStorage.getItem(keys.mode) as AppMode) || 'api';
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
  if (typeof window !== 'undefined') return localStorage.getItem(keys.supabaseUrl) || '';
  return '';
}
export function setSupabaseUrl(v: string) {
  if (typeof window !== 'undefined') localStorage.setItem(keys.supabaseUrl, v);
}
export function getSupabaseAnon() {
  if (typeof window !== 'undefined') return localStorage.getItem(keys.supabaseAnon) || '';
  return '';
}
export function setSupabaseAnon(v: string) {
  if (typeof window !== 'undefined') localStorage.setItem(keys.supabaseAnon, v);
}
