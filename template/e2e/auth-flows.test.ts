import { expect, test } from '@playwright/test';

// Mailpit API helper functions
const MAILPIT_API = 'http://localhost:8025/api/v1/messages';

async function getEmailsForRecipient(email: string) {
	const response = await fetch(`${MAILPIT_API}?search=${encodeURIComponent(`to:${email}`)}`);
	const data = await response.json();
	return data.messages || [];
}

async function getAllEmails() {
	const response = await fetch(MAILPIT_API);
	const data = await response.json();
	console.log('Total messages in Mailpit:', data.messages?.length || 0);
	if (data.messages && data.messages.length > 0) {
		console.log('Recent 3 messages:', data.messages.slice(0, 3).map((m: any) => ({ ID: m.ID, To: m.To, Subject: m.Subject })));
	}
	return data.messages || [];
}

async function getLatestEmailForRecipient(email: string, retries = 3) {
	for (let i = 0; i < retries; i++) {
		const emails = await getEmailsForRecipient(email);
		if (emails.length > 0) {
			console.log(`Found email for ${email} on attempt ${i + 1}`);
			return emails[0];
		}
		if (i < retries - 1) {
			console.log(`No email for ${email} yet, waiting 1.5s... (attempt ${i + 1}/${retries})`);
			await new Promise(resolve => setTimeout(resolve, 1500));
		}
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

		const response = await fetch(`${MAILPIT_API}/${message.ID}`);
		if (!response.ok) {
			console.error('Failed to fetch email:', response.statusText);
			return null;
		}
		const data = await response.json();

		// Get email body - try HTML first, then text
		const emailBody = data.HTML || data.Text || '';
		console.log('Email HTML exists:', !!data.HTML, 'Text exists:', !!data.Text);
		if (emailBody.length === 0) {
			console.log('Email body is empty!');
			console.log('Full message data keys:', Object.keys(data));
		}
		console.log('Email body (first 500 chars):', emailBody.substring(0, 500));

		// Extract OTP - try multiple patterns:
		// 1. Exactly 8 consecutive digits
		// 2. Code: followed by digits
		// 3. Any number like verification code
		let match = emailBody.match(/(\d{8})/);
		if (match) {
			console.log('Found 8-digit OTP:', match[1]);
			return match[1];
		}

		// Try "code" followed by digits (case insensitive)
		match = emailBody.match(/code[:\s]+(\d+)/i);
		if (match) {
			console.log('Found code-formatted OTP:', match[1]);
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

	const response = await fetch(`${MAILPIT_API}/${message.ID}`);
	if (!response.ok) {
		console.error('Failed to fetch email:', response.statusText);
		return null;
	}
	const data = await response.json();

	// Get email body - try HTML first, then text
	const emailBody = data.HTML || data.Text || '';
	console.log('Email body (first 1000 chars):', emailBody.substring(0, 1000));

	// Extract verification link - try multiple patterns:
	// 1. Full URL with /confirm-verification/ path
	// 2. URL in href attribute
	// 3. Any localhost/127.0.0.1 URL in the email
	let match = emailBody.match(/(https?:\/\/[^\s"'<>]+\/confirm-verification\/[^\s"'<>]+)/);
	if (match) {
		console.log('Found confirm-verification URL:', match[1].substring(0, 100));
		return match[1];
	}

	// Try looking for href
	match = emailBody.match(/href=["']([^"']+\/confirm-verification\/[^"']+)["']/);
	if (match) {
		console.log('Found href-style verification URL:', match[1].substring(0, 100));
		return match[1];
	}

	// Last resort: look for ANY URL containing "confirm-verification"
	match = emailBody.match(/(https?:\/\/[^\s"'<>]*confirm-verification[^\s"'<>]*)/);
	if (match) {
		console.log('Found generic confirm-verification URL:', match[1].substring(0, 100));
		return match[1];
	}

	console.error('No verification link found in email with any pattern');
	console.log('Email body dump:', emailBody);
	return null;
}

// PocketBase Admin API cleanup helper
async function deleteUserByEmail(email: string) {
	try {
		// Get admin token from environment - in production, use proper auth
		const adminEmail = 'admin@example.com';
		const adminPassword = 'admin123456';

		// Authenticate as admin
		const authResponse = await fetch(
			'http://localhost:8090/api/collections/users/auth-with-password',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ identity: adminEmail, password: adminPassword })
			}
		);

		if (!authResponse.ok) {
			// Fallback: try to delete directly (may fail if admin auth is different)
			return;
		}

		const authData = await authResponse.json();
		const token = authData.token;

		// Find user by email
		const searchResponse = await fetch(
			`http://localhost:8090/api/collections/users/records?filter=${encodeURIComponent(`email="${email}"`)}`,
			{
				method: 'GET',
				headers: { Authorization: `Bearer ${token}` }
			}
		);

		if (!searchResponse.ok) return;

		const searchData = await searchResponse.json();
		if (searchData.items && searchData.items.length > 0) {
			// Delete each user record found
			for (const item of searchData.items) {
				await fetch(`http://localhost:8090/api/collections/users/records/${item.id}`, {
					method: 'DELETE',
					headers: { Authorization: `Bearer ${token}` }
				});
			}
		}
	} catch (err) {
		// Silently fail if cleanup doesn't work - tests should still pass
	}
}

test.describe('Authentication Flows', () => {
	const testUser = {
		name: 'Test User',
		email: `test-${Date.now()}@example.com`,
		password: 'Password123!'
	};

	test.describe('Registration Flow', () => {
		test('should register a new user successfully', async ({ page }) => {
			const email = `register-basic-${Date.now()}@example.com`;
			try {
				await page.goto('/register');

				// Fill registration form
				await page.fill('input[name="name"]', 'Test User');
				await page.fill('input[name="email"]', email);
				await page.fill('input[name="password"]', 'Password123!');
				await page.fill('input[name="passwordConfirm"]', 'Password123!');

				// Submit form
				await page.click('button[type="submit"]');

				// Should redirect to home page after successful registration
				await expect(page).toHaveURL('/');

				// Should see welcome message
				await expect(page.locator('text=/welcome/i')).toBeVisible();
			} finally {
				await deleteUserByEmail(email);
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
				await deleteUserByEmail(email);
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
				// Register user with 2FA profile
				await page.goto('/register');
				await page.fill('input[name="name"]', '2FA User');
				await page.fill('input[name="email"]', email);
				await page.fill('input[name="password"]', password);
				await page.fill('input[name="passwordConfirm"]', password);
				await page.click('button[type="submit"]');

				// Wait for registration to complete
				await expect(page).toHaveURL('/');

				// Enable 2FA in account settings
				await page.goto('/account');
				await page.waitForLoadState('networkidle');
				await page.click('#mfa-opt-in');
				await page.waitForLoadState('networkidle');

				// Go to home page and logout
				await page.goto('/');
				await page.click('button:has-text("Logout")');
				await expect(page).toHaveURL('/login');

				// Now login
				await page.fill('input[name="email"]', email);
				await page.fill('input[name="password"]', password);
				await page.click('button[type="submit"]');

				// Should be on MFA verification page
				await expect(page.locator('text=/enter the verification code/i')).toBeVisible();
				// Get OTP from email - wait longer for email delivery
			await page.waitForTimeout(3000);
			const otp = await extractOTPFromEmail(email);
			expect(otp).toBeTruthy();
				// Enter OTP
				await page.getByLabel('Verification Code').fill(otp!);
				await page.click('button[type="submit"]');

				// Should redirect to home after 2FA success
				await expect(page).toHaveURL('/');
				await expect(page.locator('text=/logged in/i')).toBeVisible();
			} finally {
				await deleteUserByEmail(email);
			}
		});

		test('should reject invalid OTP code', async ({ page }) => {
			const email = `2fa-invalid-${Date.now()}@example.com`;
			const password = 'SecurePassword123!';

			try {
				// Register and enable 2FA
				await page.goto('/register');
				await page.fill('input[name="name"]', '2FA Invalid Test');
				await page.fill('input[name="email"]', email);
				await page.fill('input[name="password"]', password);
				await page.fill('input[name="passwordConfirm"]', password);
				await page.click('button[type="submit"]');

				// Wait for registration to complete
				await expect(page).toHaveURL('/');

				await page.goto('/account');
				await page.waitForLoadState('networkidle');
				await page.click('#mfa-opt-in');
				await page.waitForLoadState('networkidle');

				// Go to home page and logout
				await page.goto('/');
				await page.click('button:has-text("Logout")');
				await page.fill('input[name="email"]', email);
				await page.fill('input[name="password"]', password);
				await page.click('button[type="submit"]');

				// Enter invalid OTP
				await page.getByLabel('Verification Code').fill('00000000');
				await page.click('button[type="submit"]');

				// Should show error
				await expect(page.locator('text=/invalid|expired/i')).toBeVisible();
			} finally {
				await deleteUserByEmail(email);
			}
		});
	});

	test.describe('Email Verification Flow', () => {
		test('should send and verify email via link', async ({ page }) => {
			const email = `verify-email-${Date.now()}@example.com`;
			const password = 'SecurePassword123!';

			try {
				// Register user
				await page.goto('/register');
				await page.fill('input[name="name"]', 'Email Verify Test');
				await page.fill('input[name="email"]', email);
				await page.fill('input[name="password"]', password);
				await page.fill('input[name="passwordConfirm"]', password);
				await page.click('button[type="submit"]');

				await expect(page).toHaveURL('/');

				// Go to account page
				await page.goto('/account');
				await page.waitForLoadState('networkidle');

				// Email should not be verified yet
				await expect(page.locator('text=/please verify your email/i')).toBeVisible();

				// Send verification email
				await page.click('button:has-text("Send Verification Email")');
				await page.waitForLoadState('networkidle');

				// Should see "check your inbox" message
				await expect(
					page.getByText('Please check your inbox for a verification email')
				).toBeVisible();

				// Get verification link from email - wait longer for email delivery
			await page.waitForTimeout(3000);
				const verificationLink = await extractVerificationLinkFromEmail(email);
				expect(verificationLink).toBeTruthy();
				// Navigate to verification link
				await page.goto(verificationLink!);
				// Should redirect to account page with success
				await expect(page).toHaveURL(/\/account/);
				await expect(page.locator('text=/email verified successfully/i')).toBeVisible();

				// Navigate back to account page
				await page.goto('/account');
				await page.waitForLoadState('networkidle');

				// Should see green checkmark indicating verified
				await expect(page.locator('text=/email verified/i')).toBeVisible();
			} finally {
				await deleteUserByEmail(email);
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
				// First register a user
				await page.goto('/register');

				await page.fill('input[name="name"]', 'Login Test');
				await page.fill('input[name="email"]', uniqueEmail);
				await page.fill('input[name="password"]', 'Password123!');
				await page.fill('input[name="passwordConfirm"]', 'Password123!');
				await page.click('button[type="submit"]');

				// Logout
				await page.click('button[type="submit"]:has-text("Logout")');

				// Now login
				await page.goto('/login');
				await page.fill('input[name="email"]', uniqueEmail);
				await page.fill('input[name="password"]', 'Password123!');
				await page.click('button[type="submit"]');

				// Should redirect to home
				await expect(page).toHaveURL('/');
				await expect(page.locator('text=/logged in/i')).toBeVisible();
			} finally {
				await deleteUserByEmail(uniqueEmail);
			}
		});

		test('should show error for invalid credentials', async ({ page }) => {
			await page.goto('/login');

			await page.fill('input[name="email"]', 'nonexistent@example.com');
			await page.fill('input[name="password"]', 'WrongPassword123!');

			await page.click('button[type="submit"]');

			await expect(page.locator('text=/invalid email or password/i')).toBeVisible();
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

			// Wait for redirect to home after registration
			await page.waitForURL('/');

			// Navigate to account page
			await page.goto('/account');

			// Wait for account page to load
			await page.waitForLoadState('networkidle');

			// Should see account settings
			await expect(page.locator('text=/account settings/i')).toBeVisible();

			await expect(page.locator('input[name="email"]')).toHaveValue(uniqueEmail);
		});

		test('should redirect to login when not authenticated', async ({ page }) => {
			await page.goto('/account');

			// Should redirect to login
			await expect(page).toHaveURL('/login');
		});

		test('should update profile information', async ({ page }) => {
			// Register and login
			await page.goto('/register');
			const uniqueEmail = `profile-test-${Date.now()}@example.com`;

			await page.fill('input[name="name"]', 'Profile Test');
			await page.fill('input[name="email"]', uniqueEmail);
			await page.fill('input[name="password"]', 'Password123!');
			await page.fill('input[name="passwordConfirm"]', 'Password123!');
			await page.click('button[type="submit"]');

			try {
				// Wait for registration redirect to complete
				await expect(page).toHaveURL('/');

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
					(response) => response.url().includes('/account') && response.status() === 200
				);
				await page.click('button[type="submit"]:has-text("Save Changes")');
				await responsePromise;

				// Wait for form to update with new values
				await expect(page.locator('input[name="title"]')).toHaveValue('Software Engineer');
			} finally {
				await deleteUserByEmail(uniqueEmail);
			}
		});

		test('should enable and disable 2FA', async ({ page }) => {
			// Register and login
			await page.goto('/register');
			const uniqueEmail = `2fa-toggle-${Date.now()}@example.com`;

			await page.fill('input[name="name"]', '2FA Toggle Test');
			await page.fill('input[name="email"]', uniqueEmail);
			await page.fill('input[name="password"]', 'Password123!');
			await page.fill('input[name="passwordConfirm"]', 'Password123!');
			await page.click('button[type="submit"]');

			try {
				// Wait for registration redirect to complete
				await expect(page).toHaveURL('/');

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
				await deleteUserByEmail(uniqueEmail);
			}
		});

		test('should change password', async ({ page }) => {
			// Register and login
			await page.goto('/register');
			const uniqueEmail = `password-test-${Date.now()}@example.com`;
			const oldPassword = 'OldPassword123!';
			const newPassword = 'NewPassword123!';

			try {
				await page.fill('input[name="name"]', 'Password Test');
				await page.fill('input[name="email"]', uniqueEmail);
				await page.fill('input[name="password"]', oldPassword);
				await page.fill('input[name="passwordConfirm"]', oldPassword);
				await page.click('button[type="submit"]');

				await expect(page).toHaveURL('/');

				// Go to account page
				await page.goto('/account');
				await page.waitForLoadState('networkidle');

				// Scroll to password section
				await page.getByText('Change Password', { exact: true }).first().scrollIntoViewIfNeeded();

				// Fill password change form
				await page.fill('input[name="oldPassword"]', oldPassword);
				await page.fill('input[name="password"]', newPassword);
				await page.fill('input[name="passwordConfirm"]', newPassword);

				// Submit password change
				await page.click('button:has-text("Change Password")');

				// Wait for response but don't wait for networkidle since password change may redirect
				await page.waitForTimeout(1000);

				// The password change should either show a success message or redirect
				// Check if we're still on account page or if we redirected
				const currentUrl = page.url();

				if (currentUrl.includes('/account')) {
					// Still on account page, should see success message
					await expect(page.locator('text=/password changed successfully/i')).toBeVisible({
						timeout: 2000
					});
				}

				// Navigate to home to logout (in case we're still logged in)
				await page.goto('/', { waitUntil: 'networkidle' });

				// Check if we're still logged in (logout button visible)
				const logoutButton = page.locator('button:has-text("Logout")');
				if (await logoutButton.isVisible({ timeout: 1000 }).catch(() => false)) {
					await page.click('button:has-text("Logout")');
					await expect(page).toHaveURL('/login');
				} else {
					// Already logged out, navigate to login
					await page.goto('/login');
				}

				// Try login with old password - should fail
				await page.fill('input[name="email"]', uniqueEmail);
				await page.fill('input[name="password"]', oldPassword);
				await page.click('button[type="submit"]');

				await expect(page.locator('text=/invalid email or password/i')).toBeVisible();

				// Login with new password - should succeed
				await page.fill('input[name="email"]', uniqueEmail);
				await page.fill('input[name="password"]', newPassword);
				await page.click('button[type="submit"]');

				await expect(page).toHaveURL('/');
			} finally {
				await deleteUserByEmail(uniqueEmail);
			}
		});

		test('should show 2FA section', async ({ page }) => {
			// Register and login
			await page.goto('/register');
			const uniqueEmail = `2fa-section-${Date.now()}@example.com`;

			try {
				await page.fill('input[name="name"]', '2FA Section Test');
				await page.fill('input[name="email"]', uniqueEmail);
				await page.fill('input[name="password"]', 'Password123!');
				await page.fill('input[name="passwordConfirm"]', 'Password123!');
				await page.click('button[type="submit"]');

				// Wait for registration redirect to complete
				await expect(page).toHaveURL('/');

				// Go to account page
				await page.goto('/account');

				// Wait for account page to load
				await page.waitForLoadState('networkidle');

				// Should see 2FA information section (regular users can opt in)
				await expect(page.getByText('Two-Factor Authentication', { exact: true })).toBeVisible();
				await expect(page.getByText('2FA Not Required')).toBeVisible();
				await expect(page.locator('#mfa-opt-in')).toBeVisible();
			} finally {
				await deleteUserByEmail(uniqueEmail);
			}
		});

		test.describe('Protected Routes', () => {
			test('should redirect to login for protected routes when not authenticated', async ({
				page
			}) => {
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

					// Should be logged in
					await expect(page.locator('text=/logged in/i')).toBeVisible();

					// Logout
					await page.click('button[type="submit"]:has-text("Logout")');

					// Should redirect to login page
					await expect(page).toHaveURL('/login');
				} finally {
					await deleteUserByEmail(uniqueEmail);
				}
			});
		});
	});
});
