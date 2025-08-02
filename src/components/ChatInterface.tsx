
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Users, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sanitizeHTML, validateInput } from "@/lib/security";
import ChatPrompts from "./ChatPrompts";
import { useConversationAnalysis } from "@/hooks/useConversationAnalysis";

interface Message {
  id: string;
  session_id: string;
  sender_id: string | null;
  sender_role: string;
  content: string;
  message_type: string;
  created_at: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  disputeDescription: string;
  currentUserRole: string;
  profiles: { [key: string]: { full_name: string } };
  sessionId: string;
}

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  disputeDescription, 
  currentUserRole,
  profiles,
  sessionId 
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");
  const { metrics } = useConversationAnalysis(sessionId, messages);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    if (!validateInput(newMessage, 500)) {
      console.error('Invalid message content');
      return;
    }
    onSendMessage(newMessage);
    setNewMessage("");
  };

  const handlePromptSelect = (prompt: string) => {
    onSendMessage(prompt);
  };

  const getSenderName = (message: Message) => {
    if (message.sender_role === 'mediator') return 'AI Mediator';
    if (message.sender_id && profiles[message.sender_id]) {
      return profiles[message.sender_id].full_name;
    }
    return message.sender_role === 'party_a' ? 'Party A' : 'Party B';
  };

  const isCurrentUser = (message: Message) => {
    return message.sender_role === currentUserRole;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Mediation Chat
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Dispute: {disputeDescription}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-96 w-full pr-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${isCurrentUser(message) ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_role === 'mediator' 
                      ? 'bg-purple-100 border border-purple-200' 
                      : isCurrentUser(message)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender_role === 'mediator' && <Bot className="w-4 h-4" />}
                      <span className="font-semibold text-xs">
                        {getSenderName(message)}
                      </span>
                    </div>
                    <p 
                      className="text-sm" 
                      dangerouslySetInnerHTML={{ 
                        __html: sanitizeHTML(message.content) 
                      }} 
                    />
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <Separator />

        {/* Smart Chat Prompts */}
        <ChatPrompts 
          sessionStage={metrics.currentStage}
          onPromptSelect={handlePromptSelect}
          userRole={currentUserRole as 'party_a' | 'party_b' | 'mediator'}
        />

        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
