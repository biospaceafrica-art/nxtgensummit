import { defineTool } from "@lovable.dev/mcp-js";
import { authorize, READ_LIMIT, supabaseForUser, toolError, toolJson } from "../guards";

export default defineTool({
  name: "list_my_registrations",
  title: "List my registrations",
  description: "List NextGen Summit registrations belonging to the signed-in user.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const denied = await authorize(ctx, "list_my_registrations", { rate: READ_LIMIT });
    if (denied) return denied;
    const { data, error } = await supabaseForUser(ctx)
      .from("registrations")
      .select("id, full_name, fellowship_track, current_status, selected_course, payment_confirmed, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return toolError("Could not load registrations.");
    return toolJson(data ?? [], { registrations: data ?? [] });
  },
});
