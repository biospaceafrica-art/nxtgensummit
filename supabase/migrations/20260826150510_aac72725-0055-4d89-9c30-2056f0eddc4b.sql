-- Resolve the caller's email from auth.users by auth.uid(), only when confirmed.
CREATE OR REPLACE FUNCTION public.current_verified_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT lower(u.email)
  FROM auth.users u
  WHERE u.id = auth.uid()
    AND u.email_confirmed_at IS NOT NULL
$$;

REVOKE ALL ON FUNCTION public.current_verified_email() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_verified_email() TO authenticated, service_role;

DROP POLICY IF EXISTS "Registered attendees can view profiles" ON public.networking_profiles;
CREATE POLICY "Registered attendees can view profiles"
ON public.networking_profiles FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.registrations r
    WHERE lower(r.email) = public.current_verified_email()
  )
);

DROP POLICY IF EXISTS "Users can view groups for their own track" ON public.whatsapp_groups;
CREATE POLICY "Users can view groups for their own track"
ON public.whatsapp_groups FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.registrations r
    WHERE lower(r.email) = public.current_verified_email()
      AND r.fellowship_track = whatsapp_groups.fellowship_track
  )
);