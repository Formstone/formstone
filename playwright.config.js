import { defineConfig, devices } from '@playwright/test';

let port = 8765;

export default defineConfig({
  testDir: './test/browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: `node test/server.js ${port}`,
    url: `http://localhost:${port}/package.json`,
    reuseExistingServer: !process.env.CI,
  },
});
