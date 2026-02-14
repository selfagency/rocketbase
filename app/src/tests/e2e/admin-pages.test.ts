import { expect, test } from './fixtures/coverage';

const API_BASE = process.env.POCKETBASE_URL || 'http://localhost:8090';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'test1234567890';
const MAILPIT_LIST_API = 'http://localhost:8025/api/v1/messages';
const MAILPIT_MESSAGE_API = 'http://localhost:8025/api/v1/message';
const MAILPIT_POLL_INTERVAL_MS = 1000;
const MAILPIT_POLL_TIMEOUT_MS = 10000;

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

async function createPageRecord(title: string, slug: string) {
  const token = await getAdminToken();
  const res = await fetch(`${API_BASE}/api/collections/pages/records`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      slug,
      summary: 'This is a test page created by Playwright',
      content: '<p>Hello world</p>',
      collection: 'posts',
      published: true,
      visible: true,
      order: 0,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed creating page: ${res.status} ${txt}`);
  }

  return res.json();
}

async function getLatestEmailForRecipient(email: string) {
  const normalizedEmail = email.toLowerCase();
  const start = Date.now();

  while (Date.now() - start < MAILPIT_POLL_TIMEOUT_MS) {
    const response = await fetch(MAILPIT_LIST_API);
    const data = await response.json();
    const messages = data.messages || [];
    const matching = messages.find((message: any) => {
      const recipients = Array.isArray(message?.To) ? message.To : [message?.To];
      return recipients.some((recipient: any) => {
        const value = recipient?.Address || recipient?.Email || recipient?.Name || recipient || '';
        return value.toString().toLowerCase().includes(normalizedEmail);
      });
    });

    if (matching) {
      return matching;
    }

    await new Promise(resolve => setTimeout(resolve, MAILPIT_POLL_INTERVAL_MS));
  }

  return null;
}

async function extractOTPFromEmail(email: string): Promise<string | null> {
  const message = await getLatestEmailForRecipient(email);
  if (!message) {
    return null;
  }

  const messageId = message.ID || message.id || message.Id || message._id;
  if (!messageId) {
    return null;
  }

  const response = await fetch(`${MAILPIT_MESSAGE_API}/${encodeURIComponent(messageId.toString())}`);
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const emailBody = data.HTML || data.Text || '';
  const match = emailBody.match(/\b(\d{8}|\d{6})\b/);
  return match ? match[1] : null;
}

async function loginViaUi(page: any, email: string, password: string) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: /^login$/i }).click();

  const mfaInput = page.getByLabel(/verification code/i);
  let needsMfa = false;
  let loginSucceeded = false;

  for (let i = 0; i < 30; i++) {
    if (page.url().includes('/?login=success')) {
      loginSucceeded = true;
      break;
    }

    needsMfa = await mfaInput.isVisible().catch(() => false);
    if (needsMfa) {
      break;
    }

    await page.waitForTimeout(500);
  }

  if (needsMfa) {
    const otp = await extractOTPFromEmail(email);
    expect(otp).toBeTruthy();
    await mfaInput.fill(otp as string);
    await page.getByRole('button', { name: /verify code/i }).click();
    await expect(page).toHaveURL('/?login=success', { timeout: 15000 });
    return;
  }

  if (!loginSucceeded) {
    await expect(page).toHaveURL('/?login=success', { timeout: 15000 });
  }
}

async function cleanupTestUsers(email?: string) {
  if (!email) return;

  const token = await getAdminToken();
  const headers = { Authorization: `Bearer ${token}` };
  const listRes = await fetch(`${API_BASE}/api/collections/users/records?filter=email="${email}"&perPage=50`, {
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

test.describe('Admin Pages - create and edit', () => {
  let createdEmail: string | undefined;

  test.afterEach(async () => {
    await cleanupTestUsers(createdEmail);
    createdEmail = undefined;
  });

  test('create a new page and then edit it', async ({ page }) => {
    const email = `pages-editor-${Date.now()}@example.com`;
    const password = 'Password123!';
    const initialTitle = 'E2E Test Page';
    const editedTitle = 'E2E Test Page - Edited';
    const slug = `e2e-test-page-${Date.now()}`;
    let createdPageId = '';
    createdEmail = email;

    await test.step('create editor user via API', async () => {
      await createUser('editor', email, password, 'Pages Editor');
    });

    await test.step('login via UI', async () => {
      await loginViaUi(page, email, password);
    });

    await test.step('create page via API and open edit page', async () => {
      const record = await createPageRecord(initialTitle, slug);
      createdPageId = record.id;

      await page.goto(`/admin/pages/${createdPageId}`);
      await expect(page.getByRole('heading', { name: /edit page/i })).toBeVisible({ timeout: 10000 });
    });

    await test.step('edit the created page', async () => {
      // On the page detail route the form is present; update the title
      const titleField = page.getByLabel('Title');
      await titleField.fill(editedTitle);

      await page.getByRole('button', { name: /update page/i }).click();

      // After update, remain on edit page and show updated title
      await expect(page).toHaveURL(new RegExp(`/admin/pages/${createdPageId}$`), { timeout: 10000 });
      await expect(page.getByLabel('Title')).toHaveValue(editedTitle);
    });
  });
});
