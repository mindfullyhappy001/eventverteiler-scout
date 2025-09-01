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
  });

  return (
    <div className="space-y-3">
      <Input placeholder="Titel" value={v.title || ''} onChange={(e) => setV({ ...v, title: e.target.value })} />
      <Textarea placeholder="Beschreibung" value={v.description || ''} onChange={(e) => setV({ ...v, description: e.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <Input type="date" value={v.date?.slice(0,10) || ''} onChange={(e) => setV({ ...v, date: e.target.value ? new Date(e.target.value).toISOString() : '' })} />
        <Input type="time" value={v.time || ''} onChange={(e) => setV({ ...v, time: e.target.value })} />
      </div>
      <Input placeholder="Ort (JSON oder Text)" value={typeof v.location === 'string' ? v.location : JSON.stringify(v.location || '')} onChange={(e) => setV({ ...v, location: e.target.value })} />
      <Input placeholder="Kategorie" value={v.category || ''} onChange={(e) => setV({ ...v, category: e.target.value })} />
      <Input placeholder="Tags (Komma-getrennt)" value={(v.tags || []).join(',')} onChange={(e) => setV({ ...v, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
      <Input placeholder="Bilder (Komma-getrennt)" value={(v.images || []).join(',')} onChange={(e) => setV({ ...v, images: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Preis" type="number" value={v.price ?? ''} onChange={(e) => setV({ ...v, price: e.target.value ? Number(e.target.value) : undefined })} />
        <div className="flex items-center gap-2"><Switch checked={!!v.isVirtual} onCheckedChange={(c) => setV({ ...v, isVirtual: c })} /> <span>Virtuell?</span></div>
      </div>
      <Input placeholder="Veranstalter" value={v.organizer || ''} onChange={(e) => setV({ ...v, organizer: e.target.value })} />
      <Input placeholder="URL" value={v.url || ''} onChange={(e) => setV({ ...v, url: e.target.value })} />

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (<Button variant="outline" onClick={onCancel}>Abbrechen</Button>)}
        <Button onClick={() => onSubmit(v)}>Speichern</Button>
      </div>
    </div>
  );
}
