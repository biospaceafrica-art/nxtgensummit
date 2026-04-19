ALTER TABLE public.volunteer_applications ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

CREATE POLICY "Admins can update volunteers" ON public.volunteer_applications
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));