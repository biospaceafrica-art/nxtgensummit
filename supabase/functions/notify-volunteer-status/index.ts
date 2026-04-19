import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { full_name, email, position, status } = await req.json();
    if (!email || !status) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");

    const isApproved = status === "approved";
    const subject = isApproved
      ? "🎉 You're In! Welcome to the NextGen Summit Volunteer Team"
      : "Update on Your NextGen Summit Volunteer Application";

    const html = isApproved
      ? `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
          <h1 style="color:#f97316;">Congratulations, ${full_name}! 🎉</h1>
          <p>We're thrilled to welcome you as a volunteer for the <strong>NextGen Summit 2026</strong>, powered by The Tribe Africa.</p>
          <p>Your application for the <strong>${position}</strong> position has been <strong style="color:#16a34a;">APPROVED</strong>.</p>
          <h3>Next Steps:</h3>
          <ol>
            <li>Join our Volunteer WhatsApp community: <a href="https://chat.whatsapp.com/CAVi4oKBoyv4b3vo92AKkl?mode=gi_t" style="color:#f97316;">Click here to join</a></li>
            <li>Watch out for orientation details in the group</li>
            <li>Get ready to make history with us!</li>
          </ol>
          <p>Thank you for stepping up to serve. Together, we're opening doors for the next generation.</p>
          <p style="margin-top:30px;">— The NextGen Summit Team</p>
        </div>`
      : `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fff;">
          <h1 style="color:#1f2937;">Hello ${full_name},</h1>
          <p>Thank you for your interest in volunteering for the <strong>NextGen Summit 2026</strong> and for the time you took to apply for the <strong>${position}</strong> role.</p>
          <p>After careful review, we are unable to offer you a volunteer position at this time. We received an overwhelming number of applications and had to make difficult decisions.</p>
          <p>This is by no means a reflection of your value or potential. We deeply appreciate your willingness to serve and encourage you to attend the summit as a participant.</p>
          <p>We hope to cross paths again in future editions.</p>
          <p style="margin-top:30px;">With gratitude,<br/>— The NextGen Summit Team</p>
        </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NextGen Summit <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
