import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Gavel, FileText, Target, Handshake } from 'lucide-react';

interface ChatPromptsProps {
  sessionStage: 'initial' | 'dispute_clarification' | 'position_sharing' | 'negotiation' | 'resolution';
  onPromptSelect: (prompt: string) => void;
  userRole: 'party_a' | 'party_b' | 'mediator';
}

const ChatPrompts: React.FC<ChatPromptsProps> = ({ sessionStage, onPromptSelect, userRole }) => {
  const getPromptsForStage = () => {
    switch (sessionStage) {
      case 'initial':
        return {
          icon: MessageSquare,
          title: 'Getting Started',
          description: 'Let\'s begin by understanding the situation',
          prompts: userRole === 'party_a' ? [
            "I'd like to explain what happened from my perspective...",
            "The main issue I'm facing is...",
            "This situation started when...",
            "I'm hoping we can resolve this by..."
          ] : [
            "I see things differently and here's why...",
            "From my point of view, the situation is...",
            "I'd like to respond to what was shared...",
            "My main concern is..."
          ]
        };

      case 'dispute_clarification':
        return {
          icon: Users,
          title: 'Clarifying the Dispute',
          description: 'Help us understand the core issues',
          prompts: [
            "The specific problem is...",
            "What I need to resolve this is...",
            "The impact on me has been...",
            "I think a fair solution would be...",
            "Can you help me understand your perspective on...?"
          ]
        };

      case 'position_sharing':
        return {
          icon: Target,
          title: 'Sharing Positions',
          description: 'Express your needs and interests',
          prompts: [
            "What's most important to me is...",
            "I could be flexible on...",
            "A deal-breaker for me would be...",
            "I'm willing to consider...",
            "My ideal outcome would be..."
          ]
        };

      case 'negotiation':
        return {
          icon: Gavel,
          title: 'Finding Solutions',
          description: 'Work together to find common ground',
          prompts: [
            "What if we tried...",
            "I could agree to that if...",
            "Another option might be...",
            "Would you consider...",
            "That works for me, but what about..."
          ]
        };

      case 'resolution':
        return {
          icon: Handshake,
          title: 'Reaching Agreement',
          description: 'Finalize the terms of your settlement',
          prompts: [
            "I agree to these terms...",
            "Let me confirm my understanding...",
            "The final details should include...",
            "I'm ready to move forward with...",
            "This resolves the issue for me because..."
          ]
        };

      default:
        return {
          icon: MessageSquare,
          title: 'Continue Conversation',
          description: 'Keep the dialogue flowing',
          prompts: [
            "I'd like to add...",
            "Can you clarify...",
            "What I'm hearing is...",
            "Let me make sure I understand..."
          ]
        };
    }
  };

  const stageInfo = getPromptsForStage();
  const Icon = stageInfo.icon;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{stageInfo.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{stageInfo.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              Quick Responses
            </Badge>
            {userRole !== 'mediator' && (
              <Badge variant="outline" className="text-xs">
                {userRole === 'party_a' ? 'Party A' : 'Party B'}
              </Badge>
            )}
          </div>
          <div className="grid gap-2">
            {stageInfo.prompts.map((prompt, index) => (
              <Button
                key={index}
                variant="ghost"
                className="justify-start text-left h-auto p-3 whitespace-normal"
                onClick={() => onPromptSelect(prompt)}
              >
                <span className="text-sm">{prompt}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPrompts;