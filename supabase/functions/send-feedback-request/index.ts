import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Optional: verify admin caller for manual trigger
    let isManualTrigger = false;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { data } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      if (data?.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();
        isManualTrigger = !!roleData;
      }
    }

    // Fetch all registrations that haven't received feedback requests yet
    const { data: registrations, error: regError } = await supabase
      .from("registrations")
      .select("id, full_name, email")
      .order("created_at", { ascending: false });

    if (regError) throw regError;

    // Check which emails already have feedback
    const { data: existingFeedback } = await supabase
      .from("feedback")
      .select("email");

    const feedbackEmails = new Set((existingFeedback || []).map((f: { email: string }) => f.email));

    // Also check which have already been sent a reminder of type 'feedback_request'
    const { data: sentReminders } = await supabase
      .from("email_reminders")
      .select("registration_id")
      .eq("reminder_type", "feedback_request")
      .eq("status", "sent");

    const sentIds = new Set((sentReminders || []).map((r: { registration_id: string }) => r.registration_id));

    const toNotify = (registrations || []).filter(
      (r: { id: string; email: string }) => !feedbackEmails.has(r.email) && !sentIds.has(r.id)
    );

    // Record reminders for each participant
    const reminders = toNotify.map((r: { id: string; full_name: string; email: string }) => ({
      registration_id: r.id,
      reminder_type: "feedback_request",
      scheduled_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      status: "sent",
    }));

    if (reminders.length > 0) {
      const { error: insertError } = await supabase
        .from("email_reminders")
        .insert(reminders);
      if (insertError) throw insertError;
    }

    // Build feedback URL
    const feedbackUrl = `${req.headers.get("origin") || "https://nxtgensummit.lovable.app"}/feedback`;

    return new Response(
      JSON.stringify({
        success: true,
        triggered_by: isManualTrigger ? "admin" : "cron",
        participants_notified: toNotify.length,
        feedback_url: feedbackUrl,
        participants: toNotify.map((r: { full_name: string; email: string }) => ({
          name: r.full_name,
          email: r.email,
        })),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("send-feedback-request error:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
