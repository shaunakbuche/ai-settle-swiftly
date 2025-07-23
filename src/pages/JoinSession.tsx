import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, ArrowLeft, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const JoinSession = () => {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(searchParams.get("id") || "");
  const [partyName, setPartyName] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleJoinSession = () => {
    if (!sessionId || !partyName) {
      toast({
        title: "Missing Information",
        description: "Please enter both session ID and your name.",
        variant: "destructive"
      });
      return;
    }

    if (sessionId.length !== 6) {
      toast({
        title: "Invalid Session ID",
        description: "Session ID should be 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    // Simulate successful join - in real app, this would validate the session
    toast({
      title: "Joining Session...",
      description: "Connecting you to the mediation session.",
    });

    // Navigate to mediation room
    window.location.href = `/mediation/${sessionId.toUpperCase()}?party=2`;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AccordNow</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          <Card className="shadow-elegant border-border/50 animate-fade-in">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Search className="w-6 h-6 text-primary" />
                Join Mediation Session
              </CardTitle>
              <CardDescription>
                Enter the session ID provided by the other party
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sessionId">Session ID *</Label>
                <Input 
                  id="sessionId"
                  placeholder="Enter 6-character session ID"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center font-mono text-lg tracking-wider"
                />
                <p className="text-xs text-muted-foreground">
                  Session ID is case-insensitive and 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partyName">Your Name / Organization *</Label>
                <Input 
                  id="partyName"
                  placeholder="Enter your name or organization"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="your@email.com (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Before joining:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Ensure you have the correct session ID</li>
                  <li>• Have your key points and desired outcomes ready</li>
                  <li>• Be prepared to engage constructively</li>
                  <li>• Remember: our AI mediator is neutral and fair</li>
                </ul>
              </div>

              <Button 
                onClick={handleJoinSession}
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={!sessionId || !partyName}
              >
                Join Session
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have a session ID?{" "}
                  <Link to="/create-session" className="text-primary hover:underline">
                    Create a new session
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JoinSession;