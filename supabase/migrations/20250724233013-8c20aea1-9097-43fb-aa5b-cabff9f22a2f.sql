-- Create table to track DocuSign envelopes
CREATE TABLE public.docusign_envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  envelope_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  party_a_signed BOOLEAN DEFAULT FALSE,
  party_b_signed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.docusign_envelopes ENABLE ROW LEVEL SECURITY;

-- Create policies for DocuSign envelopes
CREATE POLICY "Users can view envelopes for their sessions" 
ON public.docusign_envelopes 
FOR SELECT 
USING (session_id IN (
  SELECT id FROM public.sessions 
  WHERE auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE id = ANY(ARRAY[party_a_id, party_b_id, created_by])
  )
));

CREATE POLICY "System can insert envelopes" 
ON public.docusign_envelopes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update envelopes" 
ON public.docusign_envelopes 
FOR UPDATE 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_docusign_envelopes_updated_at
BEFORE UPDATE ON public.docusign_envelopes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();