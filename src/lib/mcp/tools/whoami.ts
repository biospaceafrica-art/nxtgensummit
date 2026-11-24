import { defineTool } from "@lovable.dev/mcp-js";
import { authorize, getRoles, READ_LIMIT, toolJson } from "../guards";

export default defineTool({
  name: "whoami",
  title: "Who am I",
  description: "Return the signed-in user's id, email, and app roles.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const denied = await authorize(ctx, "whoami", { rate: READ_LIMIT });
    if (denied) return denied;
    const payload = { user_id: ctx.getUserId(), email: ctx.getUserEmail(), roles: await getRoles(ctx) };
    return toolJson(payload, payload);
  },
});
