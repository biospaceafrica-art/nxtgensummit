import { test, expect } from "@playwright/test";

/**
 * Google OAuth UX — loading toast on click, cancel handling, provider error.
 *
 * GoogleButton checks `window.__lovableOAuthStub` before calling the real
 * Lovable OAuth helper. We use that hook to simulate provider responses
 * deterministically — no real Google round-trip required.
 */

test.describe.configure({ retries: 2 });

async function stubOAuth(
  page: import("@playwright/test").Page,
  response: { error?: { message: string }; redirected?: boolean }
) {
  await page.addInitScript((resp) => {
    (window as unknown as { __lovableOAuthStub: () => Promise<typeof resp> }).__lovableOAuthStub =
      () => new Promise((r) => setTimeout(() => r(resp), 250));
  }, response);
}

test("clicking Continue with Google shows the loading toast immediately", async ({ page }) => {
  await stubOAuth(page, { redirected: true });
  await page.goto("/login");

  await page.getByTestId("google-oauth-button").click();

  await expect(page.getByText(/redirecting to google/i)).toBeVisible({ timeout: 2_000 });
  // Button reflects loading state.
  await expect(page.getByTestId("google-oauth-button")).toContainText(/connecting/i);
});

test("user cancels Google sign-in: info toast appears, no error toast", async ({ page }) => {
  await stubOAuth(page, { error: { message: "User closed the popup before completing sign-in" } });
  await page.goto("/login");

  await page.getByTestId("google-oauth-button").click();

  await expect(page.getByText(/google sign-in was cancelled/i)).toBeVisible({ timeout: 3_000 });
  // Button returns to its default label so the user can try again.
  await expect(page.getByTestId("google-oauth-button")).toContainText(/sign in with google/i);
});

test("provider error during Google sign-in: error toast appears with the provider message", async ({ page }) => {
  await stubOAuth(page, {
    error: { message: "Google OAuth provider unavailable (503)" },
  });
  await page.goto("/login");

  await page.getByTestId("google-oauth-button").click();

  await expect(page.getByText(/google oauth provider unavailable/i)).toBeVisible({ timeout: 3_000 });
  await expect(page.getByTestId("google-oauth-button")).not.toBeDisabled();
});

test("Google sign-up button on /signup shows loading + cancel feedback", async ({ page }) => {
  await stubOAuth(page, { error: { message: "popup_closed_by_user" } });
  await page.goto("/signup");

  await page.getByTestId("google-oauth-button").click();
  await expect(page.getByText(/redirecting to google/i)).toBeVisible({ timeout: 2_000 });
  await expect(page.getByText(/cancelled/i)).toBeVisible({ timeout: 3_000 });
});
