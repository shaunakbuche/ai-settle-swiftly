import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { email } = await req.json();
    
    // Input validation
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check rate limiting using the new database function
    const { data: rateLimitOk, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        _identifier: email,
        _action_type: 'password_reset',
        _max_attempts: 3,
        _window_minutes: 15
      });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!rateLimitOk) {
      // Log security event
      await supabase.rpc('log_security_event', {
        _user_id: null,
        _event_type: 'password_reset_rate_limit_exceeded',
        _event_details: { email, ip: req.headers.get('cf-connecting-ip') || 'unknown' }
      });

      return new Response(
        JSON.stringify({ 
          error: 'Too many password reset attempts. Please try again in 15 minutes.' 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Attempt password reset
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.get('origin') || 'https://gffhkotvbwcsvchfieoa.supabase.co'}/auth?tab=reset-password`,
    });

    // Log security event (successful reset attempt)
    await supabase.rpc('log_security_event', {
      _user_id: null,
      _event_type: 'password_reset_requested',
      _event_details: { 
        email, 
        ip: req.headers.get('cf-connecting-ip') || 'unknown',
        success: !resetError
      }
    });

    if (resetError) {
      console.error('Password reset error:', resetError);
      // Don't reveal whether email exists or not
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'If your email is registered, you will receive reset instructions.' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'If your email is registered, you will receive reset instructions.' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Secure password reset error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});