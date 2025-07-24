import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
    
    console.log('DocuSign webhook received:', JSON.stringify(webhookData, null, 2));

    // Extract envelope information
    const envelopeId = webhookData.data?.envelopeId;
    const status = webhookData.event;
    
    if (!envelopeId) {
      throw new Error("Envelope ID not found in webhook data");
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
    console.error('DocuSign webhook error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process webhook' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});