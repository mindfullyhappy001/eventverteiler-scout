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

export async function clickByText(page: Page, text: string) {
  const candidates = [page.getByRole('button', { name: text }), page.getByText(text, { exact: true })];
  for (const c of candidates) {
    if (await c.count().catch(() => 0)) {
      try { await c.first().click(); return true; } catch {}
    }
  }
  return false;
}
