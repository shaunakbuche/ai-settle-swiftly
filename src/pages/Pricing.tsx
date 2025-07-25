import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Header */}
      <div className="border-b border-border/10">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Only pay when you reach a successful agreement. No upfront costs, no hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Trial */}
          <Card className="relative border-2 border-border/50 hover:border-primary/20 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl">Try It Free</CardTitle>
              <CardDescription>
                Experience our mediation platform with no commitment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-6">$0</div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Full mediation session</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>AI-powered assistance</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Real-time communication</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>No payment until agreement</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link to="/create-session">Start Free Session</Link>
              </Button>
              <Button asChild className="w-full" variant="ghost" size="sm">
                <Link to="/checkout">Test Checkout</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Pay on Success */}
          <Card className="relative border-2 border-primary/20 bg-primary/5">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Pay on Success</CardTitle>
              <CardDescription>
                Only pay when you reach a binding agreement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">$4.99</div>
              <div className="text-sm text-muted-foreground mb-6">per successful agreement</div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Complete mediation process</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Legal settlement document</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>DocuSign integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Binding legal agreement</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/create-session">Get Started</Link>
              </Button>
              <Button asChild className="w-full" variant="ghost" size="sm">
                <Link to="/checkout">Test Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Special Offer */}
        <div className="text-center mt-12">
          <Card className="max-w-md mx-auto bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Limited Time Offer</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="mb-2">FIRST25</Badge>
              <p className="text-sm text-muted-foreground">
                Use code FIRST25 for 50% off your first agreement → Just $2.49
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold mb-2">When do I pay?</h3>
              <p className="text-muted-foreground text-sm">
                You only pay the $4.99 fee when both parties agree to a settlement and sign the legal document.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What if we don't reach an agreement?</h3>
              <p className="text-muted-foreground text-sm">
                If mediation doesn't result in a signed agreement, you pay nothing. Our platform is completely free to try.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is the agreement legally binding?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, our settlement documents are legally binding contracts that can be enforced in court.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How long does mediation take?</h3>
              <p className="text-muted-foreground text-sm">
                Most sessions are completed within 24-48 hours, though complex cases may take longer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;