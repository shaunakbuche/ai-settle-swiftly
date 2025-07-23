
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, action, messages } = await req.json();
    console.log('AI mediator request:', { sessionId, action, messages: messages?.length });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Fetch session details
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      throw new Error('Session not found');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'summary':
        systemPrompt = `You are an AI mediator for AccordNow. Your role is to analyze dispute conversations and provide neutral, helpful summaries.

        Key responsibilities:
        - Remain completely neutral and unbiased
        - Identify key issues and concerns from both parties
        - Highlight areas of potential agreement
        - Suggest constructive next steps
        - Use professional, calming language
        - Focus on resolution, not blame`;

        userPrompt = `Please analyze this mediation session and provide a helpful summary.

        Dispute Title: ${session.title}
        Dispute Description: ${session.dispute_description}
        
        Recent conversation (${messages?.length || 0} messages):
        ${messages?.map((msg: any) => `${msg.sender_role}: ${msg.content}`).join('\n') || 'No messages yet'}
        
        Provide a concise summary focusing on:
        1. Current status and main issues
        2. Each party's key concerns
        3. Potential areas of agreement
        4. Recommended next steps for resolution`;
        break;

      case 'settlement_suggestion':
        systemPrompt = `You are an AI mediator specializing in settlement negotiations. Your role is to propose fair, balanced settlement solutions based on the dispute context and conversation.

        Guidelines:
        - Propose specific, actionable settlement terms
        - Consider both parties' interests and concerns
        - Be realistic about outcomes
        - Focus on mutual benefit
        - Include clear next steps for implementation`;

        userPrompt = `Based on this mediation session, suggest a fair settlement proposal.

        Dispute: ${session.title}
        Context: ${session.dispute_description}
        
        Conversation history:
        ${messages?.map((msg: any) => `${msg.sender_role}: ${msg.content}`).join('\n') || 'No conversation yet'}
        
        Please provide:
        1. A specific settlement proposal
        2. Rationale for the proposal
        3. Benefits for both parties
        4. Implementation steps`;
        break;

      case 'progress_analysis':
        systemPrompt = `You are an AI mediator analyzing mediation progress. Evaluate the conversation flow and provide insights on the mediation's advancement toward resolution.`;

        userPrompt = `Analyze the progress of this mediation session:

        Dispute: ${session.title}
        Messages: ${messages?.length || 0}
        
        Recent conversation:
        ${messages?.slice(-10).map((msg: any) => `${msg.sender_role}: ${msg.content}`).join('\n') || 'No recent messages'}
        
        Assess:
        1. Current progress level (1-10)
        2. Cooperation level between parties
        3. Remaining obstacles
        4. Recommended interventions`;
        break;

      default:
        throw new Error('Invalid action');
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const aiResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${aiResponse.error?.message || 'Unknown error'}`);
    }

    const aiMessage = aiResponse.choices[0].message.content;
    console.log('AI response generated successfully');

    // Store AI response as a message in the session
    await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        sender_role: 'mediator',
        content: aiMessage,
        message_type: 'ai_response',
      });

    return new Response(JSON.stringify({ 
      success: true, 
      response: aiMessage,
      action 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI mediator error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
