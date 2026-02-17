import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response(JSON.stringify({ isAdmin: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return new Response(JSON.stringify({ isAdmin: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  const needsPasswordChange = user.user_metadata?.needs_password_change !== false && 
    !user.user_metadata?.password_changed;

  return new Response(JSON.stringify({ 
    isAdmin: !!data, 
    needsPasswordChange 
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
