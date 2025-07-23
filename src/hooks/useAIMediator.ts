
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_role: string;
  content: string;
  message_type: string;
  created_at: string;
}

export const useAIMediator = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const requestAIAction = async (sessionId: string, action: string, messages: Message[]) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-mediator', {
        body: {
          sessionId,
          action,
          messages,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'AI mediator request failed');
      }

      toast({
        title: "AI Analysis Complete",
        description: getActionDescription(action),
      });

      return data.response;
    } catch (error: any) {
      console.error('AI mediator error:', error);
      toast({
        title: "AI Mediator Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'summary':
        return 'AI has analyzed the conversation and provided a summary';
      case 'settlement_suggestion':
        return 'AI has generated a settlement proposal';
      case 'progress_analysis':
        return 'AI has analyzed the mediation progress';
      default:
        return 'AI analysis completed';
    }
  };

  return {
    requestAIAction,
    loading,
  };
};
