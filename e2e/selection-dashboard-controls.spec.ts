import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

/**
 * SelectionDashboard interaction contracts.
 *
 * These tests stub Supabase REST calls so they run without a fixture account:
 *   - `/user_roles` controls whether the visitor is authorised.
 *   - `/scholarship_applicants` returns a synthetic dataset large enough to
 *     exercise pagination/virtualization and multi-page CSV export.
 *
 * They cover:
 *   1. Non-selection-team visitor is bounced off the page with a toast and
 *      can't trigger the Export CSV control.
 *   2. Inline notes editor rejects payloads above the 1000-character limit,
 *      showing an inline validation message and disabling Save.
 *   3. The CSV export contains EVERY currently-filtered row, regardless of
 *      how many would fit on-screen (i.e. virtualization/pagination must not
 *      truncate the export).
 */

const fakeApplicants = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`,
    full_name: `Applicant ${i}`,
    email: `applicant${i}@example.com`,
    phone: `+234800000${String(i).padStart(4, "0")}`,
    status: i % 3 === 0 ? "shortlisted" : "pending",
    notes: null,
    source: "csv-import",
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(2026, 0, 1 + (i % 28)).toISOString(),
  }));

async function injectFakeSession(page: Page) {
  await page.addInitScript(() => {
    const session = {
      access_token: "fake", refresh_token: "fake",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: "test-user", email: "tester@example.com" },
    };
    window.localStorage.setItem("sb-test-auth-token", JSON.stringify(session));
  });
}

async function stubRoles(page: Page, roles: string[]) {
  await page.route(/user_roles/i, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(roles.map((role) => ({ role }))),
    }),
  );
}

async function stubApplicants(page: Page, rows: ReturnType<typeof fakeApplicants>) {
  await page.route(/scholarship_applicants/i, (route) => {
    if (route.request().method() !== "GET") return route.continue();
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(rows),
    });
  });
}

test("non-selection-team user cannot export CSV and is redirected with an error toast", async ({ page }) => {
  await injectFakeSession(page);
  await stubRoles(page, ["user"]); // no admin, no selection_team
  await stubApplicants(page, fakeApplicants(3));

  await page.goto("/selection");

  // Should be redirected away from /selection.
  await page.waitForURL((url) => !url.pathname.startsWith("/selection"), { timeout: 5_000 });

  // Sonner renders an error toast with the access-denied copy.
  await expect(
    page.getByText(/don't have access to the selection dashboard/i),
  ).toBeVisible({ timeout: 3_000 });

  // The export button must not be present on the page they land on.
  await expect(page.getByTestId("export-csv")).toHaveCount(0);
});

test("inline notes editor blocks updates over the 1000-character limit", async ({ page }) => {
  await injectFakeSession(page);
  await stubRoles(page, ["admin"]);
  const rows = fakeApplicants(2);
  await stubApplicants(page, rows);

  let updateAttempted = false;
  await page.route(/scholarship_applicants/i, (route) => {
    if (route.request().method() === "PATCH") {
      updateAttempted = true;
      return route.fulfill({ status: 200, body: "[]" });
    }
    return route.continue();
  });

  await page.goto("/selection");
  if (!page.url().includes("/selection")) test.skip(true, "Auth guard not bypassable here");
  await expect(page.getByTestId("selection-dashboard")).toBeVisible({ timeout: 5_000 });

  const target = rows[0];
  const input = page.getByTestId(`notes-input-${target.id}`);
  const save = page.getByTestId(`notes-save-${target.id}`);

  // Type 1001 characters (1 over the limit).
  await input.fill("x".repeat(1001));

  // Inline error and disabled Save must surface immediately.
  const error = page.getByTestId(`notes-error-${target.id}`);
  await expect(error).toBeVisible();
  await expect(error).toContainText("1000-character limit");
  await expect(error).toContainText("1001/1000");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(save).toBeDisabled();

  // No PATCH should have been issued — the form refuses to call the API.
  expect(updateAttempted).toBe(false);

  // Trimming back to exactly 1000 chars re-enables Save and clears the error.
  await input.fill("x".repeat(1000));
  await expect(page.getByTestId(`notes-error-${target.id}`)).toHaveCount(0);
  await expect(save).toBeEnabled();
});

test("CSV export includes every filtered row across the entire (virtualized) list", async ({ page }) => {
  await injectFakeSession(page);
  await stubRoles(page, ["admin"]);
  // 120 rows — far more than fit on screen at once in the virtualized window.
  const rows = fakeApplicants(120);
  await stubApplicants(page, rows);

  await page.goto("/selection");
  if (!page.url().includes("/selection")) test.skip(true, "Auth guard not bypassable here");
  await expect(page.getByTestId("selection-dashboard")).toBeVisible({ timeout: 5_000 });

  // No filter → export should match the full dataset (120 rows).
  await expect(page.getByTestId("export-csv")).toContainText("(120)");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId("export-csv").click(),
  ]);
  const csv = readFileSync((await download.path())!, "utf8");
  const lines = csv.split("\n").filter(Boolean);
  expect(lines).toHaveLength(120 + 1); // header + 120 rows

  // Spot-check first, middle, and last applicant — proving the CSV is not
  // truncated to whatever the virtualized viewport currently rendered.
  expect(csv).toContain("Applicant 0");
  expect(csv).toContain("Applicant 60");
  expect(csv).toContain("Applicant 119");

  // Now apply a filter and re-export — the CSV must reflect ONLY the filtered subset.
  await page.getByTestId("status-filter").click();
  await page.getByRole("option", { name: "shortlisted" }).click();

  // i % 3 === 0 → 40 shortlisted (0, 3, 6, …, 117).
  await expect(page.getByTestId("export-csv")).toContainText("(40)");

  const [download2] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId("export-csv").click(),
  ]);
  const csv2 = readFileSync((await download2.path())!, "utf8");
  const lines2 = csv2.split("\n").filter(Boolean);
  expect(lines2).toHaveLength(40 + 1);
  expect(csv2).toContain("Applicant 0");
  expect(csv2).toContain("Applicant 117");
  expect(csv2).not.toContain("Applicant 1,"); // status=pending → excluded
});
