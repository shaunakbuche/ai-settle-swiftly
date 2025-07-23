import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Shield, Users, Zap, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-mediation.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AccordNow</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/legal" className="text-muted-foreground hover:text-foreground transition-colors">
                Legal
              </Link>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Bot className="w-3 h-3 mr-1" />
                  AI-Powered Mediation
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Settle Disputes in
                  <span className="bg-gradient-primary bg-clip-text text-transparent"> Under 10 Minutes</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  AccordNow's AI mediator facilitates fair, neutral settlements between parties with 
                  real-time chat, intelligent compromise suggestions, and instant legal agreements.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/create-session">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto">
                    Start Mediation Session
                  </Button>
                </Link>
                <Link to="/join-session">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Join Existing Session
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>10 min average</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Legally binding</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>AI-assisted</span>
                </div>
              </div>
            </div>

            <div className="relative animate-scale-in">
              <img 
                src={heroImage} 
                alt="AI-powered mediation platform"
                className="rounded-2xl shadow-elegant w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              How AccordNow Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI mediator guides both parties through a structured process to reach fair agreements
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 shadow-elegant animate-fade-in">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>1. Join Session</CardTitle>
                <CardDescription>
                  Two parties join a secure mediation session with separate dashboards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-elegant animate-fade-in">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>2. AI Facilitation</CardTitle>
                <CardDescription>
                  Our AI mediator listens, summarizes positions, and suggests fair compromises
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-elegant animate-fade-in">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>3. Legal Agreement</CardTitle>
                <CardDescription>
                  Generate binding settlement PDF and collect e-signatures via DocuSign
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Pay only for successful settlements
            </p>
          </div>

          <Card className="shadow-elegant border-border/50 max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Per Agreement</CardTitle>
              <div className="text-4xl font-bold text-primary">$5</div>
              <CardDescription>Only charged when both parties reach agreement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent" />
                  <span>AI-mediated sessions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent" />
                  <span>Legal settlement PDFs</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent" />
                  <span>DocuSign e-signatures</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent" />
                  <span>Unlimited session attempts</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="bg-accent/10 rounded-lg p-3 mb-4">
                  <div className="font-semibold text-accent">First 25 agreements FREE</div>
                  <div className="text-sm text-muted-foreground">Use code: FIRST25</div>
                </div>
                <Button variant="hero" size="lg" className="w-full">
                  Start Free Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">AccordNow</span>
              </div>
              <p className="text-muted-foreground">
                AI-powered dispute resolution in under 10 minutes.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Platform</h4>
              <div className="space-y-2 text-sm">
                <Link to="/how-it-works" className="block text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
                <Link to="/pricing" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link to="/analytics" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Analytics
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link to="/legal" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
                <Link to="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/arbitration" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Arbitration Clause
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="mailto:support@accordnow.com" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact Support
                </a>
                <Link to="/help" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 AccordNow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;