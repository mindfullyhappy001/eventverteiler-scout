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

export async function listPlatformConfigs(): Promise<any[]> {
  if (getMode() === 'api') return api<any[]>('/api/platforms');
  const sb: any = supa();
  const { data, error } = await sb.from('PlatformConfig').select('*').order('platform');
  if (error) throw error; return data || [];
}

export async function savePlatformConfig(platform: string, method: 'api'|'ui', config: any, enabled = true) {
  if (getMode() === 'api') {
    const items = await api<any[]>('/api/platforms');
    const exist = items.find((i) => i.platform === platform && i.method === method);
    if (exist) return api(`/api/platforms/${exist.id}`, { method: 'PUT', body: JSON.stringify({ config, enabled }) });
    return api('/api/platforms', { method: 'POST', body: JSON.stringify({ platform, method, name: `${platform} ${method}`, config, enabled }) });
  }
  const sb: any = supa();
  // Upsert by (platform, method)
  const { data: exist, error: e1 } = await sb.from('PlatformConfig').select('id').eq('platform', platform).eq('method', method).maybeSingle();
  if (e1) throw e1;
  if (exist?.id) {
    const { error } = await sb.from('PlatformConfig').update({ config, enabled, updatedAt: new Date().toISOString() }).eq('id', exist.id);
    if (error) throw error; return { id: exist.id };
  } else {
    const { data, error } = await sb.from('PlatformConfig').insert([{ platform, method, name: `${platform} ${method}`, config, enabled }]).select('id').single();
    if (error) throw error; return data;
  }
}

export async function schedulePublishJob(payload: { eventId: string; platform: string; method: 'api'|'ui'; action?: 'create'|'update'|'delete'; scheduledAt?: string; }) {
  if (getMode() === 'api') return api('/api/publish', { method: 'POST', body: JSON.stringify(payload) });
  const sb: any = supa();
  const { error } = await sb.from('PublishJob').insert([{ 
    eventId: payload.eventId,
    platform: payload.platform,
    method: payload.method,
    action: payload.action || 'create',
    scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt).toISOString() : new Date().toISOString(),
    status: 'scheduled'
  }]);
  if (error) throw error; return { ok: true };
}

export async function listFieldOptionsFor(platform: string, method?: 'api'|'ui'): Promise<Record<string, string[]>> {
  if (getMode() === 'api') {
    const res = await api<any>(`/api/field-options?platform=${encodeURIComponent(platform)}${method?`&method=${method}`:''}`);
    return (res?.options as Record<string,string[]>) || {};
  }
  const sb: any = supa();
  let q = sb.from('FieldOption').select('*').eq('platform', platform);
  if (method) q = q.eq('method', method);
  const { data, error } = await q;
  if (error) throw error;
  const map: Record<string, string[]> = {};
  (data || []).forEach((row: any) => { map[row.field] = row.options || []; });
  return map;
}

export async function scheduleOptionDiscovery(platform: string, method: 'api'|'ui' = 'ui') {
  // On-demand: schedule discovery job for the Desktop Runner (or any Playwright runner)
  const sb: any = supa();
  const { data: ev, error: e1 } = await sb.from('Event').insert([{ title: `Options Refresh ${platform}`, description: 'Auto-generated placeholder for discovery' }]).select('id').single();
  if (e1) throw e1;
  const { error: e2 } = await sb.from('PublishJob').insert([{ 
    eventId: ev.id,
    platform,
    method,
    action: 'discover',
    scheduledAt: new Date().toISOString(),
    status: 'scheduled'
  }]);
  if (e2) throw e2; return { ok: true };
}

export async function scheduleOptionDiscoveryAll() {
  const platforms = ['spontacts','meetup','eventbrite','facebook'];
  for (const p of platforms) await scheduleOptionDiscovery(p,'ui');
  return { ok: true };
}