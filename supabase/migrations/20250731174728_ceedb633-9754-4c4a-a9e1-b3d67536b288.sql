-- Add policy to allow users to view sessions by session code when joining
CREATE POLICY "Users can view sessions by session code to join" 
ON public.sessions 
FOR SELECT 
USING (status = 'waiting' AND party_b_id IS NULL);