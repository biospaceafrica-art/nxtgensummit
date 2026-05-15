import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — runs against `vite preview` serving the production build.
 * Auth & Suspense specs get retries to absorb transient Supabase latency,
 * while still failing the build on persistent issues.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  // Global retries=2 in CI; per-spec overrides via test.describe.configure.
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["html", { open: "never" }], ["list"], ["json", { outputFile: "playwright-report/results.json" }]]
    : "list",
  use: {
    baseURL: "http://localhost:4173",
    // Rich debugging artifacts ONLY on failure: traces, screenshots, videos.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
