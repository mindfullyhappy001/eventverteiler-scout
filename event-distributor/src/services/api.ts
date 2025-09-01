export function getApiBase() {
  if (typeof window !== 'undefined') {
    const ls = localStorage.getItem('apiBase');
    if (ls) return ls;
  }
  const fromEnv = (import.meta as any)?.env?.VITE_API_URL;
  return fromEnv || 'http://localhost:8080';
}

export function setApiBase(url: string) {
  if (typeof window !== 'undefined') localStorage.setItem('apiBase', url);
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const API_URL = getApiBase();
