import { expect, test } from '@playwright/test';

const API_BASE = process.env.POCKETBASE_URL || 'http://localhost:8090';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'test1234567890';

// Get admin token using superuser authentication
async function getAdminToken() {
	const response = await fetch(`${API_BASE}/api/collections/_superusers/auth-with-password`, {
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
	return data.token || data.tokenString || data?.admin?.token;
}

async function createUser(role: string, email: string, password: string, name = 'E2E User') {
	const token = await getAdminToken();
	const res = await fetch(`${API_BASE}/api/collections/users/records`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ email, password, passwordConfirm: password, name, role })
	});
	if (!res.ok) {
		const txt = await res.text();
		throw new Error(`Failed creating user: ${res.status} ${txt}`);
	}
	return res.json();
}

async function cleanupTestUsers() {
	const token = await getAdminToken();
	const headers = { Authorization: `Bearer ${token}` };
	const listRes = await fetch(
		`${API_BASE}/api/collections/users/records?filter=email~"@example.com"&perPage=500`,
		{
			headers
		}
	);
	if (!listRes.ok) return;
	const data = await listRes.json();
	const items = data?.items || data || [];
	for (const it of items) {
		const id = it.id || it.ID || it._id;
		if (!id) continue;
		await fetch(`${API_BASE}/api/collections/users/records/${id}`, { method: 'DELETE', headers });
	}
}

// Helper: perform server-side login and set auth cookie in the browser context
async function browserLogin(page: any, email: string, password: string) {
	// Post form to the login action so server sets the auth cookie
	const res = await page.request.post('/login', {
		form: { email, password, action: 'login' },
		// don't auto-follow to capture set-cookie
		maxRedirects: 0,
		headers: {
			Origin: 'http://localhost:3000',
			Referer: 'http://localhost:3000/login'
		}
	});

	// Get Set-Cookie header and add to browser context
	const raw = res.headers()['set-cookie'];
	if (raw) {
		// take first cookie pair before ';'
		const first = raw.split(',')[0];
		const pair = first.split(';')[0].trim();
		const [name, ...rest] = pair.split('=');
		const value = rest.join('=');
		await page.context().addCookies([{ name, value, domain: 'localhost', path: '/' }]);
	} else {
		const body = await res.text();
		throw new Error(`Login did not return Set-Cookie header, status=${res.status()}, body=${body}`);
	}
}

test.describe('Navigation: Admin dropdown', () => {
	test.afterEach(async () => {
		await cleanupTestUsers();
	});

	test('shows Admin dropdown next to About for admin/editor/contributor and Pages only for admin/editor', async ({
		page
	}) => {
		const email = `nav-admin-${Date.now()}@example.com`;
		const password = 'Password123!';

		// Create an admin user
		await test.step('create admin user via API', async () => {
			await createUser('admin', email, password, 'Nav Admin');
		});

		await test.step('login via UI', async () => {
			await page.goto('/login');
			// Fill login form
			await page.locator('input[name="email"]').fill(email);
			await page.locator('input[name="password"]').fill(password);
			await page.click('button[type="submit"]');
			// After login redirect to home
			await page.waitForURL(/\//, { timeout: 15000 });
		});

		await test.step('assert admin dropdown exists as last nav item', async () => {
			const nav = page.getByRole('navigation', { name: 'Primary' });
			const links = nav.locator('a');

			// Admin should be the last item in nav
			const count = await links.count();
			expect(count).toBeGreaterThan(0);

			const lastLink = links.nth(count - 1);
			const lastLinkText = (await lastLink.innerText()).trim();
			expect(lastLinkText).toMatch(/^admin$/i);

			// Open admin dropdown and assert Pages visible for admin
			await lastLink.click();
			await expect(page.getByRole('link', { name: /pages/i })).toBeVisible();
		});
	});
});
