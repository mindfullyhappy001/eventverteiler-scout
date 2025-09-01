import { Router } from 'express';
import { prisma } from '../db/client.js';

export const router = Router();

router.get('/', async (req, res) => {
  const { scope, level, limit } = req.query as any;
  const where: any = {};
  if (scope) where.scope = scope;
  if (level) where.level = level;
  const logs = await prisma.logEntry.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit ? Number(limit) : 200 });
  res.json(logs);
});
