// Playwright konfiguráció – látható Chrome-ban, lassítva, hogy követhető legyen
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 90000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://practicesoftwaretesting.com',
    channel: 'chrome',          // a telepített Google Chrome-ot használja
    headless: false,            // látható ablak
    viewport: { width: 1366, height: 900 },
    screenshot: 'on',
    trace: 'on',
    video: 'off',
    actionTimeout: 20000,
    launchOptions: { slowMo: 450 }, // lassított műveletek, hogy szemmel követhető legyen
  },
});
