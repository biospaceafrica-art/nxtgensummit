import { test, expect, Page } from "@playwright/test";

/**
 * Exact toast text + loading-state transitions for the GoogleButton
 * across both /login and /signup, for both cancel and provider-error.
 *
 * GoogleButton checks `window.__lovableOAuthStub` before calling the
 * real OAuth helper, so we can deterministically simulate provider
 * responses with a small delay to observe the loading state.
 */

test.describe.configure({ retries: 2 });

const LOADING_TEXT = /redirecting to google/i;
const CANCEL_TEXT = /google sign-in was cancelled/i;
const PROVIDER_ERROR_TEXT = /google oauth provider unavailable/i;

async function stubOAuth(
  page: Page,
  response: { error?: { message: string }; redirected?: boolean },
  delayMs = 400
) {
  await page.addInitScript(
    ({ resp, delay }) => {
      (window as unknown as { __lovableOAuthStub: () => Promise<typeof resp> }).__lovableOAuthStub =
        () => new Promise((r) => setTimeout(() => r(resp), delay));
    },
    { resp: response, delay: delayMs }
  );
}

async function verifyLoadingTransition(page: Page, route: "/login" | "/signup") {
  await page.goto(route);
  const btn = page.getByTestId("google-oauth-button");

  // 1. Initial label depends on the route.
  const expectedLabel = route === "/login" ? /sign in with google/i : /sign up with google/i;
  await expect(btn).toContainText(expectedLabel);
  await expect(btn).toBeEnabled();

  await btn.click();

  // 2. Loading toast appears with the EXACT copy.
  await expect(page.getByText(LOADING_TEXT)).toBeVisible({ timeout: 2_000 });
  // 3. Button switches to "Connecting..." and is disabled.
  await expect(btn).toContainText(/connecting\.\.\./i);
  await expect(btn).toBeDisabled();
}

for (const route of ["/login", "/signup"] as const) {
  test(`(${route}) Google cancel: loading -> info toast, button re-enabled, no error toast`, async ({ page }) => {
    await stubOAuth(page, { error: { message: "User closed the popup before completing sign-in" } });
    await verifyLoadingTransition(page, route);

    // The loading toast is dismissed and replaced with the cancel info toast.
    await expect(page.getByText(CANCEL_TEXT)).toBeVisible({ timeout: 3_000 });

    // Loading toast must NOT remain on screen.
    await expect(page.getByText(LOADING_TEXT)).toHaveCount(0);

    // The error-styled toast wording must NOT appear.
    await expect(page.getByText(/sign-in failed/i)).toHaveCount(0);

    // Button returns to idle so the user can retry.
    const btn = page.getByTestId("google-oauth-button");
    const expectedLabel = route === "/login" ? /sign in with google/i : /sign up with google/i;
    await expect(btn).toContainText(expectedLabel);
    await expect(btn).toBeEnabled();
  });

  test(`(${route}) Google provider error: loading -> error toast with provider message, button re-enabled`, async ({ page }) => {
    await stubOAuth(page, { error: { message: "Google OAuth provider unavailable (503)" } });
    await verifyLoadingTransition(page, route);

    await expect(page.getByText(PROVIDER_ERROR_TEXT)).toBeVisible({ timeout: 3_000 });
    await expect(page.getByText(LOADING_TEXT)).toHaveCount(0);

    // The cancel wording must NOT appear for a generic provider error.
    await expect(page.getByText(CANCEL_TEXT)).toHaveCount(0);

    const btn = page.getByTestId("google-oauth-button");
    await expect(btn).toBeEnabled();
  });
}
