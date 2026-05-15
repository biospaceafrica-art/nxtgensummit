// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const BASE_URL = "https://nxtgensummit.lovable.app";

const entries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/register", changefreq: "weekly", priority: "0.9" },
  { path: "/fellowship", changefreq: "monthly", priority: "0.8" },
  { path: "/speakers", changefreq: "weekly", priority: "0.8" },
  { path: "/schedule", changefreq: "weekly", priority: "0.8" },
  { path: "/scholarship", changefreq: "monthly", priority: "0.7" },
  { path: "/plant-a-seed", changefreq: "monthly", priority: "0.7" },
  { path: "/gallery", changefreq: "weekly", priority: "0.6" },
  { path: "/volunteer", changefreq: "monthly", priority: "0.6" },
  { path: "/networking", changefreq: "weekly", priority: "0.5" },
  // Admin & utility routes deliberately omitted.
];

const today = new Date().toISOString().slice(0, 10);

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${e.priority}</priority>`,
      `  </url>`,
    ].join("\n"),
  ),
  `</urlset>`,
].join("\n");

const out = resolve("public/sitemap.xml");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, xml);
console.log(`sitemap.xml written (${entries.length} entries)`);
