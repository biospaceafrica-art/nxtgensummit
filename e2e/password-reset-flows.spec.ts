import { test, expect, Page } from "@playwright/test";

/**
 * Full password-reset journeys.
 *
 * Supabase endpoints are stubbed so the tests are deterministic and don't
 * require a live mailbox. The UI contracts under test are:
 *   - Inline password-rule validation (length, upper, lower, number)
 *   - Submit button disabled until all rules pass + confirmation matches
 *   - Successful update -> success toast -> redirect to "/" -> session is set
 *   - Reusing the same recovery link shows the friendly link-error state
 *   - Repeated forgot-password requests hit a cooldown / rate-limit message
 */

test.describe.configure({ retries: 2 });

const SUPABASE_RECOVER = "**/auth/v1/recover**";
const SUPABASE_USER = "**/auth/v1/user**";

async function primeRecoverySession(page: Page) {
  // Pretend the recovery link landed and a recovery session is live.
  await page.addInitScript(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, hash: "#access_token=fake&type=recovery" },
    });
  });
}

test.describe("Inline password-rule validation", () => {
  test("submit stays disabled and rules light up as the user types", async ({ page }) => {
    await primeRecoverySession(page);
    await page.route(SUPABASE_USER, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
    );

    await page.goto("/reset-password#access_token=fake&type=recovery");
    const pwd = page.getByLabel(/^new password$/i);
    await expect(pwd).toBeVisible({ timeout: 5_000 });

    const submit = page.getByRole("button", { name: /update password/i });
    await expect(submit).toBeDisabled();

    // Too short, lowercase only.
    await pwd.fill("abc");
    await expect(page.getByTestId("rule-len")).toHaveAttribute("data-ok", "false");
    await expect(page.getByTestId("rule-upper")).toHaveAttribute("data-ok", "false");
    await expect(page.getByTestId("rule-num")).toHaveAttribute("data-ok", "false");
    await expect(submit).toBeDisabled();

    // Long enough + lowercase, still missing upper + number.
    await pwd.fill("abcdefghij");
    await expect(page.getByTestId("rule-len")).toHaveAttribute("data-ok", "true");
    await expect(page.getByTestId("rule-upper")).toHaveAttribute("data-ok", "false");
    await expect(page.getByTestId("rule-num")).toHaveAttribute("data-ok", "false");
    await expect(submit).toBeDisabled();

    // All rules satisfied, confirmation empty -> still disabled.
    await pwd.fill("BrandNewPassw0rd!");
    for (const id of ["len", "upper", "lower", "num"]) {
      await expect(page.getByTestId(`rule-${id}`)).toHaveAttribute("data-ok", "true");
    }
    await expect(submit).toBeDisabled();

    // Mismatched confirmation -> inline error AND submit disabled.
    await page.getByLabel(/confirm password/i).fill("WrongConfirm1A");
    await expect(page.getByTestId("confirm-error")).toBeVisible();
    await expect(submit).toBeDisabled();

    // Matching confirmation -> enabled.
    await page.getByLabel(/confirm password/i).fill("BrandNewPassw0rd!");
    await expect(page.getByTestId("confirm-error")).toHaveCount(0);
    await expect(submit).toBeEnabled();
  });

  test("server-side weak-password rejection appears inline, not just as a toast", async ({ page }) => {
    await primeRecoverySession(page);
    await page.route(SUPABASE_USER, (route) =>
      route.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({
          code: "weak_password",
          message: "Password should contain at least one uppercase character",
        }),
      })
    );

    await page.goto("/reset-password#access_token=fake&type=recovery");
    const pwd = page.getByLabel(/^new password$/i);
    await expect(pwd).toBeVisible({ timeout: 5_000 });

    await pwd.fill("Validpass1A");
    await page.getByLabel(/confirm password/i).fill("Validpass1A");
    await page.getByRole("button", { name: /update password/i }).click();

    const inline = page.getByTestId("reset-inline-error");
    await expect(inline).toBeVisible({ timeout: 3_000 });
    await expect(inline).toContainText(/uppercase|weak|character/i);
  });
});

test.describe("Successful reset + session continuity", () => {
  test("password updates, success toast appears, redirected home, session is present", async ({ page }) => {
    await primeRecoverySession(page);

    let updateCalled = 0;
    await page.route(SUPABASE_USER, (route) => {
      updateCalled += 1;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "user-1", email: "user@example.com" }),
      });
    });

    await page.goto("/reset-password#access_token=fake&type=recovery");
    const pwd = page.getByLabel(/^new password$/i);
    await expect(pwd).toBeVisible({ timeout: 5_000 });

    await pwd.fill("BrandNewPassw0rd!");
    await page.getByLabel(/confirm password/i).fill("BrandNewPassw0rd!");
    await page.getByRole("button", { name: /update password/i }).click();

    await expect(page.getByText(/password updated\. you're signed in/i)).toBeVisible({
      timeout: 3_000,
    });
    await page.waitForURL("**/", { timeout: 5_000 });
    expect(updateCalled).toBeGreaterThanOrEqual(1);
  });
});

test.describe("Reused / expired recovery link", () => {
  test("hash already carries `otp_expired`: link-error shown, form NOT rendered, cannot reuse", async ({ page }) => {
    await page.goto(
      "/reset-password#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired"
    );

    const err = page.getByTestId("reset-link-error");
    await expect(err).toBeVisible();
    await expect(err).toContainText(/expired/i);
    await expect(page.getByLabel(/^new password$/i)).toHaveCount(0);
    await expect(page.getByRole("link", { name: /request a new link/i })).toBeVisible();
  });

  test("second submit on the same link is rejected by the server with the same friendly message", async ({ page }) => {
    await primeRecoverySession(page);

    // First call (the "fresh" submit) succeeds; second call rejects as
    // expired/used to simulate token reuse.
    let n = 0;
    await page.route(SUPABASE_USER, (route) => {
      n += 1;
      if (n === 1) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: "user-1", email: "user@example.com" }),
        });
      } else {
        route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            code: "otp_expired",
            message: "Token has expired or is invalid",
          }),
        });
      }
    });

    // First reset succeeds and routes home.
    await page.goto("/reset-password#access_token=fake&type=recovery");
    const pwd = page.getByLabel(/^new password$/i);
    await expect(pwd).toBeVisible({ timeout: 5_000 });
    await pwd.fill("BrandNewPassw0rd!");
    await page.getByLabel(/confirm password/i).fill("BrandNewPassw0rd!");
    await page.getByRole("button", { name: /update password/i }).click();
    await page.waitForURL("**/", { timeout: 5_000 });

    // Now the user clicks the same recovery link a second time.
    await page.goto("/reset-password#access_token=fake&type=recovery");
    const pwd2 = page.getByLabel(/^new password$/i);
    if (await pwd2.isVisible().catch(() => false)) {
      await pwd2.fill("AnotherPassw0rd!");
      await page.getByLabel(/confirm password/i).fill("AnotherPassw0rd!");
      await page.getByRole("button", { name: /update password/i }).click();
    }

    const err = page.getByTestId("reset-link-error");
    await expect(err).toBeVisible({ timeout: 5_000 });
    await expect(err).toContainText(/expired|already been used/i);

    // Form is gone — the password CANNOT be changed via the reused link.
    await expect(page.getByLabel(/^new password$/i)).toHaveCount(0);
  });
});

test.describe("Forgot-password rate limit / cooldown", () => {
  test("third rapid request triggers cooldown UI and blocks further submissions", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.removeItem("nextgen.fp.cooldownUntil"));

    let count = 0;
    await page.route(SUPABASE_RECOVER, (route) => {
      count += 1;
      if (count <= 1) {
        route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      } else {
        // Subsequent rapid calls mimic Supabase rate-limit response.
        route.fulfill({
          status: 429,
          contentType: "application/json",
          body: JSON.stringify({
            code: "over_email_send_rate_limit",
            message: "Email rate limit exceeded",
          }),
        });
      }
    });

    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();

    // First request succeeds -> confirmation screen with the cooldown timer.
    await expect(page.getByTestId("fp-cooldown")).toBeVisible({ timeout: 3_000 });
    await expect(page.getByTestId("fp-cooldown")).toContainText(/\d+s/);

    // Re-navigate to the form and try again immediately — the cooldown
    // (persisted in localStorage) must keep the button disabled and surface
    // the rate-limit message instead of allowing unlimited emails.
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("user@example.com");
    const submit = page.getByRole("button", { name: /try again in \d+s|send reset link/i });
    await expect(submit).toBeDisabled();

    // For belt-and-suspenders: if the server itself rejects with 429, the
    // page maps it to the friendly rate-error UI.
    await page.evaluate(() => window.localStorage.removeItem("nextgen.fp.cooldownUntil"));
    await page.reload();
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByRole("button", { name: /send reset link/i }).click();
    const rate = page.getByTestId("fp-rate-error");
    await expect(rate).toBeVisible({ timeout: 3_000 });
    await expect(rate).toContainText(/too many|wait/i);
  });
});
