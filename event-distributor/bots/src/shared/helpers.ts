import { Page } from '@playwright/test';

export async function smartFill(page: Page, label: string, value: string) {
  const candidates = [
    page.getByLabel(label),
    page.getByPlaceholder(label),
    page.getByRole('textbox', { name: label }),
    page.locator(`input[aria-label="${label}"]`),
    page.getByText(label).locator('..').locator('input,textarea,select'),
  ];
  for (const c of candidates) {
    if (await c.count().catch(() => 0)) {
      try { await c.first().fill(value); return true; } catch {}
    }
  }
  // Fallback: any input on page
  const any = page.locator('input,textarea').first();
  try { await any.fill(value); return true; } catch {}
  return false;
}

export async function smartSelect(page: Page, label: string, value: string) {
  const selectCandidates = [
    page.getByLabel(label),
    page.getByRole('combobox', { name: label }),
    page.getByText(label).locator('..').locator('select'),
    page.locator(`label:has-text("${label}")`).locator('..').locator('select'),
  ];
  for (const c of selectCandidates) {
    const count = await c.count().catch(() => 0);
    if (count) {
      const el = c.first();
      try {
        await el.selectOption({ label: value });
        return true;
      } catch {}
      try {
        await el.selectOption(value);
        return true;
      } catch {}
      try {
        await el.fill(value);
        return true;
      } catch {}
    }
  }
  // Try opening a dropdown and clicking by option text
  const triggers = [
    page.getByLabel(label),
    page.getByRole('combobox', { name: label }),
    page.getByText(label).locator('..').locator('input,[role="combobox"],button'),
  ];
  for (const t of triggers) {
    if (await t.count().catch(() => 0)) {
      try {
        await t.first().click({ force: true });
        const opt = page.getByRole('option', { name: value }).first();
        if (await opt.count().catch(() => 0)) {
          await opt.click({ force: true });
          return true;
        }
      } catch {}
    }
  }
  return false;
}

export async function clickByText(page: Page, text: string) {
  const candidates = [page.getByRole('button', { name: text }), page.getByText(text, { exact: true })];
  for (const c of candidates) {
    if (await c.count().catch(() => 0)) {
      try { await c.first().click(); return true; } catch {}
    }
  }
  return false;
}