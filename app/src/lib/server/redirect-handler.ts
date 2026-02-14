import logger from '$lib/server/logger';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import type { RedirectsResponse } from '../types/pocketbase';
import { getCachedRedirects } from './redirect-store.js';

export const handleRedirects: Handle = async ({ event, resolve }) => {
	// Skip redirects for API routes and static assets
	const p = event.url.pathname;
	if (p === '/api' || p.startsWith('/api/') || p === '/_app' || p.startsWith('/_app/')) {
		return resolve(event);
	}

	// Fetch redirects from cache (with fallback to PocketBase inside the store)
	let redirects: RedirectsResponse[] = [];
	try {
		redirects = await getCachedRedirects();
	} catch (error) {
		// Log error but don't break the request flow
		logger.error(
			'Failed to load redirects',
			error instanceof Error ? error.message : String(error)
		);
	}

	// Normalize the pathname (remove trailing slash for comparison)
	const pathname = event.url.pathname.replace(/\/$/, '') || '/';

	// Find matching redirect
	const matchedRedirect = redirects.find((r) => {
		const redirectSlug = r.slug?.replace(/^\//, '').replace(/\/$/, '');
		const normalizedPathname = pathname.replace(/^\//, '');
		return redirectSlug === normalizedPathname;
	});

	if (matchedRedirect?.url) {
		// Let SvelteKit handle the redirect by throwing — do NOT swallow this with try/catch
		throw redirect(302, matchedRedirect.url);
	}

	// If not found in cache, force-refresh once to catch redirects created during the same test run
	try {
		const freshRedirects = await getCachedRedirects(true);
		const freshMatch = freshRedirects.find((r) => {
			const redirectSlug = r.slug?.replace(/^\//, '').replace(/\/$/, '');
			const normalizedPathname = pathname.replace(/^\//, '');
			return redirectSlug === normalizedPathname;
		});
		if (freshMatch?.url) throw redirect(302, freshMatch.url);
	} catch (err) {
		// Re-throw redirect errors (they have status 300-399)
		if (
			err &&
			typeof err === 'object' &&
			'status' in err &&
			typeof err.status === 'number' &&
			err.status >= 300 &&
			err.status < 400
		) {
			throw err;
		}
		// Ignore other errors - we don't want to break the request flow if PB is unreachable
	}

	return resolve(event);
};
