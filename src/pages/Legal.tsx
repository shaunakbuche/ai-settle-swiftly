import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowLeft, Scale, Shield, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Legal = () => {
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
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Legal Information</h1>
            <p className="text-xl text-muted-foreground">
              Terms, conditions, and legal framework for AccordNow mediation services
            </p>
          </div>

          <div className="grid gap-8">
            {/* Terms & Conditions */}
            <Card className="shadow-elegant border-border/50 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Terms & Conditions
                </CardTitle>
                <CardDescription>
                  Your agreement to use AccordNow services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">1. Service Description</h4>
                  <p className="text-muted-foreground">
                    AccordNow provides AI-assisted mediation services to help parties reach settlements. 
                    Our platform facilitates communication and provides neutral guidance, but does not 
                    constitute legal advice.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. User Responsibilities</h4>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Provide accurate information during mediation</li>
                    <li>• Engage in good faith negotiations</li>
                    <li>• Respect the other party and the mediation process</li>
                    <li>• Understand that AI guidance is not legal advice</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">3. Payment Terms</h4>
                  <p className="text-muted-foreground">
                    Fees are charged only upon successful completion of a settlement agreement ($5 per agreement). 
                    First 25 agreements are free with code FIRST25. No refunds for completed settlements.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">4. Limitation of Liability</h4>
                  <p className="text-muted-foreground">
                    AccordNow's liability is limited to the fees paid for services. We are not responsible 
                    for the outcome of mediation or enforcement of agreements.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Policy */}
            <Card className="shadow-elegant border-border/50 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Privacy Policy
                </CardTitle>
                <CardDescription>
                  How we protect and handle your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Information We Collect</h4>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Names and contact information provided during registration</li>
                    <li>• Mediation session communications and dispute details</li>
                    <li>• Payment information processed securely through Stripe</li>
                    <li>• Usage analytics to improve our service</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">How We Use Information</h4>
                  <p className="text-muted-foreground">
                    Information is used solely to facilitate mediation, generate agreements, and improve 
                    our services. We do not sell or share personal information with third parties except 
                    as necessary for service delivery.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Data Security</h4>
                  <p className="text-muted-foreground">
                    All communications are encrypted in transit and at rest. Session data is automatically 
                    deleted after 30 days unless both parties consent to longer retention.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Arbitration Clause */}
            <Card className="shadow-elegant border-border/50 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  Arbitration Clause
                </CardTitle>
                <CardDescription>
                  Dispute resolution for AccordNow service issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Binding Arbitration</h4>
                  <p className="text-muted-foreground">
                    Any disputes arising from the use of AccordNow services (not the disputes being mediated, 
                    but disputes about our service itself) will be resolved through binding arbitration rather 
                    than in court.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Arbitration Process</h4>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Conducted by the American Arbitration Association (AAA)</li>
                    <li>• Individual arbitration only - no class actions</li>
                    <li>• Arbitrator's decision is final and binding</li>
                    <li>• Each party pays their own costs unless law requires otherwise</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Exceptions</h4>
                  <p className="text-muted-foreground">
                    Small claims court disputes under $5,000 and intellectual property disputes are 
                    excluded from this arbitration requirement.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-elegant border-border/50 animate-fade-in">
              <CardHeader>
                <CardTitle>Legal Contact</CardTitle>
                <CardDescription>
                  Questions about these terms or legal matters
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">
                  For legal questions or concerns about these terms, contact us at:
                  <br /><br />
                  <strong>Email:</strong> legal@accordnow.com<br />
                  <strong>Address:</strong> AccordNow Legal Department<br />
                  123 Mediation Way, Suite 100<br />
                  San Francisco, CA 94102
                </p>
                
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}. We may update these terms 
                    from time to time and will notify users of significant changes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;