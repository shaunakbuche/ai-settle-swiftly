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

// Expanded Legal Templates for Phase 3
const LEGAL_TEMPLATES = {
  contract: {
    name: "Contract Dispute Settlement",
    category: "Business Law",
    complexity: "Standard",
    structure: `
## CONTRACT DISPUTE SETTLEMENT AGREEMENT

**PARTIES:** [Party A Name] and [Party B Name]
**DATE:** [Current Date]
**MATTER:** Contract Dispute - [Dispute Title]
**CONTRACT DATE:** [Original Contract Date]
**CONTRACT VALUE:** $[Original Value]

### RECITALS
WHEREAS, the parties entered into a [Contract Type] on [Contract Date];
WHEREAS, a dispute arose regarding [Brief Description];
WHEREAS, the parties desire to resolve this matter amicably;

### SETTLEMENT TERMS
1. **Performance Obligations:** [Specific actions required]
2. **Payment Terms:** [Monetary settlements if any]
3. **Timeline:** [Deadlines for compliance]
4. **Quality Standards:** [Performance criteria]
5. **Release of Claims:** Both parties release all claims related to this dispute
6. **Confidentiality:** Terms shall remain confidential
7. **Enforcement:** Agreement shall be binding and enforceable

### SIGNATURES
Party A: _________________ Date: _______
Party B: _________________ Date: _______`
  },
  
  financial: {
    name: "Financial Dispute Settlement",
    category: "Finance",
    complexity: "Basic",
    structure: `
## FINANCIAL SETTLEMENT AGREEMENT

**CREDITOR:** [Party A Name]
**DEBTOR:** [Party B Name]
**ORIGINAL AMOUNT:** $[Amount]
**SETTLEMENT AMOUNT:** $[Settlement Amount]
**DISCOUNT:** [Percentage/Amount]

### PAYMENT TERMS
1. **Total Settlement:** $[Amount] to be paid as follows:
2. **Payment Schedule:** [Installment details]
3. **Late Payment:** [Penalty terms]
4. **Default Provisions:** [Consequences of non-payment]
5. **Interest Rate:** [If applicable]

### MUTUAL RELEASES
Upon full payment, creditor releases all claims against debtor.

### ENFORCEMENT
This agreement may be entered as a judgment upon default.`
  },
  
  service: {
    name: "Service Dispute Settlement",
    category: "Service Agreement",
    complexity: "Standard",
    structure: `
## SERVICE DISPUTE RESOLUTION AGREEMENT

**SERVICE PROVIDER:** [Party A Name]
**CLIENT:** [Party B Name]
**SERVICE TYPE:** [Description]
**PROJECT VALUE:** $[Amount]

### RESOLUTION TERMS
1. **Service Completion:** [Remaining obligations]
2. **Quality Standards:** [Acceptance criteria]
3. **Compensation:** [Payment adjustments]
4. **Timeline:** [Completion deadlines]
5. **Future Services:** [Ongoing relationship terms]
6. **Warranty/Support:** [Post-completion obligations]

### SATISFACTION OF CLAIMS
Both parties acknowledge satisfaction of all claims upon completion.`
  },
  
  property: {
    name: "Property Dispute Settlement",
    category: "Real Estate",
    complexity: "Standard",
    structure: `
## PROPERTY DISPUTE SETTLEMENT AGREEMENT

**PROPERTY:** [Property Description/Address]
**PARTIES:** [Party Names and Roles]
**DISPUTE TYPE:** [Boundary/Easement/Damage/etc.]

### PROPERTY RESOLUTION
1. **Ownership/Use Rights:** [Clarification of rights]
2. **Maintenance Obligations:** [Responsibility allocation]
3. **Financial Obligations:** [Cost sharing]
4. **Access Rights:** [Usage permissions]
5. **Insurance Requirements:** [Coverage obligations]

### RECORDING
This agreement shall be recorded with appropriate authorities if applicable.`
  },

  employment: {
    name: "Employment Dispute Settlement",
    category: "Labor & Employment",
    complexity: "Advanced",
    structure: `
## EMPLOYMENT DISPUTE SETTLEMENT AGREEMENT

**EMPLOYEE:** [Employee Name]
**EMPLOYER:** [Company Name]
**POSITION:** [Job Title]
**EMPLOYMENT PERIOD:** [Start Date] to [End Date]
**DISPUTE NATURE:** [Termination/Discrimination/Wage/etc.]

### SETTLEMENT TERMS
1. **Severance Payment:** $[Amount] paid in [installments/lump sum]
2. **Benefits Continuation:** [COBRA/Health/etc.]
3. **References:** [Agreed reference terms]
4. **Non-Disclosure:** [Confidentiality requirements]
5. **Non-Compete/Non-Solicitation:** [Post-employment restrictions]
6. **Return of Property:** [Company assets to be returned]

### RELEASES
Employee releases all employment-related claims. Employer provides general release.

### COMPLIANCE
Agreement complies with applicable labor laws and regulations.`
  },

  landlord_tenant: {
    name: "Landlord-Tenant Settlement",
    category: "Real Estate",
    complexity: "Standard",
    structure: `
## LANDLORD-TENANT DISPUTE SETTLEMENT

**LANDLORD:** [Landlord Name]
**TENANT:** [Tenant Name]
**PROPERTY:** [Property Address]
**LEASE PERIOD:** [Start Date] to [End Date]
**MONTHLY RENT:** $[Amount]

### RESOLUTION TERMS
1. **Security Deposit:** $[Amount] - [Return/Retention details]
2. **Outstanding Rent:** $[Amount] - [Payment schedule]
3. **Property Condition:** [Repair obligations]
4. **Move-out Date:** [Specific date and terms]
5. **Utilities:** [Final responsibility allocation]
6. **Legal Fees:** [Cost allocation if applicable]

### MUTUAL RELEASES
Both parties release all claims related to the tenancy.`
  },

  business_partnership: {
    name: "Business Partnership Dissolution",
    category: "Business Law",
    complexity: "Advanced",
    structure: `
## PARTNERSHIP DISSOLUTION AGREEMENT

**PARTNERSHIP:** [Business Name]
**PARTNERS:** [Partner Names and Ownership %]
**BUSINESS TYPE:** [LLC/Partnership/Corporation]
**DISSOLUTION DATE:** [Effective Date]

### ASSET DISTRIBUTION
1. **Business Assets:** [Valuation and distribution method]
2. **Accounts Receivable:** [Collection and allocation]
3. **Inventory:** [Distribution or liquidation]
4. **Intellectual Property:** [Ownership transfer/licensing]
5. **Real Estate:** [Sale or transfer terms]

### LIABILITY ALLOCATION
1. **Existing Debts:** [Payment responsibility]
2. **Ongoing Obligations:** [Contract assignments]
3. **Tax Liabilities:** [Allocation method]

### POST-DISSOLUTION
1. **Non-Compete:** [Geographic and time restrictions]
2. **Customer/Client Lists:** [Usage restrictions]
3. **Business Name/Goodwill:** [Rights allocation]`
  },

  consumer_protection: {
    name: "Consumer Protection Settlement",
    category: "Consumer Rights",
    complexity: "Basic",
    structure: `
## CONSUMER DISPUTE SETTLEMENT AGREEMENT

**CONSUMER:** [Consumer Name]
**BUSINESS:** [Business Name]
**PRODUCT/SERVICE:** [Description]
**PURCHASE DATE:** [Date]
**PURCHASE AMOUNT:** $[Amount]

### RESOLUTION TERMS
1. **Refund/Credit:** $[Amount] - [Method and timeline]
2. **Product Replacement:** [Specifications if applicable]
3. **Service Correction:** [Remedial actions required]
4. **Future Warranties:** [Extended coverage if applicable]
5. **Costs/Fees:** [Shipping, handling, etc.]

### BUSINESS COMMITMENTS
Business agrees to [policy changes/training/etc.] to prevent future issues.

### CONSUMER SATISFACTION
Consumer acknowledges full satisfaction upon completion of settlement terms.`
  },

  intellectual_property: {
    name: "Intellectual Property Settlement",
    category: "Intellectual Property",
    complexity: "Advanced",
    structure: `
## INTELLECTUAL PROPERTY DISPUTE SETTLEMENT

**IP OWNER:** [Owner Name]
**ALLEGED INFRINGER:** [Infringer Name]
**IP TYPE:** [Patent/Trademark/Copyright/Trade Secret]
**IP DESCRIPTION:** [Detailed description]
**REGISTRATION #:** [If applicable]

### SETTLEMENT TERMS
1. **Infringement Cessation:** [Specific activities to stop]
2. **Licensing Agreement:** [Permitted uses and terms]
3. **Royalty Payments:** [Rate and payment schedule]
4. **Attribution Requirements:** [Credit/notice obligations]
5. **Territory Restrictions:** [Geographic limitations]
6. **Term Duration:** [License period]

### FINANCIAL TERMS
1. **Past Damages:** $[Amount] for prior infringement
2. **Future Royalties:** [Percentage or fixed amount]
3. **Legal Fees:** [Cost allocation]

### COMPLIANCE MONITORING
Ongoing reporting and audit rights to ensure compliance.`
  },

  insurance_claim: {
    name: "Insurance Claim Settlement",
    category: "Insurance",
    complexity: "Standard",
    structure: `
## INSURANCE CLAIM SETTLEMENT AGREEMENT

**POLICYHOLDER:** [Name]
**INSURANCE COMPANY:** [Company Name]
**POLICY NUMBER:** [Number]
**CLAIM NUMBER:** [Number]
**INCIDENT DATE:** [Date]
**ORIGINAL CLAIM AMOUNT:** $[Amount]

### SETTLEMENT TERMS
1. **Settlement Payment:** $[Amount]
2. **Payment Schedule:** [Lump sum/installments]
3. **Coverage Clarification:** [Policy interpretation]
4. **Future Claims:** [Impact on future coverage]
5. **Deductible:** [Application/waiver]

### MUTUAL UNDERSTANDING
Both parties agree on policy interpretation and coverage scope going forward.

### CLAIM CLOSURE
This settlement represents full and final resolution of the claim.`
  },

  construction: {
    name: "Construction Dispute Settlement",
    category: "Construction",
    complexity: "Advanced",
    structure: `
## CONSTRUCTION DISPUTE SETTLEMENT AGREEMENT

**CONTRACTOR:** [Contractor Name]
**PROPERTY OWNER:** [Owner Name]
**PROJECT:** [Project Description]
**CONTRACT DATE:** [Date]
**CONTRACT AMOUNT:** $[Amount]
**PROJECT ADDRESS:** [Address]

### DISPUTE RESOLUTION
1. **Work Completion:** [Remaining work specifications]
2. **Quality Standards:** [Correction of defective work]
3. **Timeline:** [Completion deadlines with penalties]
4. **Payment Schedule:** [Remaining payments and conditions]
5. **Change Orders:** [Approved modifications and costs]
6. **Materials/Labor:** [Quality and warranty requirements]

### FINANCIAL SETTLEMENT
1. **Final Payment:** $[Amount]
2. **Retention Release:** [Conditions and timeline]
3. **Cost Overruns:** [Responsibility allocation]
4. **Penalty/Bonus:** [Performance incentives]

### WARRANTY AND MAINTENANCE
[Duration and scope of warranties on completed work]`
  },

  family_mediation: {
    name: "Family Mediation Agreement",
    category: "Family Law",
    complexity: "Advanced",
    structure: `
## FAMILY MEDIATION AGREEMENT

**PARTIES:** [Party Names]
**MARRIAGE DATE:** [Date]
**SEPARATION DATE:** [Date if applicable]
**CHILDREN:** [Names and Ages]

### CHILD CUSTODY AND SUPPORT
1. **Physical Custody:** [Primary residence and schedule]
2. **Legal Custody:** [Decision-making authority]
3. **Visitation Schedule:** [Detailed schedule including holidays]
4. **Child Support:** $[Amount] monthly paid by [Party]
5. **Educational Decisions:** [School choice and expenses]
6. **Medical Decisions:** [Healthcare and insurance]

### PROPERTY DIVISION
1. **Marital Home:** [Sale/retention/buyout terms]
2. **Financial Accounts:** [Division of assets]
3. **Retirement Accounts:** [QDRO requirements if applicable]
4. **Personal Property:** [Division of belongings]
5. **Debts:** [Allocation of marital debts]

### SPOUSAL SUPPORT
[Amount, duration, and modification conditions if applicable]

### BEST INTERESTS OF CHILDREN
All provisions prioritize the welfare and best interests of the children.`
  }
};

// Enhanced legal clause library with specialized provisions
const LEGAL_CLAUSES = {
  confidentiality: "The parties agree that the terms of this settlement and the underlying dispute shall remain strictly confidential, except as required by law or for enforcement purposes.",
  
  nonAdmission: "This settlement shall not be construed as an admission of liability, wrongdoing, or fault by any party.",
  
  entireAgreement: "This agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, or agreements relating to this dispute.",
  
  modification: "This agreement may only be modified in writing, signed by both parties.",
  
  governingLaw: "This agreement shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to conflict of law principles.",
  
  severability: "If any provision of this agreement is deemed invalid or unenforceable, the remaining provisions shall remain in full force and effect.",
  
  enforceability: "The parties agree that this settlement agreement is binding and enforceable, and may be entered as a judgment by any court of competent jurisdiction.",
  
  compliance: "Time is of the essence in this agreement. Failure to comply with any term within the specified timeframe shall constitute a material breach.",

  // Advanced specialized clauses
  nonDisclosure: "Each party agrees to maintain in confidence all non-public information received from the other party, with exceptions for: (a) information already public, (b) information independently developed, (c) information required to be disclosed by law, and (d) information necessary for enforcement of this agreement.",
  
  nonCompete: "For a period of [Duration] following the effective date of this agreement, within [Geographic Area], neither party shall directly or indirectly engage in any business that competes with [Specific Business Activities].",
  
  indemnification: "Each party agrees to indemnify, defend, and hold harmless the other party from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or related to any breach of this agreement or any negligent or wrongful acts or omissions.",
  
  forceMajeure: "Neither party shall be liable for any failure or delay in performance under this agreement due to circumstances beyond their reasonable control, including but not limited to acts of God, war, terrorism, epidemic, government actions, or natural disasters.",
  
  liquidatedDamages: "The parties agree that actual damages for breach would be difficult to ascertain. Therefore, the breaching party shall pay liquidated damages of $[Amount] per day/week/month of delay, which represents a reasonable pre-estimate of probable damages.",
  
  arbitration: "Any dispute arising under this agreement shall be resolved through binding arbitration administered by [Arbitration Organization] under its commercial arbitration rules. The arbitration shall take place in [Location] and be conducted by a single arbitrator experienced in [Relevant Field].",
  
  jurisdiction: "The parties consent to the exclusive jurisdiction of the courts located in [Jurisdiction] for any legal proceedings related to this agreement, and waive any objection to venue or inconvenient forum.",
  
  choiceOfLaw: "This agreement shall be governed by and construed in accordance with the laws of [State/Country], without giving effect to any choice of law or conflict of law provisions.",
  
  terminationRights: "Either party may terminate this agreement upon [Notice Period] written notice if: (a) the other party materially breaches any provision and fails to cure such breach within [Cure Period], (b) the other party becomes insolvent, or (c) [Other Termination Events].",
  
  complianceMonitoring: "To ensure ongoing compliance with this agreement, [Monitoring Party] shall have the right to: (a) receive quarterly written reports, (b) conduct annual inspections with reasonable notice, and (c) audit relevant records upon request.",
  
  successorBinding: "This agreement shall be binding upon and inure to the benefit of the parties' respective heirs, successors, assigns, and legal representatives.",
  
  noticesProvision: "All notices required under this agreement shall be in writing and delivered by: (a) certified mail, return receipt requested, (b) overnight courier with tracking, or (c) email with delivery confirmation to the addresses specified herein.",
  
  costsAndFees: "In the event of any legal action to enforce this agreement, the prevailing party shall be entitled to recover reasonable attorneys' fees, court costs, and other litigation expenses from the non-prevailing party.",
  
  performanceStandards: "All performance under this agreement shall meet industry standard practices and applicable professional standards. Any work product must be completed in a workmanlike manner using materials of good quality."
};

function detectDisputeType(title: string, description: string): keyof typeof LEGAL_TEMPLATES {
  const content = (title + ' ' + description).toLowerCase();
  
  // Employment disputes
  if (content.includes('employment') || content.includes('employee') || content.includes('workplace') || 
      content.includes('termination') || content.includes('discrimination') || content.includes('wage') ||
      content.includes('salary') || content.includes('firing') || content.includes('wrongful')) {
    return 'employment';
  }
  
  // Landlord-Tenant disputes
  if (content.includes('landlord') || content.includes('tenant') || content.includes('rent') || 
      content.includes('lease') || content.includes('eviction') || content.includes('security deposit') ||
      content.includes('rental') || content.includes('apartment')) {
    return 'landlord_tenant';
  }
  
  // Business Partnership disputes
  if (content.includes('partnership') || content.includes('business partner') || content.includes('llc') ||
      content.includes('corporation') || content.includes('business dissolution') || content.includes('equity')) {
    return 'business_partnership';
  }
  
  // Consumer Protection disputes
  if (content.includes('consumer') || content.includes('warranty') || content.includes('defective product') ||
      content.includes('refund') || content.includes('merchant') || content.includes('purchase') ||
      content.includes('customer service')) {
    return 'consumer_protection';
  }
  
  // Intellectual Property disputes
  if (content.includes('patent') || content.includes('trademark') || content.includes('copyright') ||
      content.includes('intellectual property') || content.includes('infringement') || content.includes('licensing')) {
    return 'intellectual_property';
  }
  
  // Insurance disputes
  if (content.includes('insurance') || content.includes('claim') || content.includes('policy') ||
      content.includes('coverage') || content.includes('premium') || content.includes('adjuster')) {
    return 'insurance_claim';
  }
  
  // Construction disputes
  if (content.includes('construction') || content.includes('contractor') || content.includes('building') ||
      content.includes('renovation') || content.includes('defective work') || content.includes('project')) {
    return 'construction';
  }
  
  // Family disputes
  if (content.includes('family') || content.includes('divorce') || content.includes('custody') ||
      content.includes('child support') || content.includes('alimony') || content.includes('marriage')) {
    return 'family_mediation';
  }
  
  // Original categories
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