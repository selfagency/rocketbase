import { defineConfig } from '@playwright/test';
import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get __dirname equivalent in ES modules
// @ts-expect-error
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from app directory for API_KEY and other environment variables
config({ path: resolve(__dirname, '.env'), quiet: true });

export default defineConfig({
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm run test:setup',
        url: 'http://localhost:3000',
        timeout: 180000,
        reuseExistingServer: !process.env.CI,
      },
  testDir: 'src/tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  globalTeardown: './util/global-teardown.ts',
  // Disable HTML report in CI/local e2e runs to avoid starting the server that serves
  // the report during automated runs. Use 'line' for concise console output.
  reporter: [['line']],
});
