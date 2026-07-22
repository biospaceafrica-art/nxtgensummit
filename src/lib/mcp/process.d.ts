// Ambient types for MCP tool files. These run under Deno at runtime (as an
// emitted Supabase Edge Function) — process.env is polyfilled there. In the
// Vite build the file is statically analyzed but never executed in the browser.
declare const process: { env: Record<string, string | undefined> };
