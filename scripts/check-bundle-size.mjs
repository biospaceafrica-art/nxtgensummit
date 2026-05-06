#!/usr/bin/env node
/**
 * Bundle-size guard.
 *
 * Enforces:
 *   1. Hard budget for the main entry chunk (loaded by index.html on every visit).
 *   2. Hard budget for the Admin chunk (must remain split out).
 *   3. Hard budget for total initial JS (entry + sync deps in index.html).
 *   4. Per-chunk ceiling for ALL emitted JS chunks — catches surprise growth in
 *      vendor splits like react/recharts/html2canvas before they become a problem.
 *   5. Sanity check that admin code never leaks into the main entry.
 *
 * Each failure prints chunk name, observed size, budget, and overage so CI logs
 * make the regression obvious.
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
  // Per-chunk ceiling applied to every emitted JS chunk. Generous enough for
  // the largest known vendor splits (html2canvas ~200KB, recharts/client ~500KB)
  // but tight enough to catch a chunk doubling in size.
  perChunkKB: 600,
};

// Chunks whose name matches any of these patterns may exceed perChunkKB
// (because they have their own dedicated budget above, or are intentionally large).
const PER_CHUNK_EXEMPT = [
  /^index-/,         // main entry (covered by mainEntryKB)
  /^Admin-/,         // admin dashboard (covered by adminChunkKB)
];

function kb(bytes) {
  return Math.round((bytes / 1024) * 100) / 100;
}

function fail(msg) {
  console.error(`✗ ${msg}`);
}

let html;
try {
  html = readFileSync(INDEX_HTML, "utf8");
} catch {
  fail(`Could not read ${INDEX_HTML}. Did "npm run build" run?`);
  process.exit(1);
}

const entryMatch = html.match(/\/assets\/(index-[^"']+\.js)/);
if (!entryMatch) {
  fail("Could not locate entry chunk in index.html");
  process.exit(1);
}
const entryFile = entryMatch[1];

const allFiles = readdirSync(DIST).filter((f) => f.endsWith(".js"));
const entryPath = join(DIST, entryFile);
const entrySize = statSync(entryPath).size;

const adminFile = allFiles.find((f) => /^Admin-[^.]+\.js$/.test(f));
const adminSize = adminFile ? statSync(join(DIST, adminFile)).size : 0;

// Initial JS = sum of all <script src=/assets/*.js> in index.html
const initialScripts = [...html.matchAll(/\/assets\/([^"']+\.js)/g)].map(
  (m) => m[1],
);
const initialSize = initialScripts.reduce(
  (sum, f) => sum + statSync(join(DIST, f)).size,
  0,
);

let failed = false;

console.log("\nBundle size report");
console.log("=".repeat(64));

// --- Headline budgets ---
const headline = [
  {
    label: `Main entry (${entryFile})`,
    sizeKB: kb(entrySize),
    budgetKB: BUDGETS.mainEntryKB,
  },
  {
    label: `Admin chunk (${adminFile ?? "MISSING"})`,
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

for (const c of headline) {
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
  if (!ok) {
    failed = true;
    fail(
      `${c.label} exceeds budget by ${(c.sizeKB - c.budgetKB).toFixed(2)} KB.`,
    );
  }
}

// --- Per-chunk ceiling ---
console.log(`\nPer-chunk ceiling: ${BUDGETS.perChunkKB} KB`);
console.log("-".repeat(64));
const perChunkOffenders = [];
for (const f of allFiles) {
  if (PER_CHUNK_EXEMPT.some((re) => re.test(f))) continue;
  const sizeKB = kb(statSync(join(DIST, f)).size);
  if (sizeKB > BUDGETS.perChunkKB) {
    perChunkOffenders.push({ file: f, sizeKB });
  }
}
if (perChunkOffenders.length === 0) {
  console.log("  ✓  All non-exempt chunks within per-chunk ceiling");
} else {
  failed = true;
  for (const o of perChunkOffenders) {
    fail(
      `Chunk ${o.file} = ${o.sizeKB} KB exceeds per-chunk ceiling of ${BUDGETS.perChunkKB} KB ` +
        `(over by ${(o.sizeKB - BUDGETS.perChunkKB).toFixed(2)} KB).`,
    );
  }
}

// --- Code-splitting sanity check ---
console.log("\nCode-splitting sanity");
console.log("-".repeat(64));
if (adminFile) {
  const entryContent = readFileSync(entryPath, "utf8");
  const leaks = ["VolunteerAdmin", "AnalyticsDashboard", "FeedbackDashboard", "CheckInDashboard"];
  const leaked = leaks.filter((n) => entryContent.includes(n));
  if (leaked.length) {
    failed = true;
    fail(
      `Admin component(s) leaked into main entry: ${leaked.join(", ")}. ` +
        `Check lazy() imports in src/App.tsx.`,
    );
  } else {
    console.log("  ✓  Admin code-splitting verified (not in main entry)");
  }
} else {
  failed = true;
  fail("Admin chunk not found — admin dashboard must be code-split.");
}

console.log("=".repeat(64));
if (failed) {
  console.error("\nBundle-size budget exceeded. See ✗ lines above.");
  console.error("If a regression is intentional, update BUDGETS in scripts/check-bundle-size.mjs.\n");
  process.exit(1);
}
console.log("\nAll bundle-size budgets respected.\n");
