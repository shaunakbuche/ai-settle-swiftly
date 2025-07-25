import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const requests = new Map<string, number[]>();

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 30; // 30 requests per minute for webhooks
  
  const userRequests = requests.get(clientIP) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return true;
  }
  
  recentRequests.push(now);
  requests.set(clientIP, recentRequests);
  return false;
}

// Input validation for webhook data
function validateWebhookData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!data.data || !data.event) return false;
  if (typeof data.event !== 'string') return false;
  if (data.event.length > 100) return false;
  
  return true;
}

// Secure error response
function createSecureErrorResponse(error: unknown, statusCode: number = 500): Response {
  console.error('DocuSign webhook error:', error);
  
  const sanitizedMessage = 'Webhook processing failed';
    
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: sanitizedMessage 
    }),
    {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  if (isRateLimited(clientIP)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse DocuSign webhook data
    const webhookData = await req.json();
    
    // Validate webhook data
    if (!validateWebhookData(webhookData)) {
      return createSecureErrorResponse(new Error('Invalid webhook data'), 400);
    }
    
    console.log('DocuSign webhook received - Event:', webhookData.event);

    // Extract envelope information
    const envelopeId = webhookData.data?.envelopeId;
    const status = webhookData.event;
    
    if (!envelopeId || typeof envelopeId !== 'string' || envelopeId.length > 100) {
      return createSecureErrorResponse(new Error("Invalid envelope ID"), 400);
    }

    // Update envelope status in database
    const { data: envelope, error: fetchError } = await supabaseService
      .from('docusign_envelopes')
      .select('*')
      .eq('envelope_id', envelopeId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch envelope:', fetchError);
      throw new Error(`Failed to fetch envelope: ${fetchError.message}`);
    }

    // Handle different webhook events
    let updateData: any = { status };

    switch (status) {
      case 'envelope-completed':
        updateData = {
          ...updateData,
          party_a_signed: true,
          party_b_signed: true,
          completed_at: new Date().toISOString()
        };
        
        // Update session status to completed
        await supabaseService
          .from('sessions')
          .update({ status: 'completed', is_settled: true })
          .eq('id', envelope.session_id);
        break;
        
      case 'recipient-completed':
        // Check which recipient signed
        const recipientData = webhookData.data;
        if (recipientData?.recipientId === "1") {
          updateData.party_a_signed = true;
        } else if (recipientData?.recipientId === "2") {
          updateData.party_b_signed = true;
        }
        break;
        
      case 'envelope-declined':
      case 'envelope-voided':
        updateData.status = 'failed';
        break;
    }

    // Update envelope in database
    const { error: updateError } = await supabaseService
      .from('docusign_envelopes')
      .update(updateData)
      .eq('envelope_id', envelopeId);

    if (updateError) {
      console.error('Failed to update envelope:', updateError);
      throw new Error(`Failed to update envelope: ${updateError.message}`);
    }

    console.log(`Envelope ${envelopeId} updated with status: ${status}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    return createSecureErrorResponse(error);
  }
});