import { test, expect } from "@playwright/test";

/**
 * Verifies CSV export reflects the CURRENT active filters, not the
 * filter state at the time the page first loaded.
 *
 * Assumes an authenticated selection-team session is already established
 * by the shared Playwright setup (see e2e/selection-csv-export.spec.ts for
 * the stub pattern used there).
 */

test.describe("SelectionDashboard CSV export re-filters on demand", () => {
  test("changing status filter mid-session updates the exported rows", async ({ page }) => {
    // Stub the applicants endpoint with a mixed dataset.
    await page.route("**/rest/v1/scholarship_applicants*", async (route) => {
      const body = [
        { id: "1", full_name: "Alice A", email: "a@x.com", phone: null, status: "pending", notes: null, source: "csv", reviewed_by: null, reviewed_at: null, created_at: "2026-01-01" },
        { id: "2", full_name: "Bob B",   email: "b@x.com", phone: null, status: "shortlisted", notes: null, source: "csv", reviewed_by: null, reviewed_at: null, created_at: "2026-01-01" },
        { id: "3", full_name: "Cara C",  email: "c@x.com", phone: null, status: "accepted", notes: null, source: "csv", reviewed_by: null, reviewed_at: null, created_at: "2026-01-01" },
      ];
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
    });

    await page.goto("/selection");

    // Export #1: default filter (all) — expect 3 rows.
    const [dl1] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /export csv/i }).click(),
    ]);
    const csv1 = await (await dl1.createReadStream())!.setEncoding("utf-8").toArray();
    const text1 = csv1.join("");
    expect(text1).toContain("Alice A");
    expect(text1).toContain("Bob B");
    expect(text1).toContain("Cara C");

    // Change filter to "accepted" mid-session.
    await page.getByLabel(/status/i).first().click();
    await page.getByRole("option", { name: /accepted/i }).click();

    // Export #2: expect only Cara.
    const [dl2] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /export csv/i }).click(),
    ]);
    const csv2 = await (await dl2.createReadStream())!.setEncoding("utf-8").toArray();
    const text2 = csv2.join("");
    expect(text2).toContain("Cara C");
    expect(text2).not.toContain("Alice A");
    expect(text2).not.toContain("Bob B");
  });
});
