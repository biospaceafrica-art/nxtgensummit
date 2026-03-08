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

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const origin = req.headers.get("origin") || "https://nxtgensummit.lovable.app";
    const badgeParams = new URLSearchParams({ name, email, track: track || "", course: course || "" });
    const badgeUrl = `${origin}/badge?${badgeParams.toString()}`;
    const trackLabel = track === "enterprise" ? "Business Champions" : "Career Champions";

    // Send actual email via Resend
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Welcome to NextGen Summit 2026!</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #1a1a2e;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 15px; color: #333;">You're officially registered for <strong>NextGen Summit 2026</strong> as a <strong>${trackLabel}</strong>${course ? ` — <em>${course}</em>` : ""}.</p>
          <div style="background: #f8f5ff; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 4px 0; font-size: 14px; color: #555;">📅 <strong>Date:</strong> June 20, 2026 | 11:00 AM</p>
            <p style="margin: 4px 0; font-size: 14px; color: #555;">📍 <strong>Venue:</strong> The Purple Place, Lokogoma, Abuja</p>
          </div>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${badgeUrl}" style="display: inline-block; background: #7c3aed; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">🎫 View Your Digital Badge</a>
          </div>
          <p style="font-size: 13px; color: #888; text-align: center;">Attendance is compulsory for all registered delegates.</p>
        </div>
        <div style="background: #f4f4f5; padding: 16px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #999;">NextGen Summit Team • Abuja, Nigeria</p>
        </div>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NextGen Summit <hello@nxtgensummit.lovable.app>",
        to: [email],
        subject: "🎉 Welcome to NextGen Summit 2026!",
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      console.error("Resend API error:", resendData);
      throw new Error(`Resend error: ${JSON.stringify(resendData)}`);
    }

    // Track in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

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
      JSON.stringify({ success: true, message: `Welcome email sent to ${email}`, resend_id: resendData.id }),
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
