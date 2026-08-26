DROP POLICY IF EXISTS "Registered attendees can view profiles" ON public.networking_profiles;
DROP POLICY IF EXISTS "Users can view groups for their own track" ON public.whatsapp_groups;
DROP FUNCTION IF EXISTS public.current_verified_email();

-- Verified email comes straight from the signed JWT (Supabase sets and signs
-- both claims; users cannot forge them).
CREATE POLICY "Registered attendees can view profiles"
ON public.networking_profiles FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.registrations r
    WHERE lower(r.email) = lower(auth.jwt() ->> 'email')
      AND coalesce((auth.jwt() -> 'user_metadata' ->> 'email_verified')::boolean, false)
  )
);

CREATE POLICY "Users can view groups for their own track"
ON public.whatsapp_groups FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.registrations r
    WHERE lower(r.email) = lower(auth.jwt() ->> 'email')
      AND coalesce((auth.jwt() -> 'user_metadata' ->> 'email_verified')::boolean, false)
      AND r.fellowship_track = whatsapp_groups.fellowship_track
  )
);