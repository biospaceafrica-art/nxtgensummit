
-- Remove overly permissive SELECT policies
DROP POLICY IF EXISTS "Anyone can view own check-in" ON public.check_ins;
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON public.door_opener_submissions;
DROP POLICY IF EXISTS "Anyone can view own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Authenticated users can view registrations" ON public.registrations;

-- Add admin-only SELECT policies where needed
CREATE POLICY "Admins can view door opener submissions"
  ON public.door_opener_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view registrations"
  ON public.registrations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- admin_tasks: admin-only management
DROP POLICY IF EXISTS "Authenticated users can manage tasks" ON public.admin_tasks;
CREATE POLICY "Admins manage admin tasks"
  ON public.admin_tasks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- email_reminders: admin-only management
DROP POLICY IF EXISTS "Authenticated users can manage reminders" ON public.email_reminders;
CREATE POLICY "Admins manage email reminders"
  ON public.email_reminders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- whatsapp_groups: admin-only management; keep read for authenticated (used by app)
DROP POLICY IF EXISTS "Authenticated users can manage groups" ON public.whatsapp_groups;
CREATE POLICY "Admins manage whatsapp groups"
  ON public.whatsapp_groups FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Revoke EXECUTE on SECURITY DEFINER helper from anon/authenticated (RLS policies still evaluate it)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
