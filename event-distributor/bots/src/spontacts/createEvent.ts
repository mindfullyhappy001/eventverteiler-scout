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
  const session = await loadOrCreateSession(context, 'spontacts');
  const page = await context.newPage();
  const art = createArtifacts(jobId);
  try {
    await page.goto('https://www.spontacts.com/');
    await page.waitForLoadState('domcontentloaded');

    if (cfg.email && cfg.password) {
      // Try to open login
      await clickByText(page, 'Login').catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      await smartFill(page, 'E-Mail', cfg.email);
      await smartFill(page, 'Email', cfg.email);
      await smartFill(page, 'Passwort', cfg.password);
      await smartFill(page, 'Password', cfg.password);
      await clickByText(page, 'Anmelden').catch(() => clickByText(page, 'Login'));
      await page.waitForLoadState('networkidle');
      await session.save();
    }

    // Navigate to create activity/event page
    const createBtn = (await clickByText(page, 'Aktivität erstellen')) || (await clickByText(page, 'Create activity'));
    if (!createBtn) {
      await page.goto('https://www.spontacts.com/activities/new').catch(() => {});
    }

    await page.waitForLoadState('domcontentloaded');
    if (event.title) {
      await smartFill(page, 'Titel', event.title) || await smartFill(page, 'Title', event.title);
    }
    if (event.description) {
      await smartFill(page, 'Beschreibung', event.description) || await smartFill(page, 'Description', event.description);
    }
    if (event.date) {
      await smartFill(page, 'Datum', new Date(event.date).toLocaleDateString()) || await smartFill(page, 'Date', new Date(event.date).toLocaleDateString());
    }
    if (event.time) {
      await smartFill(page, 'Uhrzeit', event.time) || await smartFill(page, 'Time', event.time);
    }

    await clickByText(page, 'Veröffentlichen') || await clickByText(page, 'Publish');
    await page.waitForLoadState('networkidle');
    await art.save(page, 'after-publish');

    // Verify in "Meine Aktivitäten"
    await page.goto('https://www.spontacts.com/my-activities').catch(() => page.goto('https://www.spontacts.com/activities/mine'));
    await page.waitForLoadState('domcontentloaded');
    const visible = await page.getByText(event.title, { exact: false }).first().isVisible().catch(() => false);
    if (!visible) throw new Error('Verification failed: event title not visible on Spontacts my activities');

    await session.save();
    await browser.close();
    console.log(JSON.stringify({ ok: true, verified: true }));
  } catch (e) {
    await art.save(page, 'error');
    await browser.close();
    throw e;
  }
})();
