import { defineConfig } from '@playwright/test';
import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get __dirname equivalent in ES modules
// @ts-expect-error
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from app directory for API_KEY and other environment variables
config({ path: resolve(__dirname, '.env') });

function logE2ERequirementsOnce() {
  console.log('\n⚠️  E2E TEST REQUIREMENTS:');
  console.log('   • Mailpit must be running (docker run --rm -p 1025:1025 -p 8025:8025 axllent/mailpit)');
  console.log('   • PocketBase must be running with migrations applied');
  console.log('   • API_KEY environment variable must be set with a superuser impersonation token');
  console.log('   • Without API_KEY, test cleanup will be skipped\n');
}
logE2ERequirementsOnce();

export default defineConfig({
  webServer: [
    {
      command: 'docker run --rm -p 1025:1025 -p 8025:8025 axllent/mailpit',
      port: 8025,
      reuseExistingServer: !process.env.CI,
      timeout: 10000,
    },
    {
      command: 'cd .. && pnpm run db',
      port: 8090,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm run build && pnpm run preview',
      port: 4173,
      reuseExistingServer: !process.env.CI,
    },
  ],
  testDir: 'src/tests/e2e',
  use: {
    baseURL: 'http://localhost:4173',
  },
});
