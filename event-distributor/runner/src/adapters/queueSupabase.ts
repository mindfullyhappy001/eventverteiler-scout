import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cfg, requireEnv } from '../config';

export type Method = 'api'|'ui';

export class SupabaseQueue {
  private sb: SupabaseClient;
  private authed = false;
  constructor() {
    requireEnv('SUPABASE_URL', cfg.supabaseUrl);
    requireEnv('SUPABASE_ANON_KEY', cfg.supabaseAnon);
    this.sb = createClient(cfg.supabaseUrl, cfg.supabaseAnon);
  }
  async authBot() {
    if (this.authed) return;
    if (!cfg.botEmail || !cfg.botPassword) throw new Error('Missing SUPABASE_BOT_EMAIL/PASSWORD');
    const { error } = await this.sb.auth.signInWithPassword({ email: cfg.botEmail, password: cfg.botPassword });
    if (error) throw error;
    this.authed = true;
  }
  async pickNextJob() {
    await this.authBot();
    const { data, error } = await this.sb.from('PublishJob')
      .select('*')
      .eq('status','scheduled')
      .lte('scheduledAt', new Date().toISOString())
      .order('createdAt', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error; return data;
  }
  async markJob(id: string, fields: any) {
    await this.authBot();
    const { error } = await this.sb.from('PublishJob').update({ ...fields, updatedAt: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }
  async loadEvent(id: string) {
    await this.authBot();
    const { data, error } = await this.sb.from('Event').select('*').eq('id', id).single();
    if (error) throw error; return data;
  }
  async loadPlatformCfg(platform: string, method: Method) {
    await this.authBot();
    const { data, error } = await this.sb.from('PlatformConfig').select('*').eq('platform', platform).eq('method', method).maybeSingle();
    if (error) throw error; return (data as any)?.config || {};
  }
  async upsertPublication(eventId: string, platform: string, method: Method, status: string, details: any) {
    await this.authBot();
    const { data: exist } = await this.sb.from('EventPublication').select('id').eq('eventId', eventId).eq('platform', platform).eq('method', method).maybeSingle();
    if (exist?.id) {
      const { error } = await this.sb.from('EventPublication').update({ status, details, updatedAt: new Date().toISOString() }).eq('id', exist.id);
      if (error) throw error;
    } else {
      const { error } = await this.sb.from('EventPublication').insert([{ eventId, platform, method, status, details }]);
      if (error) throw error;
    }
  }
  async saveFieldOptions(platform: string, method: Method, map: Record<string,string[]>) {
    await this.authBot();
    for (const [field, options] of Object.entries(map)) {
      const { data: exist } = await this.sb.from('FieldOption').select('id').eq('platform', platform).eq('method', method).eq('field', field).maybeSingle();
      if (exist?.id) {
        const { error } = await this.sb.from('FieldOption').update({ options, updatedAt: new Date().toISOString() }).eq('id', exist.id);
        if (error) throw error;
      } else {
        const { error } = await this.sb.from('FieldOption').insert([{ platform, method, field, options }]);
        if (error) throw error;
      }
    }
  }
  client() { return this.sb; }
}
