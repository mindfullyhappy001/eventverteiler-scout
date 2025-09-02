import type { VercelRequest, VercelResponse } from '@vercel/node';

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function decodeHtml(s: string) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function extractOptions(html: string, labelRegex: RegExp): string[] {
  try {
    const idx = html.search(labelRegex);
    if (idx === -1) return [];
    const after = html.slice(idx);
    const selStart = after.search(/<select[\s\S]*?>/i);
    if (selStart === -1) return [];
    const selAll = after.slice(selStart);
    const endIdx = selAll.search(/<\/select>/i);
    if (endIdx === -1) return [];
    const selHtml = selAll.slice(0, endIdx);
    const opts: string[] = [];
    const re = /<option[^>]*>([\s\S]*?)<\/option>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(selHtml))) {
      const t = decodeHtml(m[1]).replace(/<[^>]+>/g, '').trim();
      if (t) opts.push(t);
    }
    return Array.from(new Set(opts));
  } catch {
    return [];
  }
}

async function fetchSpontactsOptions(): Promise<Record<string, string[]>> {
  const res = await fetch('https://www.spontacts.com/activities/new', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const category = extractOptions(html, /kateg|categ|Kategorie|Category/i);
  const visibility = extractOptions(html, /sichtbar|visib|Sichtbarkeit|Visibility/i);
  const difficulty = extractOptions(html, /schwier|diffic|Schwierigkeit|Difficulty/i);
  return { category, visibility, difficulty };
}

async function readFieldOptions(supaUrl: string, anonKey: string, authBearer: string | undefined, platform: string, method?: string) {
  const params = new URLSearchParams({ select: '*', platform: `eq.${platform}` });
  if (method) params.set('method', `eq.${method}`);
  const url = `${supaUrl}/rest/v1/FieldOption?${params.toString()}`;
  const headers: Record<string,string> = { apikey: anonKey };
  if (authBearer) headers.Authorization = authBearer;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function writeFieldOptions(supaUrl: string, anonKey: string, authBearer: string | undefined, platform: string, method: string, map: Record<string, string[]>) {
  const headers: Record<string,string> = { apikey: anonKey, 'Content-Type': 'application/json', Prefer: 'return=representation' };
  if (authBearer) headers.Authorization = authBearer;
  // delete existing
  const delParams = new URLSearchParams({ platform: `eq.${platform}`, method: `eq.${method}` });
  const delUrl = `${supaUrl}/rest/v1/FieldOption?${delParams.toString()}`;
  await fetch(delUrl, { method: 'DELETE', headers });
  // insert new
  const rows = Object.entries(map).map(([field, options]) => ({ platform, method, field, options }));
  if (!rows.length) return [];
  const insUrl = `${supaUrl}/rest/v1/FieldOption`;
  const ins = await fetch(insUrl, { method: 'POST', headers, body: JSON.stringify(rows) });
  if (!ins.ok) throw new Error(await ins.text());
  return ins.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'OPTIONS') return res.status(200).end();
    const platform = String(req.query.platform || '').toLowerCase();
    const method = (String(req.query.method || 'ui').toLowerCase());
    const refresh = String(req.query.refresh || '0') === '1';
    if (!platform) return res.status(400).json({ error: 'platform required' });

    const supaUrl = requiredEnv('SUPABASE_URL');
    const anonKey = requiredEnv('SUPABASE_ANON_KEY');
    const authBearer = req.headers['authorization'] as string | undefined;

    if (!refresh) {
      const existing = await readFieldOptions(supaUrl, anonKey, authBearer, platform, method);
      if (existing?.length) {
        const map: Record<string, string[]> = {};
        for (const row of existing) map[row.field] = row.options || [];
        return res.json({ ok: true, platform, method, options: map });
      }
    }

    let options: Record<string, string[]> = {};
    if (platform === 'spontacts') {
      options = await fetchSpontactsOptions();
    } else {
      return res.status(400).json({ error: 'unsupported platform for discovery' });
    }

    await writeFieldOptions(supaUrl, anonKey, authBearer, platform, method, options);
    return res.json({ ok: true, platform, method, options });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
}