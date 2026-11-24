import { test, expect } from "@playwright/test";

/** OWASP-style checks: XSS injection, clickjacking, headers, data exposure. */
const SUPABASE_URL = "https://ypcoludurdfinazcxylj.supabase.co";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwY29sdWR1cmRmaW5hemN4eWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDcxODQsImV4cCI6MjA4NjkyMzE4NH0.zlRpRLdQGbYIEDdPXJ4W3KegBZXrvo-cLOTWY76Zqm4";
const XSS = `"><img src=x onerror="window.__xss=1"><script>window.__xss=1</script>`;

test.describe("A03 Injection / XSS", () => {
  for (const path of ["/?q=", "/schedule?track=", "/login?next=", "/signup?next="]) {
    test(`reflected payload does not execute on ${path}`, async ({ page }) => {
      await page.goto(path + encodeURIComponent(XSS));
      await page.waitForLoadState("networkidle");
      expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
    });
  }

  test("typed payload in register form is rendered inert", async ({ page }) => {
    await page.goto("/register");
    const input = page.locator("input").first();
    await input.fill(XSS);
    expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
    expect(await page.locator("img[src='x']").count()).toBe(0);
  });

  test("open redirect via ?next= is rejected", async ({ page }) => {
    await page.goto("/login?next=" + encodeURIComponent("//evil.example.com"));
    await page.waitForLoadState("networkidle");
    expect(new URL(page.url()).host).toContain("localhost");
  });
});

test.describe("A05 Security misconfiguration", () => {
  test("security headers + CSP are sent", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["content-security-policy"]).toContain("object-src 'none'");
  });

  test("CSP meta tag is present in the built HTML", async ({ page }) => {
    await page.goto("/");
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
    expect(csp).toContain("default-src 'self'");
  });
});

test.describe("A01 Broken access control (anonymous API)", () => {
  const headers = { apikey: ANON, Authorization: `Bearer ${ANON}` };
  for (const table of [
    "registrations",
    "scholarship_applicants",
    "feedback",
    "door_opener_submissions",
    "volunteer_applications",
    "check_ins",
    "networking_profiles",
    "messages",
    "user_roles",
  ]) {
    test(`anon cannot read ${table}`, async ({ request }) => {
      const res = await request.get(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, { headers });
      if (res.ok()) expect(await res.json()).toEqual([]);
      else expect([401, 403, 404]).toContain(res.status());
    });
  }

  test("anon cannot update scholarship applicants", async ({ request }) => {
    const res = await request.patch(
      `${SUPABASE_URL}/rest/v1/scholarship_applicants?id=neq.00000000-0000-0000-0000-000000000000`,
      { headers: { ...headers, Prefer: "return=representation" }, data: { status: "accepted" } },
    );
    if (res.ok()) expect(await res.json()).toEqual([]);
    else expect([401, 403]).toContain(res.status());
  });
});
