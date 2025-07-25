import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/hooks/useSession";
import logoShield from "@/assets/accordnow-logo-shield.png";

const CreateSession = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { createSession } = useSession();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleCreateSession = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
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
    const session = await createSession(title, description);
    
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
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elegant border-border/50 animate-fade-in">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create Mediation Session</CardTitle>
              <CardDescription>
                Start a new dispute resolution session with our AI mediator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Session Title *</Label>
                <Input 
                  id="title"
                  placeholder="Brief title for this dispute"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Dispute Description *</Label>
                <Textarea 
                  id="description"
                  placeholder="Briefly describe the nature of the dispute (contract issue, service disagreement, etc.)"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Creator Information</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
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
                disabled={loading}
              >
                {loading ? "Creating Session..." : "Create Session"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateSession;