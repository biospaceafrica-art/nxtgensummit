import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { authorize, isUuid, sanitizeText, supabaseForUser, toolError, toolJson, WRITE_LIMIT } from "../guards";

export default defineTool({
  name: "update_applicant_status",
  title: "Update applicant status",
  description:
    "Update a scholarship applicant's review status and optional notes. Requires admin or selection_team role.",
  inputSchema: {
    applicant_id: z.string().uuid().describe("Applicant row id."),
    status: z.enum(["pending", "shortlisted", "accepted", "rejected", "waitlist"]),
    notes: z.string().max(1000).optional().describe("Reviewer notes (max 1000 chars)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ applicant_id, status, notes }, ctx) => {
    const denied = await authorize(ctx, "update_applicant_status", {
      rate: WRITE_LIMIT,
      anyOfRoles: ["admin", "selection_team"],
    });
    if (denied) return denied;
    if (!isUuid(applicant_id)) return toolError("Invalid applicant_id.");
    const patch: Record<string, unknown> = {
      status,
      reviewed_by: ctx.getUserId(),
      reviewed_at: new Date().toISOString(),
    };
    if (notes !== undefined) {
      const clean = sanitizeText(notes);
      if (clean.length > 1000) return toolError("Notes exceed 1000-character limit");
      patch.notes = clean;
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("scholarship_applicants")
      .update(patch)
      .eq("id", applicant_id)
      .select("id, full_name, status, notes, reviewed_at")
      .maybeSingle();
    if (error) return toolError("Update rejected by access rules.");
    if (!data) return toolError("Applicant not found or not permitted.");
    return toolJson(data, { applicant: data });
  },
});
