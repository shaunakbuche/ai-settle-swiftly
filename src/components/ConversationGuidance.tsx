import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  AlertCircle,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

interface ConversationGuidanceProps {
  sessionStage: string;
  messages: any[];
  sessionProgress: number;
  onStageAdvance: () => void;
  extractedInfo: {
    disputeType?: string;
    keyIssues?: string[];
    positions?: {
      party_a?: string;
      party_b?: string;
    };
    proposedSolutions?: string[];
  };
}

const ConversationGuidance: React.FC<ConversationGuidanceProps> = ({
  sessionStage,
  messages,
  sessionProgress,
  onStageAdvance,
  extractedInfo
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [progressMetrics, setProgressMetrics] = useState({
    issuesIdentified: 0,
    positionsShared: 0,
    solutionsProposed: 0
  });

  useEffect(() => {
    updateSuggestions();
    updateProgressMetrics();
  }, [sessionStage, messages, extractedInfo]);

  const updateSuggestions = () => {
    const newSuggestions: string[] = [];

    switch (sessionStage) {
      case 'initial':
        if (messages.length < 3) {
          newSuggestions.push("Encourage both parties to share their perspective on what happened");
        }
        if (!extractedInfo.disputeType) {
          newSuggestions.push("Try to identify the type of dispute (contract, payment, service, etc.)");
        }
        break;

      case 'dispute_clarification':
        if (!extractedInfo.keyIssues?.length) {
          newSuggestions.push("Ask specific questions to identify the core issues");
        }
        if (extractedInfo.keyIssues && extractedInfo.keyIssues.length < 2) {
          newSuggestions.push("Explore if there are additional underlying concerns");
        }
        break;

      case 'position_sharing':
        if (!extractedInfo.positions?.party_a) {
          newSuggestions.push("Party A should clearly state their desired outcome");
        }
        if (!extractedInfo.positions?.party_b) {
          newSuggestions.push("Party B should share their perspective and needs");
        }
        break;

      case 'negotiation':
        if (!extractedInfo.proposedSolutions?.length) {
          newSuggestions.push("Start brainstorming potential solutions together");
        }
        if (extractedInfo.proposedSolutions && extractedInfo.proposedSolutions.length < 2) {
          newSuggestions.push("Consider alternative approaches or compromises");
        }
        break;

      case 'resolution':
        newSuggestions.push("Summarize the agreed terms clearly");
        newSuggestions.push("Confirm both parties understand and accept the resolution");
        break;
    }

    setSuggestions(newSuggestions);
  };

  const updateProgressMetrics = () => {
    setProgressMetrics({
      issuesIdentified: extractedInfo.keyIssues?.length || 0,
      positionsShared: Object.keys(extractedInfo.positions || {}).length,
      solutionsProposed: extractedInfo.proposedSolutions?.length || 0
    });
  };

  const getStageInfo = () => {
    const stages = {
      initial: { title: 'Initial Discussion', color: 'bg-blue-500', progress: 20 },
      dispute_clarification: { title: 'Clarifying Issues', color: 'bg-yellow-500', progress: 40 },
      position_sharing: { title: 'Sharing Positions', color: 'bg-orange-500', progress: 60 },
      negotiation: { title: 'Negotiating Solutions', color: 'bg-purple-500', progress: 80 },
      resolution: { title: 'Reaching Resolution', color: 'bg-green-500', progress: 100 }
    };
    return stages[sessionStage as keyof typeof stages] || stages.initial;
  };

  const stageInfo = getStageInfo();
  const canAdvanceStage = sessionProgress >= stageInfo.progress;

  return (
    <div className="space-y-4">
      {/* Stage Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Conversation Progress</CardTitle>
            <Badge variant="secondary">{sessionProgress}% Complete</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{stageInfo.title}</span>
                <span className="text-sm text-muted-foreground">
                  {stageInfo.progress}%
                </span>
              </div>
              <Progress value={sessionProgress} className="h-2" />
            </div>

            {canAdvanceStage && sessionStage !== 'resolution' && (
              <Button 
                onClick={onStageAdvance}
                className="w-full"
                size="sm"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Advance to Next Stage
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversation Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Session Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{progressMetrics.issuesIdentified}</div>
              <div className="text-xs text-muted-foreground">Issues Identified</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{progressMetrics.positionsShared}</div>
              <div className="text-xs text-muted-foreground">Positions Shared</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{progressMetrics.solutionsProposed}</div>
              <div className="text-xs text-muted-foreground">Solutions Proposed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Conversation Guidance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Summary */}
      {Object.keys(extractedInfo).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              Extracted Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {extractedInfo.disputeType && (
                <div>
                  <span className="text-sm font-medium">Dispute Type: </span>
                  <Badge variant="outline">{extractedInfo.disputeType}</Badge>
                </div>
              )}
              
              {extractedInfo.keyIssues && extractedInfo.keyIssues.length > 0 && (
                <div>
                  <span className="text-sm font-medium block mb-2">Key Issues:</span>
                  <div className="space-y-1">
                    {extractedInfo.keyIssues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-sm">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {extractedInfo.positions && (
                <div>
                  <span className="text-sm font-medium block mb-2">Positions:</span>
                  <div className="space-y-2">
                    {extractedInfo.positions.party_a && (
                      <div className="text-sm">
                        <Badge variant="secondary" className="mr-2">Party A</Badge>
                        {extractedInfo.positions.party_a}
                      </div>
                    )}
                    {extractedInfo.positions.party_b && (
                      <div className="text-sm">
                        <Badge variant="secondary" className="mr-2">Party B</Badge>
                        {extractedInfo.positions.party_b}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConversationGuidance;