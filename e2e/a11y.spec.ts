import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility scan with axe-core. Fails on any "critical" or "serious"
 * violations on key public routes.
 */
test.describe.configure({ retries: 1 });

const routes = ["/", "/speakers", "/schedule", "/register", "/admin/login"];

for (const path of routes) {
  test(`a11y: no critical/serious violations on ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    if (blocking.length) {
      console.log(JSON.stringify(blocking, null, 2));
    }
    expect(blocking, `Found ${blocking.length} blocking a11y issues on ${path}`).toEqual([]);
  });
}
