import { chromium, Browser, BrowserContext } from '@playwright/test';

export interface BrowserAdapter {
  connect(): Promise<void>;
  newContext(options?: Parameters<typeof chromium['launch']>[0] & { storageState?: any }): Promise<BrowserContext>;
  close(): Promise<void>;
}

export class LocalBrowserAdapter implements BrowserAdapter {
  private browser?: Browser;
  async connect() {
    this.browser = await chromium.launch({ headless: true });
  }
  async newContext(opts?: any) {
    if (!this.browser) throw new Error('LocalBrowserAdapter not connected');
    return this.browser.newContext({ locale: 'de-DE', timezoneId: 'Europe/Berlin', viewport: { width: 1280, height: 800 }, ...opts });
  }
  async close() { await this.browser?.close(); }
}

export class WsBrowserAdapter implements BrowserAdapter {
  private browser?: Browser;
  constructor(private endpoint: string) {}
  async connect() {
    this.browser = await chromium.connect(this.endpoint, { timeout: 60000 });
  }
  async newContext(opts?: any) {
    if (!this.browser) throw new Error('WsBrowserAdapter not connected');
    return this.browser.newContext({ locale: 'de-DE', timezoneId: 'Europe/Berlin', viewport: { width: 1280, height: 800 }, ...opts });
  }
  async close() { await this.browser?.close(); }
}
