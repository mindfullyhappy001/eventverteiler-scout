import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const BOT_EMAIL = process.env.SUPABASE_BOT_EMAIL || '';
const BOT_PASSWORD = process.env.SUPABASE_BOT_PASSWORD || '';

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Set SUPABASE_URL and SUPABASE_ANON_KEY');
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  if (!BOT_EMAIL || !BOT_PASSWORD) throw new Error('Set SUPABASE_BOT_EMAIL and SUPABASE_BOT_PASSWORD');
  const { error: authErr } = await sb.auth.signInWithPassword({ email: BOT_EMAIL, password: BOT_PASSWORD });
  if (authErr) throw authErr;
  const platforms = ['spontacts','meetup','eventbrite','facebook'];
  for (const p of platforms) {
    await sb.from('PublishJob').insert([{ eventId: (await ensurePlaceholderEvent(sb)).id, platform: p, method: 'ui', action: 'discover', scheduledAt: new Date().toISOString(), status: 'scheduled' }]);
    console.log(`Scheduled discover for ${p}`);
  }
}

async function ensurePlaceholderEvent(sb: any) {
  const { data } = await sb.from('Event').insert([{ title: 'Options Refresh', description: 'Auto-generated placeholder for discovery' }]).select('id').single();
  return data;
}

main().catch((e)=>{ console.error(e); process.exit(1); });
