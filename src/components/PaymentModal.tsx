
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateInput } from "@/lib/security";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionCode: string;
}

export default function PaymentModal({ isOpen, onClose, sessionId, sessionCode }: PaymentModalProps) {
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const { toast } = useToast();

  const applyPromoCode = async () => {
    if (!validateInput(promoCode, 20)) {
      toast({
        title: "Invalid promo code",
        description: "Please enter a valid promo code.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Validate promo code against database
      const { data: promoCodeData, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .single();

      if (error || !promoCodeData) {
        toast({
          title: "Invalid promo code",
          description: "Please check your code and try again.",
          variant: "destructive",
        });
        setDiscount(0);
        return;
      }

      // Check if promo code has usage limit
      if (promoCodeData.usage_limit && promoCodeData.used_count >= promoCodeData.usage_limit) {
        toast({
          title: "Promo code expired",
          description: "This promo code has reached its usage limit.",
          variant: "destructive",
        });
        setDiscount(0);
        return;
      }

      setDiscount(promoCodeData.discount_percentage);
      toast({
        title: "Promo code applied!",
        description: `${promoCodeData.discount_percentage}% discount has been applied to your order.`,
      });
    } catch (error) {
      console.error('Promo code error:', error);
      toast({
        title: "Error",
        description: "Failed to apply promo code. Please try again.",
        variant: "destructive",
      });
      setDiscount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          sessionId,
          promoCode: promoCode.toUpperCase() === "FIRST25" ? "FIRST25" : null
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      onClose();
      
      // Also create DocuSign envelope after successful payment setup
      setTimeout(async () => {
        try {
          await supabase.functions.invoke('create-docusign-envelope', {
            body: { sessionId }
          });
        } catch (envelopeError) {
          console.error('Failed to create DocuSign envelope:', envelopeError);
        }
      }, 2000);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const originalPrice = 5.00;
  const finalPrice = originalPrice * (1 - discount / 100);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Complete Your Settlement
          </DialogTitle>
          <DialogDescription>
            Session: {sessionCode}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Settlement Agreement Fee</h4>
            <div className="flex justify-between items-center">
              <span>AccordNow Service Fee</span>
              <div className="text-right">
                {discount > 0 && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
                <div className="text-lg font-bold">
                  ${finalPrice.toFixed(2)}
                </div>
              </div>
            </div>
            {discount > 0 && (
              <Badge variant="secondary" className="mt-2">
                {discount}% discount applied!
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo">Promo Code (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="promo"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button variant="outline" onClick={applyPromoCode}>
                <Tag className="w-4 h-4 mr-2" />
                Apply
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Try "FIRST25" for 50% off your first agreement
            </p>
          </div>

          <div className="pt-4 space-y-2">
            <Button 
              onClick={handlePayment} 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading ? "Processing..." : `Pay $${finalPrice.toFixed(2)} & Generate Agreement`}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Secure payment processed by Stripe
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
