import { expect, test } from "@playwright/test";

test.describe("Authentication Flows", () => {
  const testUser = {
    name: "Test User",
    email: `test-${Date.now()}@example.com`,
    password: "Password123!",
  };

  test.describe("Registration Flow", () => {
    test("should register a new user successfully", async ({ page }) => {
      await page.goto("/register");

      // Fill registration form
      await page.fill('input[name="name"]', testUser.name);
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="passwordConfirm"]', testUser.password);

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to home page after successful registration
      await expect(page).toHaveURL("/");

      // Should see welcome message
      await expect(page.locator("text=/welcome/i")).toBeVisible();
    });

    test("should show error for mismatched passwords", async ({ page }) => {
      await page.goto("/register");

      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[name="email"]', "test@example.com");
      await page.fill('input[name="password"]', "Password123!");
      await page.fill('input[name="passwordConfirm"]', "DifferentPassword123!");

      await page.click('button[type="submit"]');

      // Should show validation error
      await expect(
        page.locator("text=/passwords do not match/i"),
      ).toBeVisible();
    });

    test("should show error for invalid email", async ({ page }) => {
      await page.goto("/register");

      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[name="email"]', "invalid-email");
      await page.fill('input[name="password"]', "Password123!");
      await page.fill('input[name="passwordConfirm"]', "Password123!");

      await page.click('button[type="submit"]');

      await expect(page.locator("text=/invalid email/i")).toBeVisible();
    });

    test("should navigate to login page from link", async ({ page }) => {
      await page.goto("/register");

      await page.click('a[href="/login"]');

      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Login Flow", () => {
    test("should login successfully with valid credentials", async ({
      page,
      context,
    }) => {
      // First register a user
      await page.goto("/register");
      const uniqueEmail = `login-test-${Date.now()}@example.com`;

      await page.fill('input[name="name"]', "Login Test");
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="passwordConfirm"]', testUser.password);
      await page.click('button[type="submit"]');

      // Logout
      await page.click('button[type="submit"]:has-text("Logout")');

      // Now login
      await page.goto("/login");
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', testUser.password);
      await page.click('button[type="submit"]');

      // Should redirect to home
      await expect(page).toHaveURL("/");
      await expect(page.locator("text=/logged in/i")).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/login");

      await page.fill('input[name="email"]', "nonexistent@example.com");
      await page.fill('input[name="password"]', "WrongPassword123!");

      await page.click('button[type="submit"]');

      await expect(
        page.locator("text=/invalid email or password/i"),
      ).toBeVisible();
    });

    test("should navigate to register page from link", async ({ page }) => {
      await page.goto("/login");

      await page.click('a[href="/register"]');

      await expect(page).toHaveURL("/register");
    });

    test("should navigate to forgot password page from link", async ({
      page,
    }) => {
      await page.goto("/login");

      await page.click('a[href="/forgot-password"]');

      await expect(page).toHaveURL("/forgot-password");
    });
  });

  test.describe("Forgot Password Flow", () => {
    test("should display success message after submitting email", async ({
      page,
    }) => {
      await page.goto("/forgot-password");

      await page.fill('input[name="email"]', "test@example.com");
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(
        page.locator("text=/password reset link has been sent/i"),
      ).toBeVisible();
    });

    test("should show error for invalid email format", async ({ page }) => {
      await page.goto("/forgot-password");

      await page.fill('input[name="email"]', "invalid-email");
      await page.click('button[type="submit"]');

      await expect(page.locator("text=/invalid email/i")).toBeVisible();
    });

    test("should navigate to login page from link", async ({ page }) => {
      await page.goto("/forgot-password");

      await page.click('a[href="/login"]');

      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Logout Flow", () => {
    test("should logout user and redirect to login", async ({ page }) => {
      // First login
      await page.goto("/register");
      const uniqueEmail = `logout-test-${Date.now()}@example.com`;

      await page.fill('input[name="name"]', "Logout Test");
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="passwordConfirm"]', testUser.password);
      await page.click('button[type="submit"]');

      // Should be logged in
      await expect(page.locator("text=/logged in/i")).toBeVisible();

      // Logout
      await page.click('button[type="submit"]:has-text("Logout")');

      // Should redirect to login page
      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Account Management Flow", () => {
    test("should access account page when logged in", async ({ page }) => {
      // Register and login
      await page.goto("/register");
      const uniqueEmail = `account-test-${Date.now()}@example.com`;

      await page.fill('input[name="name"]', "Account Test");
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="passwordConfirm"]', testUser.password);
      await page.click('button[type="submit"]');

      // Wait for redirect to home after registration
      await page.waitForURL("/");

      // Navigate to account page
      await page.goto("/account");

      // Wait for account page to load
      await page.waitForLoadState("networkidle");

      // Should see account settings
      await expect(page.locator("text=/account settings/i")).toBeVisible();
      await expect(page.locator('input[name="name"]')).toHaveValue(
        "Account Test",
      );
      await expect(page.locator('input[name="email"]')).toHaveValue(
        uniqueEmail,
      );
    });

    test("should redirect to login when not authenticated", async ({
      page,
    }) => {
      await page.goto("/account");

      // Should redirect to login
      await expect(page).toHaveURL("/login");
    });

    test("should update profile information", async ({ page }) => {
      // Register and login
      await page.goto("/register");
      const uniqueEmail = `profile-test-${Date.now()}@example.com`;

      await page.fill('input[name="name"]', "Profile Test");
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="passwordConfirm"]', testUser.password);
      await page.click('button[type="submit"]');

      // Go to account page
      await page.goto("/account");

      // Wait for account page to load
      await page.waitForLoadState("networkidle");

      // Update profile
      await page.fill('input[name="name"]', "Updated Name");
      await page.fill('input[name="title"]', "Software Engineer");
      await page.fill('textarea[name="bio"]', "Test bio");
      await page.fill('input[name="website"]', "https://example.com");

      await page.click('button[type="submit"]:has-text("Save Changes")');

      // Should show success message or reload with updated data
      await page.waitForTimeout(1000);
      await expect(page.locator('input[name="name"]')).toHaveValue(
        "Updated Name",
      );
    });

    test("should show 2FA section", async ({ page }) => {
      // Register and login
      await page.goto("/register");
      const uniqueEmail = `2fa-test-${Date.now()}@example.com`;

      await page.fill('input[name="name"]', "2FA Test");
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="passwordConfirm"]', testUser.password);
      await page.click('button[type="submit"]');

      // Go to account page
      await page.goto("/account");

      // Wait for account page to load
      await page.waitForLoadState("networkidle");

      // Should see 2FA section
      await expect(
        page.locator("text=/two-factor authentication/i"),
      ).toBeVisible();
      await expect(page.locator("text=/2fa is disabled/i")).toBeVisible();
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect to login for protected routes when not authenticated", async ({
      page,
    }) => {
      await page.goto("/account");
      await expect(page).toHaveURL("/login");
    });

    test("should allow access to public routes when not authenticated", async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page).toHaveURL("/");

      await page.goto("/login");
      await expect(page).toHaveURL("/login");

      await page.goto("/register");
      await expect(page).toHaveURL("/register");

      await page.goto("/forgot-password");
      await expect(page).toHaveURL("/forgot-password");
    });
  });
});
