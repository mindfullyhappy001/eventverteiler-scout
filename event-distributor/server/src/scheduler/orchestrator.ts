import { prisma } from '../db/client.js';
import { runJob } from './worker.js';
import type { PublishJob } from '@prisma/client';

export async function scheduleJobNowOrLater(job: PublishJob) {
  const now = new Date();
  if (job.scheduledAt <= now) {
    await runJob(job);
  } else {
    // will be picked up by cron
  }
}
