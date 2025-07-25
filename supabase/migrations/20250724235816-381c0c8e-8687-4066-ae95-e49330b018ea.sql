-- Drop the security definer view and recreate it properly
DROP VIEW IF EXISTS public.analytics_summary;

-- Create the analytics_summary view without SECURITY DEFINER
CREATE VIEW public.analytics_summary AS
SELECT 
  date_trunc('day', created_at) AS date,
  event_type,
  count(*) AS event_count,
  count(DISTINCT user_id) AS unique_users,
  count(DISTINCT session_id) AS unique_sessions
FROM public.analytics_events
GROUP BY date_trunc('day', created_at), event_type
ORDER BY date_trunc('day', created_at) DESC;

-- Enable RLS on analytics_events table if not already enabled
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for analytics access (users can only see their own events)
CREATE POLICY "Users can view their own analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create a secure promo codes table for better promo code management
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  usage_limit INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on promo codes table
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for promo codes (allow reading active codes)
CREATE POLICY "Anyone can view active promo codes" 
ON public.promo_codes 
FOR SELECT 
USING (active = true AND (expires_at IS NULL OR expires_at > now()));

-- Insert the existing FIRST25 promo code
INSERT INTO public.promo_codes (code, discount_percentage, usage_limit, expires_at, active)
VALUES ('FIRST25', 50, 100, now() + interval '1 year', true)
ON CONFLICT (code) DO NOTHING;

-- Create trigger for promo codes updated_at
CREATE TRIGGER update_promo_codes_updated_at
BEFORE UPDATE ON public.promo_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();