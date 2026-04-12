import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const POSITION_LABELS: Record<string, string> = {
  mass_choir: "Mass Choir",
  ushering: "Ushering",
  transportation: "Transportation & Logistics",
  social_media: "Social Media",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { full_name, email, phone, position, experience, why_volunteer } = await req.json();

    if (!full_name || !email || !position) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get admin emails
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admin users found to notify");
      return new Response(
        JSON.stringify({ success: true, message: "No admins to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin emails from auth
    const adminEmails: string[] = [];
    for (const role of adminRoles) {
      const { data: { user } } = await supabase.auth.admin.getUserById(role.user_id);
      if (user?.email) adminEmails.push(user.email);
    }

    if (adminEmails.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No admin emails found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const posLabel = POSITION_LABELS[position] || position;

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #e67e22, #f39c12); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">🙋 New Volunteer Application</h1>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 15px; color: #333; margin-bottom: 16px;">A new volunteer has applied for <strong>NextGen Summit 2026</strong>:</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #888; width: 140px;">Name</td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 600;">${full_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0; color: #1a1a2e;">${email}</td></tr>
            ${phone ? `<tr><td style="padding: 8px 0; color: #888;">Phone</td><td style="padding: 8px 0; color: #1a1a2e;">${phone}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; color: #888;">Position</td><td style="padding: 8px 0; color: #1a1a2e; font-weight: 600;">${posLabel}</td></tr>
            ${experience ? `<tr><td style="padding: 8px 0; color: #888; vertical-align: top;">Experience</td><td style="padding: 8px 0; color: #1a1a2e;">${experience}</td></tr>` : ""}
            ${why_volunteer ? `<tr><td style="padding: 8px 0; color: #888; vertical-align: top;">Motivation</td><td style="padding: 8px 0; color: #1a1a2e;">${why_volunteer}</td></tr>` : ""}
          </table>
        </div>
        <div style="background: #f4f4f5; padding: 16px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #999;">NextGen Summit Admin Notification</p>
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
        to: adminEmails,
        subject: `🙋 New Volunteer: ${full_name} — ${posLabel}`,
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      console.error("Resend API error:", resendData);
      throw new Error(`Resend error: ${JSON.stringify(resendData)}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Admin notification sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("notify-volunteer-application error:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
