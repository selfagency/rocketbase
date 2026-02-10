import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: [
		{
			command: 'docker run --rm -p 1025:1025 -p 8025:8025 axllent/mailpit',
			port: 8025,
			reuseExistingServer: !process.env.CI,
			timeout: 10000
		},
		{
			command: 'cd .. && pnpm run db',
			port: 8090,
			reuseExistingServer: !process.env.CI
		},
		{
			command: 'pnpm run build && pnpm run preview',
			port: 4173,
			reuseExistingServer: !process.env.CI
		}
	],
	testDir: 'e2e',
	use: {
		baseURL: 'http://localhost:4173'
	}
});
