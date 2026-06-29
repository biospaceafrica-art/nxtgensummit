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

test("when autoplay is blocked, the poster remains visible as a fallback", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "no-preference" });
  const page = await context.newPage();

  // Simulate autoplay-blocked / iframe-failed by triggering the onError handler
  // as soon as the iframe mounts. The component flips into the "videoFailed"
  // branch and the poster must remain the primary background.
  await page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      const f = document.querySelector<HTMLIFrameElement>(
        "iframe[data-testid='hero-video-iframe']",
      );
      if (f) {
        observer.disconnect();
        f.dispatchEvent(new Event("error"));
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });

  await page.goto("/");

  // Poster is visible from first paint and must STAY visible after error.
  await expect(page.getByTestId("hero-poster")).toBeVisible();
  await page.waitForTimeout(1_200);
  await expect(page.getByTestId("hero-video-iframe")).toHaveCount(0);
  await expect(page.getByTestId("hero-poster")).toBeVisible();

  await context.close();
});

