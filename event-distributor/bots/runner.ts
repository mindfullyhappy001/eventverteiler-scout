import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { test as pwtest, chromium, expect } from '@playwright/test';
import path from 'node:path';
import { createArtifacts } from './src/shared/logging.js';

const prisma = new PrismaClient();

async function main() {
  const jobId = process.argv[2];
  if (!jobId) throw new Error('runner requires jobId');
  const job = await prisma.publishJob.findUnique({ where: { id: jobId } });
  if (!job) throw new Error('Job not found');
  const event = await prisma.event.findUnique({ where: { id: job.eventId } });
  if (!event) throw new Error('Event not found');

  const art = createArtifacts(jobId);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    if (job.platform === 'meetup') {
      await runMeetup(page, event, art.base);
    } else if (job.platform === 'eventbrite') {
      await runEventbrite(page, event, art.base);
    } else if (job.platform === 'facebook') {
      await runFacebook(page, event, art.base);
    } else {
      throw new Error('Unsupported platform');
    }

    await prisma.eventPublication.upsert({
      where: { eventId_platform_method: { eventId: event.id, platform: job.platform, method: 'ui' } },
      create: { eventId: event.id, platform: job.platform, method: 'ui', status: 'published', details: { artifacts: art.base } },
      update: { status: 'published', details: { artifacts: art.base } },
    });
  } catch (e: any) {
    await prisma.eventPublication.upsert({
      where: { eventId_platform_method: { eventId: event.id, platform: job.platform, method: 'ui' } },
      create: { eventId: event.id, platform: job.platform, method: 'ui', status: 'error', details: { error: e.message, artifacts: art.base } },
      update: { status: 'error', details: { error: e.message, artifacts: art.base } },
    });
    throw e;
  } finally {
    await browser.close();
  }
}

async function runMeetup(page: any, event: any, outDir: string) {
  // Placeholder self-healing approach: prefer role/name/label, fallback to text
  await page.goto('https://www.meetup.com/');
  // ... Login and navigate to create event
  // Save proof
  await page.screenshot({ path: path.join(outDir, 'meetup.png') });
}

async function runEventbrite(page: any, event: any, outDir: string) {
  await page.goto('https://www.eventbrite.com/');
  await page.screenshot({ path: path.join(outDir, 'eventbrite.png') });
}

async function runFacebook(page: any, event: any, outDir: string) {
  await page.goto('https://www.facebook.com/');
  await page.screenshot({ path: path.join(outDir, 'facebook.png') });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
