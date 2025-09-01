import { Router } from 'express';
import { prisma } from '../db/client.js';
import { z } from 'zod';

export const router = Router();

const EventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  time: z.string().optional(),
  location: z.any().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  price: z.number().optional().nullable(),
  isVirtual: z.boolean().optional(),
  images: z.array(z.string()).optional().default([]),
  organizer: z.string().optional(),
  url: z.string().url().optional(),
});

router.get('/', async (req, res) => {
  const { q, category, from, to, tag } = req.query as any;
  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { organizer: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (category) where.category = category;
  if (tag) where.tags = { has: tag };
  if (from || to) where.date = { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined };

  const events = await prisma.event.findMany({ where, orderBy: { createdAt: 'desc' }, include: { publications: true } });
  res.json(events);
});

router.post('/', async (req, res) => {
  const parsed = EventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const evt = await prisma.event.create({ data: parsed.data });
  await prisma.eventVersion.create({ data: { eventId: evt.id, snapshot: evt as any } });
  res.json(evt);
});

router.get('/:id', async (req, res) => {
  const evt = await prisma.event.findUnique({ where: { id: req.params.id }, include: { versions: true, publications: true } });
  if (!evt) return res.status(404).json({ error: 'Not found' });
  res.json(evt);
});

router.put('/:id', async (req, res) => {
  const parsed = EventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const evt = await prisma.event.update({ where: { id: req.params.id }, data: parsed.data });
  await prisma.eventVersion.create({ data: { eventId: evt.id, snapshot: evt as any } });
  res.json(evt);
});

router.delete('/:id', async (req, res) => {
  await prisma.event.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

router.post('/:id/copy', async (req, res) => {
  const original = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!original) return res.status(404).json({ error: 'Not found' });
  const { id, createdAt, updatedAt, ...data } = original as any;
  const copy = await prisma.event.create({ data: { ...data, title: (original.title || 'Event') + ' (Copy)' } });
  await prisma.eventVersion.create({ data: { eventId: copy.id, snapshot: copy as any } });
  res.json(copy);
});

router.post('/bulk', async (req, res) => {
  const body = z
    .object({
      ids: z.array(z.string()),
      action: z.enum(['delete', 'duplicate']),
    })
    .parse(req.body);

  if (body.action === 'delete') {
    await prisma.event.deleteMany({ where: { id: { in: body.ids } } });
    return res.json({ ok: true });
  }
  if (body.action === 'duplicate') {
    const originals = await prisma.event.findMany({ where: { id: { in: body.ids } } });
    const copies = await Promise.all(
      originals.map(async (o) => {
        const { id, createdAt, updatedAt, ...data } = o as any;
        const copy = await prisma.event.create({ data: { ...data, title: (o.title || 'Event') + ' (Copy)' } });
        await prisma.eventVersion.create({ data: { eventId: copy.id, snapshot: copy as any } });
        return copy;
      })
    );
    return res.json(copies);
  }
});
