CREATE POLICY "Selection team can view scholarship applicants"
  ON public.scholarship_applicants
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'selection_team'::app_role));

CREATE POLICY "Selection team can update scholarship applicants"
  ON public.scholarship_applicants
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'selection_team'::app_role))
  WITH CHECK (has_role(auth.uid(), 'selection_team'::app_role));

CREATE OR REPLACE FUNCTION public.restrict_scholarship_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF public.has_role(auth.uid(), 'selection_team'::app_role) THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.full_name IS DISTINCT FROM OLD.full_name
       OR NEW.phone IS DISTINCT FROM OLD.phone
       OR NEW.source IS DISTINCT FROM OLD.source
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Selection team members can only change status, notes, and review metadata';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Not authorized to update scholarship_applicants';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.restrict_scholarship_updates() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS scholarship_applicants_restrict_columns ON public.scholarship_applicants;
CREATE TRIGGER scholarship_applicants_restrict_columns
  BEFORE UPDATE ON public.scholarship_applicants
  FOR EACH ROW EXECUTE FUNCTION public.restrict_scholarship_updates();