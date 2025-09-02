import type { BrowserContext, Page } from '@playwright/test';
import { smartFill, clickByText, smartSelect } from '@bots/shared/helpers';
import { mapToSpontactsFields } from '@shared/platforms/spontacts';

async function ensureLoggedIn(page: Page, cfg: any) {
  await page.goto('https://www.spontacts.com/');
  await page.waitForLoadState('domcontentloaded');
  if (!cfg?.email || !cfg?.password) return;
  const loggedIn = await page.getByText('Abmelden', { exact: false }).first().isVisible().catch(()=>false);
  if (loggedIn) return;
  await clickByText(page, 'Login').catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
  await smartFill(page, 'E-Mail', cfg.email) || await smartFill(page, 'Email', cfg.email);
  await smartFill(page, 'Passwort', cfg.password) || await smartFill(page, 'Password', cfg.password);
  await clickByText(page, 'Anmelden').catch(() => clickByText(page, 'Login'));
  await page.waitForLoadState('networkidle');
}

export async function runSpontacts(context: BrowserContext, jobId: string, event: any, platformCfg: any, saveArtifact: (name: string, blob: Blob) => Promise<string>) {
  const page = await context.newPage();
  try {
    await ensureLoggedIn(page, platformCfg);

    const createBtn = (await clickByText(page, 'Aktivität erstellen')) || (await clickByText(page, 'Create activity'));
    if (!createBtn) await page.goto('https://www.spontacts.com/activities/new').catch(()=>{});
    await page.waitForLoadState('domcontentloaded');

    const m = mapToSpontactsFields(event);
    if (m.title) await smartFill(page, 'Titel', m.title) || await smartFill(page, 'Title', m.title);
    if (m.description) await smartFill(page, 'Beschreibung', m.description) || await smartFill(page, 'Description', m.description);
    if (m.date) await smartFill(page, 'Datum', new Date(m.date).toLocaleDateString('de-DE')) || await smartFill(page, 'Date', new Date(m.date).toLocaleDateString('de-DE'));
    if (m.time) await smartFill(page, 'Uhrzeit', m.time) || await smartFill(page, 'Time', m.time);
    if (m.category) (await smartSelect(page, 'Kategorie', m.category)) || (await smartSelect(page, 'Category', m.category)) || (await smartFill(page, 'Kategorie', m.category));
    if (m.city) await smartFill(page, 'Ort', m.city) || await smartFill(page, 'City', m.city);
    if (m.meetingPoint) await smartFill(page, 'Treffpunkt', m.meetingPoint) || await smartFill(page, 'Meeting point', m.meetingPoint);
    if (m.maxParticipants) await smartFill(page, 'Teilnehmer', String(m.maxParticipants)) || await smartFill(page, 'Participants', String(m.maxParticipants));
    if (m.price) await smartFill(page, 'Preis', String(m.price)) || await smartFill(page, 'Price', String(m.price));
    if (m.visibility) (await smartSelect(page, 'Sichtbarkeit', m.visibility)) || (await smartSelect(page, 'Visibility', m.visibility));
    if (m.difficulty) (await smartSelect(page, 'Schwierigkeit', m.difficulty)) || (await smartSelect(page, 'Difficulty', m.difficulty));

    await clickByText(page, 'Veröffentlichen') || await clickByText(page, 'Publish');
    await page.waitForLoadState('networkidle');

    const shot = await page.screenshot({ fullPage: true });
    await saveArtifact('after-publish.png', new Blob([shot]));

    await page.goto('https://www.spontacts.com/my-activities').catch(() => page.goto('https://www.spontacts.com/activities/mine'));
    await page.waitForLoadState('domcontentloaded');
    const visible = await page.getByText(m.title, { exact: false }).first().isVisible().catch(() => false);
    if (!visible) throw new Error('Verification failed: event title not visible on Spontacts my activities');
  } finally {
    await page.close().catch(()=>{});
  }
}
