import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response(JSON.stringify({ isAdmin: false }), { headers: { "Content-Type": "application/json" } });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return new Response(JSON.stringify({ isAdmin: false }), { headers: { "Content-Type": "application/json" } });

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  // Check if using default password (created_at close to last_sign_in)
  const needsPasswordChange = user.user_metadata?.needs_password_change !== false && 
    !user.user_metadata?.password_changed;

  return new Response(JSON.stringify({ 
    isAdmin: !!data, 
    needsPasswordChange 
  }), { headers: { "Content-Type": "application/json" } });
});
