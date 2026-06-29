ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'selection_team';

CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());