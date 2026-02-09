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
			'src/tests/**/*.svelte.spec.{js,ts}',
			'src/lib/components/**/*.test.{js,ts}',
			'src/lib/components/**/*.spec.{js,ts}',
			'node_modules'
		]
	}
});
