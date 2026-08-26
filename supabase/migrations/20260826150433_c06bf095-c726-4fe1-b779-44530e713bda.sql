-- Only registered attendees (or admins) can browse the networking directory
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.networking_profiles;
CREATE POLICY "Registered attendees can view profiles"
ON public.networking_profiles FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.registrations r
    WHERE lower(r.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

-- WhatsApp invite links only for the user's own fellowship track
DROP POLICY IF EXISTS "Authenticated users can view groups" ON public.whatsapp_groups;
CREATE POLICY "Users can view groups for their own track"
ON public.whatsapp_groups FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.registrations r
    WHERE lower(r.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      AND r.fellowship_track = whatsapp_groups.fellowship_track
  )
);