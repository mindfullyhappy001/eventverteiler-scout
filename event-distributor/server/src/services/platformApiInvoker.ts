import { prisma } from '../db/client.js';
import type { Event, PublishJob, PlatformConfig } from '@prisma/client';

const PLATFORM_WHITELIST = ['meetup', 'eventbrite', 'facebook', 'spontacts'] as const;
const METHOD_WHITELIST = ['api', 'ui'] as const;

type PlatformKey = typeof PLATFORM_WHITELIST[number];

type Adapter = {
  create_event: (evt: Event, cfg: any) => Promise<{ externalId?: string; url?: string; proof?: any }>;
  update_event: (evt: Event, externalId: string | undefined, cfg: any) => Promise<{ url?: string; proof?: any }>;
  delete_event: (externalId: string | undefined, cfg: any) => Promise<{ ok: boolean; proof?: any }>;
  get_status: (externalId: string | undefined, cfg: any) => Promise<{ exists: boolean; url?: string; proof?: any }>;
};

export async function performApiActionAndVerify(job: PublishJob) {
  if (!PLATFORM_WHITELIST.includes(job.platform as PlatformKey)) throw new Error('Platform not allowed');
  if (!METHOD_WHITELIST.includes(job.method as any)) throw new Error('Method not allowed');

  const event = await prisma.event.findUnique({ where: { id: job.eventId } });
  if (!event) throw new Error('Event not found');

  const platCfg = await findEnabledConfig(job.platform as PlatformKey, 'api');
  if (!platCfg) throw new Error(`No enabled API config for platform ${job.platform}`);

  const pub = await prisma.eventPublication.upsert({
    where: { eventId_platform_method: { eventId: job.eventId, platform: job.platform, method: job.method } },
    create: { eventId: job.eventId, platform: job.platform, method: job.method, status: 'in_progress' },
    update: { status: 'in_progress' },
  });

  const adapter = await loadAdapter(job.platform as PlatformKey);

  let result: any = {};
  if (job.action === 'create') {
    result = await adapter.create_event(event, platCfg.config);
  } else if (job.action === 'update') {
    result = await adapter.update_event(event, pub.externalId || undefined, platCfg.config);
  } else if (job.action === 'delete') {
    result = await adapter.delete_event(pub.externalId || undefined, platCfg.config);
  }

  const status = await adapter.get_status(result.externalId || pub.externalId || undefined, platCfg.config);

  const finalStatus = computeFinalStatus(job.action, status);

  const updated = await prisma.eventPublication.update({
    where: { id: pub.id },
    data: {
      status: finalStatus,
      externalId: result.externalId || pub.externalId,
      externalUrl: status.url || result.url || pub.externalUrl,
      verifiedAt: new Date(),
      details: { apiProof: result.proof, verifyProof: status.proof },
    },
  });

  return updated;
}

function computeFinalStatus(action: string, status: { exists: boolean }) {
  if (action === 'delete') return status.exists ? 'error' : 'deleted';
  if (action === 'update') return status.exists ? 'updated' : 'error';
  if (action === 'create') return status.exists ? 'published' : 'error';
  return 'error';
}

async function loadAdapter(platform: PlatformKey): Promise<Adapter> {
  switch (platform) {
    case 'meetup':
      return (await import('../platforms/meetup/api/adapter.js')).adapter;
    case 'eventbrite':
      return (await import('../platforms/eventbrite/api/adapter.js')).adapter;
    case 'facebook':
      return (await import('../platforms/facebook/api/adapter.js')).adapter;
    case 'spontacts':
      return (await import('../platforms/spontacts/api/adapter.js')).adapter;
    default:
      throw new Error('Unsupported platform');
  }
}

async function findEnabledConfig(platform: PlatformKey, method: 'api'|'ui'): Promise<PlatformConfig | null> {
  return prisma.platformConfig.findFirst({ where: { platform, method, enabled: true }, orderBy: { updatedAt: 'desc' } });
}
