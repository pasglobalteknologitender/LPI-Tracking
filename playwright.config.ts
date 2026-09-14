import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './apps/web/tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run start -w @lpi/api',
      url: 'http://127.0.0.1:3001/health/live',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_APP_URL: 'http://localhost:3100',
        JWT_ACCESS_SECRET: 'dev-access-secret-change-me-min-32-chars',
        JWT_REFRESH_SECRET: 'dev-refresh-secret-change-me-min-32-chars',
        COOKIE_SECURE: 'false',
      },
    },
    {
      command: 'npm run dev -w @lpi/web -- --hostname 127.0.0.1 --port 3100',
      url: 'http://127.0.0.1:3100/login',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        API_URL: 'http://127.0.0.1:3001',
      },
    },
  ],
  projects: [
    {
      name: 'chromium',
      testIgnore: /responsive\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      testMatch: /responsive\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
    },
  ],
});
