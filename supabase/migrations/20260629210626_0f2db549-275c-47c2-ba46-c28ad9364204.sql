
CREATE TYPE public.scholarship_status AS ENUM ('pending','shortlisted','accepted','rejected','waitlist');

CREATE TABLE public.scholarship_applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  status public.scholarship_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'career_champions_csv_2026',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX scholarship_applicants_status_idx ON public.scholarship_applicants(status);
CREATE INDEX scholarship_applicants_created_at_idx ON public.scholarship_applicants(created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scholarship_applicants TO authenticated;
GRANT ALL ON public.scholarship_applicants TO service_role;

ALTER TABLE public.scholarship_applicants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view scholarship applicants"
  ON public.scholarship_applicants FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert scholarship applicants"
  ON public.scholarship_applicants FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update scholarship applicants"
  ON public.scholarship_applicants FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete scholarship applicants"
  ON public.scholarship_applicants FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER scholarship_applicants_set_updated_at
  BEFORE UPDATE ON public.scholarship_applicants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
