
-- Add course selection and payment fields to registrations
ALTER TABLE public.registrations 
  ADD COLUMN IF NOT EXISTS selected_course text,
  ADD COLUMN IF NOT EXISTS payment_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamp with time zone;

-- Create a table for door opener (sponsor/partner) submissions
CREATE TABLE IF NOT EXISTS public.door_opener_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  partnership_tier text NOT NULL,
  message text,
  amount_paid numeric,
  payment_confirmed boolean NOT NULL DEFAULT false,
  payment_confirmed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.door_opener_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "Anyone can submit door opener form" 
  ON public.door_opener_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- Authenticated users can view
CREATE POLICY "Authenticated users can view submissions" 
  ON public.door_opener_submissions 
  FOR SELECT 
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_door_opener_submissions_updated_at
  BEFORE UPDATE ON public.door_opener_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
