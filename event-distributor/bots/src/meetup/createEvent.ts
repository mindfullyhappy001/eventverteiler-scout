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
  const session = await loadOrCreateSession(context, 'meetup');
  const page = await context.newPage();
  const art = createArtifacts(jobId);
  try {
    await page.goto('https://www.meetup.com/login/');
    await page.waitForLoadState('networkidle');

    if (cfg.email && cfg.password) {
      await smartFill(page, 'Email', cfg.email) || await smartFill(page, 'E-Mail', cfg.email);
      await smartFill(page, 'Password', cfg.password) || await smartFill(page, 'Passwort', cfg.password);
      await clickByText(page, 'Log in') || await clickByText(page, 'Anmelden');
      await page.waitForLoadState('networkidle');
    }

    const createUrl = cfg.groupUrl ? `${cfg.groupUrl.replace(/\/$/,'')}/events/create/` : 'https://www.meetup.com/your-group/events/create/';
    await page.goto(createUrl);
    await page.waitForLoadState('domcontentloaded');

    if (event.title) await smartFill(page, 'Event name', event.title);
    if (event.description) await smartFill(page, 'Description', event.description);
    if (event.date) await smartFill(page, 'Date', new Date(event.date).toLocaleDateString());
    if (event.time) await smartFill(page, 'Time', event.time);
    await clickByText(page, 'Publish') || await clickByText(page, 'Veröffentlichen');

    await page.waitForLoadState('networkidle');
    await art.save(page, 'after-publish');

    const listUrl = cfg.groupUrl ? `${cfg.groupUrl.replace(/\/$/,'')}/events/` : 'https://www.meetup.com/your-group/events/';
    await page.goto(listUrl);
    await page.waitForLoadState('domcontentloaded');
    const visible = await page.getByText(event.title, { exact: false }).first().isVisible().catch(() => false);
    if (!visible) throw new Error('Verification failed: event title not visible on listing');

    await session.save();
    await browser.close();
    console.log(JSON.stringify({ ok: true, verified: true }));
  } catch (e) {
    await art.save(page, 'error');
    await browser.close();
    throw e;
  }
})();
