-- Add trigger to log session join attempts
CREATE TRIGGER session_join_audit_trigger
  AFTER UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_session_join_attempt();

-- Set proper search path for the function
ALTER FUNCTION public.log_session_join_attempt() SET search_path = public, auth;