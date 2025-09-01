import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';

export default function Logs() {
  const [items, setItems] = useState<any[]>([]);
  const [scope, setScope] = useState('');

  async function load() {
    const data = await api<any[]>(`/api/logs?scope=${encodeURIComponent(scope)}`);
    setItems(data);
  }
  useEffect(() => { load(); }, [scope]);

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Logs & Belege</h1>
        <Input placeholder="Scope filter (optional)" value={scope} onChange={(e) => setScope(e.target.value)} />
      </div>

      <Card>
        <CardHeader><CardTitle>Einträge</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zeit</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Nachricht</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{l.scope}</TableCell>
                  <TableCell>{l.level}</TableCell>
                  <TableCell>{l.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
