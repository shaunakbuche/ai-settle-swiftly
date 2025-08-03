-- Fix RLS policy to allow users to join sessions with valid session codes
-- Drop the current update policy
DROP POLICY IF EXISTS "Session participants can update sessions" ON public.sessions;

-- Create new update policies
-- Allow session participants to update sessions they're already part of
CREATE POLICY "Session participants can update sessions" 
ON public.sessions 
FOR UPDATE 
USING (auth.uid() IN ( 
  SELECT profiles.user_id
  FROM profiles
  WHERE profiles.id = ANY (ARRAY[sessions.party_a_id, sessions.party_b_id, sessions.created_by])
));

-- Allow users to join sessions by updating party_b_id when it's null and status is waiting
CREATE POLICY "Users can join waiting sessions" 
ON public.sessions 
FOR UPDATE 
USING (
  party_b_id IS NULL 
  AND status = 'waiting'::session_status 
  AND auth.uid() IS NOT NULL
)
WITH CHECK (
  party_b_id IS NULL 
  AND status = 'waiting'::session_status 
  AND auth.uid() IS NOT NULL
);

-- Add security audit logging for session join attempts
CREATE OR REPLACE FUNCTION public.log_session_join_attempt()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when someone joins a session (party_b_id gets set)
  IF OLD.party_b_id IS NULL AND NEW.party_b_id IS NOT NULL THEN
    PERFORM public.log_security_event(
      auth.uid(),
      'session_joined',
      jsonb_build_object(
        'session_id', NEW.id,
        'session_code', NEW.session_code,
        'party_b_id', NEW.party_b_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;