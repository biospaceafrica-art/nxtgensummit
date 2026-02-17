
-- Create event_gallery table
CREATE TABLE public.event_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_year INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_gallery ENABLE ROW LEVEL SECURITY;

-- Anyone can view gallery
CREATE POLICY "Anyone can view gallery"
ON public.event_gallery FOR SELECT
USING (true);

-- Only admins can manage gallery
CREATE POLICY "Admins can manage gallery"
ON public.event_gallery FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update registrations (payment confirmation)
CREATE POLICY "Admins can update registrations"
ON public.registrations FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update door opener submissions
CREATE POLICY "Admins can update door openers"
ON public.door_opener_submissions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public) VALUES ('event-gallery', 'event-gallery', true);

-- Storage policies
CREATE POLICY "Anyone can view event gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-gallery');

CREATE POLICY "Admins can upload event gallery images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete event gallery images"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-gallery' AND public.has_role(auth.uid(), 'admin'));
