import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client.js';
import { scheduleJobNowOrLater } from '../scheduler/orchestrator.js';

export const router = Router();

const PublishBody = z.object({
  eventId: z.string(),
  platform: z.enum(['meetup','eventbrite','facebook','spontacts']),
  method: z.enum(['api','ui']),
  action: z.enum(['create','update','delete']).default('create'),
  scheduledAt: z.string().datetime().optional(),
});

router.post('/', async (req, res) => {
  const body = PublishBody.parse(req.body);
  const job = await prisma.publishJob.create({
    data: {
      eventId: body.eventId,
      platform: body.platform,
      method: body.method,
      action: body.action,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : new Date(),
      status: body.scheduledAt ? 'scheduled' : 'scheduled',
    },
  });
  await scheduleJobNowOrLater(job);
  res.json(job);
});

router.get('/status/:eventId', async (req, res) => {
  const pubs = await prisma.eventPublication.findMany({ where: { eventId: req.params.eventId } });
  res.json(pubs);
});
