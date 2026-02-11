import { defineConfig } from '@playwright/test';
import { config } from 'dotenv';
import { exec } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get __dirname equivalent in ES modules
// @ts-expect-error
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from app directory for API_KEY and other environment variables
config({ path: resolve(__dirname, '.env') });

exec('docker network create e2e 2>/dev/null || true', error => {
  if (error) {
    console.error('Error creating Docker network:', error);
  } else {
    console.log('Docker network "e2e" is ready');
  }
});

export default defineConfig({
  webServer: [
    {
      command: 'docker run --rm --network e2e --name mailpit -p 1025:1025 -p 8025:8025 axllent/mailpit',
      url: 'http://localhost:8025',
      timeout: 10000,
    },
    {
      command:
        'docker run --rm --network e2e -v ../db/pb_hooks:/pb_hooks -v ../db/pb_migrations:/pb_migrations -v ../db/pb_data:/pb_data -p 8090:8090 -e SMTP_HOST=mailpit -e SMTP_PORT=1025 -e SMTP_USERNAME=test -e SMTP_PASSWORD=test -e SMTP_AUTH=PLAIN ghcr.io/muchobien/pocketbase:latest',
      url: 'http://localhost:8090/api/health',
      timeout: 10000,
    },
    {
      command: 'pnpm run build && pnpm run preview',
      url: 'http://localhost:4173',
    },
  ],
  testDir: 'src/tests/e2e',
  use: {
    baseURL: 'http://localhost:4173',
  },
});
