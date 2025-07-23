-- Create enum types for session status and user roles
CREATE TYPE session_status AS ENUM ('waiting', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE party_role AS ENUM ('party_a', 'party_b', 'mediator');
CREATE TYPE message_type AS ENUM ('text', 'system', 'ai_response', 'settlement_proposal');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  dispute_description TEXT,
  status session_status NOT NULL DEFAULT 'waiting',
  party_a_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  party_b_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  current_party party_role DEFAULT 'party_a',
  settlement_amount DECIMAL(10,2),
  settlement_terms TEXT,
  is_settled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_role party_role,
  content TEXT NOT NULL,
  message_type message_type DEFAULT 'text',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for sessions
CREATE POLICY "Users can view sessions they participate in" ON public.sessions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.profiles WHERE id IN (party_a_id, party_b_id, created_by)
    )
  );

CREATE POLICY "Users can create sessions" ON public.sessions
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.profiles WHERE id = created_by
    )
  );

CREATE POLICY "Session participants can update sessions" ON public.sessions
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.profiles WHERE id IN (party_a_id, party_b_id, created_by)
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their sessions" ON public.messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.sessions 
      WHERE auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id IN (party_a_id, party_b_id, created_by)
      )
    )
  );

CREATE POLICY "Users can insert messages in their sessions" ON public.messages
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM public.sessions 
      WHERE auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id IN (party_a_id, party_b_id, created_by)
      )
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_sessions_code ON public.sessions(session_code);
CREATE INDEX idx_sessions_participants ON public.sessions(party_a_id, party_b_id);
CREATE INDEX idx_messages_session ON public.messages(session_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Enable realtime for live chat
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.sessions REPLICA IDENTITY FULL;