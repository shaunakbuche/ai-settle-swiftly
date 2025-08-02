import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ExtractedInfo {
  disputeType?: string;
  keyIssues?: string[];
  positions?: {
    party_a?: string;
    party_b?: string;
  };
  proposedSolutions?: string[];
  sentiment?: {
    party_a?: 'positive' | 'neutral' | 'negative';
    party_b?: 'positive' | 'neutral' | 'negative';
  };
}

interface ConversationMetrics {
  messageCount: number;
  participationBalance: number; // 0-100, 50 = balanced
  progressScore: number; // 0-100
  currentStage: 'initial' | 'dispute_clarification' | 'position_sharing' | 'negotiation' | 'resolution';
}

export const useConversationAnalysis = (sessionId: string, messages: any[]) => {
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo>({});
  const [metrics, setMetrics] = useState<ConversationMetrics>({
    messageCount: 0,
    participationBalance: 50,
    progressScore: 0,
    currentStage: 'initial'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      analyzeConversation();
    }
  }, [messages]);

  const analyzeConversation = async () => {
    if (isAnalyzing || messages.length === 0) return;
    
    setIsAnalyzing(true);
    
    try {
      // Basic metrics calculation
      const newMetrics = calculateBasicMetrics(messages);
      setMetrics(newMetrics);

      // AI-powered analysis for complex extraction
      if (messages.length >= 3) {
        const aiAnalysis = await performAIAnalysis(messages);
        setExtractedInfo(aiAnalysis);
      } else {
        // Simple keyword-based analysis for early messages
        const simpleAnalysis = performSimpleAnalysis(messages);
        setExtractedInfo(simpleAnalysis);
      }
    } catch (error) {
      console.error('Error analyzing conversation:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateBasicMetrics = (msgs: any[]): ConversationMetrics => {
    const messageCount = msgs.length;
    
    // Calculate participation balance
    const partyAMessages = msgs.filter(m => m.sender_role === 'party_a').length;
    const partyBMessages = msgs.filter(m => m.sender_role === 'party_b').length;
    const totalUserMessages = partyAMessages + partyBMessages;
    
    let participationBalance = 50;
    if (totalUserMessages > 0) {
      const ratio = partyAMessages / totalUserMessages;
      participationBalance = Math.abs(50 - (ratio * 100));
      participationBalance = 100 - participationBalance; // Invert so 100 = perfectly balanced
    }

    // Calculate progress score based on message count and content analysis
    let progressScore = Math.min((messageCount / 20) * 100, 100);
    
    // Determine current stage based on message content and count
    let currentStage: ConversationMetrics['currentStage'] = 'initial';
    
    if (messageCount >= 15) currentStage = 'resolution';
    else if (messageCount >= 12) currentStage = 'negotiation';
    else if (messageCount >= 8) currentStage = 'position_sharing';
    else if (messageCount >= 4) currentStage = 'dispute_clarification';

    return {
      messageCount,
      participationBalance,
      progressScore,
      currentStage
    };
  };

  const performSimpleAnalysis = (msgs: any[]): ExtractedInfo => {
    const allText = msgs.map(m => m.content).join(' ').toLowerCase();
    
    // Simple keyword-based dispute type detection
    let disputeType = undefined;
    if (allText.includes('payment') || allText.includes('money') || allText.includes('paid')) {
      disputeType = 'Payment Dispute';
    } else if (allText.includes('contract') || allText.includes('agreement')) {
      disputeType = 'Contract Dispute';
    } else if (allText.includes('service') || allText.includes('work')) {
      disputeType = 'Service Dispute';
    } else if (allText.includes('product') || allText.includes('item') || allText.includes('purchase')) {
      disputeType = 'Product Dispute';
    }

    // Extract basic issues using common phrases
    const keyIssues: string[] = [];
    if (allText.includes('late') || allText.includes('delay')) {
      keyIssues.push('Timing/Delivery Issues');
    }
    if (allText.includes('quality') || allText.includes('defect') || allText.includes('problem')) {
      keyIssues.push('Quality Concerns');
    }
    if (allText.includes('communication') || allText.includes('response')) {
      keyIssues.push('Communication Issues');
    }

    return {
      disputeType: disputeType || 'General Dispute',
      keyIssues: keyIssues.length > 0 ? keyIssues : undefined
    };
  };

  const performAIAnalysis = async (msgs: any[]): Promise<ExtractedInfo> => {
    try {
      const conversationText = msgs.map(m => 
        `${m.sender_role}: ${m.content}`
      ).join('\n');

      const { data, error } = await supabase.functions.invoke('ai-mediator', {
        body: {
          action: 'analyze_conversation',
          conversation: conversationText,
          session_id: sessionId
        }
      });

      if (error) throw error;

      return data.analysis || {};
    } catch (error) {
      console.error('AI analysis failed, falling back to simple analysis:', error);
      return performSimpleAnalysis(msgs);
    }
  };

  const getStageRecommendations = () => {
    const recommendations: string[] = [];
    
    switch (metrics.currentStage) {
      case 'initial':
        recommendations.push('Encourage both parties to share their perspective');
        recommendations.push('Focus on understanding what happened');
        break;
      case 'dispute_clarification':
        recommendations.push('Identify specific issues and concerns');
        recommendations.push('Ask clarifying questions');
        break;
      case 'position_sharing':
        recommendations.push('Have each party state their desired outcome');
        recommendations.push('Explore underlying interests and needs');
        break;
      case 'negotiation':
        recommendations.push('Brainstorm potential solutions together');
        recommendations.push('Look for areas of compromise');
        break;
      case 'resolution':
        recommendations.push('Summarize agreed terms clearly');
        recommendations.push('Confirm mutual understanding');
        break;
    }

    // Add balance recommendations
    if (metrics.participationBalance < 70) {
      recommendations.push('Encourage more balanced participation from both parties');
    }

    return recommendations;
  };

  const advanceStage = () => {
    const stages: ConversationMetrics['currentStage'][] = [
      'initial', 'dispute_clarification', 'position_sharing', 'negotiation', 'resolution'
    ];
    
    const currentIndex = stages.indexOf(metrics.currentStage);
    if (currentIndex < stages.length - 1) {
      setMetrics(prev => ({
        ...prev,
        currentStage: stages[currentIndex + 1],
        progressScore: Math.min(prev.progressScore + 20, 100)
      }));
    }
  };

  return {
    extractedInfo,
    metrics,
    isAnalyzing,
    recommendations: getStageRecommendations(),
    advanceStage,
    refreshAnalysis: analyzeConversation
  };
};