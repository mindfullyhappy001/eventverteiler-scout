import { chromium } from '@playwright/test';
import { loadOrCreateSession } from '../shared/session.js';
import { smartFill, clickByText } from '../shared/helpers.js';
import { createArtifacts } from '../shared/logging.js';

const event = JSON.parse(process.env.EVENT_JSON || '{}');
const jobId = process.env.JOB_ID || 'local';
const cfg = JSON.parse(process.env.BOT_CONFIG || '{}');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const session = await loadOrCreateSession(context, 'facebook');
  const page = await context.newPage();
  const art = createArtifacts(jobId);
  try {
    await page.goto('https://www.facebook.com/login');
    await page.waitForLoadState('networkidle');

    if (cfg.email && cfg.password) {
      await smartFill(page, 'Email address or phone number', cfg.email) || await smartFill(page, 'E-Mail', cfg.email) || await smartFill(page, 'Email', cfg.email);
      await smartFill(page, 'Password', cfg.password) || await smartFill(page, 'Passwort', cfg.password);
      await clickByText(page, 'Log in') || await clickByText(page, 'Anmelden');
      await page.waitForLoadState('networkidle');
    }

    await page.goto('https://www.facebook.com/events/create');
    await page.waitForLoadState('domcontentloaded');

    if (event.title) await smartFill(page, 'Event name', event.title);
    if (event.description) await smartFill(page, 'Description', event.description);
    await clickByText(page, 'Create event') || await clickByText(page, 'Event erstellen');

    await page.waitForLoadState('networkidle');
    await art.save(page, 'after-publish');

    await page.goto('https://www.facebook.com/events/hosting');
    const visible = await page.getByText(event.title, { exact: false }).first().isVisible().catch(() => false);
    if (!visible) throw new Error('Verification failed: event title not visible on Facebook hosting');

    await session.save();
    await browser.close();
    console.log(JSON.stringify({ ok: true, verified: true }));
  } catch (e) {
    await art.save(page, 'error');
    await browser.close();
    throw e;
  }
})();
