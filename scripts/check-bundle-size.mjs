#!/usr/bin/env node
/**
 * Bundle-size guard.
 *
 * Fails CI if the main client bundle (the entry chunk loaded by index.html)
 * exceeds the configured budget. This protects the gains we got from
 * lazy-loading the admin dashboard.
 *
 * Budgets are intentionally tight but with headroom — bump only after a
 * deliberate review.
 */
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist/assets";
const INDEX_HTML = "dist/index.html";

// Hard budgets (raw bytes, uncompressed). Adjust intentionally.
const BUDGETS = {
  mainEntryKB: 600,    // entry chunk referenced by index.html
  adminChunkKB: 600,   // Admin dashboard chunk (must stay split out)
  totalInitialKB: 700, // entry + its sync deps loaded on first paint
};

function kb(bytes) {
  return Math.round((bytes / 1024) * 100) / 100;
}

let html;
try {
  html = readFileSync(INDEX_HTML, "utf8");
} catch {
  console.error(`✗ Could not read ${INDEX_HTML}. Did "npm run build" run?`);
  process.exit(1);
}

const entryMatch = html.match(/\/assets\/(index-[^"']+\.js)/);
if (!entryMatch) {
  console.error("✗ Could not locate entry chunk in index.html");
  process.exit(1);
}
const entryFile = entryMatch[1];

const files = readdirSync(DIST);
const entryPath = join(DIST, entryFile);
const entrySize = statSync(entryPath).size;

const adminFile = files.find((f) => /^Admin-[^.]+\.js$/.test(f));
const adminSize = adminFile ? statSync(join(DIST, adminFile)).size : 0;

// Initial JS = sum of all <script src=/assets/*.js> in index.html
const initialScripts = [...html.matchAll(/\/assets\/([^"']+\.js)/g)].map(
  (m) => m[1],
);
const initialSize = initialScripts.reduce(
  (sum, f) => sum + statSync(join(DIST, f)).size,
  0,
);

const checks = [
  {
    label: `Main entry (${entryFile})`,
    sizeKB: kb(entrySize),
    budgetKB: BUDGETS.mainEntryKB,
  },
  {
    label: `Admin chunk (${adminFile ?? "missing"})`,
    sizeKB: kb(adminSize),
    budgetKB: BUDGETS.adminChunkKB,
    skip: !adminFile,
  },
  {
    label: `Initial JS (${initialScripts.length} script(s))`,
    sizeKB: kb(initialSize),
    budgetKB: BUDGETS.totalInitialKB,
  },
];

let failed = false;
console.log("\nBundle size report:");
console.log("─".repeat(60));
for (const c of checks) {
  if (c.skip) {
    console.log(`  •  ${c.label} — skipped`);
    continue;
  }
  const pct = Math.round((c.sizeKB / c.budgetKB) * 100);
  const ok = c.sizeKB <= c.budgetKB;
  const icon = ok ? "✓" : "✗";
  console.log(
    `  ${icon}  ${c.label}: ${c.sizeKB} KB / ${c.budgetKB} KB (${pct}%)`,
  );
  if (!ok) failed = true;
}
console.log("─".repeat(60));

// Sanity: Admin must NOT be bundled into the main entry.
if (adminFile) {
  const entryContent = readFileSync(entryPath, "utf8");
  if (
    entryContent.includes("VolunteerAdmin") ||
    entryContent.includes("AnalyticsDashboard")
  ) {
    console.error(
      "✗ Admin components leaked into the main entry chunk. Check lazy() imports in src/App.tsx.",
    );
    failed = true;
  } else {
    console.log("  ✓  Admin code-splitting verified (not in main entry)");
  }
}

if (failed) {
  console.error("\nBundle-size budget exceeded. Update budgets only if intentional.");
  process.exit(1);
}
console.log("\nAll bundle-size budgets respected.\n");
