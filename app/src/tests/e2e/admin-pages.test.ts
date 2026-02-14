import { expect, test } from './fixtures/coverage';

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
      password: ADMIN_PASSWORD,
    }),
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
  const token = await getAdminToken();
  const headers = { Authorization: `Bearer ${token}` };
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

async function browserLogin(page: any, email: string, password: string) {
  const res = await page.request.post('/login', {
    form: { email, password, action: 'login' },
    maxRedirects: 0,
    headers: {
      Origin: 'http://localhost:3000',
      Referer: 'http://localhost:3000/login',
    },
  });
  const raw = res.headers()['set-cookie'];
  if (raw) {
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

    await test.step('login via UI', async () => {
      await page.goto('/login');
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill(password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\//, { timeout: 15000 });
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
