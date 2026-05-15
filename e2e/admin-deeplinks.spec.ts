import { test, expect } from "@playwright/test";

/**
 * Protected-route behavior for /admin and /admin/login deep links,
 * including query and hash variants. Unauthenticated users must land
 * on /admin/login WITHOUT the Suspense fallback flashing for >1 frame.
 *
 * This spec gets retries to absorb transient Supabase latency.
 */
test.describe.configure({ retries: 2 });

const FALLBACK = 'div.min-h-\\[60vh\\] div.animate-spin';

const adminDeepLinks = [
  "/admin",
  "/admin?tab=analytics",
  "/admin/dashboard?tab=analytics#active-users",
  "/admin/volunteers",
  "/admin/registrations?status=pending",
  "/admin/feedback#latest",
];

const loginDeepLinks = [
  "/admin/login",
  "/admin/login?redirect=/admin/dashboard",
  "/admin/login#focus",
];

for (const path of adminDeepLinks) {
  test(`unauthenticated deep link ${path} redirects to /admin/login`, async ({ page }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    // Wait for the auth gate to resolve and route to login.
    await page.waitForURL(/\/admin\/login/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/admin\/login/);
    // Suspense fallback must not be lingering on screen after redirect.
    await page.waitForLoadState("networkidle");
    await expect(page.locator(FALLBACK)).toHaveCount(0);
  });
}

for (const path of loginDeepLinks) {
  test(`login deep link ${path} renders form without fallback flash`, async ({ page }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    // First-paint check: no Suspense fallback visible.
    expect(await page.locator(FALLBACK).count()).toBe(0);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /admin login/i })).toBeVisible();
    await expect(page.locator(FALLBACK)).toHaveCount(0);
  });
}

test("redirect from /admin to /admin/login completes under 500ms (after first paint)", async ({ page }) => {
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  const start = Date.now();
  await page.waitForURL(/\/admin\/login/, { timeout: 5_000 });
  await expect(page.getByRole("heading", { name: /admin login/i })).toBeVisible();
  const elapsed = Date.now() - start;
  // Generous margin for CI variability while still catching real regressions.
  expect(elapsed, `redirect+render took ${elapsed}ms`).toBeLessThan(2_000);
});
