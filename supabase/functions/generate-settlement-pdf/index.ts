
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting
const requests = new Map<string, number[]>();

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10; // 10 requests per minute
  
  const userRequests = requests.get(clientIP) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return true;
  }
  
  recentRequests.push(now);
  requests.set(clientIP, recentRequests);
  return false;
}

// Input validation
function validateInput(input: unknown, maxLength: number = 1000): boolean {
  if (typeof input !== 'string') return false;
  if (input.length > maxLength) return false;
  if (input.trim().length === 0) return false;
  
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}

// Sanitize HTML content
function sanitizeHTML(dirty: string): string {
  return dirty.replace(/[<>'"&]/g, (match) => {
    const map: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;',
    };
    return map[match];
  });
}

// Secure error response
function createSecureErrorResponse(error: unknown, statusCode: number = 500): Response {
  console.error('Settlement PDF generation error:', error);
  
  const sanitizedMessage = error instanceof Error 
    ? 'Failed to generate settlement document'
    : 'Internal server error';
    
  return new Response(
    JSON.stringify({ error: sanitizedMessage }),
    {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.json();
    const { sessionId } = body;

    // Validate input
    if (!validateInput(sessionId, 36)) {
      return createSecureErrorResponse(new Error('Invalid session ID'), 400);
    }

    // Fetch session data
    const { data: session, error: sessionError } = await supabaseClient
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error("Session not found");
    }

    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
      .in('id', [session.party_a_id, session.party_b_id].filter(Boolean));

    if (profilesError) {
      throw new Error("Failed to fetch profiles");
    }

    const partyA = profiles.find(p => p.id === session.party_a_id);
    const partyB = profiles.find(p => p.id === session.party_b_id);

    // Generate settlement document HTML
    const settlementHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Settlement Agreement</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; }
          .parties { margin: 20px 0; }
          .terms { margin: 20px 0; }
          .signature { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; }
          .signature-line { margin: 20px 0; border-bottom: 1px solid #000; width: 300px; height: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SETTLEMENT AGREEMENT</h1>
          <p>Session: ${session.session_code}</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="parties">
          <h2>PARTIES</h2>
          <p><strong>Party A:</strong> ${sanitizeHTML(partyA?.full_name || 'Unknown')}</p>
          <p><strong>Party B:</strong> ${sanitizeHTML(partyB?.full_name || 'Unknown')}</p>
        </div>

        <div class="terms">
          <h2>DISPUTE DESCRIPTION</h2>
          <p>${sanitizeHTML(session.dispute_description || 'No description provided')}</p>
          
          <h2>SETTLEMENT TERMS</h2>
          <p>${sanitizeHTML(session.settlement_terms || 'Settlement terms to be added.')}</p>
          
          ${session.settlement_amount ? `
          <h2>SETTLEMENT AMOUNT</h2>
          <p>$${sanitizeHTML(session.settlement_amount.toString())}</p>
          ` : ''}
        </div>

        <div class="signature">
          <h2>SIGNATURES</h2>
          <p>By signing below, both parties agree to the terms of this settlement.</p>
          
          <div style="display: flex; justify-content: space-between; margin-top: 40px;">
            <div>
              <div class="signature-line"></div>
              <p><strong>${sanitizeHTML(partyA?.full_name || 'Party A')}</strong></p>
              <p>Date: _____________</p>
            </div>
            
            <div>
              <div class="signature-line"></div>
              <p><strong>${sanitizeHTML(partyB?.full_name || 'Party B')}</strong></p>
              <p>Date: _____________</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return new Response(JSON.stringify({ 
      html: settlementHtml,
      filename: `settlement-${sanitizeHTML(session.session_code)}.html`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return createSecureErrorResponse(error);
  }
});
