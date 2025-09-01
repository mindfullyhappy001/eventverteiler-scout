import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { api, getApiBase, setApiBase } from '@/services/api';

export default function Platforms() {
  const [items, setItems] = useState<any[]>([]);
  const [apiBase, setApiBaseState] = useState<string>(getApiBase());

  async function load() {
    const data = await api<any[]>('/api/platforms');
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  function saveApiBase() {
    setApiBase(apiBase);
    load();
  }

  const getCfg = (platform: string, method: 'api'|'ui') => items.find((i) => i.platform === platform && i.method === method);

  async function save(platform: string, method: 'api'|'ui', config: any, enabled = true) {
    const exist = getCfg(platform, method);
    if (exist) {
      await api(`/api/platforms/${exist.id}`, { method: 'PUT', body: JSON.stringify({ config, enabled }) });
    } else {
      await api('/api/platforms', { method: 'POST', body: JSON.stringify({ platform, method, name: `${platform} ${method}`, config, enabled }) });
    }
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
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-end gap-2 md:gap-4">
        <h1 className="text-2xl font-semibold">Plattform-Verknüpfungen</h1>
        <div className="ml-auto flex items-end gap-2">
          <div>
            <div className="text-xs text-muted-foreground">API Server URL</div>
            <Input value={apiBase} onChange={(e)=>setApiBaseState(e.target.value)} placeholder="z.B. http://localhost:8080" />
          </div>
          <Button onClick={saveApiBase}>Übernehmen</Button>
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
              <div className="text-right"><Button size="sm" onClick={()=>save('meetup','api', meetupApi, true)}>Speichern</Button></div>
            </div>
            <div className="border rounded p-3 space-y-2">
              <div className="flex items-center justify-between"><div className="font-medium">UI-Bot</div><Switch checked={enabled('meetup','ui')} onCheckedChange={(c)=>save('meetup','ui', meetupUi, c)} /></div>
              <Input placeholder="Login E-Mail" value={meetupUi.email} onChange={(e)=>setMeetupUi({...meetupUi, email:e.target.value})} />
              <Input placeholder="Login Passwort" type="password" value={meetupUi.password} onChange={(e)=>setMeetupUi({...meetupUi, password:e.target.value})} />
              <Input placeholder="Group URL (optional)" value={meetupUi.groupUrl} onChange={(e)=>setMeetupUi({...meetupUi, groupUrl:e.target.value})} />
              <div className="text-right"><Button size="sm" onClick={()=>save('meetup','ui', meetupUi, true)}>Speichern</Button></div>
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
              <div className="text-right"><Button size="sm" onClick={()=>save('eventbrite','api', ebApi, true)}>Speichern</Button></div>
            </div>
            <div className="border rounded p-3 space-y-2">
              <div className="flex items-center justify-between"><div className="font-medium">UI-Bot</div><Switch checked={enabled('eventbrite','ui')} onCheckedChange={(c)=>save('eventbrite','ui', ebUi, c)} /></div>
              <Input placeholder="Login E-Mail" value={ebUi.email} onChange={(e)=>setEbUi({...ebUi, email:e.target.value})} />
              <Input placeholder="Login Passwort" type="password" value={ebUi.password} onChange={(e)=>setEbUi({...ebUi, password:e.target.value})} />
              <div className="text-right"><Button size="sm" onClick={()=>save('eventbrite','ui', ebUi, true)}>Speichern</Button></div>
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
              <div className="text-right"><Button size="sm" onClick={()=>save('facebook','api', fbApi, true)}>Speichern</Button></div>
            </div>
            <div className="border rounded p-3 space-y-2">
              <div className="flex items-center justify-between"><div className="font-medium">UI-Bot</div><Switch checked={enabled('facebook','ui')} onCheckedChange={(c)=>save('facebook','ui', fbUi, c)} /></div>
              <Input placeholder="Login E-Mail" value={fbUi.email} onChange={(e)=>setFbUi({...fbUi, email:e.target.value})} />
              <Input placeholder="Login Passwort" type="password" value={fbUi.password} onChange={(e)=>setFbUi({...fbUi, password:e.target.value})} />
              <div className="text-right"><Button size="sm" onClick={()=>save('facebook','ui', fbUi, true)}>Speichern</Button></div>
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
              <div className="text-right"><Button size="sm" onClick={()=>save('spontacts','ui', spUi, true)}>Speichern</Button></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
