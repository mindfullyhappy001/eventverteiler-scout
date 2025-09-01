import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  timeout: 120000,
  expect: { timeout: 10000 },
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10000,
    navigationTimeout: 30000,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
