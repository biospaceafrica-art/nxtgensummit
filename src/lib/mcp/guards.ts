/**
 * Shared hardening helpers for every MCP tool.
 *
 * Import-safe: only function declarations here — no env reads or I/O at module
 * top level (the entry is evaluated at build time and on cold start).
 */
import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

type RuntimeGlobals = typeof globalThis & {
  Deno?: { env?: { get?: (name: string) => string | undefined } };
  process?: { env?: Record<string, string | undefined> };
};

function runtimeEnv(name: string): string | undefined {
  const runtime = globalThis as RuntimeGlobals;
  return runtime.Deno?.env?.get?.(name) ?? runtime.process?.env?.[name];
}

function configuredEnv(names: readonly string[]): string | undefined {
  for (const name of names) {
    const value = runtimeEnv(name)?.trim();
    if (value) return value;
  }
  return undefined;
}

function supabaseProjectUrl(): string {
  const url = configuredEnv(["SUPABASE_URL", "VITE_SUPABASE_URL"]);
  if (!url) throw new Error("SUPABASE_URL (or VITE_SUPABASE_URL) is required");
  return url;
}

function supabasePublishableKey(): string {
  const direct = configuredEnv(["SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"]);
  if (direct) return direct;
  const keyset = runtimeEnv("SUPABASE_PUBLISHABLE_KEYS");
  if (keyset) {
    try {
      const parsed: unknown = JSON.parse(keyset);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const keys = parsed as Record<string, unknown>;
        const key = [keys.default, ...Object.values(keys)]
          .find((v): v is string => typeof v === "string" && v.trim().startsWith("sb_publishable_"))
          ?.trim();
        if (key) return key;
      }
    } catch {
      // fall through to legacy names
    }
  }
  const legacy = configuredEnv(["SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"]);
  if (legacy) return legacy;
  throw new Error("SUPABASE_PUBLISHABLE_KEY, SUPABASE_PUBLISHABLE_KEYS, or SUPABASE_ANON_KEY is required");
}

/** Forwards the verified bearer token so RLS runs as the signed-in user. */
export function supabaseForUser(ctx: ToolContext) {
  const token = ctx.getToken();
  if (!token) throw new Error("supabaseForUser requires a verified OAuth token");
  return createClient(supabaseProjectUrl(), supabasePublishableKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
};

export function toolError(message: string): ToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

export function toolJson(payload: unknown, structured?: Record<string, unknown>): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: structured,
  };
}

/* ------------------------------------------------------------------ *
 * Rate limiting (per identity + tool, sliding window, in-memory)
 * ------------------------------------------------------------------ */

const buckets = new Map<string, number[]>();
const MAX_BUCKETS = 5_000;

export type RateLimit = { limit: number; windowMs: number };

export const READ_LIMIT: RateLimit = { limit: 30, windowMs: 60_000 };
export const WRITE_LIMIT: RateLimit = { limit: 10, windowMs: 60_000 };

/** Returns an error result when the caller exceeded the limit, else null. */
export function checkRateLimit(ctx: ToolContext, tool: string, rule: RateLimit): ToolResult | null {
  const identity = `${ctx.getUserId() ?? "anon"}:${ctx.getClientId?.() ?? "unknown"}`;
  const key = `${identity}:${tool}`;
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < rule.windowMs);
  if (hits.length >= rule.limit) {
    const retryIn = Math.ceil((rule.windowMs - (now - hits[0])) / 1000);
    return toolError(
      `Rate limit exceeded for \`${tool}\` (${rule.limit} calls / ${rule.windowMs / 1000}s). Retry in ~${retryIn}s.`,
    );
  }
  hits.push(now);
  if (buckets.size > MAX_BUCKETS) buckets.clear();
  buckets.set(key, hits);
  return null;
}

/* ------------------------------------------------------------------ *
 * Authorization
 * ------------------------------------------------------------------ */

export type AppRole = "admin" | "user" | "selection_team";

/** Roles of the signed-in user, read through RLS (never from tool input). */
export async function getRoles(ctx: ToolContext): Promise<AppRole[]> {
  const sb = supabaseForUser(ctx);
  const { data } = await sb.from("user_roles").select("role").eq("user_id", ctx.getUserId());
  return ((data ?? []) as Array<{ role: AppRole }>).map((r) => r.role);
}

/**
 * Single entry gate for every tool: verified identity, OAuth-client token,
 * rate limit, and (optionally) an explicit role requirement checked in code
 * on top of the RLS policies.
 */
export async function authorize(
  ctx: ToolContext,
  tool: string,
  opts: { rate: RateLimit; anyOfRoles?: AppRole[] },
): Promise<ToolResult | null> {
  if (!ctx.isAuthenticated() || !ctx.getUserId() || !ctx.getToken()) {
    return toolError("Not authenticated. Connect this app over OAuth and sign in first.");
  }
  const limited = checkRateLimit(ctx, tool, opts.rate);
  if (limited) return limited;

  if (opts.anyOfRoles?.length) {
    let roles: AppRole[];
    try {
      roles = await getRoles(ctx);
    } catch {
      return toolError("Could not verify your permissions. Try again.");
    }
    if (!opts.anyOfRoles.some((r) => roles.includes(r))) {
      return toolError(`Forbidden: this tool requires one of the roles: ${opts.anyOfRoles.join(", ")}.`);
    }
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Input sanitation
 * ------------------------------------------------------------------ */

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Strips control characters and trims; use on any free-text tool input. */
export function sanitizeText(value: string): string {
  return value.replace(CONTROL_CHARS, "").trim();
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
