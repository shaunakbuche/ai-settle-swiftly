import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SignJWT } from "https://deno.land/x/jose@v5.2.0/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const rateLimiter = new Map<string, number[]>();

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;
  
  const requests = rateLimiter.get(clientIP) || [];
  const recentRequests = requests.filter(time => time > now - windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return true;
  }
  
  recentRequests.push(now);
  rateLimiter.set(clientIP, recentRequests);
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(clientIP)) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: corsHeaders,
      });
    }
    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse request
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Fetch session data with profiles
    const { data: sessionData, error: sessionError } = await supabaseService
      .from('sessions')
      .select(`
        *,
        party_a:party_a_id(id, full_name, email),
        party_b:party_b_id(id, full_name, email),
        creator:created_by(id, full_name, email)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      throw new Error(`Failed to fetch session: ${sessionError.message}`);
    }

    // Get DocuSign credentials
    const integrationKey = Deno.env.get("DOCUSIGN_INTEGRATION_KEY");
    const userId = Deno.env.get("DOCUSIGN_USER_ID");
    const accountId = Deno.env.get("DOCUSIGN_ACCOUNT_ID");
    const privateKey = Deno.env.get("DOCUSIGN_PRIVATE_KEY");
    const baseUrl = Deno.env.get("DOCUSIGN_BASE_URL");

    if (!integrationKey || !userId || !accountId || !privateKey || !baseUrl) {
      throw new Error("Missing DocuSign configuration");
    }

    // Generate secure JWT for DocuSign authentication
    const now = Math.floor(Date.now() / 1000);
    
    // Properly format the private key
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    
    // Import the private key
    const keyData = formattedPrivateKey
      .replace(/-----BEGIN [^-]+-----/, '')
      .replace(/-----END [^-]+-----/, '')
      .replace(/\s/g, '');
    
    const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const jwt = await new SignJWT({
      iss: integrationKey,
      sub: userId,
      aud: "account-d.docusign.com",
      scope: "signature impersonation"
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + 3600) // 1 hour
      .sign(cryptoKey);

    // Get DocuSign access token
    const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get DocuSign access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Create settlement document HTML
    const settlementHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Settlement Agreement</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin: 20px 0; }
          .signature-section { margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SETTLEMENT AGREEMENT</h1>
          <p>Session Code: ${sessionData.session_code}</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <h2>Parties</h2>
          <p><strong>Party A:</strong> ${sessionData.party_a?.full_name}</p>
          <p><strong>Party B:</strong> ${sessionData.party_b?.full_name}</p>
        </div>
        
        <div class="section">
          <h2>Dispute Description</h2>
          <p>${(sessionData.dispute_description || 'N/A').replace(/[<>'"&]/g, (match) => {
            const map: { [key: string]: string } = {
              '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;'
            };
            return map[match];
          })}</p>
        </div>
        
        <div class="section">
          <h2>Settlement Terms</h2>
          <p>${(sessionData.settlement_terms || 'Terms to be finalized upon signing.').replace(/[<>'"&]/g, (match) => {
            const map: { [key: string]: string } = {
              '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;'
            };
            return map[match];
          })}</p>
        </div>
        
        ${sessionData.settlement_amount ? `
        <div class="section">
          <h2>Settlement Amount</h2>
          <p>$${sessionData.settlement_amount}</p>
        </div>
        ` : ''}
        
        <div class="signature-section">
          <p>By signing below, both parties agree to the terms outlined in this settlement agreement.</p>
          
          <div style="margin-top: 40px;">
            <p><strong>Party A Signature:</strong></p>
            <div style="border-bottom: 1px solid #000; width: 300px; height: 30px; margin: 10px 0;"></div>
            <p>Name: ${sessionData.party_a?.full_name}</p>
            <p>Date: _________________</p>
          </div>
          
          <div style="margin-top: 40px;">
            <p><strong>Party B Signature:</strong></p>
            <div style="border-bottom: 1px solid #000; width: 300px; height: 30px; margin: 10px 0;"></div>
            <p>Name: ${sessionData.party_b?.full_name}</p>
            <p>Date: _________________</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Convert HTML to base64
    const documentBase64 = btoa(settlementHtml);

    // Create DocuSign envelope
    const envelopeDefinition = {
      emailSubject: `Settlement Agreement - Session ${sessionData.session_code}`,
      status: "sent",
      documents: [{
        documentBase64,
        name: `Settlement_Agreement_${sessionData.session_code}.html`,
        fileExtension: "html",
        documentId: "1"
      }],
      recipients: {
        signers: [
          {
            email: sessionData.party_a?.email,
            name: sessionData.party_a?.full_name,
            recipientId: "1",
            tabs: {
              signHereTabs: [{
                documentId: "1",
                pageNumber: "1",
                xPosition: "100",
                yPosition: "400"
              }]
            }
          },
          {
            email: sessionData.party_b?.email,
            name: sessionData.party_b?.full_name,
            recipientId: "2",
            tabs: {
              signHereTabs: [{
                documentId: "1",
                pageNumber: "1",
                xPosition: "100",
                yPosition: "500"
              }]
            }
          }
        ]
      }
    };

    // Create envelope in DocuSign
    const envelopeResponse = await fetch(`${baseUrl}/restapi/v2.1/accounts/${accountId}/envelopes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(envelopeDefinition)
    });

    if (!envelopeResponse.ok) {
      const errorText = await envelopeResponse.text();
      console.error('DocuSign envelope creation failed:', errorText);
      throw new Error('Failed to create DocuSign envelope');
    }

    const envelopeData = await envelopeResponse.json();

    // Store envelope info in database
    const { error: insertError } = await supabaseService
      .from('docusign_envelopes')
      .insert({
        session_id: sessionId,
        envelope_id: envelopeData.envelopeId,
        status: 'sent'
      });

    if (insertError) {
      console.error('Failed to store envelope info:', insertError);
    }

    console.log('DocuSign envelope created successfully for session:', sessionId);

    return new Response(
      JSON.stringify({
        success: true,
        envelopeId: envelopeData.envelopeId,
        message: 'Settlement agreement sent for signature'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('DocuSign envelope creation failed:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return sanitized error message
    const sanitizedMessage = 'Failed to create settlement agreement';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: sanitizedMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});