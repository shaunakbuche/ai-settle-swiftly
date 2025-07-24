import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Tag, TestTube } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const basePrice = 5.00;
  const finalPrice = basePrice - discount;

  const applyPromoCode = () => {
    if (promoCode === "FIRST25") {
      setDiscount(2.50);
      toast({
        title: "Promo code applied!",
        description: "You saved 50% on your settlement agreement.",
      });
    } else if (promoCode) {
      toast({
        title: "Invalid promo code",
        description: "Please check your code and try again.",
        variant: "destructive",
      });
    } else {
      setDiscount(0);
    }
  };

  const handleTestPayment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue with payment.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          sessionId: 'test-checkout-session',
          promoCode: promoCode || undefined,
        },
      });

      if (error) {
        console.error('Payment creation error:', error);
        throw error;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to payment",
          description: "Please complete your payment in the new tab.",
        });
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error.message || "Failed to create payment session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Header */}
      <div className="border-b border-border/10">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/pricing" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Pricing
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TestTube className="h-6 w-6 text-primary" />
            <Badge variant="secondary">Test Mode</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">Test Checkout</h1>
          <p className="text-muted-foreground">
            Test the Stripe payment integration with our settlement agreement service
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Settlement Agreement Service
            </CardTitle>
            <CardDescription>
              Legal settlement document with DocuSign integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Pricing Breakdown */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>Settlement Agreement</span>
                  <span>${basePrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center mb-2 text-green-600">
                    <span>Discount (FIRST25)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>${finalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="space-y-2">
                <Label htmlFor="promo" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Promo Code
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="promo"
                    placeholder="Enter promo code (try: FIRST25)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && applyPromoCode()}
                  />
                  <Button variant="outline" onClick={applyPromoCode}>
                    Apply
                  </Button>
                </div>
                {discount > 0 && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    50% off applied!
                  </Badge>
                )}
              </div>

              {/* User Info */}
              {user ? (
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm font-medium">Signed in as:</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              ) : (
                <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20">
                  <p className="text-sm font-medium text-destructive">Authentication Required</p>
                  <p className="text-sm text-muted-foreground">
                    You need to sign in to test the payment flow.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleTestPayment}
              disabled={!user || loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Creating checkout..." : `Test Payment - $${finalPrice.toFixed(2)}`}
            </Button>
          </CardFooter>
        </Card>

        {/* Test Info */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">Test Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 dark:text-blue-200">
            <ul className="space-y-2">
              <li>• This is a test checkout to verify Stripe integration</li>
              <li>• Use test credit card: 4242 4242 4242 4242</li>
              <li>• Any future expiry date and CVC will work</li>
              <li>• Try promo code "FIRST25" for 50% discount</li>
              <li>• Payment will open in a new tab</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;