-- Link registrations to real auth accounts instead of matching on email strings.
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS user_id uuid;

UPDATE public.registrations r
SET user_id = u.id
FROM auth.users u
WHERE r.user_id IS NULL
  AND lower(u.email) = lower(r.email);

CREATE INDEX IF NOT EXISTS registrations_user_id_idx ON public.registrations(user_id);

DROP POLICY IF EXISTS "Registered attendees can view profiles" ON public.networking_profiles;
DROP POLICY IF EXISTS "Users can view groups for their own track" ON public.whatsapp_groups;

CREATE POLICY "Registered attendees can view profiles"
ON public.networking_profiles FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.registrations r
    WHERE r.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view groups for their own track"
ON public.whatsapp_groups FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.registrations r
    WHERE r.user_id = auth.uid()
      AND r.fellowship_track = whatsapp_groups.fellowship_track
  )
);

-- Keep new registrations linked to the account that creates them.
CREATE OR REPLACE FUNCTION public.set_registration_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS registrations_set_user_id ON public.registrations;
CREATE TRIGGER registrations_set_user_id
BEFORE INSERT ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.set_registration_user_id();