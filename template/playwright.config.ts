import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: [
		{
			command: 'pnpm run pb',
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
