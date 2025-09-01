import { Router } from 'express';
import { prisma } from '../db/client.js';
import { stringify } from 'csv-stringify/sync';
import multer from 'multer';
import { parse } from 'csv-parse/sync';

export const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const fields = [
  'id','title','description','date','time','location','category','tags','price','isVirtual','images','organizer','url'
];

router.get('/export', async (req, res) => {
  const ids = (req.query.ids as string)?.split(',').filter(Boolean);
  const where = ids?.length ? { id: { in: ids } } : {};
  const events = await prisma.event.findMany({ where });
  const records = events.map((e) => ({
    id: e.id,
    title: e.title || '',
    description: e.description || '',
    date: e.date ? e.date.toISOString() : '',
    time: e.time || '',
    location: e.location ? JSON.stringify(e.location) : '',
    category: e.category || '',
    tags: e.tags?.join('|') || '',
    price: e.price ?? '',
    isVirtual: e.isVirtual ?? '',
    images: e.images?.join('|') || '',
    organizer: e.organizer || '',
    url: e.url || '',
  }));
  const csv = stringify(records, { header: true, columns: fields });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="events.csv"');
  res.send(csv);
});

router.post('/import', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const text = req.file.buffer.toString('utf-8');
  const rows = parse(text, { columns: true, skip_empty_lines: true });
  const created: any[] = [];
  for (const r of rows) {
    const data: any = {
      title: r.title || undefined,
      description: r.description || undefined,
      date: r.date ? new Date(r.date) : undefined,
      time: r.time || undefined,
      location: r.location ? JSON.parse(r.location) : undefined,
      category: r.category || undefined,
      tags: r.tags ? String(r.tags).split('|').filter(Boolean) : [],
      price: r.price ? parseFloat(r.price) : undefined,
      isVirtual: r.isVirtual === 'true' || r.isVirtual === true,
      images: r.images ? String(r.images).split('|').filter(Boolean) : [],
      organizer: r.organizer || undefined,
      url: r.url || undefined,
    };
    const evt = await prisma.event.create({ data });
    await prisma.eventVersion.create({ data: { eventId: evt.id, snapshot: evt as any } });
    created.push(evt);
  }
  res.json({ created: created.length });
});
