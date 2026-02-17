
-- Fellowship track enum
CREATE TYPE public.fellowship_track AS ENUM ('career', 'enterprise');

-- Current status enum
CREATE TYPE public.attendee_status AS ENUM ('employed', 'unemployed', 'corp_member', 'student');

-- Registrations table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  fellowship_track fellowship_track NOT NULL,
  current_status attendee_status NOT NULL,
  whatsapp_group_assigned TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Public can insert (register)
CREATE POLICY "Anyone can register" ON public.registrations FOR INSERT WITH CHECK (true);
-- Only authenticated admins read registrations (we'll use service role in edge functions)
CREATE POLICY "Authenticated users can view registrations" ON public.registrations FOR SELECT TO authenticated USING (true);

-- WhatsApp groups table
CREATE TABLE public.whatsapp_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fellowship_track fellowship_track NOT NULL,
  group_name TEXT NOT NULL,
  invite_link TEXT,
  member_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.whatsapp_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view groups" ON public.whatsapp_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage groups" ON public.whatsapp_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Email reminders table
CREATE TABLE public.email_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('weekly', 'daily')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage reminders" ON public.email_reminders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Admin tasks table
CREATE TABLE public.admin_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage tasks" ON public.admin_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_tasks_updated_at BEFORE UPDATE ON public.admin_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
