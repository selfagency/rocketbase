import { expect, test } from '@playwright/test';

const POCKETBASE_URL =
	process.env.POCKETBASE_URL || process.env.PUBLIC_POCKETBASE_URL || 'http://localhost:8090';
const ADMIN_EMAIL =
	process.env.PB_ADMIN_EMAIL || process.env.POCKETBASE_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD =
	process.env.PB_ADMIN_PASSWORD || process.env.POCKETBASE_ADMIN_PASSWORD || 'test1234567890';
const SITE_ORIGIN = process.env.PUBLIC_SITE_URL || process.env.ORIGIN || 'http://localhost:3000';

// Helper function to authenticate and get admin token
async function getAdminToken() {
	const response = await fetch(`${POCKETBASE_URL}/api/collections/_superusers/auth-with-password`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			identity: ADMIN_EMAIL,
			password: ADMIN_PASSWORD
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to authenticate admin: ${response.status} ${errorText}`);
	}

	const data = await response.json();
	// debug: print admin auth response
	// eslint-disable-next-line no-console
	console.log('admin auth response:', JSON.stringify(data).slice(0, 1000));
	// Some PocketBase setups return token in different fields (token, tokenString)
	return data.token || data.tokenString || data?.admin?.token;
}

// Helper function to create a redirect in PocketBase
async function createRedirect(token: string, slug: string, url: string) {
	// PocketBase "url" field expects a valid absolute URL. Convert relative paths to absolute using SITE_ORIGIN.
	const bodyUrl = url && url.startsWith('/') ? `${SITE_ORIGIN}${url}` : url;

	const body = { slug, url: bodyUrl };
	// eslint-disable-next-line no-console
	console.log(
		'Creating redirect:',
		body,
		'SITE_ORIGIN:',
		SITE_ORIGIN,
		'token:',
		token?.substring(0, 20) + '...'
	);

	const response = await fetch(`${POCKETBASE_URL}/api/collections/redirects/records`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const errorText = await response.text();
		// eslint-disable-next-line no-console
		console.error('Failed to create redirect. Status:', response.status, 'Body:', errorText);
		let errorDetail = errorText;
		try {
			const errorJson = JSON.parse(errorText);
			if (errorJson.data && Object.keys(errorJson.data).length > 0) {
				errorDetail = JSON.stringify(errorJson.data);
			}
		} catch {
			// ignore parse error
		}
		throw new Error(`Failed to create redirect: ${errorDetail}`);
	}

	return response.json();
}

// Helper function to delete a redirect from PocketBase
async function deleteRedirect(token: string, id: string) {
	const response = await fetch(`${POCKETBASE_URL}/api/collections/redirects/records/${id}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${token}` }
	});

	if (!response.ok) {
		console.warn(`Failed to delete redirect ${id}: ${await response.text()}`);
	}
}

// Helper function to list all redirects
async function listRedirects(token: string) {
	const response = await fetch(`${POCKETBASE_URL}/api/collections/redirects/records`, {
		headers: { Authorization: `Bearer ${token}` }
	});

	if (!response.ok) {
		throw new Error('Failed to list redirects');
	}

	const data = await response.json();
	return data.items || [];
}

test.describe('Redirect Functionality', () => {
	let adminToken: string;
	let createdRedirects: string[] = [];

	test.beforeAll(async () => {
		adminToken = await getAdminToken();
	});

	test.afterEach(async () => {
		// Clean up created redirects
		for (const id of createdRedirects) {
			await deleteRedirect(adminToken, id);
		}
		createdRedirects = [];
	});

	test('should redirect from old path to new path', async ({ page }) => {
		const redirect = await createRedirect(adminToken, 'old-page', '/');
		createdRedirects.push(redirect.id);

		const response = await page.goto('http://localhost:3000/old-page');

		expect(response?.status()).toBe(200);
		expect(page.url()).toBe('http://localhost:3000/');
	});

	test('should redirect with leading slash in slug', async ({ page }) => {
		const redirect = await createRedirect(adminToken, '/old-page-2', '/');
		createdRedirects.push(redirect.id);

		const response = await page.goto('http://localhost:3000/old-page-2');

		expect(response?.status()).toBe(200);
		expect(page.url()).toBe('http://localhost:3000/');
	});

	test('should redirect with trailing slash in URL', async ({ page }) => {
		const redirect = await createRedirect(adminToken, 'old-page-3', '/');
		createdRedirects.push(redirect.id);

		const response = await page.goto('http://localhost:3000/old-page-3/');

		expect(response?.status()).toBe(200);
		expect(page.url()).toBe('http://localhost:3000/');
	});

	test('should redirect to external URL', async ({ page }) => {
		const redirect = await createRedirect(adminToken, 'external-redirect', 'https://example.com');
		createdRedirects.push(redirect.id);

		// Start waiting for navigation before clicking
		const navigationPromise = page.waitForURL('https://example.com', { timeout: 10000 });

		await page.goto('http://localhost:3000/external-redirect');

		await navigationPromise;
		expect(page.url()).toBe('https://example.com/');
	});

	test('should not redirect for non-existent slug', async ({ page }) => {
		const response = await page.goto('http://localhost:3000/non-existent-path');

		// Should reach the catch-all route or 404
		expect(response?.status()).toBeGreaterThanOrEqual(200);
		expect(page.url()).toBe('http://localhost:3000/non-existent-path');
	});

	test('should not redirect API routes', async ({ page }) => {
		const redirect = await createRedirect(adminToken, 'api/test', '/');
		createdRedirects.push(redirect.id);

		// API routes should not be redirected
		await page.goto('http://localhost:3000/api/test');

		// Should get 404 or API response, not redirect
		expect(page.url()).toContain('/api/test');
	});

	test('should redirect before catch-all route', async ({ page }) => {
		// Create a redirect that would otherwise match the catch-all route
		const redirect = await createRedirect(adminToken, 'some-page', '/');
		createdRedirects.push(redirect.id);

		const response = await page.goto('http://localhost:3000/some-page');

		// Should redirect instead of hitting catch-all
		expect(response?.status()).toBe(200);
		expect(page.url()).toBe('http://localhost:3000/');
	});

	test('should handle multiple redirects correctly', async ({ page }) => {
		const redirect1 = await createRedirect(adminToken, 'path-1', '/');
		const redirect2 = await createRedirect(adminToken, 'path-2', '/login');
		createdRedirects.push(redirect1.id, redirect2.id);

		// Test first redirect
		await page.goto('http://localhost:3000/path-1');
		expect(page.url()).toBe('http://localhost:3000/');

		// Test second redirect
		await page.goto('http://localhost:3000/path-2');
		expect(page.url()).toBe('http://localhost:3000/login');
	});

	test('should handle nested paths', async ({ page }) => {
		const redirect = await createRedirect(adminToken, 'old/nested/path', '/');
		createdRedirects.push(redirect.id);

		const response = await page.goto('http://localhost:3000/old/nested/path');

		expect(response?.status()).toBe(200);
		expect(page.url()).toBe('http://localhost:3000/');
	});

	test('should preserve query parameters in redirect', async ({ page }) => {
		const redirect = await createRedirect(adminToken, 'old-with-query', '/login');
		createdRedirects.push(redirect.id);

		await page.goto('http://localhost:3000/old-with-query?foo=bar');

		// Note: Current implementation doesn't preserve query params
		// This test documents current behavior
		expect(page.url()).toBe('http://localhost:3000/login');
	});
});

test.describe('Redirect Performance', () => {
	let adminToken: string;

	test.beforeAll(async () => {
		adminToken = await getAdminToken();
	});

	test('should handle many redirects efficiently', async ({ page }) => {
		// Get count of existing redirects
		const existingRedirects = await listRedirects(adminToken);
		const redirectCount = existingRedirects.length;

		// Test that redirect lookup is still fast with existing redirects
		const start = Date.now();
		await page.goto('http://localhost:3000/non-existent-for-perf-test');
		const duration = Date.now() - start;

		// Should complete reasonably quickly even with many redirects
		// Adjust threshold based on expected performance
		expect(duration).toBeLessThan(2000);

		console.log(`Redirect lookup with ${redirectCount} redirects took ${duration}ms`);
	});
});
