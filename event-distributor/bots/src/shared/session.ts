import { BrowserContext } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export async function loadOrCreateSession(context: BrowserContext, platform: string) {
  const dir = path.resolve(process.cwd(), 'sessions', platform);
  const file = path.join(dir, 'state.json');
  if (fs.existsSync(file)) {
    await context.addCookies(JSON.parse(fs.readFileSync(file, 'utf8')).cookies || []);
    // LocalStorage restoration requires per-page script; best-effort only
  }
  return { save: async () => {
    const cookies = await context.cookies();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ cookies }, null, 2));
  } };
}
