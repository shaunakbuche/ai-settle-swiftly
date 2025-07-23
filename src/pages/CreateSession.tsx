import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, Bot, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CreateSession = () => {
  const [sessionCreated, setSessionCreated] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [formData, setFormData] = useState({
    partyName: "",
    disputeDescription: "",
    email: ""
  });
  const { toast } = useToast();

  const handleCreateSession = () => {
    if (!formData.partyName || !formData.disputeDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setSessionCreated(true);
    toast({
      title: "Session Created!",
      description: "Share the session ID with the other party to begin mediation.",
    });
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    toast({
      title: "Copied!",
      description: "Session ID copied to clipboard.",
    });
  };

  const shareLink = `${window.location.origin}/join-session?id=${sessionId}`;

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
        <div className="max-w-2xl mx-auto">
          {!sessionCreated ? (
            <Card className="shadow-elegant border-border/50 animate-fade-in">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Bot className="w-6 h-6 text-primary" />
                  Create Mediation Session
                </CardTitle>
                <CardDescription>
                  Start a new dispute resolution session with our AI mediator
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="partyName">Your Name / Organization *</Label>
                  <Input 
                    id="partyName"
                    placeholder="Enter your name or organization"
                    value={formData.partyName}
                    onChange={(e) => setFormData({...formData, partyName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disputeDescription">Dispute Description *</Label>
                  <Textarea 
                    id="disputeDescription"
                    placeholder="Briefly describe the nature of the dispute (contract issue, service disagreement, etc.)"
                    rows={4}
                    value={formData.disputeDescription}
                    onChange={(e) => setFormData({...formData, disputeDescription: e.target.value})}
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">What happens next:</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li>1. You'll receive a unique session ID to share</li>
                    <li>2. The other party joins using this ID</li>
                    <li>3. Our AI mediator facilitates the discussion</li>
                    <li>4. Settlement agreement is generated if consensus is reached</li>
                  </ol>
                </div>

                <Button 
                  onClick={handleCreateSession}
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                >
                  Create Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-elegant border-border/50 animate-scale-in">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-accent-foreground" />
                </div>
                <CardTitle className="text-2xl text-accent">Session Created Successfully!</CardTitle>
                <CardDescription>
                  Share this information with the other party to begin mediation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Session ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-lg px-4 py-2 font-mono">
                        {sessionId}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copySessionId}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Share Link</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={shareLink}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(shareLink);
                          toast({
                            title: "Copied!",
                            description: "Share link copied to clipboard.",
                          });
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <Link to={`/mediation/${sessionId}?party=1`}>
                    <Button variant="hero" size="lg" className="w-full">
                      Enter Session as Party 1
                    </Button>
                  </Link>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    Waiting for the other party to join...
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">Important:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Keep this session ID safe - it's your access key</li>
                    <li>• The session remains active for 24 hours</li>
                    <li>• Both parties must be present to begin mediation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateSession;