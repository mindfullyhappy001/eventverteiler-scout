import { prisma } from '../db/client.js';
import { execa } from 'execa';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { performApiActionAndVerify } from '../services/platformApiInvoker.js';

const MAX_RETRIES = 3;

export async function runJob(job: any) {
  job = await prisma.publishJob.update({ where: { id: job.id }, data: { status: 'running', tryCount: { increment: 1 } } });
  try {
    if (job.method === 'api') {
      const result = await performApiActionAndVerify(job);
      await prisma.publishJob.update({ where: { id: job.id }, data: { status: 'success', result } });
    } else if (job.method === 'ui') {
      const pub = await prisma.eventPublication.upsert({
        where: { eventId_platform_method: { eventId: job.eventId, platform: job.platform, method: 'ui' } },
        create: { eventId: job.eventId, platform: job.platform, method: 'ui', status: 'in_progress' },
        update: { status: 'in_progress' },
      });

      const botsRoot = path.resolve(process.cwd(), '../bots');
      const scriptMap: Record<string, string> = {
        meetup: 'src/meetup/createEvent.ts',
        eventbrite: 'src/eventbrite/createEvent.ts',
        facebook: 'src/facebook/createEvent.ts',
        spontacts: 'src/spontacts/createEvent.ts',
      };
      const scriptRel = scriptMap[job.platform];
      if (!scriptRel) throw new Error('Unsupported platform for UI');

      const event = await prisma.event.findUnique({ where: { id: job.eventId } });
      if (!event) throw new Error('Event not found');

      const platCfg = await prisma.platformConfig.findFirst({ where: { platform: job.platform, method: 'ui', enabled: true }, orderBy: { updatedAt: 'desc' } });

      const artifactsBase = `artifacts/${job.id}/${Date.now()}`;
      const child = execa('bun', ['run', scriptRel], {
        cwd: botsRoot,
        env: { ...process.env, EVENT_JSON: JSON.stringify(event), JOB_ID: job.id, BOT_CONFIG: JSON.stringify(platCfg?.config || {}), ARTIFACTS_BASE: artifactsBase },
      });
      const { stdout } = await child;

      await prisma.eventPublication.update({
        where: { id: pub.id },
        data: { status: 'published', verifiedAt: new Date(), details: { artifacts: artifactsBase, botOutput: safeParse(stdout) } },
      });

      await prisma.publishJob.update({ where: { id: job.id }, data: { status: 'success', result: { stdout } } });
    }
  } catch (e: any) {
    const message = e?.message || String(e);
    await prisma.publishJob.update({ where: { id: job.id }, data: { status: 'failed', lastError: message } });
    if (job.tryCount < MAX_RETRIES) {
      await delay(1000 * Math.pow(2, job.tryCount));
      await prisma.publishJob.update({ where: { id: job.id }, data: { status: 'scheduled', scheduledAt: new Date(Date.now() + 1000) } });
    }
  }
}

function safeParse(s: string) {
  try { return JSON.parse(s); } catch { return { raw: s }; }
}
