declare const process: { env: Record<string, string | undefined> };
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "update_applicant_status",
  title: "Update applicant status",
  description:
    "Update a scholarship applicant's review status and optional notes. Requires admin or selection_team role (enforced by RLS).",
  inputSchema: {
    applicant_id: z.string().uuid().describe("Applicant row id."),
    status: z.enum(["pending", "shortlisted", "accepted", "rejected", "waitlist"]),
    notes: z.string().optional().describe("Reviewer notes (max 1000 chars)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ applicant_id, status, notes }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    if (notes && notes.length > 1000) {
      return { content: [{ type: "text", text: "Notes exceed 1000-character limit" }], isError: true };
    }
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const patch: Record<string, unknown> = {
      status,
      reviewed_by: ctx.getUserId(),
      reviewed_at: new Date().toISOString(),
    };
    if (notes !== undefined) patch.notes = notes;
    const { data, error } = await sb
      .from("scholarship_applicants")
      .update(patch)
      .eq("id", applicant_id)
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { applicant: data },
    };
  },
});
