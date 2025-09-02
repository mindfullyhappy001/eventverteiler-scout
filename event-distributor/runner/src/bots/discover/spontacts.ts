import type { BrowserContext } from '@playwright/test';
import { clickByText } from '@bots/shared/helpers';

function decodeHtml(s: string) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

export async function discoverSpontacts(context: BrowserContext, cfg: any) {
  const page = await context.newPage();
  try {
    await page.goto('https://www.spontacts.com/');
    await page.waitForLoadState('domcontentloaded');
    if (cfg?.email && cfg?.password) {
      await clickByText(page, 'Login').catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      try { await page.getByLabel('E-Mail').fill(cfg.email); } catch {}
      try { await page.getByLabel('Email').fill(cfg.email); } catch {}
      try { await page.getByLabel('Passwort').fill(cfg.password); } catch {}
      try { await page.getByLabel('Password').fill(cfg.password); } catch {}
      await clickByText(page, 'Anmelden').catch(() => clickByText(page, 'Login'));
      await page.waitForLoadState('networkidle');
    }

    const ok = (await clickByText(page, 'Aktivität erstellen')) || (await clickByText(page, 'Create activity'));
    if (!ok) await page.goto('https://www.spontacts.com/activities/new').catch(()=>{});
    await page.waitForLoadState('domcontentloaded');

    const entries = await page.evaluate(() => {
      const out: { label: string; options: string[] }[] = [];
      const uniq = (arr: string[]) => Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
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
          const opts = uniq(Array.from(select.options).map((o) => (o.textContent || '')));
          if (opts.length) out.push({ label: text, options: opts });
        }
      }
      return out;
    });

    const map: Record<string, string[]> = {};
    const find = (r: RegExp) => entries.find(e => r.test(e.label))?.options || [];
    map['category'] = find(/kategor|categ/i);
    map['visibility'] = find(/sichtbar|visib/i);
    map['difficulty'] = find(/schwier|diffic/i);
    // basic cleanup
    for (const k of Object.keys(map)) map[k] = map[k].map(decodeHtml).filter(Boolean);
    return map;
  } finally {
    await page.close().catch(()=>{});
  }
}
