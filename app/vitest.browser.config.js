// <reference types="@sveltejs/kit" />
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./util/setup-tests.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
    include: [
      'src/tests/**/*.svelte.spec.{js,ts}',
      'src/tests/lib/auth/schemas.test.ts',
      'src/tests/lib/schemas/**/*.test.ts',
      'src/tests/lib/stores/**/*.test.ts',
      'src/tests/lib/utils/**/*.test.ts',
      'src/tests/lib/utils.test.ts',
      'src/lib/components/**/*.spec.{js,ts}',
    ],
    exclude: ['src/tests/**/*.server.spec.{js,ts}', 'node_modules'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        'src/lib/types/',
        'src/lib/paraglide/',
        'build/',
        '.svelte-kit/',
        'src/lib/components/ui/',
      ],
    },
  },
});
