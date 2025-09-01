import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { PlatformKey, PublishMethod } from '../../shared/types';
import { api } from '@/services/api';

export function PublishDrawer({ open, onOpenChange, eventId }: { open: boolean; onOpenChange: (v: boolean) => void; eventId: string }) {
  const [platform, setPlatform] = useState<PlatformKey>('meetup');
  const [method, setMethod] = useState<PublishMethod>('api');
  const [when, setWhen] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await api('/api/publish', {
        method: 'POST',
        body: JSON.stringify({ eventId, platform, method, action: 'create', scheduledAt: when || undefined }),
      });
      onOpenChange(false);
    } finally { setLoading(false); }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Event veröffentlichen</DrawerTitle>
        </DrawerHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
          <div>
            <label className="text-sm">Plattform</label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as PlatformKey)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="meetup">Meetup</SelectItem>
                <SelectItem value="eventbrite">Eventbrite</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="spontacts">Spontacts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm">Methode</label>
            <Select value={method} onValueChange={(v) => setMethod(v as PublishMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="ui">UI-Bot</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm">Zeitpunkt (optional)</label>
            <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
        </div>
        <DrawerFooter>
          <Button onClick={submit} disabled={loading}>{loading ? 'Wird geplant…' : 'Veröffentlichen'}</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
