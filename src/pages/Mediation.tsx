import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Users, Bot, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender: 'party1' | 'party2' | 'ai';
  content: string;
  timestamp: Date;
}

interface SessionData {
  id: string;
  party1Name: string;
  party2Name: string;
  status: 'waiting' | 'active' | 'settlement_reached';
  dispute: string;
  currentParty: 'party1' | 'party2';
}

export default function Mediation() {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionData, setSessionData] = useState<SessionData>({
    id: sessionId || '',
    party1Name: "John Smith",
    party2Name: "Sarah Johnson", 
    status: 'active',
    dispute: "Contract payment dispute - $5,000",
    currentParty: 'party1' // This would come from URL params or session state
  });

  const [aiSummary, setAiSummary] = useState("Listening to both parties...");

  const statusConfig = {
    waiting: { icon: Clock, color: "bg-yellow-500", text: "Waiting for both parties" },
    active: { icon: Users, color: "bg-blue-500", text: "Mediation in progress" },
    settlement_reached: { icon: CheckCircle, color: "bg-green-500", text: "Settlement reached!" }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: sessionData.currentParty,
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simulate AI response after a user message
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: `I understand ${sessionData.currentParty === 'party1' ? sessionData.party1Name : sessionData.party2Name}'s concern. Let me analyze both perspectives and suggest a path forward.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setAiSummary("Analyzing conflict points and identifying common ground...");
    }, 2000);
  };

  const StatusIcon = statusConfig[sessionData.status].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-primary">AccordNow Mediation</h1>
              <p className="text-muted-foreground">Session ID: {sessionId}</p>
            </div>
            <Badge 
              variant="secondary" 
              className={`${statusConfig[sessionData.status].color} text-white px-4 py-2`}
            >
              <StatusIcon className="w-4 h-4 mr-2" />
              {statusConfig[sessionData.status].text}
            </Badge>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Party Views */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dual Party Interface */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Party 1 View */}
              <Card className={`${sessionData.currentParty === 'party1' ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    {sessionData.party1Name}
                    {sessionData.currentParty === 'party1' && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {sessionData.currentParty === 'party1' 
                      ? "Share your perspective and concerns about the dispute."
                      : "Waiting for their input..."
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Party 2 View */}
              <Card className={`${sessionData.currentParty === 'party2' ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    {sessionData.party2Name}
                    {sessionData.currentParty === 'party2' && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {sessionData.currentParty === 'party2' 
                      ? "Share your perspective and concerns about the dispute."
                      : "Waiting for their input..."
                    }
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Mediation Chat
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Dispute: {sessionData.dispute}
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
                          className={`flex ${message.sender === sessionData.currentParty ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === 'ai' 
                              ? 'bg-purple-100 border border-purple-200' 
                              : message.sender === sessionData.currentParty
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              {message.sender === 'ai' && <Bot className="w-4 h-4" />}
                              <span className="font-semibold text-xs">
                                {message.sender === 'ai' ? 'AI Mediator' : 
                                 message.sender === 'party1' ? sessionData.party1Name : sessionData.party2Name}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>

                <Separator />

                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Mediator Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-500" />
                  AI Mediator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800">{aiSummary}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Session Progress</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Parties joined session</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span>Gathering perspectives</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-50">
                      <AlertCircle className="w-4 h-4" />
                      <span>Identify common ground</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-50">
                      <AlertCircle className="w-4 h-4" />
                      <span>Propose settlement</span>
                    </div>
                  </div>
                </div>

                {sessionData.status === 'settlement_reached' && (
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

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Request AI Summary
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Suggest Break
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  End Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}