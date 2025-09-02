import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getApiBase, setApiBase, getSupabaseUrl, setSupabaseUrl, getSupabaseAnon, setSupabaseAnon, getMode, setMode } from '@/services/config';
import { listPlatformConfigs, savePlatformConfig, scheduleOptionDiscovery, scheduleOptionDiscoveryAll } from '@/services/data';

export function PlatformsInline() {
  const [items, setItems] = useState<any[]>([]);
  const [apiBase, setApiBaseState] = useState<string>(getApiBase());
  const [supabaseUrl, setSupabaseUrlState] = useState<string>(getSupabaseUrl());
  const [supabaseAnon, setSupabaseAnonState] = useState<string>(getSupabaseAnon());
  const [mode, setModeState] = useState<'api'|'supabase'>(getMode());
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const data = await listPlatformConfigs();
      setItems(data);
    } catch (_) {
      // ignore
    }
  }
  useEffect(() => { load(); }, []);

  function saveConnectivity() {
    setApiBase(apiBase);
    setSupabaseUrl(supabaseUrl);
    setSupabaseAnon(supabaseAnon);
    setMode(mode);
    load();
  }

  const getCfg = (platform: string, method: 'api'|'ui') => items.find((i) => i.platform === platform && i.method === method);

  async function save(platform: string, method: 'api'|'ui', config: any, enabled = true) {
    setLoading(true);
    await savePlatformConfig(platform, method, config, enabled);
    setLoading(false);
    await load();
  }

  const [meetupApi, setMeetupApi] = useState({ token: '', group: '' });
  const [meetupUi, setMeetupUi] = useState({ email: '', password: '', groupUrl: '' });
  const [ebApi, setEbApi] = useState({ token: '' });
  const [ebUi, setEbUi] = useState({ email: '', password: '' });
  const [fbApi, setFbApi] = useState({ pageId: '', pageToken: '' });
  const [fbUi, setFbUi] = useState({ email: '', password: '' });
  const [spUi, setSpUi] = useState({ email: '', password: '' });

  useEffect(() => {
    const mApi = getCfg('meetup','api'); if (mApi) setMeetupApi({ token: mApi.config?.token || '', group: mApi.config?.group || '' });
    const mUi = getCfg('meetup','ui'); if (mUi) setMeetupUi({ email: mUi.config?.email || '', password: mUi.config?.password || '', groupUrl: mUi.config?.groupUrl || '' });
    const eApi = getCfg('eventbrite','api'); if (eApi) setEbApi({ token: eApi.config?.token || '' });
    const eUi = getCfg('eventbrite','ui'); if (eUi) setEbUi({ email: eUi.config?.email || '', password: eUi.config?.password || '' });
    const fApi = getCfg('facebook','api'); if (fApi) setFbApi({ pageId: fApi.config?.pageId || '', pageToken: fApi.config?.pageToken || '' });
    const fUi = getCfg('facebook','ui'); if (fUi) setFbUi({ email: fUi.config?.email || '', password: fUi.config?.password || '' });
    const sUi = getCfg('spontacts','ui'); if (sUi) setSpUi({ email: sUi.config?.email || '', password: sUi.config?.password || '' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const enabled = (platform: string, method: 'api'|'ui') => !!getCfg(platform, method)?.enabled;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-end gap-2 md:gap-4">
        <h2 className="text-xl font-semibold">Plattformen – Konnektivität</h2>
        <div className="ml-auto"><Button variant="secondary" size="sm" disabled={loading} onClick={()=>{setLoading(true);scheduleOptionDiscoveryAll().finally(()=>setLoading(false));}}>Alle Feld‑Optionen aktualisieren</Button></div>
        <div className="ml-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-full md:w-auto">
          <div>
            <div className="text-xs text-muted-foreground">Modus</div>
            <select className="w-full border rounded p-2" value={mode} onChange={(e)=>setModeState(e.target.value as any)}>
              <option value="api">Backend API</option>
              <option value="supabase">Supabase direkt</option>
            </select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">API Server URL</div>
            <Input value={apiBase} onChange={(e)=>setApiBaseState(e.target.value)} placeholder="z.B. http://localhost:8080" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">DB URL (Supabase URL)</div>
            <Input value={supabaseUrl} onChange={(e)=>setSupabaseUrlState(e.target.value)} placeholder="https://xxx.supabase.co" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Supabase Anon Key</div>
            <Input value={supabaseAnon} onChange={(e)=>setSupabaseAnonState(e.target.value)} placeholder="public anon key" />
          </div>
          <div className="md:col-span-2 lg:col-span-4 text-right">
            <Button onClick={saveConnectivity}>Übernehmen</Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Meetup</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded p-3 space-y-2">
              <div className="flex items-center justify-between"><div className="font-medium">API</div><Switch checked={enabled('meetup','api')} onCheckedChange={(c)=>save('meetup','api', meetupApi, c)} /></div>
              <Input placeholder="API Token" value={meetupApi.token} onChange={(e)=>setMeetupApi({...meetupApi, token:e.target.value})} />
              <Input placeholder="Group Slug" value={meetupApi.group} onChange={(e)=>setMeetupApi({...meetupApi, group:e.target.value})} />
              <div className="text-right"><Button size="sm" disabled={loading} onClick={()=>save('meetup','api', meetupApi, true)}>{loading?'Speichern…':'Speichern'}</Button></div>
            </div>
            <div className="border rounded p-3 space-y-2">
              <div className="flex items-center justify-between"><div className="font-medium">UI-Bot</div><Switch checked={enabled('meetup','ui')} onCheckedChange={(c)=>save('meetup','ui', meetupUi, c)} /></div>
              <Input placeholder="Login E-Mail" value={meetupUi.email} onChange={(e)=>setMeetupUi({...meetupUi, email:e.target.value})} />
              <Input placeholder="Login Passwort" type="password" value={meetupUi.password} onChange={(e)=>setMeetupUi({...meetupUi, password:e.target.value})} />
              <Input placeholder="Group URL (optional)" value={meetupUi.groupUrl} onChange={(e)=>setMeetupUi({...meetupUi, groupUrl:e.target.value})} />
              <div className="flex items-center justify-between gap-2">
                <Button size="sm" variant="outline" disabled={loading} onClick={()=>scheduleOptionDiscovery('meetup','ui')}>Feld-Optionen aktualisieren</Button>
                <div className="text-right"><Button size="sm" disabled={loading} onClick={()=>save('meetup','ui', meetupUi, true)}>{loading?'Speichern…':'Speichern'}</Button></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Eventbrite</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded p-3 space-y-2">
              <div className="flex items-center justify-between"><div className="font-medium">API</div><Switch checked={enabled('eventbrite','api')} onCheckedChange={(c)=>save('eventbrite','api', ebApi, c)} /></div>
              <Input placeholder="API Token" value={ebApi.token} onChange={(e)=>setEbApi({...ebApi, token:e.target.value})} />
              <div className="text-right"><Button size="sm" disabled={loading} onClick={()=>save('eventbrite','api', ebApi, true)}>{loading?'Speichern…':'Speichern'}</Button></div>
            </div>
            <div className="border rounded p-3 space-y-2">
              <div className="flex items-center justify-between"><div className="font-medium">UI-Bot</div><Switch checked={enabled('eventbrite','ui')} onCheckedChange={(c)=>save('eventbrite','ui', ebUi, c)} /></div>
              <Input placeholder="Login E-Mail" value={ebUi.email} onChange={(e)=>setEbUi({...ebUi, email:e.target.value})} />
              <Input placeholder="Login Passwort" type="password" value={ebUi.password} onChange={(e)=>setEbUi({...ebUi, password:e.target.value})} />
              <div className="flex items-center justify-between gap-2">
                <Button size="sm" variant="outline" disabled={loading} onClick={()=>scheduleOptionDiscovery('eventbrite','ui')}>Feld-Optionen aktualisieren</Button>
                <div className="text-right"><Button size="sm" disabled={loading} onClick={()=>save('eventbrite','ui', ebUi, true)}>{loading?'Speichern…':'Speichern'}</Button></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Facebook Events</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded p-3 space-y-2">
              <div className="flex items-center justify-between"><div className="font-medium">API</div><Switch checked={enabled('facebook','api')} onCheckedChange={(c)=>save('facebook','api', fbApi, c)} /></div>
              <Input placeholder="Page ID" value={fbApi.pageId} onChange={(e)=>setFbApi({...fbApi, pageId:e.target.value})} />
              <Input placeholder="Page Token" value={fbApi.pageToken} onChange={(e)=>setFbApi({...fbApi, pageToken:e.target.value})} />
              <div className="text-right"><Button size="sm" disabled={loading} onClick={()=>save('facebook','api', fbApi, true)}>{loading?'Speichern…':'Speichern'}</Button></div>
            </div>
            <div className="border rounded p-3 space-y-2">
              <div className="flex items-center justify-between"><div className="font-medium">UI-Bot</div><Switch checked={enabled('facebook','ui')} onCheckedChange={(c)=>save('facebook','ui', fbUi, c)} /></div>
              <Input placeholder="Login E-Mail" value={fbUi.email} onChange={(e)=>setFbUi({...fbUi, email:e.target.value})} />
              <Input placeholder="Login Passwort" type="password" value={fbUi.password} onChange={(e)=>setFbUi({...fbUi, password:e.target.value})} />
              <div className="flex items-center justify-between gap-2">
                <Button size="sm" variant="outline" disabled={loading} onClick={()=>scheduleOptionDiscovery('facebook','ui')}>Feld-Optionen aktualisieren</Button>
                <div className="text-right"><Button size="sm" disabled={loading} onClick={()=>save('facebook','ui', fbUi, true)}>{loading?'Speichern…':'Speichern'}</Button></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Spontacts.de</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded p-3 space-y-2 opacity-60 pointer-events-none">
              <div className="flex items-center justify-between"><div className="font-medium">API</div><span className="text-xs text-muted-foreground">Nicht verfügbar</span></div>
              <Input placeholder="(nicht unterstützt)" disabled />
            </div>
            <div className="border rounded p-3 space-y-2">
              <div className="flex items-center justify-between"><div className="font-medium">UI-Bot</div><Switch checked={enabled('spontacts','ui')} onCheckedChange={(c)=>save('spontacts','ui', spUi, c)} /></div>
              <Input placeholder="Login E-Mail" value={spUi.email} onChange={(e)=>setSpUi({...spUi, email:e.target.value})} />
              <Input placeholder="Login Passwort" type="password" value={spUi.password} onChange={(e)=>setSpUi({...spUi, password:e.target.value})} />
              <div className="flex items-center justify-between gap-2">
                <Button size="sm" variant="outline" disabled={loading} onClick={()=>scheduleOptionDiscovery('spontacts','ui')}>Feld-Optionen aktualisieren</Button>
                <div className="text-right"><Button size="sm" disabled={loading} onClick={()=>save('spontacts','ui', spUi, true)}>{loading?'Speichern…':'Speichern'}</Button></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
