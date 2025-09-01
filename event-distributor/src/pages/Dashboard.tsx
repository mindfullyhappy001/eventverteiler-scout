import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EventForm } from '@/components/EventForm';
import { PublishDrawer } from '@/components/PublishDrawer';
import { API_URL } from '@/services/api';
import { PlatformsInline } from '@/components/PlatformsInline';
import { listEvents, createEvent, updateEvent, deleteEvent, copyEvent } from '@/services/data';
import { getMode } from '@/services/config';

export default function Dashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState<{ id: string } | null>(null);

  async function load() {
    const data: any[] = await listEvents({ q });
    setEvents(data);
  }
  useEffect(() => { load(); }, [q]);

  async function onCreate(v: any) {
    await createEvent(v);
    setCreating(false); await load();
  }
  async function onUpdate(id: string, v: any) {
    await updateEvent(id, v);
    setEditing(null); await load();
  }
  async function onDelete(id: string) {
    await deleteEvent(id);
    await load();
  }
  async function onCopy(id: string) {
    await copyEvent(id);
    await load();
  }

  async function exportCsv(ids?: string[]) {
    if (getMode() === 'api') {
      window.open(API_URL + '/api/csv/export' + (ids?.length ? `?ids=${ids.join(',')}` : ''), '_blank');
    } else {
      const cols = ['id','title','description','date','time','location','category','tags','price','isVirtual','images','organizer','url'];
      const lines = [cols.join(',')];
      for (const e of events) {
        const row = [
          e.id,
          e.title||'',
          e.description?.replace(/\n/g,' ' )||'',
          e.date||'',
          e.time||'',
          e.location?JSON.stringify(e.location):'',
          e.category||'',
          (e.tags||[]).join('|'),
          e.price??'',
          e.isVirtual??'',
          (e.images||[]).join('|'),
          e.organizer||'',
          e.url||'',
        ].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',');
        lines.push(row);
      }
      const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'events.csv'; a.click(); URL.revokeObjectURL(url);
    }
  }

  async function importCsv(file: File) {
    if (getMode() === 'api') {
      const form = new FormData(); form.append('file', file);
      await fetch(API_URL + '/api/csv/import', { method: 'POST', body: form });
      await load();
    } else {
      const text = await file.text();
      const [header, ...rows] = text.split(/\r?\n/).filter(Boolean);
      const cols = header.split(',').map((h)=>h.replace(/^\"|\"$/g,''));
      for (const line of rows) {
        const parts = line.match(/\"([^\"]|\"\")*\"(?=,|$)/g)?.map((v)=>v.slice(1,-1).replace(/\"\"/g,'"')) || [];
        const obj: any = {}; cols.forEach((c,i)=>obj[c]=parts[i]);
        const payload: any = {
          title: obj.title || undefined,
          description: obj.description || undefined,
          date: obj.date || undefined,
          time: obj.time || undefined,
          location: obj.location ? JSON.parse(obj.location) : undefined,
          category: obj.category || undefined,
          tags: obj.tags ? String(obj.tags).split('|').filter(Boolean) : [],
          price: obj.price ? parseFloat(obj.price) : undefined,
          isVirtual: obj.isVirtual === 'true' || obj.isVirtual === true,
          images: obj.images ? String(obj.images).split('|').filter(Boolean) : [],
          organizer: obj.organizer || undefined,
          url: obj.url || undefined,
        };
        await createEvent(payload);
      }
      await load();
    }
  }

  const statusMap = (pubs: any[]) => {
    const m: Record<string,string> = {};
    for (const p of pubs || []) m[`${p.platform}:${p.method}`] = p.status;
    return m;
  };

  const platforms = ['meetup','eventbrite','facebook','spontacts'] as const;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Event-Verteiler Dashboard</h1>
        <div className="flex gap-2 items-center">
          <Input placeholder="Suche…" value={q} onChange={(e) => setQ(e.target.value)} />
          <input type="file" accept=".csv" onChange={(e) => e.target.files && importCsv(e.target.files[0])} className="text-sm" />
          <Button variant="outline" onClick={() => exportCsv()}>CSV Export</Button>
          <Button onClick={() => setCreating(true)}>Neues Event</Button>
        </div>
      </div>

      <PlatformsInline />

      <Card>
        <CardHeader><CardTitle>Events</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => {
                const sm = statusMap(e.publications);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.title || '—'}</TableCell>
                    <TableCell>{e.date ? new Date(e.date).toLocaleString() : '—'}</TableCell>
                    <TableCell>{e.category || '—'}</TableCell>
                    <TableCell className="space-x-1">
                      {platforms.map((p) => (
                        <div key={p} className="inline-flex gap-1 mr-2">
                          <Badge variant={sm[`${p}:api`] === 'published' || sm[`${p}:api`] === 'updated' ? 'default' : sm[`${p}:api`] ? 'secondary' : 'outline'}>{p} API: {sm[`${p}:api`] || '—'}</Badge>
                          <Badge variant={sm[`${p}:ui`] === 'published' || sm[`${p}:ui`] === 'updated' ? 'default' : sm[`${p}:ui`] ? 'secondary' : 'outline'}>{p} UI: {sm[`${p}:ui`] || '—'}</Badge>
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setEditing(e)}>Bearbeiten</Button>
                      <Button size="sm" variant="outline" onClick={() => onCopy(e.id)}>Kopieren</Button>
                      <Button size="sm" variant="outline" onClick={() => setPublishing({ id: e.id })}>Publish</Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(e.id)}>Löschen</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader><DialogTitle>Neues Event</DialogTitle></DialogHeader>
          <EventForm onSubmit={onCreate} onCancel={() => setCreating(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Event bearbeiten</DialogTitle></DialogHeader>
          {editing && <EventForm initial={editing} onSubmit={(v) => onUpdate(editing.id, v)} onCancel={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>

      {publishing && (
        <PublishDrawer open={!!publishing} onOpenChange={(o) => { if (!o) setPublishing(null); }} eventId={publishing.id} />
      )}
    </div>
  );
}
