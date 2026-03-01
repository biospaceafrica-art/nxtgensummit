
-- Volunteer applications table
CREATE TABLE public.volunteer_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  experience TEXT,
  why_volunteer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a volunteer application
CREATE POLICY "Anyone can submit volunteer application"
  ON public.volunteer_applications
  FOR INSERT
  WITH CHECK (true);

-- Admins can view volunteer applications
CREATE POLICY "Admins can view volunteers"
  ON public.volunteer_applications
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Networking profiles table
CREATE TABLE public.networking_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  organization TEXT,
  bio TEXT,
  photo_url TEXT,
  searchable_text TEXT GENERATED ALWAYS AS (lower(full_name) || ' ' || lower(coalesce(organization, '')) || ' ' || lower(coalesce(bio, ''))) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.networking_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON public.networking_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.networking_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.networking_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Connection requests table
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON public.connections
  FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send connection requests"
  ON public.connections
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Recipients can update connections"
  ON public.connections
  FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON public.messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
