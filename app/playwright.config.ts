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

export default defineConfig({
	webServer: [
		{
			command: 'pnpm run test:setup',
			url: 'http://localhost:3000',
			timeout: 120000
		}
	],
	testDir: 'src/tests/e2e',
	use: {
		baseURL: 'http://localhost:3000'
	},
	globalTeardown: './util/global-teardown.ts'
});
