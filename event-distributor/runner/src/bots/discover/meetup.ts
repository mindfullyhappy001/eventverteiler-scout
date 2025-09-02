import type { BrowserContext } from '@playwright/test';
import { clickByText } from '@bots/shared/helpers';

function decodeHtml(s: string) { return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'"); }

export async function discoverMeetup(context: BrowserContext, cfg: any) {
  const page = await context.newPage();
  try {
    await page.goto('https://www.meetup.com/');
    await page.waitForLoadState('domcontentloaded');
    if (cfg?.email && cfg?.password) {
      await clickByText(page, 'Log in').catch(()=>{});
      await page.waitForLoadState('networkidle').catch(()=>{});
      try { await page.getByLabel('Email').fill(cfg.email); } catch {}
      try { await page.getByLabel('Password').fill(cfg.password); } catch {}
      await clickByText(page, 'Log in').catch(()=>{});
      await page.waitForLoadState('networkidle');
    }
    if (cfg?.groupUrl) {
      await page.goto(cfg.groupUrl.replace(/\/$/,'') + '/event/create').catch(()=>{});
    } else {
      await page.goto('https://www.meetup.com/create/').catch(()=>{});
    }
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
    map['category'] = find(/categor|kategor|Topic/i);
    map['visibility'] = find(/privacy|sicht|Visibility/i);
    return Object.fromEntries(Object.entries(map).map(([k,v])=>[k, v.map(decodeHtml)]));
  } finally { await page.close().catch(()=>{}); }
}
