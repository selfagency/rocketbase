// <reference types="@sveltejs/kit" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.{js,ts}', 'src/tests/**/*.server.spec.{js,ts}'],
    exclude: [
      'src/tests/e2e/**/*',
      'src/tests/**/*.svelte.spec.{js,ts}',
      'src/lib/components/**/*.test.{js,ts}',
      'src/lib/components/**/*.spec.{js,ts}',
      'node_modules',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportOnFailure: true,
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        'src/lib/types/',
        'src/lib/paraglide/',
        'build/',
        '.svelte-kit/',
      ],
    },
  },
});
