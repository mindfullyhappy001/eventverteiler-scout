import { chromium } from '@playwright/test';
import { loadOrCreateSession } from '../shared/session.js';
import { smartFill, clickByText } from '../shared/helpers.js';
import { createArtifacts } from '../shared/logging.js';
import { mapToSpontactsFields } from '../../../shared/platforms/spontacts';

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
      await clickByText(page, 'Login').catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      await smartFill(page, 'E-Mail', cfg.email) || await smartFill(page, 'Email', cfg.email);
      await smartFill(page, 'Passwort', cfg.password) || await smartFill(page, 'Password', cfg.password);
      await clickByText(page, 'Anmelden').catch(() => clickByText(page, 'Login'));
      await page.waitForLoadState('networkidle');
      await session.save();
    }

    const createBtn = (await clickByText(page, 'Aktivität erstellen')) || (await clickByText(page, 'Create activity'));
    if (!createBtn) {
      await page.goto('https://www.spontacts.com/activities/new').catch(() => {});
    }

    await page.waitForLoadState('domcontentloaded');

    const m = mapToSpontactsFields(event);
    if (m.title) await smartFill(page, 'Titel', m.title) || await smartFill(page, 'Title', m.title);
    if (m.description) await smartFill(page, 'Beschreibung', m.description) || await smartFill(page, 'Description', m.description);
    if (m.date) await smartFill(page, 'Datum', new Date(m.date).toLocaleDateString()) || await smartFill(page, 'Date', new Date(m.date).toLocaleDateString());
    if (m.time) await smartFill(page, 'Uhrzeit', m.time) || await smartFill(page, 'Time', m.time);
    if (m.category) await smartFill(page, 'Kategorie', m.category) || await smartFill(page, 'Category', m.category);
    if (m.city) await smartFill(page, 'Ort', m.city) || await smartFill(page, 'City', m.city);
    if (m.meetingPoint) await smartFill(page, 'Treffpunkt', m.meetingPoint) || await smartFill(page, 'Meeting point', m.meetingPoint);
    if (m.maxParticipants) await smartFill(page, 'Teilnehmer', String(m.maxParticipants)) || await smartFill(page, 'Participants', String(m.maxParticipants));
    if (m.price) await smartFill(page, 'Preis', String(m.price)) || await smartFill(page, 'Price', String(m.price));

    await clickByText(page, 'Veröffentlichen') || await clickByText(page, 'Publish');
    await page.waitForLoadState('networkidle');
    await art.save(page, 'after-publish');

    await page.goto('https://www.spontacts.com/my-activities').catch(() => page.goto('https://www.spontacts.com/activities/mine'));
    await page.waitForLoadState('domcontentloaded');
    const visible = await page.getByText(m.title, { exact: false }).first().isVisible().catch(() => false);
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
