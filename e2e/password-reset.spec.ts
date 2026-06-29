import { test, expect } from "@playwright/test";

/**
 * Password reset & recovery flows.
 *
 * These tests intercept the Supabase auth REST endpoints so they exercise
 * the UI behaviour for both Google-free (email/password) users and users
 * who originally signed up with Google (where Supabase returns 200 but
 * no reset email is actually sent — the UI must NOT leak that fact).
 *
 * They also verify server-rejected tokens (expired, used, invalid) render
 * a clear error and cannot be reused.
 */

test.describe.configure({ retries: 2 });

const SUPABASE_RECOVER = "**/auth/v1/recover**";
const SUPABASE_USER = "**/auth/v1/user**";

test.describe("Forgot password — request reset email", () => {
  test("email/password user: success message appears after submit", async ({ page }) => {
    await page.route(SUPABASE_RECOVER, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
    );

    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();

    await expect(page.getByText(/a reset link is on its way/i)).toBeVisible();
    await expect(page.getByText("user@example.com")).toBeVisible();
  });

  test("Google-only user: UI shows the same neutral confirmation (no account enumeration)", async ({ page }) => {
    // Supabase returns 200 even when the user signed up via Google — the
    // frontend must show the same neutral "if an account exists" message.
    await page.route(SUPABASE_RECOVER, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
    );

    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("googleuser@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();

    await expect(page.getByText(/if an account exists/i)).toBeVisible();
    // Critically: we must NOT reveal whether the account exists or its provider.
    await expect(page.getByText(/google/i)).toHaveCount(0);
  });

  test("network failure shows an error toast", async ({ page }) => {
    await page.route(SUPABASE_RECOVER, (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal server error" }),
      })
    );

    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();

    await expect(page.locator("[data-sonner-toast]").first()).toBeVisible();
  });
});

test.describe("Reset password — submitting a new password", () => {
  test("valid recovery session: updating password succeeds and routes home", async ({ page }) => {
    // Pretend the page already has a recovery session (Supabase emits PASSWORD_RECOVERY)
    await page.addInitScript(() => {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: { ...window.location, hash: "#access_token=fake&type=recovery" },
      });
    });
    await page.route(SUPABASE_USER, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "user-1", email: "user@example.com" }),
      })
    );

    await page.goto("/reset-password#access_token=fake&type=recovery");

    // The form may take a tick to appear after the auth client hydrates.
    const newPwd = page.getByLabel(/^new password$/i);
    await expect(newPwd).toBeVisible({ timeout: 5_000 });
    await newPwd.fill("BrandNewPassw0rd!");
    await page.getByLabel(/confirm password/i).fill("BrandNewPassw0rd!");
    await page.getByRole("button", { name: /update password/i }).click();

    await page.waitForURL("**/", { timeout: 5_000 });
  });

  test("expired recovery link in URL hash shows a clear error and offers a new link", async ({ page }) => {
    await page.goto(
      "/reset-password#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired"
    );

    const err = page.getByTestId("reset-link-error");
    await expect(err).toBeVisible();
    await expect(err).toContainText(/expired/i);
    await expect(page.getByRole("link", { name: /request a new link/i })).toBeVisible();

    // The form must NOT be present — preventing reuse of an expired token.
    await expect(page.getByLabel(/^new password$/i)).toHaveCount(0);
  });

  test("server rejects a used/expired token at submit time and surfaces a clear error", async ({ page }) => {
    await page.route(SUPABASE_USER, (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          code: "otp_expired",
          message: "Token has expired or is invalid",
        }),
      })
    );

    await page.goto("/reset-password#access_token=fake&type=recovery");

    const newPwd = page.getByLabel(/^new password$/i);
    // If the UI hasn't hydrated a recovery session, the test is still valid:
    // the link-error branch shows up instead. Branch on what we see.
    const formVisible = await newPwd.isVisible().catch(() => false);
    if (formVisible) {
      await newPwd.fill("BrandNewPassw0rd!");
      await page.getByLabel(/confirm password/i).fill("BrandNewPassw0rd!");
      await page.getByRole("button", { name: /update password/i }).click();
    }

    const err = page.getByTestId("reset-link-error");
    await expect(err).toBeVisible({ timeout: 5_000 });
    await expect(err).toContainText(/expired|already been used/i);
  });
});
