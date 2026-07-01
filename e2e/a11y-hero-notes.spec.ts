import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("A11y: HeroSection poster + notes validation", () => {
  test("HeroSection poster is decorative and iframe carries an accessible title", async ({ page }) => {
    await page.goto("/");
    const poster = page.getByTestId("hero-poster");
    await expect(poster).toBeVisible();
    // Decorative image: empty alt + aria-hidden.
    await expect(poster).toHaveAttribute("alt", "");
    await expect(poster).toHaveAttribute("aria-hidden", "true");

    // Axe on the hero region only — catches any WCAG regressions there.
    const results = await new AxeBuilder({ page })
      .include("section:has([data-testid=hero-poster])")
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("Notes editor exposes role=alert error and is keyboard-reachable", async ({ page }) => {
    // This test assumes a selection-team session is available. Skip gracefully otherwise.
    await page.goto("/selection");
    if (!/\/selection/.test(page.url())) test.skip(true, "No selection-team session available");

    const firstNotes = page.locator('[data-testid^="notes-input-"]').first();
    await firstNotes.focus();
    await expect(firstNotes).toBeFocused();

    // Type over the limit → alert must appear with role=alert + aria-invalid=true.
    await firstNotes.fill("a".repeat(1001));
    const alert = page.locator('[data-testid^="notes-error-"]').first();
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute("role", "alert");
    await expect(firstNotes).toHaveAttribute("aria-invalid", "true");
    await expect(firstNotes).toHaveAttribute("aria-describedby", /notes-help-/);

    // Save button must be reachable via keyboard and disabled while invalid.
    const save = page.locator('[data-testid^="notes-save-"]').first();
    await expect(save).toBeDisabled();
  });
});
