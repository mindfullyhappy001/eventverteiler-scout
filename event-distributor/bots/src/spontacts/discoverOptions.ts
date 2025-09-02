import { chromium } from '@playwright/test';
import { loadOrCreateSession } from '../shared/session.js';
import { clickByText } from '../shared/helpers.js';

const jobId = process.env.JOB_ID || 'local';
const cfg = JSON.parse(process.env.BOT_CONFIG || '{}');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const session = await loadOrCreateSession(context, 'spontacts');
  const page = await context.newPage();
  try {
    await page.goto('https://www.spontacts.com/');
    await page.waitForLoadState('domcontentloaded');

    if (cfg.email && cfg.password) {
      await clickByText(page, 'Login').catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      try {
        await page.getByLabel('E-Mail').fill(cfg.email);
      } catch { try { await page.getByLabel('Email').fill(cfg.email); } catch {}
      }
      try {
        await page.getByLabel('Passwort').fill(cfg.password);
      } catch { try { await page.getByLabel('Password').fill(cfg.password); } catch {}
      }
      await clickByText(page, 'Anmelden').catch(() => clickByText(page, 'Login'));
      await page.waitForLoadState('networkidle');
      await session.save();
    }

    const createBtn = (await clickByText(page, 'Aktivität erstellen')) || (await clickByText(page, 'Create activity'));
    if (!createBtn) {
      await page.goto('https://www.spontacts.com/activities/new').catch(() => {});
    }
    await page.waitForLoadState('domcontentloaded');

    const entries = await page.evaluate(() => {
      const out: { label: string; options: string[] }[] = [];
      const uniq = (arr: string[]) => Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
      // Map labels to associated select element via 'for' attribute or proximity
      const labels = Array.from(document.querySelectorAll('label')) as HTMLLabelElement[];
      for (const label of labels) {
        const text = (label.textContent || '').trim();
        let el: HTMLElement | null = null;
        const id = label.getAttribute('for');
        if (id) el = document.getElementById(id);
        if (!el) {
          const next = label.nextElementSibling as HTMLElement | null;
          if (next && next.tagName === 'SELECT') el = next;
          if (!el) {
            const parentSelect = label.parentElement?.querySelector('select') as HTMLElement | null;
            if (parentSelect) el = parentSelect;
          }
        }
        if (el && el.tagName === 'SELECT') {
          const select = el as HTMLSelectElement;
          const opts = uniq(Array.from(select.options).map((o) => o.textContent || ''));
          if (opts.length) out.push({ label: text, options: opts });
        }
      }
      return out;
    });

    const map: Record<string, string[]> = {};
    const pick = (matcher: RegExp) => entries.find((e) => matcher.test(e.label))?.options || [];
    map['category'] = pick(/kategor|categ/i);
    map['visibility'] = pick(/sichtbar|visib/i);
    map['difficulty'] = pick(/schwier|diffic/i);

    console.log(JSON.stringify({ ok: true, options: map }));
    await browser.close();
  } catch (e) {
    await browser.close();
    throw e;
  }
})();