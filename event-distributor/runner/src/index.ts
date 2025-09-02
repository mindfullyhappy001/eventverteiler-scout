import { cfg } from './config';
import { LocalBrowserAdapter, WsBrowserAdapter } from './adapters/browser';
import { SupabaseQueue } from './adapters/queueSupabase';
import { SupabaseStorage } from './adapters/storageSupabase';
import { runSpontacts } from './bots/spontacts';
import { discoverSpontacts } from './bots/discover/spontacts';

async function main() {
  const once = process.argv.includes('--once');
  const queue = new SupabaseQueue();
  const storage = new SupabaseStorage(queue.client());
  const browser = cfg.mode === 'ws' ? new WsBrowserAdapter(cfg.wsEndpoint) : new LocalBrowserAdapter();
  await browser.connect();

  async function processOne(): Promise<boolean> {
    const job = await queue.pickNextJob();
    if (!job) return false;
    await queue.markJob(job.id, { status: 'running' });
    try {
      const event = await queue.loadEvent(job.eventId);
      const platformCfg = await queue.loadPlatformCfg(job.platform, job.method);
      const storageState = await storage.loadSession(job.platform);
      const context = await browser.newContext({ storageState });
      const saveArtifact = async (name: string, blob: Blob) => storage.saveArtifact(job.id, name, blob);

      if (job.platform === 'spontacts' && job.method === 'ui' && (job.action === 'create' || !job.action)) {
        await runSpontacts(context, job.id, event, platformCfg, saveArtifact);
        const newState = await context.storageState();
        await storage.saveSession(job.platform, newState);
        await queue.upsertPublication(job.eventId, job.platform, job.method, 'published', { jobId: job.id });
        await queue.markJob(job.id, { status: 'completed' });
      } else if (job.method === 'ui' && job.action === 'discover') {
        let map: Record<string,string[]> = {};
        if (job.platform === 'spontacts') {
          map = await discoverSpontacts(context, platformCfg);
        } else if (job.platform === 'meetup') {
          const { discoverMeetup } = await import('./bots/discover/meetup');
          map = await discoverMeetup(context, platformCfg);
        } else if (job.platform === 'eventbrite') {
          const { discoverEventbrite } = await import('./bots/discover/eventbrite');
          map = await discoverEventbrite(context, platformCfg);
        } else if (job.platform === 'facebook') {
          const { discoverFacebook } = await import('./bots/discover/facebook');
          map = await discoverFacebook(context, platformCfg);
        } else {
          throw new Error(`Unsupported discover platform ${job.platform}`);
        }
        await queue.saveFieldOptions(job.platform, job.method, map);
        await queue.markJob(job.id, { status: 'completed', result: { ok: true } });
      } else {
        throw new Error(`Unsupported job ${job.platform}/${job.method}/${job.action}`);
      }
      await context.close().catch(()=>{});
    } catch (e: any) {
      await queue.upsertPublication(job.eventId, job.platform, job.method, 'error', { error: e?.message || String(e) });
      await queue.markJob(job.id, { status: 'error', lastError: e?.message || String(e) });
    }
    return true;
  }

  if (once) {
    const worked = await processOne();
    await browser.close();
    process.exit(worked ? 0 : 2);
  }

  // Loop
  while (true) {
    const worked = await processOne();
    if (!worked) await new Promise(r => setTimeout(r, cfg.pollIntervalMs));
  }
}

main().catch((e)=>{ console.error(e); process.exit(1); });
