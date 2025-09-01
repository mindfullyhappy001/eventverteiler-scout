import cron from 'node-cron';
import type pino from 'pino';
import { prisma } from '../db/client.js';
import { runJob } from './worker.js';

export async function initScheduler(logger: pino.Logger) {
  logger.info('Scheduler starting');
  // Every 30 seconds check for due jobs
  cron.schedule('*/30 * * * * *', async () => {
    const now = new Date();
    const jobs = await prisma.publishJob.findMany({
      where: { status: 'scheduled', scheduledAt: { lte: now } },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    });
    for (const job of jobs) {
      await runJob(job);
    }
  });
}
