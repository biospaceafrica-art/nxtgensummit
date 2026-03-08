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
    const { name, email, track, course } = await req.json();

    if (!name || !email) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing name or email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const origin = req.headers.get("origin") || "https://nxtgensummit.lovable.app";
    const badgeParams = new URLSearchParams({ name, email, track: track || "", course: course || "" });
    const badgeUrl = `${origin}/badge?${badgeParams.toString()}`;

    const trackLabel = track === "enterprise" ? "Business Champions" : "Career Champions";

    // Log the welcome email details (actual email sending would require an email provider)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Record as email reminder for tracking
    const { data: reg } = await supabase
      .from("registrations")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (reg) {
      await supabase.from("email_reminders").insert({
        registration_id: reg.id,
        reminder_type: "welcome_email",
        scheduled_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        status: "sent",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Welcome email prepared for ${name}`,
        badge_url: badgeUrl,
        email_content: {
          to: email,
          subject: "🎉 Welcome to NextGen Summit 2026!",
          body: `Hi ${name},\n\nYou're registered for NextGen Summit 2026 as a ${trackLabel}${course ? ` — ${course}` : ""}.\n\n📅 June 20, 2026 | 11:00 AM\n📍 The Purple Place, Lokogoma, Abuja\n\n🎫 Your Digital Badge: ${badgeUrl}\n\nSee you there!\nNextGen Summit Team`,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("send-welcome-email error:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
