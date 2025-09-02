import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { execa } from 'execa';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_KEY || '';
const ADMIN_EMAIL = process.env.SUPABASE_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.SUPABASE_ADMIN_PASSWORD || '';

async function supabaseClient() {
  if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
  if (SUPABASE_SERVICE_ROLE) return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const sb = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON || process.env.SUPABASE_ANON_KEY || '', { auth: { persistSession: false } });
    const { error } = await sb.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    if (error) throw error; return sb;
  }
  throw new Error('Supply SUPABASE_SERVICE_ROLE or SUPABASE_ADMIN_EMAIL/PASSWORD (+ anon)');
}

async function pickNextJob(sb: any) {
  const { data, error } = await sb.from('PublishJob')
    .select('*')
    .eq('status','scheduled')
    .lte('scheduledAt', new Date().toISOString())
    .order('createdAt', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error; return data;
}

async function loadEvent(sb: any, id: string) {
  const { data, error } = await sb.from('Event').select('*').eq('id', id).single();
  if (error) throw error; return data;
}
async function loadPlatformCfg(sb: any, platform: string, method: 'api'|'ui') {
  const { data, error } = await sb.from('PlatformConfig').select('*').eq('platform', platform).eq('method', method).maybeSingle();
  if (error) throw error; return data?.config || {};
}

async function markJob(sb: any, id: string, fields: any) {
  const { error } = await sb.from('PublishJob').update({ ...fields, updatedAt: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
async function upsertPublication(sb: any, eventId: string, platform: string, method: 'api'|'ui', status: string, details: any) {
  const { data: exist } = await sb.from('EventPublication').select('id').eq('eventId', eventId).eq('platform', platform).eq('method', method).maybeSingle();
  if (exist?.id) {
    const { error } = await sb.from('EventPublication').update({ status, details, updatedAt: new Date().toISOString() }).eq('id', exist.id);
    if (error) throw error;
  } else {
    const { error } = await sb.from('EventPublication').insert([{ eventId, platform, method, status, details }]);
    if (error) throw error;
  }
}

async function saveFieldOptions(sb: any, platform: string, method: 'api'|'ui', options: Record<string, string[]>) {
  for (const [field, opts] of Object.entries(options || {})) {
    const { data: exist } = await sb.from('FieldOption').select('id').eq('platform', platform).eq('method', method).eq('field', field).maybeSingle();
    if (exist?.id) {
      const { error } = await sb.from('FieldOption').update({ options: opts, updatedAt: new Date().toISOString() }).eq('id', exist.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from('FieldOption').insert([{ platform, method, field, options: opts }]);
      if (error) throw error;
    }
  }
}

async function runOnce() {
  const sb = await supabaseClient();
  const job = await pickNextJob(sb);
  if (!job) return false;
  await markJob(sb, job.id, { status: 'running' });

  try {
    const event = await loadEvent(sb, job.eventId);
    const cfg = await loadPlatformCfg(sb, job.platform, job.method);

    if (job.platform === 'spontacts' && job.method === 'ui' && job.action === 'discover') {
      const res = await execa('tsx', ['src/spontacts/discoverOptions.ts'], {
        cwd: new URL('./', import.meta.url).pathname.replace(/bots\/$/, 'bots/'),
        stdio: 'pipe',
        env: {
          EVENT_JSON: JSON.stringify(event),
          BOT_CONFIG: JSON.stringify(cfg || {}),
          JOB_ID: job.id,
        }
      });
      if (res.exitCode === 0) {
        try {
          const parsed = JSON.parse((res.stdout || '').trim() || '{}');
          if (parsed?.options) await saveFieldOptions(sb, job.platform, job.method, parsed.options);
        } catch {}
        await markJob(sb, job.id, { status: 'completed', result: { ok: true } });
      } else {
        throw new Error('Discover bot exited with code ' + res.exitCode);
      }
    } else if (job.platform === 'spontacts' && job.method === 'ui') {
      const res = await execa('tsx', ['src/spontacts/createEvent.ts'], {
        cwd: new URL('./', import.meta.url).pathname.replace(/bots\/$/, 'bots/'),
        stdio: 'inherit',
        env: {
          EVENT_JSON: JSON.stringify(event),
          BOT_CONFIG: JSON.stringify(cfg || {}),
          JOB_ID: job.id,
        }
      });
      if (res.exitCode === 0) {
        await upsertPublication(sb, job.eventId, job.platform, job.method, 'published', { jobId: job.id });
        await markJob(sb, job.id, { status: 'completed' });
      } else {
        throw new Error('Bot exited with code ' + res.exitCode);
      }
    } else {
      throw new Error('Unsupported job: ' + job.platform + '/' + job.method + '/' + job.action);
    }
  } catch (e: any) {
    await upsertPublication(sb, job.eventId, job.platform, job.method, 'error', { error: e?.message || String(e) });
    await markJob(sb, job.id, { status: 'error', lastError: e?.message || String(e) });
  }
  return true;
}

async function loop() {
  while (true) {
    const worked = await runOnce();
    if (!worked) await new Promise(r => setTimeout(r, 3000));
  }
}

if (process.argv[2] === 'once') runOnce();
else loop();