import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { EventInput } from '../../shared/types';

export function EventForm({ initial, onSubmit, onCancel }: { initial?: Partial<EventInput>; onSubmit: (v: EventInput) => void; onCancel?: () => void }) {
  const [v, setV] = useState<EventInput>({
    title: initial?.title || '',
    description: initial?.description || '',
    date: initial?.date || '',
    time: initial?.time || '',
    location: initial?.location || '',
    category: initial?.category || '',
    tags: initial?.tags || [],
    price: initial?.price || undefined,
    isVirtual: initial?.isVirtual || false,
    images: initial?.images || [],
    organizer: initial?.organizer || '',
    url: initial?.url || '',
    spontacts: (initial as any)?.spontacts || {}
  } as any);

  return (
    <div className="space-y-3">
      <Input placeholder="Titel" value={(v as any).title || ''} onChange={(e) => setV({ ...v, title: e.target.value } as any)} />
      <Textarea placeholder="Beschreibung" value={(v as any).description || ''} onChange={(e) => setV({ ...v, description: e.target.value } as any)} />
      <div className="grid grid-cols-2 gap-2">
        <Input type="date" value={(v as any).date?.slice(0,10) || ''} onChange={(e) => setV({ ...v, date: e.target.value ? new Date(e.target.value).toISOString() : '' } as any)} />
        <Input type="time" value={(v as any).time || ''} onChange={(e) => setV({ ...v, time: e.target.value } as any)} />
      </div>
      <Input placeholder="Ort (JSON oder Text)" value={typeof (v as any).location === 'string' ? (v as any).location : JSON.stringify((v as any).location || '')} onChange={(e) => setV({ ...v, location: e.target.value } as any)} />
      <Input placeholder="Kategorie" value={(v as any).category || ''} onChange={(e) => setV({ ...v, category: e.target.value } as any)} />
      <Input placeholder="Tags (Komma-getrennt)" value={((v as any).tags || []).join(',')} onChange={(e) => setV({ ...v, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) } as any)} />
      <Input placeholder="Bilder (Komma-getrennt)" value={((v as any).images || []).join(',')} onChange={(e) => setV({ ...v, images: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) } as any)} />
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Preis" type="number" value={(v as any).price ?? ''} onChange={(e) => setV({ ...v, price: e.target.value ? Number(e.target.value) : undefined } as any)} />
        <div className="flex items-center gap-2"><Switch checked={!!(v as any).isVirtual} onCheckedChange={(c) => setV({ ...v, isVirtual: c } as any)} /> <span>Virtuell?</span></div>
      </div>
      <Input placeholder="Veranstalter" value={(v as any).organizer || ''} onChange={(e) => setV({ ...v, organizer: e.target.value } as any)} />
      <Input placeholder="URL" value={(v as any).url || ''} onChange={(e) => setV({ ...v, url: e.target.value } as any)} />

      <div className="pt-2">
        <div className="text-sm font-medium">Spontacts – Details</div>
        <div className="grid md:grid-cols-2 gap-2 mt-2">
          <Input placeholder="Kategorie (Spontacts)" value={(v as any).spontacts?.category || ''} onChange={(e)=>setV({ ...v, spontacts: { ...(v as any).spontacts, category: e.target.value } } as any)} />
          <Input placeholder="Stadt" value={(v as any).spontacts?.city || ''} onChange={(e)=>setV({ ...v, spontacts: { ...(v as any).spontacts, city: e.target.value } } as any)} />
          <Input placeholder="Treffpunkt" value={(v as any).spontacts?.meetingPoint || ''} onChange={(e)=>setV({ ...v, spontacts: { ...(v as any).spontacts, meetingPoint: e.target.value } } as any)} />
          <Input placeholder="Max. Teilnehmer" type="number" value={(v as any).spontacts?.maxParticipants ?? ''} onChange={(e)=>setV({ ...v, spontacts: { ...(v as any).spontacts, maxParticipants: e.target.value ? Number(e.target.value) : undefined } } as any)} />
          <Input placeholder="Sichtbarkeit (public/friends/private)" value={(v as any).spontacts?.visibility || ''} onChange={(e)=>setV({ ...v, spontacts: { ...(v as any).spontacts, visibility: e.target.value as any } } as any)} />
          <Input placeholder="Schwierigkeit (frei)" value={(v as any).spontacts?.difficulty || ''} onChange={(e)=>setV({ ...v, spontacts: { ...(v as any).spontacts, difficulty: e.target.value } } as any)} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (<Button variant="outline" onClick={onCancel}>Abbrechen</Button>)}
        <Button onClick={() => onSubmit(v)}>Speichern</Button>
      </div>
    </div>
  );
}
