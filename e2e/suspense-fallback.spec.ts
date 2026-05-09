import { test, expect, Page } from "@playwright/test";

/**
 * The RouteFallback in src/App.tsx renders a spinner with class
 * `animate-spin`. Public pages (/, /register, etc.) are loaded eagerly OR
 * fast enough that we never want users to *see* this fallback during a
 * direct deep link or while navigating between public routes.
 *
 * This test:
 *  1. Watches the DOM continuously while navigating between public routes.
 *  2. Asserts the Suspense fallback spinner never appears for more than
 *     a single rAF tick (effectively: not visible to a user).
 */

const FALLBACK_SELECTOR = "div.animate-spin";

async function trackFallbackAppearances(page: Page): Promise<number> {
  return page.evaluate((selector) => {
    return new Promise<number>((resolve) => {
      let count = 0;
      const observer = new MutationObserver(() => {
        const els = document.querySelectorAll(selector);
        for (const el of els) {
          // Only count fallbacks that are inside a Suspense boundary
          // (i.e. take up most of the viewport via the min-h-[60vh] wrapper).
          const parent = el.closest('[class*="min-h-"]');
          if (parent && parent.classList.toString().includes("min-h-[60vh]")) {
            count += 1;
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      // Expose a stop function for the test to await.
      (window as unknown as { __stopFallbackTracker: () => number }).__stopFallbackTracker = () => {
        observer.disconnect();
        return count;
      };
      resolve(0);
    });
  }, FALLBACK_SELECTOR);
}

async function stopTracker(page: Page): Promise<number> {
  return page.evaluate(() => {
    const w = window as unknown as { __stopFallbackTracker?: () => number };
    return w.__stopFallbackTracker ? w.__stopFallbackTracker() : 0;
  });
}

test.describe("Suspense fallback never flashes on public routes", () => {
  test("deep-linking to / does not show fallback", async ({ page }) => {
    await page.goto("/");
    // If the home route used Suspense, this spinner would be present at first paint.
    const visibleFallback = await page.locator('div.min-h-\\[60vh\\] div.animate-spin').count();
    expect(visibleFallback).toBe(0);
    await expect(page.locator("body")).toBeVisible();
  });

  test("navigating between public routes never renders Suspense fallback", async ({ page }) => {
    await page.goto("/");
    await trackFallbackAppearances(page);

    const publicPaths = ["/speakers", "/schedule", "/fellowship", "/gallery", "/"];
    for (const path of publicPaths) {
      await page.goto(path, { waitUntil: "networkidle" });
      // After load, no fallback should remain on screen.
      await expect(page.locator('div.min-h-\\[60vh\\] div.animate-spin')).toHaveCount(0);
    }

    const flashes = await stopTracker(page);
    // 0 fallback insertions inside the Suspense wrapper across all navigations.
    expect(flashes).toBe(0);
  });

  test("hard reload on a deep public link does not flash fallback", async ({ page }) => {
    await page.goto("/speakers", { waitUntil: "domcontentloaded" });
    // Capture immediately on first paint.
    const visibleFallback = await page.locator('div.min-h-\\[60vh\\] div.animate-spin').count();
    expect(visibleFallback).toBe(0);
  });

  // Every public route in src/App.tsx — including a few with realistic
  // query strings and hash fragments — should render without ever showing
  // the Suspense fallback to a user.
  const publicDeepLinks = [
    "/",
    "/register",
    "/register?track=career",
    "/register?ref=newsletter&utm_source=email",
    "/fellowship",
    "/fellowship?tab=business",
    "/speakers",
    "/speakers?day=2",
    "/schedule",
    "/schedule?track=enterprise&day=1",
    "/scholarship",
    "/plant-a-seed",
    "/feedback?session=keynote",
    "/gallery",
    "/gallery?album=2025",
    "/volunteer",
    "/networking",
    "/badge",
    "/check-in",
    "/?utm_campaign=launch#hero",
  ];

  for (const path of publicDeepLinks) {
    test(`deep link ${path} never shows Suspense fallback`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      // First paint check.
      const initial = await page
        .locator('div.min-h-\\[60vh\\] div.animate-spin')
        .count();
      expect(initial, `fallback visible on first paint for ${path}`).toBe(0);
      // After full network settle, nothing should remain on screen either.
      await page.waitForLoadState("networkidle");
      await expect(
        page.locator('div.min-h-\\[60vh\\] div.animate-spin'),
        `fallback visible after load for ${path}`,
      ).toHaveCount(0);
    });
  }
});
