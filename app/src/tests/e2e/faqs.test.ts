import { expect, test } from './fixtures/coverage';

const API_BASE = process.env.POCKETBASE_URL || 'http://localhost:8090';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'test1234567890';
const MAILPIT_LIST_API = 'http://localhost:8025/api/v1/messages';
const MAILPIT_MESSAGE_API = 'http://localhost:8025/api/v1/message';
const MAILPIT_POLL_INTERVAL_MS = 1000;
const MAILPIT_POLL_TIMEOUT_MS = 10000;

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

async function createFaqRecord(input: {
  question: string;
  answer: string;
  slug: string;
  is_published: boolean;
  sort_order: number;
  category?: string;
  locale?: string;
}) {
  const token = await getAdminToken();
  const res = await fetch(`${API_BASE}/api/collections/faqs/records`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      category: input.category || 'general',
      locale: input.locale || 'en',
      ...input,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed creating FAQ: ${res.status} ${txt}`);
  }

  return res.json();
}

async function cleanupFaqsBySlugPrefix(prefix: string) {
  const token = await getAdminToken();
  const headers = { Authorization: `Bearer ${token}` };
  const listRes = await fetch(`${API_BASE}/api/collections/faqs/records?filter=slug~"${prefix}"&perPage=200`, {
    headers,
  });
  if (!listRes.ok) return;
  const data = await listRes.json();
  const items = data?.items || data || [];
  for (const it of items) {
    const id = it.id || it.ID || it._id;
    if (!id) continue;
    await fetch(`${API_BASE}/api/collections/faqs/records/${id}`, { method: 'DELETE', headers });
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

test.describe('FAQ feature', () => {
  const faqSlugPrefix = `e2e-faq-${Date.now()}`;
  let createdEmail: string | undefined;

  test.afterEach(async () => {
    await cleanupFaqsBySlugPrefix(faqSlugPrefix);
    await cleanupTestUsers(createdEmail);
    createdEmail = undefined;
  });

  test('public FAQ page renders published FAQ and supports keyboard disclosure', async ({ page }) => {
    const question = `How does FAQ e2e public test work? ${Date.now()}`;
    const answer = 'It creates a published FAQ and verifies the disclosure behavior.';

    await test.step('create published FAQ via API', async () => {
      await createFaqRecord({
        question,
        answer,
        slug: `${faqSlugPrefix}-public`,
        is_published: true,
        sort_order: 10,
      });
    });

    await test.step('open public FAQs page', async () => {
      await page.goto('/faqs');
      await expect(page).toHaveURL('/faqs');
      await expect(page.getByRole('heading', { name: /frequently asked questions/i })).toBeVisible();
      await expect(page.getByText(question)).toBeVisible();
    });

    await test.step('open disclosure with keyboard and assert answer', async () => {
      const summary = page.getByText(question, { exact: true });
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByText(answer)).toBeVisible();
    });
  });

  test('admin FAQ CRUD happy path', async ({ page }) => {
    const email = `faq-admin-${Date.now()}@example.com`;
    const password = 'Password123!';
    const question = `How do I create an FAQ? ${Date.now()}`;
    const updatedQuestion = `${question} (updated)`;

    createdEmail = email;

    await test.step('create admin user and sign in', async () => {
      await createUser('admin', email, password, 'FAQ Admin');
      await loginViaUi(page, email, password);
    });

    await test.step('create FAQ in admin UI', async () => {
      await page.goto('/admin/faqs');
      await expect(page).toHaveURL('/admin/faqs');

      await page.locator('#create-question').fill(question);
      await page.locator('#create-answer').fill('Use the admin form and click Create FAQ.');
      await page.locator('#create-category').fill('admin');
      await page.locator('#create-slug').fill(`${faqSlugPrefix}-admin-crud`);
      await page.locator('#create-locale').fill('en');
      await page.locator('#create-sort-order').fill('20');
      await page.locator('#create-published').check();
      await page.getByRole('button', { name: /create faq/i }).click();

      await expect(page).toHaveURL(/\/admin\/faqs\?faq=created$/);
      await expect(page.getByText(question)).toBeVisible();
    });

    await test.step('update FAQ question and save', async () => {
      const faqRow = page.locator('li').filter({ hasText: question }).first();
      await faqRow.getByLabel('Question').fill(updatedQuestion);
      await faqRow.getByRole('button', { name: /^save$/i }).click();

      await expect(page).toHaveURL(/\/admin\/faqs\?faq=updated$/);
      await expect(page.getByText(updatedQuestion)).toBeVisible();
    });

    await test.step('delete FAQ entry', async () => {
      const faqRow = page.locator('li').filter({ hasText: updatedQuestion }).first();

      page.once('dialog', dialog => {
        void dialog.accept();
      });

      await faqRow.getByRole('button', { name: /^delete$/i }).click();

      await expect(page).toHaveURL(/\/admin\/faqs\?faq=deleted$/);
      await expect(page.getByText(updatedQuestion)).toHaveCount(0);
    });
  });
});
