import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { authorize, READ_LIMIT, supabaseForUser, toolError, toolJson } from "../guards";

const STATUSES = ["pending", "shortlisted", "accepted", "rejected", "waitlist"] as const;

export default defineTool({
  name: "list_scholarship_applicants",
  title: "List scholarship applicants",
  description: "List scholarship applicants (admin or selection_team only). Optional status filter.",
  inputSchema: {
    status: z.enum(STATUSES).optional().describe("Filter by review status."),
    limit: z.number().int().min(1).max(200).optional().describe("Max rows (default 50, max 200)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    const denied = await authorize(ctx, "list_scholarship_applicants", {
      rate: READ_LIMIT,
      anyOfRoles: ["admin", "selection_team"],
    });
    if (denied) return denied;
    let q = supabaseForUser(ctx)
      .from("scholarship_applicants")
      .select("id, full_name, email, status, notes, reviewed_at, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return toolError("Could not load applicants.");
    return toolJson(data ?? [], { applicants: data ?? [] });
  },
});
