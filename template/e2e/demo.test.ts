import { expect, test } from '@playwright/test';

test.describe('Demo Tests', () => {
	test('home page has expected h1', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('home page displays welcome message', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('text=/welcome|rocketbase/i')).toBeVisible();
	});

	test('public pages are accessible without login', async ({ page }) => {
		// Home page
		await page.goto('/');
		expect(page.url()).toContain('/');

		// Login page
		await page.goto('/login');
		expect(page.url()).toContain('/login');

		// Register page
		await page.goto('/register');
		expect(page.url()).toContain('/register');

		// Forgot password page
		await page.goto('/forgot-password');
		expect(page.url()).toContain('/forgot-password');
	});

	test('protected pages redirect to login when not authenticated', async ({ page }) => {
		await page.goto('/account');
		await expect(page).toHaveURL('/login');
	});

	test('navigation between pages works correctly', async ({ page }) => {
		// Start on home page
		await page.goto('/');

		// Click register link
		await page.click('a[href="/register"]');
		await expect(page).toHaveURL(/\/register/);

		// Click login link from register
		await page.click('a[href="/login"]');
		await expect(page).toHaveURL(/\/login/);

		// Click forgot password link
		await page.click('a[href="/forgot-password"]');
		await expect(page).toHaveURL(/\/forgot-password/);
	});
});
