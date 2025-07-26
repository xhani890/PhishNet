import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
});