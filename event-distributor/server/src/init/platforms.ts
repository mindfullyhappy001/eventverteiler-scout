import { prisma } from '../db/client.js';

const platforms: Array<{ platform: string; method: 'api'|'ui'; name: string; config: any; enabled: boolean }> = [
  { platform: 'meetup', method: 'api', name: 'Meetup API', config: {}, enabled: false },
  { platform: 'meetup', method: 'ui', name: 'Meetup UI', config: {}, enabled: false },
  { platform: 'eventbrite', method: 'api', name: 'Eventbrite API', config: {}, enabled: false },
  { platform: 'eventbrite', method: 'ui', name: 'Eventbrite UI', config: {}, enabled: false },
  { platform: 'facebook', method: 'api', name: 'Facebook API', config: {}, enabled: false },
  { platform: 'facebook', method: 'ui', name: 'Facebook UI', config: {}, enabled: false },
  { platform: 'spontacts', method: 'ui', name: 'Spontacts UI', config: {}, enabled: false },
];

export async function ensurePlatformConfigs() {
  for (const p of platforms) {
    const exists = await prisma.platformConfig.findFirst({ where: { platform: p.platform, method: p.method } });
    if (!exists) {
      await prisma.platformConfig.create({ data: p });
    }
  }
}
