-- Phase 1: Fix Critical RBAC Vulnerability
-- Remove the dangerous policy that allows self-role assignment
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Create a secure policy that only allows the bootstrap function or existing admins to assign roles
CREATE POLICY "Only system can assign roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  -- Allow the bootstrap function (when no admin exists yet)
  NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::public.app_role)
  OR 
  -- Allow existing admins to assign roles
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Add a constraint to prevent multiple admin role assignments to same user
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_unique_user_role UNIQUE (user_id, role);

-- Phase 2: Fix Analytics Security
-- Update analytics events policy to prevent unrestricted null user_id insertions
DROP POLICY IF EXISTS "System can insert analytics events" ON public.analytics_events;

CREATE POLICY "Controlled analytics insertion" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (
  -- Authenticated users can insert with their own user_id
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- System operations (null user_id) only allowed for specific event types
  (user_id IS NULL AND event_type IN ('page_view', 'system_event', 'error_tracking'))
);

-- Phase 3: Add Input Validation Constraints
-- Add length constraints to prevent excessive input
ALTER TABLE public.sessions 
ADD CONSTRAINT session_title_length CHECK (length(title) <= 200);

ALTER TABLE public.sessions 
ADD CONSTRAINT session_description_length CHECK (length(dispute_description) <= 2000);

ALTER TABLE public.sessions 
ADD CONSTRAINT session_terms_length CHECK (length(settlement_terms) <= 5000);

ALTER TABLE public.messages 
ADD CONSTRAINT message_content_length CHECK (length(content) <= 5000);

ALTER TABLE public.profiles 
ADD CONSTRAINT profile_name_length CHECK (length(full_name) <= 100);

-- Phase 4: Add Security Audit Logging
-- Create a table to track security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  _user_id UUID,
  _event_type TEXT,
  _event_details JSONB DEFAULT '{}',
  _ip_address INET DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.security_audit_log (user_id, event_type, event_details, ip_address, user_agent)
  VALUES (_user_id, _event_type, _event_details, _ip_address, _user_agent);
END;
$$;

-- Create function for server-side rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- email, user_id, or IP
  action_type TEXT NOT NULL, -- 'password_reset', 'login_attempt', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on rate limit log
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- System can manage rate limiting
CREATE POLICY "System can manage rate limits" 
ON public.rate_limit_log 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _identifier TEXT,
  _action_type TEXT,
  _max_attempts INTEGER DEFAULT 5,
  _window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Clean old entries
  DELETE FROM public.rate_limit_log 
  WHERE created_at < (now() - (_window_minutes || ' minutes')::INTERVAL);
  
  -- Count recent attempts
  SELECT COUNT(*) INTO attempt_count
  FROM public.rate_limit_log
  WHERE identifier = _identifier 
    AND action_type = _action_type
    AND created_at > (now() - (_window_minutes || ' minutes')::INTERVAL);
  
  -- If under limit, log this attempt and allow
  IF attempt_count < _max_attempts THEN
    INSERT INTO public.rate_limit_log (identifier, action_type)
    VALUES (_identifier, _action_type);
    RETURN true;
  END IF;
  
  -- Over limit, deny
  RETURN false;
END;
$$;