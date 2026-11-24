import { test, expect } from "@playwright/test";

/** Regression guards: route protection, MCP OAuth enforcement. */
const MCP = "https://ypcoludurdfinazcxylj.supabase.co/functions/v1/mcp";

test.describe("Route guards", () => {
  for (const path of ["/admin", "/admin/analytics", "/admin/checkin"]) {
    test(`${path} redirects anonymous users to /admin/login`, async ({ page }) => {
      await page.goto(path);
      await page.waitForURL(/\/admin\/login/, { timeout: 10_000 });
    });
  }

  test("/selection does not show applicant data when signed out", async ({ page }) => {
    await page.goto("/selection");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=@").first()).toHaveCount(0);
  });
});

test.describe("MCP OAuth enforcement", () => {
  const rpc = { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "list_scholarship_applicants", arguments: {} } };
  const h = { "Content-Type": "application/json", Accept: "application/json, text/event-stream" };

  test("rejects calls without a bearer token", async ({ request }) => {
    const res = await request.post(MCP, { headers: h, data: rpc });
    expect(res.status()).toBe(401);
    expect(res.headers()["www-authenticate"] ?? "").toContain("resource_metadata");
  });

  test("rejects a forged bearer token", async ({ request }) => {
    const res = await request.post(MCP, { headers: { ...h, Authorization: "Bearer forged.token.value" }, data: rpc });
    expect(res.status()).toBe(401);
  });

  test("publishes protected-resource metadata pointing at the auth issuer", async ({ request }) => {
    const res = await request.get(`${MCP}/.well-known/oauth-protected-resource`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(JSON.stringify(body.authorization_servers)).toContain("/auth/v1");
  });
});
