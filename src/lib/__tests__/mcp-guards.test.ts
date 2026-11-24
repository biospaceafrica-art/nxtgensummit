import { describe, it, expect } from "vitest";
import { checkRateLimit, sanitizeText, isUuid } from "../mcp/guards";

const ctx = (id: string) => ({ getUserId: () => id, getClientId: () => "c" }) as any;

describe("MCP guards", () => {
  it("allows 10 writes per minute then blocks the 11th", () => {
    const rule = { limit: 10, windowMs: 60_000 };
    for (let i = 0; i < 10; i++) expect(checkRateLimit(ctx("u1"), "t", rule)).toBeNull();
    expect(checkRateLimit(ctx("u1"), "t", rule)?.isError).toBe(true);
  });
  it("limits are per user", () => {
    const rule = { limit: 1, windowMs: 60_000 };
    expect(checkRateLimit(ctx("a"), "x", rule)).toBeNull();
    expect(checkRateLimit(ctx("b"), "x", rule)).toBeNull();
  });
  it("strips control characters from notes", () => {
    expect(sanitizeText(" hi\u0000\u0007 there ")).toBe("hi there");
  });
  it("rejects non-uuid ids", () => {
    expect(isUuid("1; drop table x")).toBe(false);
  });
});
