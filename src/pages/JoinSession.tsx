import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/hooks/useSession";
import logoShield from "@/assets/accordnow-logo-shield.png";

const JoinSession = () => {
  const [searchParams] = useSearchParams();
  const [sessionCode, setSessionCode] = useState(searchParams.get("session") || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { joinSession } = useSession();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleJoinSession = async () => {
    if (!sessionCode.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide the Session Code.",
        variant: "destructive",
      });
      return;
    }

    if (!profile) {
      toast({
        title: "Profile Error",
        description: "Please ensure your profile is set up.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const session = await joinSession(sessionCode.toUpperCase());
    
    if (session) {
      navigate(`/mediation/${session.id}`);
    }
    
    setLoading(false);
  };

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <img 
                src={logoShield} 
                alt="AccordNow" 
                className="w-8 h-8"
              />
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
                <Label htmlFor="sessionCode">Session Code *</Label>
                <Input 
                  id="sessionCode"
                  placeholder="Enter session code"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  className="font-mono"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Session code provided by the session creator
                </p>
              </div>
              <div className="space-y-2">
                <Label>Your Information</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
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
                disabled={!sessionCode.trim() || loading}
              >
                {loading ? "Joining Session..." : "Join Session"}
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