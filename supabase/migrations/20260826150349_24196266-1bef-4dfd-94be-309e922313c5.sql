DROP POLICY IF EXISTS "Anyone can view profiles" ON public.networking_profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.networking_profiles FOR SELECT TO authenticated USING (true);

REVOKE SELECT ON public.networking_profiles FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.networking_profiles TO authenticated;
GRANT ALL ON public.networking_profiles TO service_role;

DROP POLICY IF EXISTS "Anyone can view event gallery images" ON storage.objects;
CREATE POLICY "Admins can list event gallery images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'event-gallery' AND has_role(auth.uid(), 'admin'::app_role));