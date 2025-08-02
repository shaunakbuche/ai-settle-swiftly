
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAIMediator } from "@/hooks/useAIMediator";
import ConversationGuidance from "./ConversationGuidance";
import { useConversationAnalysis } from "@/hooks/useConversationAnalysis";

interface Message {
  id: string;
  sender_role: string;
  content: string;
  message_type: string;
  created_at: string;
}

interface AIMediatorPanelProps {
  sessionId: string;
  sessionStatus: string;
  aiSummary: string;
  messageCount: number;
  messages: Message[];
}

export default function AIMediatorPanel({ 
  sessionId,
  sessionStatus, 
  aiSummary, 
  messageCount,
  messages 
}: AIMediatorPanelProps) {
  const [currentAISummary, setCurrentAISummary] = useState(aiSummary);
  const { requestAIAction, loading } = useAIMediator();
  const { 
    extractedInfo, 
    metrics, 
    recommendations, 
    advanceStage,
    isAnalyzing 
  } = useConversationAnalysis(sessionId, messages);

  const getProgressSteps = () => {
    const steps = [
      { label: "Parties joined session", completed: true },
      { label: "Gathering perspectives", completed: messageCount > 0 },
      { label: "Identify common ground", completed: messageCount > 5 },
      { label: "Propose settlement", completed: sessionStatus === 'completed' },
    ];
    return steps;
  };

  const handleRequestSummary = async () => {
    try {
      const response = await requestAIAction(sessionId, 'summary', messages);
      setCurrentAISummary(response);
    } catch (error) {
      console.error('Failed to get AI summary:', error);
    }
  };

  const handleSettlementSuggestion = async () => {
    try {
      await requestAIAction(sessionId, 'settlement_suggestion', messages);
    } catch (error) {
      console.error('Failed to get settlement suggestion:', error);
    }
  };

  const handleProgressAnalysis = async () => {
    try {
      await requestAIAction(sessionId, 'progress_analysis', messages);
    } catch (error) {
      console.error('Failed to get progress analysis:', error);
    }
  };

  // Auto-update summary when messages change significantly
  useEffect(() => {
    if (messageCount > 0 && messageCount % 5 === 0) {
      const updateSummary = async () => {
        try {
          const response = await requestAIAction(sessionId, 'summary', messages);
          setCurrentAISummary(response);
        } catch (error) {
          console.error('Auto-update summary failed:', error);
        }
      };
      updateSummary();
    }
  }, [messageCount]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-500" />
            AI Mediator
            {(loading || isAnalyzing) && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-800 whitespace-pre-wrap">{currentAISummary}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Session Progress</h4>
            <div className="space-y-2">
              {getProgressSteps().map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className={step.completed ? '' : 'opacity-50'}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {sessionStatus === 'completed' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-4 bg-green-50 rounded-lg border border-green-200 text-center"
            >
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-green-800">Settlement Reached!</p>
              <Button className="mt-3 w-full" variant="default">
                Review Agreement
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={handleRequestSummary}
            disabled={loading || messageCount === 0}
          >
            <Bot className="w-4 h-4 mr-2" />
            Request AI Summary
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={handleSettlementSuggestion}
            disabled={loading || messageCount < 3}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Get Settlement Suggestion
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={handleProgressAnalysis}
            disabled={loading || messageCount === 0}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Analyze Progress
          </Button>
        </CardContent>
      </Card>

      {/* Enhanced Conversation Guidance */}
      <ConversationGuidance
        sessionStage={metrics.currentStage}
        messages={messages}
        sessionProgress={metrics.progressScore}
        onStageAdvance={advanceStage}
        extractedInfo={extractedInfo}
      />
    </div>
  );
}
