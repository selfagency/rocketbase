import { test, expect } from '@playwright/test';

const API_BASE = process.env.POCKETBASE_URL || 'http://localhost:8090';
const ADMIN_TOKEN = process.env.API_KEY;

async function createUser(role: string, email: string, password: string, name = 'E2E User') {
  if (!ADMIN_TOKEN) throw new Error('API_KEY must be set to create test users');
  const res = await fetch(`${API_BASE}/api/collections/users/records`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
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
  if (!ADMIN_TOKEN) return;
  const headers = { Authorization: `Bearer ${ADMIN_TOKEN}` };
  const listRes = await fetch(`${API_BASE}/api/collections/users/records?filter=email~"@example.com"&perPage=500`, { headers });
  if (!listRes.ok) return;
  const data = await listRes.json();
  const items = data?.items || data || [];
  for (const it of items) {
    const id = it.id || it.ID || it._id;
    if (!id) continue;
    await fetch(`${API_BASE}/api/collections/users/records/${id}`, { method: 'DELETE', headers });
  }
}


test.describe('Admin Pages - create and edit', () => {
  test.afterEach(async () => {
    await cleanupTestUsers();
  });

  test('create a new page and then edit it', async ({ page }) => {
    const email = `pages-editor-${Date.now()}@example.com`;
    const password = 'Password123!';

    await test.step('create editor user via API', async () => {
      await createUser('editor', email, password, 'Pages Editor');
    });

    await test.step('login', async () => {
      await page.goto('/login');
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/?login=success|\//, { timeout: 15000 });
    });

    await test.step('navigate to admin pages and create new page', async () => {
      await page.goto('/admin/pages');
      await page.click('a[href="/admin/pages/new"]');

      // Fill form fields by label
      await page.getByLabel('Title').fill('E2E Test Page');
      await page.getByLabel('Slug').fill(`e2e-test-page-${Date.now()}`);
      await page.getByLabel('Summary').fill('This is a test page created by Playwright');
      await page.getByLabel('Content').fill('<p>Hello world</p>');

      // Ensure Published switch is checked
      const published = page.locator('input#published');
      if (!(await published.isChecked())) {
        await published.check();
      }

      // Submit the form
      await page.click('button:has-text("Create Page")');

      // Should redirect to the page detail
      await expect(page).toHaveURL(/\/admin\/pages\/[a-zA-Z0-9-_]+/, { timeout: 10000 });
    });

    await test.step('edit the created page', async () => {
      // On the page detail route the form is present; update the title
      const titleField = page.getByLabel('Title');
      await titleField.fill('E2E Test Page - Edited');

      await page.click('button:has-text("Update Page")');

      // After update should redirect back to list
      await expect(page).toHaveURL('/admin/pages', { timeout: 10000 });

      // The updated page should appear in the listing
      await expect(page.locator('text=E2E Test Page - Edited')).toBeVisible();
    });
  });
});
