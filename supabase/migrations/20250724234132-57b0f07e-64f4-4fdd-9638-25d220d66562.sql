-- Create analytics table for tracking metrics
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for performance
CREATE INDEX idx_analytics_events_type_date ON public.analytics_events(event_type, created_at);
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_user ON public.analytics_events(user_id);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "System can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all analytics" 
ON public.analytics_events 
FOR SELECT 
USING (true);

-- Create analytics summary view
CREATE OR REPLACE VIEW public.analytics_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions
FROM public.analytics_events 
GROUP BY DATE_TRUNC('day', created_at), event_type
ORDER BY date DESC;