import { expect, test } from '@playwright/test';

// Uses API_KEY env var for PocketBase admin operations
const API_BASE = process.env.POCKETBASE_URL || 'http://localhost:8090';
const ADMIN_TOKEN = process.env.API_KEY;

async function createUser(role: string, email: string, password: string, name = 'E2E User') {
  if (!ADMIN_TOKEN) throw new Error('API_KEY must be set to create test users');
  const res = await fetch(`${API_BASE}/api/collections/users/records`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, passwordConfirm: password, name, role }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed creating user: ${res.status} ${txt}`);
  }
  return res.json();
}

async function cleanupTestUsers() {
  if (!ADMIN_TOKEN) return;
  const headers = { Authorization: `Bearer ${ADMIN_TOKEN}` };
  const listRes = await fetch(`${API_BASE}/api/collections/users/records?filter=email~"@example.com"&perPage=500`, {
    headers,
  });
  if (!listRes.ok) return;
  const data = await listRes.json();
  const items = data?.items || data || [];
  for (const it of items) {
    const id = it.id || it.ID || it._id;
    if (!id) continue;
    await fetch(`${API_BASE}/api/collections/users/records/${id}`, { method: 'DELETE', headers });
  }
}

test.describe('Navigation: Admin dropdown', () => {
  test.afterEach(async () => {
    await cleanupTestUsers();
  });

  test('shows Admin dropdown next to About for admin/editor/contributor and Pages only for admin/editor', async ({
    page,
  }) => {
    const email = `nav-admin-${Date.now()}@example.com`;
    const password = 'Password123!';

    // Create an admin user
    await test.step('create admin user via API', async () => {
      await createUser('admin', email, password, 'Nav Admin');
    });

    await test.step('login', async () => {
      await page.goto('/login');
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/?login=success|\//, { timeout: 15000 });
    });

    await test.step('assert admin dropdown exists and positioned after About', async () => {
      const nav = page.getByRole('navigation', { name: 'Primary' });
      const links = nav.locator('a');

      // Find indexes for About and Admin
      const count = await links.count();
      let aboutIndex = -1;
      let adminIndex = -1;
      for (let i = 0; i < count; i++) {
        const text = (await links.nth(i).innerText()).trim();
        if (/^about$/i.test(text)) aboutIndex = i;
        if (/^admin$/i.test(text)) adminIndex = i;
      }

      expect(adminIndex).toBeGreaterThan(-1);
      expect(aboutIndex).toBeGreaterThan(-1);
      expect(adminIndex).toBeGreaterThan(aboutIndex);

      // Open admin dropdown and assert Pages visible for admin
      await links.nth(adminIndex).click();
      await expect(page.getByRole('link', { name: /pages/i })).toBeVisible();
    });
  });
});
