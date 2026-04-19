import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: apps } = await admin
      .from("volunteer_applications")
      .select("full_name,email,position,created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (!apps || apps.length === 0) {
      return new Response(JSON.stringify({ skipped: "no new apps" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: adminRoles } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    const adminEmails: string[] = [];
    for (const r of adminRoles || []) {
      const { data: u } = await admin.auth.admin.getUserById(r.user_id);
      if (u?.user?.email) adminEmails.push(u.user.email);
    }

    if (adminEmails.length === 0) {
      return new Response(JSON.stringify({ skipped: "no admins" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const positionLabels: Record<string, string> = {
      mass_choir: "Mass Choir",
      ushering: "Ushering",
      transportation: "Transportation & Logistics",
      social_media: "Social Media",
    };

    const rows = apps.map((a: any) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${a.full_name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${a.email}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${positionLabels[a.position] || a.position}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;font-size:11px;color:#666;">${new Date(a.created_at).toLocaleString()}</td>
      </tr>`).join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:20px;background:#fff;">
        <h2 style="color:#f97316;">📋 Volunteer Applications — Daily Digest</h2>
        <p>You received <strong>${apps.length}</strong> new volunteer application(s) in the last 24 hours.</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:16px;">
          <thead>
            <tr style="background:#f3f4f6;text-align:left;">
              <th style="padding:8px;">Name</th>
              <th style="padding:8px;">Email</th>
              <th style="padding:8px;">Position</th>
              <th style="padding:8px;">Applied</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:24px;"><a href="https://nxtgensummit.lovable.app/admin" style="background:#f97316;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">Review in Admin Dashboard</a></p>
        <p style="font-size:11px;color:#999;margin-top:24px;">— NextGen Summit Admin</p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NextGen Summit <onboarding@resend.dev>",
        to: adminEmails,
        subject: `📋 ${apps.length} new volunteer application(s) — Daily Digest`,
        html,
      }),
    });
    const result = await res.json();

    return new Response(JSON.stringify({ success: true, count: apps.length, recipients: adminEmails.length, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
