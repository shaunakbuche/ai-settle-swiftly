import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, MessageSquare, Brain, FileText, PenTool, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import logoShield from "@/assets/accordnow-logo-shield.png";

const HowItWorks = () => {
  const steps = [
    {
      icon: Users,
      title: "Create or Join Session",
      description: "One party creates a mediation session and shares the link with the other party. Both parties can join anonymously or with basic contact information.",
      badge: "Step 1"
    },
    {
      icon: MessageSquare,
      title: "Communicate Safely",
      description: "Discuss your dispute in a structured environment. Our AI mediator guides the conversation and helps both parties understand each other's perspectives.",
      badge: "Step 2"
    },
    {
      icon: Brain,
      title: "AI-Assisted Resolution",
      description: "Our advanced AI analyzes the conversation in real-time, identifies common ground, and suggests fair settlement options based on similar cases.",
      badge: "Step 3"
    },
    {
      icon: FileText,
      title: "Generate Agreement",
      description: "When both parties agree to terms, we automatically generate a legally binding settlement document with all the agreed-upon details.",
      badge: "Step 4"
    },
    {
      icon: PenTool,
      title: "Sign & Complete",
      description: "Both parties review and electronically sign the settlement agreement through DocuSign integration. The agreement becomes legally binding.",
      badge: "Step 5"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={logoShield} 
                alt="AccordNow" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-foreground">AccordNow</span>
            </Link>
            <Button asChild variant="ghost">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            How Our Mediation Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered platform guides you through a structured mediation process, 
            helping you reach fair agreements without expensive lawyers or lengthy court proceedings.
          </p>
        </div>

        {/* Process Steps */}
        <div className="space-y-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="border-2 border-border/50 hover:border-primary/20 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary">{step.badge}</Badge>
                        <CardTitle className="text-xl">{step.title}</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground ml-16">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-4">
                  <ArrowRight className="w-6 h-6 text-primary/60" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose AI Mediation?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center border-border/50">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <CardTitle>Fast Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Resolve disputes in hours or days, not months. Our AI guides efficient conversations toward quick resolutions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <CardTitle>Cost Effective</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pay only $5 when you reach an agreement. No hourly fees, no retainers, no hidden costs.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-border/50">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <CardTitle>AI-Powered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI analyzes thousands of similar cases to suggest fair, balanced solutions that work for everyone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Resolve Your Dispute?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Start your mediation session today. It's completely free until you reach an agreement.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/create-session">Create Session</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/join-session">Join Session</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;