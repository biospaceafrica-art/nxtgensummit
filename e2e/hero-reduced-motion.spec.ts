import { test, expect } from "@playwright/test";

/**
 * Hero background video must honor `prefers-reduced-motion: reduce`.
 * When reduced motion is requested, the YouTube iframe must NEVER mount —
 * the static poster image remains in place instead.
 */

test.describe.configure({ retries: 1 });

test("reduced-motion users never get the autoplaying YouTube iframe", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();

  await page.goto("/");

  // The hero mounts and delays video loading by ~600ms; wait well past that.
  await page.waitForTimeout(1_500);

  // No iframe should be present anywhere in the hero.
  await expect(page.getByTestId("hero-video-iframe")).toHaveCount(0);
  await expect(page.getByTestId("hero-video-wrapper")).toHaveCount(0);

  // The poster image is still visible (background-image on a div).
  const poster = page.locator("div[style*='ytimg.com']").first();
  await expect(poster).toBeVisible();

  await context.close();
});

test("default (no reduced motion) users do get the iframe video after the warm-up delay", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "no-preference" });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page.getByTestId("hero-video-iframe")).toBeVisible({ timeout: 5_000 });
  await expect(page.getByTestId("hero-video-iframe")).toHaveAttribute("src", /youtube-nocookie\.com/);

  await context.close();
});

test("data-saver users keep the poster instead of the iframe", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "no-preference" });
  const page = await context.newPage();

  // Patch navigator.connection.saveData BEFORE any app code runs.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      get: () => ({ saveData: true }),
    });
  });

  await page.goto("/");
  await page.waitForTimeout(1_500);

  await expect(page.getByTestId("hero-video-iframe")).toHaveCount(0);
  await expect(page.getByTestId("hero-poster")).toBeVisible();

  await context.close();
});

test("when the iframe never reports loaded, the poster remains visible underneath", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "no-preference" });
  const page = await context.newPage();

  // Block the YouTube iframe from ever loading. The component keeps the iframe
  // at opacity 0 until onLoad fires, so the poster underneath stays visible.
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());

  await page.goto("/");
  await expect(page.getByTestId("hero-poster")).toBeVisible();
  await page.waitForTimeout(1_500);

  // Poster is still the visible background; iframe (if present) is transparent.
  await expect(page.getByTestId("hero-poster")).toBeVisible();
  const iframeCount = await page.getByTestId("hero-video-iframe").count();
  if (iframeCount > 0) {
    await expect(page.getByTestId("hero-video-iframe")).toHaveAttribute(
      "data-loaded",
      "false",
    );
    const opacity = await page.getByTestId("hero-video-iframe").evaluate(
      (el) => getComputedStyle(el).opacity,
    );
    expect(Number(opacity)).toBeLessThan(0.05);
  }

  await context.close();
});


