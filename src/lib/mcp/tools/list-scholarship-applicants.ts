import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_scholarship_applicants",
  title: "List scholarship applicants",
  description:
    "List scholarship applicants (admin or selection_team only, enforced by RLS). Optional status filter.",
  inputSchema: {
    status: z
      .enum(["pending", "shortlisted", "accepted", "rejected", "waitlist"])
      .optional()
      .describe("Filter by review status."),
    limit: z.number().int().positive().max(500).optional().describe("Max rows (default 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    let q = sb.from("scholarship_applicants").select("*").order("created_at", { ascending: false }).limit(limit ?? 100);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { applicants: data ?? [] },
    };
  },
});
