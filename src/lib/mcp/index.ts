import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoamiTool from "./tools/whoami";
import listMyRegistrationsTool from "./tools/list-my-registrations";
import listScholarshipApplicantsTool from "./tools/list-scholarship-applicants";
import updateApplicantStatusTool from "./tools/update-applicant-status";

// Build the OAuth issuer from the project ref (never from SUPABASE_URL — that
// may be the .lovable.cloud proxy, and mcp-js requires the direct supabase.co
// issuer). VITE_SUPABASE_PROJECT_ID is inlined by Vite at build time, so this
// stays import-safe.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "nextgen-summit-mcp",
  title: "NextGen Summit MCP",
  version: "0.1.0",
  instructions:
    "Tools for NextGen Summit 2026. Use `whoami` to inspect your session, `list_my_registrations` for your own registrations, and (admin/selection_team only) `list_scholarship_applicants` / `update_applicant_status` for scholarship review.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    whoamiTool,
    listMyRegistrationsTool,
    listScholarshipApplicantsTool,
    updateApplicantStatusTool,
  ],
});
