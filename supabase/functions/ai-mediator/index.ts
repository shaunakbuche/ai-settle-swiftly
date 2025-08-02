import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting
const rateLimiter = new Map<string, number[]>();

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 30; // 30 requests per minute for AI calls
  
  const requests = rateLimiter.get(clientIP) || [];
  const recentRequests = requests.filter(time => time > now - windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return true;
  }
  
  recentRequests.push(now);
  rateLimiter.set(clientIP, recentRequests);
  return false;
}

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

function sanitizeText(text: string): string {
  return text.replace(/[<>'"&]/g, (match) => {
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

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Legal settlement templates for different dispute types
const LEGAL_TEMPLATES = {
  contract: {
    name: "Contract Dispute Settlement",
    structure: `
## SETTLEMENT AGREEMENT

**PARTIES:** [Party A Name] and [Party B Name]
**DATE:** [Current Date]
**MATTER:** Contract Dispute - [Dispute Title]

### RECITALS
WHEREAS, the parties entered into a contract on [Contract Date];
WHEREAS, a dispute arose regarding [Brief Description];
WHEREAS, the parties desire to resolve this matter amicably;

### TERMS OF SETTLEMENT
1. **Performance Obligations:** [Specific actions required]
2. **Payment Terms:** [Monetary settlements if any]
3. **Timeline:** [Deadlines for compliance]
4. **Release of Claims:** Both parties release all claims related to this dispute
5. **Confidentiality:** Terms shall remain confidential
6. **Enforcement:** Agreement shall be binding and enforceable

### SIGNATURES
Party A: _________________ Date: _______
Party B: _________________ Date: _______`
  },
  
  financial: {
    name: "Financial Dispute Settlement",
    structure: `
## FINANCIAL SETTLEMENT AGREEMENT

**CREDITOR:** [Party A Name]
**DEBTOR:** [Party B Name]
**ORIGINAL AMOUNT:** $[Amount]
**SETTLEMENT AMOUNT:** $[Settlement Amount]

### PAYMENT TERMS
1. **Total Settlement:** $[Amount] to be paid as follows:
2. **Payment Schedule:** [Installment details]
3. **Late Payment:** [Penalty terms]
4. **Default Provisions:** [Consequences of non-payment]

### MUTUAL RELEASES
Upon full payment, creditor releases all claims against debtor.

### ENFORCEMENT
This agreement may be entered as a judgment upon default.`
  },
  
  service: {
    name: "Service Dispute Settlement", 
    structure: `
## SERVICE DISPUTE RESOLUTION AGREEMENT

**SERVICE PROVIDER:** [Party A Name]
**CLIENT:** [Party B Name]
**SERVICE TYPE:** [Description]

### RESOLUTION TERMS
1. **Service Completion:** [Remaining obligations]
2. **Quality Standards:** [Acceptance criteria]
3. **Compensation:** [Payment adjustments]
4. **Future Services:** [Ongoing relationship terms]

### SATISFACTION OF CLAIMS
Both parties acknowledge satisfaction of all claims upon completion.`
  },
  
  property: {
    name: "Property Dispute Settlement",
    structure: `
## PROPERTY DISPUTE SETTLEMENT AGREEMENT

**PROPERTY:** [Property Description/Address]
**PARTIES:** [Party Names and Roles]

### PROPERTY RESOLUTION
1. **Ownership/Use Rights:** [Clarification of rights]
2. **Maintenance Obligations:** [Responsibility allocation]
3. **Financial Obligations:** [Cost sharing]
4. **Access Rights:** [Usage permissions]

### RECORDING
This agreement shall be recorded with appropriate authorities if applicable.`
  }
};

// Enhanced legal clause library
const LEGAL_CLAUSES = {
  confidentiality: "The parties agree that the terms of this settlement and the underlying dispute shall remain strictly confidential, except as required by law or for enforcement purposes.",
  
  nonAdmission: "This settlement shall not be construed as an admission of liability, wrongdoing, or fault by any party.",
  
  entireAgreement: "This agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to this dispute.",
  
  modification: "This agreement may only be modified in writing, signed by both parties.",
  
  governingLaw: "This agreement shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to conflict of law principles.",
  
  severability: "If any provision of this agreement is deemed invalid or unenforceable, the remaining provisions shall remain in full force and effect.",
  
  enforceability: "The parties agree that this settlement agreement is binding and enforceable, and may be entered as a judgment by any court of competent jurisdiction.",
  
  compliance: "Time is of the essence in this agreement. Failure to comply with any term within the specified timeframe shall constitute a material breach."
};

function detectDisputeType(title: string, description: string): keyof typeof LEGAL_TEMPLATES {
  const content = (title + ' ' + description).toLowerCase();
  
  if (content.includes('contract') || content.includes('agreement') || content.includes('breach')) {
    return 'contract';
  }
  if (content.includes('money') || content.includes('payment') || content.includes('debt') || content.includes('financial')) {
    return 'financial';
  }
  if (content.includes('service') || content.includes('work') || content.includes('delivery')) {
    return 'service';
  }
  if (content.includes('property') || content.includes('real estate') || content.includes('land')) {
    return 'property';
  }
  
  return 'contract'; // Default fallback
}

function generateLegalSettlement(disputeType: keyof typeof LEGAL_TEMPLATES, sessionData: any, aiSuggestion: string) {
  const template = LEGAL_TEMPLATES[disputeType];
  
  // Extract key information from AI suggestion
  const hasMonetaryTerms = /\$[\d,]+/.test(aiSuggestion);
  const hasTimeline = /within|by|deadline|days|weeks|months/.test(aiSuggestion.toLowerCase());
  
  let legalSettlement = `# ${template.name}

**Case Reference:** Session ${sessionData.session_code}
**Date:** ${new Date().toLocaleDateString()}
**Parties:** Party A and Party B
**Matter:** ${sessionData.title}

## BACKGROUND
${sessionData.dispute_description}

## AI MEDIATION RECOMMENDATION
${aiSuggestion}

## FORMAL SETTLEMENT TERMS

${template.structure}

## ADDITIONAL PROVISIONS

**Confidentiality:** ${LEGAL_CLAUSES.confidentiality}

**Non-Admission:** ${LEGAL_CLAUSES.nonAdmission}

**Entire Agreement:** ${LEGAL_CLAUSES.entireAgreement}

**Governing Law:** ${LEGAL_CLAUSES.governingLaw}

**Severability:** ${LEGAL_CLAUSES.severability}

**Enforceability:** ${LEGAL_CLAUSES.enforceability}

${hasTimeline ? `**Time is of the Essence:** ${LEGAL_CLAUSES.compliance}` : ''}

## EXECUTION
This agreement becomes effective upon execution by both parties and payment of any applicable settlement fees.

**PARTY A SIGNATURE:** ___________________________ DATE: __________

**PARTY B SIGNATURE:** ___________________________ DATE: __________

---
*This settlement agreement was generated through AI-assisted mediation via AccordNow platform. Both parties should consult with independent legal counsel before signing.*`;

  return legalSettlement;
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
    const { sessionId, action, messages } = await req.json();
    console.log('AI mediator request received:', {
      sessionId,
      action: action || 'undefined',
      messageCount: messages?.length || 0,
    });
    
    // Validate inputs
    if (!sessionId || !validateInput(sessionId, 100)) {
      throw new Error("Invalid session ID");
    }
    
    if (!action || !validateInput(action, 50)) {
      throw new Error("Invalid action");
    }
    
    // Validate and sanitize messages if provided
    if (messages && Array.isArray(messages)) {
      messages.forEach((msg: any) => {
        if (msg.content && !validateInput(msg.content, 2000)) {
          throw new Error("Invalid message content");
        }
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Fetch session details with profiles
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        party_a:party_a_id(full_name),
        party_b:party_b_id(full_name)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      throw new Error('Session not found');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'summary':
        systemPrompt = `You are an AI mediator for AccordNow with expertise in dispute resolution and legal analysis.

Your responsibilities:
- Provide neutral, professional analysis
- Identify core legal and factual issues
- Highlight areas of potential agreement
- Suggest structured resolution pathways
- Use clear, accessible language while maintaining legal precision
- Focus on practical solutions`;

        userPrompt = `Analyze this mediation session and provide a comprehensive summary.

**Case Details:**
- Title: ${session.title}
- Description: ${session.dispute_description}
- Parties: ${session.party_a?.full_name || 'Party A'} vs ${session.party_b?.full_name || 'Party B'}
- Messages: ${messages?.length || 0}

**Conversation History:**
${messages?.map((msg: any) => `${msg.sender_role}: ${msg.content}`).join('\n\n') || 'No messages yet'}

**Provide structured analysis:**
1. **Case Overview:** Brief summary of the dispute
2. **Key Issues:** Primary legal/factual matters in dispute
3. **Party Positions:** Each party's main arguments and concerns
4. **Common Ground:** Areas where parties may agree
5. **Resolution Path:** Recommended steps toward settlement
6. **Next Actions:** Specific recommendations for progress`;
        break;

      case 'settlement_suggestion':
        const disputeType = detectDisputeType(session.title, session.dispute_description || '');
        
        systemPrompt = `You are an expert legal mediator and settlement negotiator. Generate comprehensive, legally sound settlement proposals.

**Key Principles:**
- Create specific, enforceable terms
- Address all material issues raised
- Ensure fairness and balance
- Include implementation timelines
- Consider legal remedies and consequences
- Structure for enforceability

**Focus on:**
- Concrete action items and deliverables
- Payment terms and schedules (if applicable)
- Performance standards and deadlines
- Dispute resolution mechanisms
- Release and satisfaction terms`;

        userPrompt = `Generate a detailed settlement proposal for this ${disputeType} dispute.

**Case Information:**
- Dispute: ${session.title}
- Context: ${session.dispute_description}
- Type: ${LEGAL_TEMPLATES[disputeType].name}
- Parties: ${session.party_a?.full_name || 'Party A'} and ${session.party_b?.full_name || 'Party B'}

**Mediation History:**
${messages?.map((msg: any) => `${msg.sender_role}: ${msg.content}`).join('\n\n') || 'No conversation yet'}

**Generate settlement proposal with:**
1. **Executive Summary:** Brief overview of proposed resolution
2. **Specific Terms:** Detailed obligations for each party
3. **Financial Components:** Any monetary settlements, payment schedules
4. **Performance Standards:** Quality, timing, and completion criteria
5. **Implementation Timeline:** Step-by-step completion schedule
6. **Enforcement Mechanisms:** Consequences for non-compliance
7. **Mutual Benefits:** How this serves both parties' interests
8. **Legal Considerations:** Key legal implications and protections

Make the proposal specific, actionable, and legally sound.`;
        break;

      case 'progress_analysis':
        systemPrompt = `You are an AI mediation progress analyst. Evaluate the trajectory and effectiveness of the mediation process.

Focus on:
- Cooperation and engagement levels
- Communication quality and tone
- Movement toward resolution
- Obstacles and roadblocks
- Strategic interventions needed`;

        userPrompt = `Analyze the mediation progress for this case:

**Session Details:**
- Dispute: ${session.title}
- Duration: Active since ${new Date(session.created_at).toLocaleDateString()}
- Total Messages: ${messages?.length || 0}
- Current Status: ${session.status}

**Recent Communication (Last 10 messages):**
${messages?.slice(-10).map((msg: any) => `${msg.sender_role} (${new Date(msg.created_at).toLocaleDateString()}): ${msg.content}`).join('\n\n') || 'No recent messages'}

**Assess and provide:**
1. **Progress Score:** Rate progress toward resolution (1-10 scale)
2. **Engagement Level:** Quality of party participation and cooperation
3. **Communication Analysis:** Tone, responsiveness, and constructiveness
4. **Momentum Assessment:** Is the case moving toward or away from resolution?
5. **Key Obstacles:** What's preventing faster progress?
6. **Strategic Recommendations:** Specific interventions to advance the case
7. **Timeline Prediction:** Estimated path to resolution
8. **Risk Factors:** Potential derailment issues to monitor`;
        break;

      default:
        throw new Error('Invalid action');
    }

    // Call OpenAI API with enhanced model for better legal reasoning
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using more powerful model for legal content
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent legal analysis
        max_tokens: 2000, // Increased for detailed legal content
      }),
    });

    const aiResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${aiResponse.error?.message || 'Unknown error'}`);
    }

    let aiMessage = aiResponse.choices[0].message.content;

    // For settlement suggestions, generate enhanced legal document
    if (action === 'settlement_suggestion') {
      const disputeType = detectDisputeType(session.title, session.dispute_description || '');
      const legalSettlement = generateLegalSettlement(disputeType, session, aiMessage);
      
      // Store both the AI suggestion and the legal document
      await supabase
        .from('sessions')
        .update({ 
          settlement_terms: legalSettlement
        })
        .eq('id', sessionId);
      
      aiMessage = `${aiMessage}

---

**📋 FORMAL SETTLEMENT DOCUMENT GENERATED**

A comprehensive legal settlement agreement has been drafted and saved to your session. This document includes:

✅ Structured legal format
✅ Specific performance obligations  
✅ Timeline and enforcement terms
✅ Standard legal protections
✅ Ready for electronic signature

The formal document will be available for review and signature after payment processing.`;
    }

    console.log('Enhanced AI response generated successfully');

    // Store AI response as a message in the session
    await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        sender_role: 'mediator',
        content: aiMessage,
        message_type: action === 'settlement_suggestion' ? 'settlement_proposal' : 'ai_response',
      });

    return new Response(JSON.stringify({ 
      success: true, 
      response: aiMessage,
      action,
      enhanced: true // Flag indicating enhanced legal templates were used
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI mediator error:', error.message || 'Unknown error');
    
    // Return sanitized error message
    const sanitizedMessage = 'Unable to process AI mediation request at this time';
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: sanitizedMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});