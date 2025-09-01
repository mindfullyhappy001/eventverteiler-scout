import { Router } from 'express';
import { prisma } from '../db/client.js';
import { z } from 'zod';

export const router = Router();

router.get('/', async (_req, res) => {
  const configs = await prisma.platformConfig.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(configs);
});

router.post('/', async (req, res) => {
  const body = z
    .object({
      platform: z.string(),
      method: z.enum(['api', 'ui']),
      name: z.string().optional(),
      config: z.any(),
      enabled: z.boolean().default(false),
    })
    .parse(req.body);

  const created = await prisma.platformConfig.create({ data: body });
  res.json(created);
});

router.put('/:id', async (req, res) => {
  const body = z
    .object({ name: z.string().optional(), config: z.any().optional(), enabled: z.boolean().optional() })
    .parse(req.body);
  const updated = await prisma.platformConfig.update({ where: { id: req.params.id }, data: body });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  await prisma.platformConfig.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
