import { api } from './api';
import { getMode } from './config';
import { supa } from './supabase';
import type { EventInput } from '../../shared/types';

export async function listEvents(params: { q?: string }): Promise<any[]> {
  if (getMode() === 'api') return api<any[]>('/api/events' + (params.q ? `?q=${encodeURIComponent(params.q)}` : ''));
  const sb: any = supa();
  let q = sb.from('Event').select('*, publications:EventPublication(*)').order('createdAt', { ascending: false });
  if (params.q) q = q.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  const { data, error } = await q;
  if (error) throw error; return (data as any[]) || [];
}

export async function createEvent(v: EventInput) {
  if (getMode() === 'api') return api('/api/events', { method: 'POST', body: JSON.stringify(v) });
  const sb: any = supa();
  const { data, error } = await sb.from('Event').insert([v]).select().single();
  if (error) throw error; return data;
}

export async function updateEvent(id: string, v: EventInput) {
  if (getMode() === 'api') return api(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(v) });
  const sb: any = supa();
  const { data, error } = await sb.from('Event').update(v).eq('id', id).select().single();
  if (error) throw error; return data;
}

export async function deleteEvent(id: string) {
  if (getMode() === 'api') return api(`/api/events/${id}`, { method: 'DELETE' });
  const sb: any = supa();
  const { error } = await sb.from('Event').delete().eq('id', id);
  if (error) throw error; return { ok: true };
}

export async function copyEvent(id: string) {
  if (getMode() === 'api') return api(`/api/events/${id}/copy`, { method: 'POST' });
  const sb: any = supa();
  const { data: orig, error } = await sb.from('Event').select('*').eq('id', id).single();
  if (error) throw error;
  const { id: _id, createdAt, updatedAt, ...rest } = orig;
  const payload = { ...rest, title: (orig.title || 'Event') + ' (Copy)' };
  const { data: copy, error: e2 } = await sb.from('Event').insert([payload]).select().single();
  if (e2) throw e2; return copy;
}
