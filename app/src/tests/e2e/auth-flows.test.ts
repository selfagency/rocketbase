import { expect, test } from './fixtures/coverage';

// Mailpit API helper functions
const MAILPIT_LIST_API = 'http://localhost:8025/api/v1/messages';
const MAILPIT_MESSAGE_API = 'http://localhost:8025/api/v1/message';
const MAILPIT_POLL_INTERVAL_MS = 1000;
const MAILPIT_POLL_TIMEOUT_MS = 10000;

async function getEmailsForRecipient(email: string) {
  const response = await fetch(MAILPIT_LIST_API);
  const data = await response.json();
  const allMessages = data.messages || [];
  const normalizedEmail = email.toLowerCase();

  const matchesRecipient = (toField: any) => {
    if (!toField) {
      return false;
    }

    const recipients = Array.isArray(toField) ? toField : [toField];
    return recipients.some(recipient => {
      const value = (() => {
        if (recipient == null) return '';
        if (typeof recipient === 'string') return recipient;
        if (typeof recipient === 'object') {
          return (recipient.Address || recipient.Email || recipient.Name || JSON.stringify(recipient)).toString();
        }
        return recipient.toString();
      })();
      return value.toLowerCase().includes(normalizedEmail);
    });
  };

  const filtered = allMessages.filter((message: any) => matchesRecipient(message.To));

  return filtered.sort((a: any, b: any) => getMessageTimestamp(b) - getMessageTimestamp(a));
}

async function getAllEmails() {
  const response = await fetch(MAILPIT_LIST_API);
  const data = await response.json();
  console.debug('Total messages in Mailpit:', data.messages?.length || 0);
  if (data.messages && data.messages.length > 0) {
    console.debug(
      'Recent 3 messages:',
      data.messages.slice(0, 3).map((m: any) => ({ ID: m.ID, To: m.To, Subject: m.Subject }))
    );
  }
  return data.messages || [];
}

async function getLatestEmailForRecipient(email: string) {
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < MAILPIT_POLL_TIMEOUT_MS) {
    attempt += 1;
    const emails = await getEmailsForRecipient(email);
    if (emails.length > 0) {
      const selected = emails[0];
      console.debug('Selected message for', email, 'candidate:', {
        id: getMailpitMessageId(selected),
        to: selected?.To,
        subject: selected?.Subject,
      });
      console.debug(`Found email for ${email} on attempt ${attempt}`);
      return emails[0];
    }

    const elapsed = Date.now() - start;
    const remaining = MAILPIT_POLL_TIMEOUT_MS - elapsed;
    if (remaining <= 0) break;

    const waitTime = Math.min(MAILPIT_POLL_INTERVAL_MS, remaining);
    console.debug(`No email for ${email} yet, waiting ${waitTime}ms... (attempt ${attempt})`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  return null;
}

function getMessageTimestamp(message: any): number {
  const timeKeys = ['CreatedAt', 'ReceivedAt', 'SentAt', 'Created', 'Time'];
  for (const key of timeKeys) {
    const value = message[key];
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  if (message.ID && typeof message.ID === 'number') {
    return message.ID;
  }

  return 0;
}

function getMailpitMessageId(message: any): string | null {
  if (!message) {
    return null;
  }

  const candidates = [message.ID, message.id, message.Id, message._id];
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) {
      continue;
    }
    return candidate.toString();
  }

  return null;
}

async function extractOTPFromEmail(email: string): Promise<string | null> {
  try {
    const message = await getLatestEmailForRecipient(email);
    if (!message) {
      console.error('No message found for email:', email);
      // Debug: show all emails
      await getAllEmails();
      return null;
    }

    const messageId = getMailpitMessageId(message);
    if (!messageId) {
      console.error('Missing message ID when extracting OTP for', email, 'message:', message);
      await getAllEmails();
      return null;
    }

    const response = await fetch(`${MAILPIT_MESSAGE_API}/${encodeURIComponent(messageId)}`);
    if (!response.ok) {
      console.error('Failed to fetch email detail', {
        status: response.status,
        statusText: response.statusText,
      });
      console.error('Detail URL', `${MAILPIT_MESSAGE_API}/${encodeURIComponent(messageId)}`);
      return null;
    }
    const data = await response.json();

    // Get email body - try HTML first, then text
    const emailBody = data.HTML || data.Text || '';
    console.debug('Email HTML exists:', !!data.HTML, 'Text exists:', !!data.Text);
    if (emailBody.length === 0) {
      console.debug('Email body is empty!');
      console.debug('Full message data keys:', Object.keys(data));
    }
    console.debug('Email body (first 500 chars):', emailBody.substring(0, 500));

    // Extract OTP - try multiple patterns:
    // 1. Exactly 8 consecutive digits
    // 2. Exactly 6 consecutive digits (PocketBase default)
    // 3. Code: followed by digits
    // 4. OTP: followed by digits
    let match = emailBody.match(/\b(\d{8})\b/);
    if (match) {
      console.debug('Found 8-digit OTP:', match[1]);
      return match[1];
    }

    // Try 6-digit code (common OTP format)
    match = emailBody.match(/\b(\d{6})\b/);
    if (match) {
      console.debug('Found 6-digit OTP:', match[1]);
      return match[1];
    }

    // Try "code" followed by digits (case insensitive)
    match = emailBody.match(/code[:\s]+(\d+)/i);
    if (match) {
      console.debug('Found code-formatted OTP:', match[1]);
      return match[1];
    }

    // Try OTP: followed by digits
    match = emailBody.match(/OTP[:\s]+(\d+)/i);
    if (match) {
      console.debug('Found OTP-formatted code:', match[1]);
      return match[1];
    }

    console.error('No OTP found in email with any pattern');
    return null;
  } catch (error) {
    console.error('Error extracting OTP:', error);
    return null;
  }
}

async function extractVerificationLinkFromEmail(email: string): Promise<string | null> {
  const message = await getLatestEmailForRecipient(email);
  if (!message) {
    console.error('No message found for email:', email);
    return null;
  }

  const messageId = getMailpitMessageId(message);
  if (!messageId) {
    console.error('Missing message ID when extracting verification link for', email, 'message:', message);
    return null;
  }

  const response = await fetch(`${MAILPIT_MESSAGE_API}/${encodeURIComponent(messageId)}`);
  if (!response.ok) {
    console.error('Failed to fetch email detail', {
      status: response.status,
      statusText: response.statusText,
    });
    console.error('Detail URL', `${MAILPIT_MESSAGE_API}/${encodeURIComponent(messageId)}`);
    return null;
  }
  const data = await response.json();

  // Get email body - try HTML first, then text
  const emailBody = data.HTML || data.Text || '';
  console.debug('Email body (first 1000 chars):', emailBody.substring(0, 1000));

  // Extract verification link - try multiple patterns:
  // 1. Full URL with /verify-email/ path (custom route)
  // 2. Full URL with /confirm-verification/ path
  // 3. Full URL with /api/collections/users/confirm-verification path (PocketBase default)
  // 4. URL in href attribute
  // 5. Any localhost/127.0.0.1 URL with verify/confirm in the email
  let match = emailBody.match(/(https?:\/\/[^\s"'<>]+\/verify-email\/[^\s"'<>]+)/);
  if (match) {
    console.debug('Found verify-email URL:', match[1].substring(0, 100));
    return match[1];
  }

  match = emailBody.match(/(https?:\/\/[^\s"'<>]+\/confirm-verification\/[^\s"'<>]+)/);
  if (match) {
    console.debug('Found confirm-verification URL:', match[1].substring(0, 100));
    return match[1];
  }

  // Try PocketBase API verification path
  match = emailBody.match(/(https?:\/\/[^\s"'<>]+\/api\/collections\/users\/confirm-verification[^\s"'<>]*)/);
  if (match) {
    console.debug('Found PocketBase API verification URL:', match[1].substring(0, 100));
    return match[1];
  }

  // Try looking for href
  match = emailBody.match(/href=["']([^"']+\/confirm-verification[^"']+)["']/);
  if (match) {
    console.debug('Found href-style verification URL:', match[1].substring(0, 100));
    return match[1];
  }

  // Last resort: look for ANY URL containing "confirm", "verification", or "verify"
  match = emailBody.match(/(https?:\/\/[^\s"'<>]*(?:confirm|verif)[^\s"'<>]*)/i);
  if (match) {
    console.debug('Found generic verification URL:', match[1].substring(0, 100));
    return match[1];
  }

  console.error('No verification link found in email with any pattern');
  console.debug('Email body dump:', emailBody);
  return null;
}

/**
 * Bulk delete all test users from @example.com domain
 */
async function deleteAllTestUsers() {
  try {
    const adminToken = process.env.API_KEY;
    if (!adminToken) return;

    const headers = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    };

    // Get all users from @example.com
    const searchUrl = `http://localhost:8090/api/collections/users/records?filter=email~"@example.com"&perPage=500`;
    const searchResponse = await fetch(searchUrl, { method: 'GET', headers });

    if (!searchResponse.ok) return;

    const searchData = (await searchResponse.json()) as any;
    const items = searchData?.items || searchData || [];

    const testEmailPrefixes = [
      'register-basic-',
      'register-mismatch-',
      '2fa-login-',
      '2fa-invalid-',
      'verify-email-',
      'login-test-',
      'account-test-',
      'profile-test-',
      '2fa-toggle-',
      'password-test-',
      '2fa-section-',
      'logout-test-',
    ];

    const scopedItems = (items || []).filter((item: any) => {
      const email = (item?.email || '').toString().toLowerCase();
      return testEmailPrefixes.some(prefix => email.startsWith(prefix));
    });

    if (scopedItems.length > 0) {
      console.debug('Bulk cleanup: Found', scopedItems.length, 'auth-flow test user(s) to delete');
      // Delete each user record found
      for (const item of scopedItems) {
        const id = item?.id || item?.ID || item?._id;
        if (!id) continue;
        const deleteUrl = `http://localhost:8090/api/collections/users/records/${id}`;
        try {
          const delRes = await fetch(deleteUrl, {
            method: 'DELETE',
            headers,
          });
          if (!delRes.ok) {
            console.debug('Failed deleting test user', id, 'status:', delRes.status);
          }
        } catch (err) {
          console.debug('Error deleting test user', id, err);
        }
      }
    } else {
      console.debug('Bulk cleanup: No auth-flow test users found for cleanup');
    }
  } catch (err) {
    // Silently fail if cleanup doesn't work
    console.debug('Error during bulk test user cleanup:', err);
  }
}

test.describe('Authentication Flows', () => {
  // const testUser = {
  // 	name: 'Test User',
  // 	email: `test-${Date.now()}@example.com`,
  // 	password: 'Password123!'
  // };

  test.describe('Registration Flow', () => {
    test('should register a new user successfully', async ({ page }) => {
      const email = `register-basic-${Date.now()}@example.com`;

      // Capture console logs and errors
      const consoleMessages: string[] = [];
      const pageErrors: string[] = [];

      page.on('console', msg => {
        consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      });

      page.on('pageerror', error => {
        pageErrors.push(error.message);
        console.error('❌ Page error:', error.message);
      });

      try {
        await page.goto('/register');

        // Fill registration form
        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', 'Password123!');
        await page.fill('input[name="passwordConfirm"]', 'Password123!');

        // Submit form
        await page.click('button[type="submit"]');

        // Wait a moment for form submission
        await page.waitForTimeout(2000);

        // Check if there's an error message
        const errorAlert = page.locator('[data-slot="alert"]');
        if (await errorAlert.isVisible()) {
          const errorText = await errorAlert.textContent();
          console.error('Registration error shown on page:', errorText);
        }

        // Check current URL
        const currentUrl = page.url();
        console.log('Current URL after form submission:', currentUrl);

        // Log captured errors and messages
        if (pageErrors.length > 0) {
          console.error('❌ Page errors captured:', pageErrors);
        }
        if (consoleMessages.length > 0) {
          console.log('📝 Console messages (last 15):', consoleMessages.slice(-15));
        }

        // Should redirect to login page after successful registration
        await expect(page).toHaveURL('/login?registered=true');
      } finally {
        // Cleanup handled in bulk via test.afterAll
      }
    });

    test('should show error for mismatched passwords', async ({ page }) => {
      const email = `register-mismatch-${Date.now()}@example.com`;
      try {
        await page.goto('/register');

        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', 'Password123!');
        await page.fill('input[name="passwordConfirm"]', 'DifferentPassword123!');

        await page.click('button[type="submit"]');

        // Should show validation error
        await expect(page.locator('text=/passwords do not match/i')).toBeVisible();
      } finally {
        // Cleanup handled in bulk via test.afterAll
      }
    });

    test('should show error for invalid email', async ({ page }) => {
      await page.goto('/register');

      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', 'Password123!');
      await page.fill('input[name="passwordConfirm"]', 'Password123!');

      await page.click('button[type="submit"]');

      await expect(page.locator('text=/invalid email/i')).toBeVisible();
    });

    test('should navigate to login page from link', async ({ page }) => {
      await page.goto('/register');

      await page.click('a[href="/login"]');

      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Login with 2FA Flow', () => {
    test('should login with 2FA using OTP code from email', async ({ page }) => {
      const email = `2fa-login-${Date.now()}@example.com`;
      const password = 'SecurePassword123!';

      try {
        await test.step('Register user', async () => {
          await page.goto('/register');
          await page.fill('input[name="name"]', '2FA User');
          await page.fill('input[name="email"]', email);
          await page.fill('input[name="password"]', password);
          await page.fill('input[name="passwordConfirm"]', password);
          await page.click('button[type="submit"]');

          // Wait for registration to complete - redirects to login
          await expect(page).toHaveURL('/login?registered=true', { timeout: 10000 });
        });

        await test.step('Login to enable 2FA', async () => {
          await page.fill('input[name="email"]', email);
          await page.fill('input[name="password"]', password);
          await page.click('button[type="submit"]');
          await expect(page).toHaveURL('/?login=success', { timeout: 10000 });
        });

        await test.step('Enable 2FA in account settings', async () => {
          await page.goto('/account');
          await page.waitForLoadState('networkidle');

          // Click the 2FA opt-in switch
          await page.click('#mfa-opt-in');

          // Wait for form submission and page update
          await page.waitForLoadState('networkidle');

          // Verify that 2FA is now enabled by checking the switch state
          const switchElement = page.locator('#mfa-opt-in');
          await expect(switchElement).toBeChecked();
        });

        // Go to home page and logout
        await page.goto('/');
        await page.waitForSelector('[data-testid="logout-button"]');
        await page.click('[data-testid="logout-button"]');
        // Logout redirects to home with logout=success, then navigate to login
        await page.goto('/login');

        // Now login with password
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.getByRole('button', { name: /^login$/i }).click();

        // Wait for form submission to complete
        await page.waitForLoadState('networkidle');

        // Should show alert indicating MFA code is required
        await expect(page.locator('[data-slot="alert"]')).toBeVisible({ timeout: 3000 });

        // Code input should now be visible (conditionally shown when mfaId is set)
        await expect(page.getByLabel(/verification code/i)).toBeVisible({ timeout: 3000 });

        // Get OTP from email - wait longer for email delivery
        await page.waitForTimeout(3000);
        const otp = await extractOTPFromEmail(email);
        expect(otp).toBeTruthy();

        // Enter OTP and submit form
        await page.getByLabel(/verification code/i).fill(otp!);
        await page.getByRole('button', { name: /verify code/i }).click();

        // Should redirect to home after 2FA success
        await expect(page).toHaveURL('/?login=success', { timeout: 10000 });
        await expect(page.getByText('Successfully logged in!')).toBeVisible();
      } finally {
        // Cleanup handled in bulk via test.afterAll
      }
    });

    test('should reject invalid OTP code', async ({ page }) => {
      const email = `2fa-invalid-${Date.now()}@example.com`;
      const password = 'SecurePassword123!';
      try {
        await test.step('Register user', async () => {
          await page.goto('/register');
          await page.fill('input[name="name"]', '2FA Invalid Test');
          await page.fill('input[name="email"]', email);
          await page.fill('input[name="password"]', password);
          await page.fill('input[name="passwordConfirm"]', password);
          await page.click('button[type="submit"]');
          // Wait for registration to complete - redirects to login
          await expect(page).toHaveURL('/login?registered=true', { timeout: 10000 });
        });

        await test.step('Login and enable 2FA', async () => {
          await page.fill('input[name="email"]', email);
          await page.fill('input[name="password"]', password);
          await page.getByRole('button', { name: /^login$/i }).click();
          await expect(page).toHaveURL('/?login=success', { timeout: 10000 });

          await page.goto('/account');
          await page.waitForLoadState('networkidle');
          await page.click('#mfa-opt-in');
          await page.waitForLoadState('networkidle');
        });

        // Go to home page and logout
        await page.goto('/');
        await page.waitForSelector('[data-testid="logout-button"]');
        await page.click('[data-testid="logout-button"]');
        // Logout redirects to home with logout=success, then navigate to login
        await page.goto('/login');

        // Submit login form with credentials
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');

        // Wait for form submission to complete
        await page.waitForLoadState('networkidle');

        // MFA code input should now be visible
        await expect(page.getByLabel(/verification code/i)).toBeVisible({ timeout: 3000 });

        // Enter invalid OTP and submit
        await page.getByLabel(/verification code/i).fill('00000000');
        await page.getByRole('button', { name: /verify code/i }).click();

        // Should show error in an alert
        await expect(page.locator('[data-slot="alert"]')).toBeVisible({ timeout: 3000 });
      } finally {
        // Cleanup handled in bulk via test.afterAll
      }
    });
  });

  test.describe('Email Verification Flow', () => {
    test('should send and verify email via link', async ({ page }) => {
      const email = `verify-email-${Date.now()}@example.com`;
      const password = 'SecurePassword123!';

      try {
        await test.step('Register user', async () => {
          await page.goto('/register');
          await page.fill('input[name="name"]', 'Email Verify Test');
          await page.fill('input[name="email"]', email);
          await page.fill('input[name="password"]', password);
          await page.fill('input[name="passwordConfirm"]', password);
          await page.click('button[type="submit"]');

          // Wait for registration to complete - redirects to login
          await expect(page).toHaveURL('/login?registered=true', { timeout: 10000 });
        });

        await test.step('Login with unverified account', async () => {
          // Login should succeed even for unverified users
          await page.fill('input[name="email"]', email);
          await page.fill('input[name="password"]', password);
          await page.getByRole('button', { name: /^login$/i }).click();

          // Should redirect to home with login success
          await expect(page).toHaveURL('/?login=success', { timeout: 10000 });
        });

        await test.step('Go to account page and send verification email', async () => {
          await page.goto('/account');
          await page.waitForLoadState('networkidle');

          // Should show the send verification email button since user is not verified
          await expect(page.locator('[data-testid="send-verification-email-button"]')).toBeVisible();

          // Click the send verification email button
          await page.click('[data-testid="send-verification-email-button"]');
          await page.waitForLoadState('networkidle');

          // Should see "check your inbox" message
          await expect(page.locator('[data-testid="email-verification-sent"]')).toBeVisible();
        });

        await test.step('Verify email and complete verification', async () => {
          // Get verification link from email - wait longer for email delivery
          await page.waitForTimeout(5000);
          const verificationLink = await extractVerificationLinkFromEmail(email);
          expect(verificationLink).toBeTruthy();

          // Navigate to verification link
          const parsedVerificationUrl = new URL(verificationLink!);
          const currentOrigin = new URL(page.url()).origin;
          const correctedOrigin = new URL(currentOrigin);
          parsedVerificationUrl.protocol = correctedOrigin.protocol;
          parsedVerificationUrl.hostname = correctedOrigin.hostname;
          parsedVerificationUrl.port = correctedOrigin.port;

          await page.goto(parsedVerificationUrl.toString());
          // Should redirect to account page with verified=true
          await expect(page).toHaveURL('/account?verified=true');
          // Should show success toast with verification message
          await expect(page.locator('text=Email verified successfully!')).toBeVisible();
        });

        await test.step('Verify account shows as verified', async () => {
          // Should already be on account page after verification
          await expect(page).toHaveURL('/account?verified=true');

          // Should not show the "send verification" button anymore (indicates verified)
          await expect(page.locator('[data-testid="send-verification-email-button"]')).toHaveCount(0);

          // Navigate to home page to verify user is logged in (logout button should be visible)
          await page.goto('/');
          await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
        });
      } catch (error) {
        console.error('Email verification test failed:', error);
        throw error;
      }
    });

    test('should handle invalid verification link', async ({ page }) => {
      // Try to verify with invalid token
      await page.goto('/auth/confirm-verification/invalid-token-12345');

      // Should show error
      await expect(page.locator('text=/failed|expired|invalid/i')).toBeVisible();
    });
  });

  test.describe('Login Flow', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
      const uniqueEmail = `login-test-${Date.now()}@example.com`;
      try {
        await test.step('Register user', async () => {
          await page.goto('/register');

          await page.fill('input[name="name"]', 'Login Test');
          await page.fill('input[name="email"]', uniqueEmail);
          await page.fill('input[name="password"]', 'Password123!');
          await page.fill('input[name="passwordConfirm"]', 'Password123!');
          await page.click('button[type="submit"]');

          // Wait for registration to complete - redirects to login
          await expect(page).toHaveURL('/login?registered=true', { timeout: 10000 });
        });

        await test.step('Login with credentials', async () => {
          await page.fill('input[name="email"]', uniqueEmail);
          await page.fill('input[name="password"]', 'Password123!');
          await page.getByRole('button', { name: /^login$/i }).click();

          // Should redirect to home with login success
          await expect(page).toHaveURL('/?login=success', { timeout: 10000 });
          // Check that we're logged in - look for Account Settings link or Logout button
          await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
        });
      } finally {
        // Cleanup handled in bulk via test.afterAll
      }
    });

    test('should show error for invalid credentials', async ({ page }) => {
      // Listen for network requests to debug form submission
      const requests: string[] = [];
      page.on('request', request => {
        if (request.url().includes('/login') && request.method() === 'POST') {
          requests.push(`${request.method()} ${request.url()}`);
        }
      });

      await page.goto('/login');

      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"]', 'WrongPassword123!');

      // Click the login button (not the MFA button)
      await page.getByRole('button', { name: /^login$/i }).click();

      // Wait for form submission to complete (AJAX request, not page load)
      await page.waitForTimeout(1000); // Give time for the AJAX request to complete

      console.log('Network requests made:', requests);

      // Check if we're still on the login page (error should keep us here)
      await expect(page).toHaveURL('/login');

      // Wait for the error message in the alert
      await expect(page.locator('[data-slot="alert"]')).toBeVisible({ timeout: 5000 });

      // Verify the alert contains an error message
      const alertText = await page.locator('[data-slot="alert"]').textContent();
      expect(alertText).toBeTruthy();
    });

    test('should navigate to register page from link', async ({ page }) => {
      await page.goto('/login');

      await page.click('a[href="/register"]');

      await expect(page).toHaveURL('/register');
    });

    test('should navigate to forgot password page from link', async ({ page }) => {
      await page.goto('/login');

      await page.click('a[href="/forgot-password"]');

      await expect(page).toHaveURL('/forgot-password');
    });
  });

  test.describe('Account Management Flow', () => {
    test('should access account page when logged in', async ({ page }) => {
      // Register and login
      await page.goto('/register');
      const uniqueEmail = `account-test-${Date.now()}@example.com`;

      await page.fill('input[name="name"]', 'Account Test');
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', 'Password123!');
      await page.fill('input[name="passwordConfirm"]', 'Password123!');
      await page.click('button[type="submit"]');

      // Wait for redirect to login page (not home)
      await expect(page).toHaveURL('/login?registered=true', { timeout: 10000 });

      // Now login with the same credentials
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', 'Password123!');

      // Click login and wait for redirect
      await page.getByRole('button', { name: /^login$/i }).click();
      await expect(page).toHaveURL('/?login=success', { timeout: 15000 });

      // Navigate to account page
      await page.goto('/account');

      // Wait for account page to load
      await page.waitForLoadState('networkidle');

      // Should see account settings heading
      await expect(page.getByRole('heading', { name: /account settings/i })).toBeVisible();

      await expect(page.locator('input[name="email"]')).toHaveValue(uniqueEmail);
    });

    test('should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/account');

      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });

    test('should update profile information', async ({ page }) => {
      const uniqueEmail = `profile-test-${Date.now()}@example.com`;

      try {
        await test.step('Register user', async () => {
          await page.goto('/register');
          await page.fill('input[name="name"]', 'Profile Test');
          await page.fill('input[name="email"]', uniqueEmail);
          await page.fill('input[name="password"]', 'Password123!');
          await page.fill('input[name="passwordConfirm"]', 'Password123!');
          await page.click('button[type="submit"]');

          // Wait for registration redirect to login
          await expect(page).toHaveURL('/login?registered=true', { timeout: 10000 });
        });

        await test.step('Login', async () => {
          await page.fill('input[name="email"]', uniqueEmail);
          await page.fill('input[name="password"]', 'Password123!');
          await page.getByRole('button', { name: /^login$/i }).click();
          await expect(page).toHaveURL('/?login=success', { timeout: 10000 });
        });

        // Go to account page
        await page.goto('/account');

        // Wait for account page to load
        await page.waitForLoadState('networkidle');

        // Update profile
        await page.fill('input[name="title"]', 'Software Engineer');
        await page.fill('textarea[name="bio"]', 'Test bio');
        await page.fill('input[name="website"]', 'https://example.com');

        // Submit form and wait for response
        const responsePromise = page.waitForResponse(
          response => response.url().includes('/account') && response.status() === 200
        );
        await page.click('button[type="submit"]:has-text("Save Changes")');
        await responsePromise;

        // Wait for form to update with new values
        await expect(page.locator('input[name="title"]')).toHaveValue('Software Engineer');
      } finally {
        // Cleanup handled in bulk via test.afterAll
      }
    });

    test('should enable and disable 2FA', async ({ page }) => {
      const uniqueEmail = `2fa-toggle-${Date.now()}@example.com`;

      try {
        await test.step('Register user', async () => {
          await page.goto('/register');
          await page.fill('input[name="name"]', '2FA Toggle Test');
          await page.fill('input[name="email"]', uniqueEmail);
          await page.fill('input[name="password"]', 'Password123!');
          await page.fill('input[name="passwordConfirm"]', 'Password123!');
          await page.click('button[type="submit"]');

          // Wait for registration redirect to login
          await expect(page).toHaveURL('/login?registered=true', { timeout: 10000 });
        });

        await test.step('Login', async () => {
          await page.fill('input[name="email"]', uniqueEmail);
          await page.fill('input[name="password"]', 'Password123!');
          await page.click('button[type="submit"]');
          await expect(page).toHaveURL('/?login=success', { timeout: 10000 });
        });

        // Go to account page
        await page.goto('/account');

        // Wait for account page to load
        await page.waitForLoadState('networkidle');

        // Should see 2FA toggle
        await expect(page.locator('#mfa-opt-in')).toBeVisible();

        // Enable 2FA
        await page.click('#mfa-opt-in');
        await page.waitForTimeout(500);

        // Should show toggle is checked
        await expect(page.locator('#mfa-opt-in')).toHaveAttribute('data-state', 'checked');

        // Disable 2FA
        await page.click('#mfa-opt-in');
        await page.waitForTimeout(500);

        // Should show toggle is unchecked
        await expect(page.locator('#mfa-opt-in')).not.toHaveAttribute('data-state', 'checked');
      } finally {
        // Cleanup handled in bulk via test.afterAll
      }
    });

    test('should change password', async ({ page }) => {
      const uniqueEmail = `password-test-${Date.now()}@example.com`;
      const oldPassword = 'OldPassword123!';
      const newPassword = 'NewPassword123!';

      try {
        await test.step('Register user', async () => {
          await page.goto('/register');
          await page.fill('input[name="name"]', 'Password Test');
          await page.fill('input[name="email"]', uniqueEmail);
          await page.fill('input[name="password"]', oldPassword);
          await page.fill('input[name="passwordConfirm"]', oldPassword);
          await page.click('button[type="submit"]');

          // Wait for registration redirect to login
          await expect(page).toHaveURL('/login?registered=true', { timeout: 10000 });
        });

        await test.step('Login', async () => {
          await page.fill('input[name="email"]', uniqueEmail);
          await page.fill('input[name="password"]', oldPassword);
          await page.click('button[type="submit"]');
          await page.waitForURL('/?login=success', { timeout: 15000 });
        });

        // Go to account page
        await page.goto('/account');
        await page.waitForLoadState('networkidle');

        // Scroll to password section
        await page.getByText('Change Password', { exact: true }).first().scrollIntoViewIfNeeded();

        // Fill password change form
        await page.fill('input[name="oldPassword"]', oldPassword);
        await page.fill('input[name="password"]', newPassword);
        await page.fill('input[name="passwordConfirm"]', newPassword);

        // Submit password change and wait for response
        await page.click('button:has-text("Change Password")');

        // Wait for form submission to complete
        await page.waitForLoadState('networkidle');

        // Success is shown via toast (not DOM text), so check for NO error alert
        const errorAlerts = await page
          .locator('[data-slot="alert"]')
          .filter({ hasText: /error|invalid|failed/i })
          .count();
        expect(errorAlerts).toBe(0);

        // Navigate to home to logout (in case we're still logged in)
        await page.goto('/', { waitUntil: 'networkidle' });

        // Check if we're still logged in (logout button visible)
        const logoutButton = page.locator('[data-testid="logout-button"]');
        if (await logoutButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await page.click('[data-testid="logout-button"]');
          // Wait for logout redirect
          await page.waitForURL('/?logout=success', { timeout: 5000 });
        }

        // Navigate to login page
        await page.goto('/login');

        // Try login with old password - should fail
        await page.fill('input[name="email"]', uniqueEmail);
        await page.fill('input[name="password"]', oldPassword);
        await page.getByRole('button', { name: /^login$/i }).click();

        await expect(page.locator('text=/invalid email or password/i')).toBeVisible();

        // Login with new password - should succeed
        await page.fill('input[name="email"]', uniqueEmail);
        await page.fill('input[name="password"]', newPassword);
        await page.getByRole('button', { name: /^login$/i }).click();

        await expect(page).toHaveURL('/?login=success');
      } finally {
        // Cleanup handled in bulk via test.afterAll
      }
    });

    test('should show 2FA section', async ({ page }) => {
      const uniqueEmail = `2fa-section-${Date.now()}@example.com`;

      try {
        await test.step('Register user', async () => {
          await page.goto('/register');
          await page.fill('input[name="name"]', '2FA Section Test');
          await page.fill('input[name="email"]', uniqueEmail);
          await page.fill('input[name="password"]', 'Password123!');
          await page.fill('input[name="passwordConfirm"]', 'Password123!');
          await page.click('button[type="submit"]');

          // Wait for registration redirect to login
          await expect(page).toHaveURL('/login?registered=true', { timeout: 10000 });
        });

        await test.step('Login', async () => {
          await page.fill('input[name="email"]', uniqueEmail);
          await page.fill('input[name="password"]', 'Password123!');
          await page.click('button[type="submit"]');
          await expect(page).toHaveURL('/?login=success', { timeout: 10000 });
        });

        // Go to account page
        await page.goto('/account');

        // Wait for account page to load
        await page.waitForLoadState('networkidle');

        // Should see 2FA information section (regular users can opt in)
        await expect(page.getByText('Two-Factor Authentication', { exact: true })).toBeVisible();
        await expect(page.getByText('2FA Not Required')).toBeVisible();
        await expect(page.locator('#mfa-opt-in')).toBeVisible();
      } finally {
        // Cleanup handled in bulk via test.afterAll
      }
    });

    test.describe('Protected Routes', () => {
      test('should redirect to login for protected routes when not authenticated', async ({ page }) => {
        await page.goto('/account');
        await expect(page).toHaveURL('/login');
      });

      test('should allow access to public routes when not authenticated', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL('/');

        await page.goto('/login');
        await expect(page).toHaveURL('/login');

        await page.goto('/register');
        await expect(page).toHaveURL('/register');

        await page.goto('/forgot-password');
        await expect(page).toHaveURL('/forgot-password');
      });
    });

    test.describe('Logout Flow', () => {
      test('should logout user and redirect to login', async ({ page }) => {
        // First login
        await page.goto('/register');
        const uniqueEmail = `logout-test-${Date.now()}@example.com`;

        try {
          await page.fill('input[name="name"]', 'Logout Test');
          await page.fill('input[name="email"]', uniqueEmail);
          await page.fill('input[name="password"]', 'Password123!');
          await page.fill('input[name="passwordConfirm"]', 'Password123!');
          await page.click('button[type="submit"]');

          // Wait for redirect to login page
          await expect(page).toHaveURL('/login?registered=true', { timeout: 10000 });

          // Now login to complete registration flow
          await page.fill('input[name="email"]', uniqueEmail);
          await page.fill('input[name="password"]', 'Password123!');

          // Click login and wait for redirect
          await page.getByRole('button', { name: /^login$/i }).click();
          await expect(page).toHaveURL('/?login=success', { timeout: 15000 });

          // Logout
          await page.click('button[type="submit"]:has-text("Logout")');

          // Should redirect to home with logout success, then go to login
          await page.goto('/login');
          await expect(page).toHaveURL('/login');
        } finally {
          // Cleanup handled in bulk via test.afterAll
        }
      });
    });
  });

  test.afterAll('Delete all test users from @example.com', async () => {
    // Bulk delete all test users at the end of all tests
    await deleteAllTestUsers();
  });
});
