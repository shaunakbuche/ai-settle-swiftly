-- Fix the analytics summary view by removing SECURITY DEFINER
DROP VIEW IF EXISTS public.analytics_summary;

-- Recreate the view without security definer
CREATE VIEW public.analytics_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions
FROM public.analytics_events 
GROUP BY DATE_TRUNC('day', created_at), event_type
ORDER BY date DESC;