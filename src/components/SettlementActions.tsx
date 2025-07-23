
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PaymentModal from "./PaymentModal";

interface SettlementActionsProps {
  sessionId: string;
  sessionCode: string;
  sessionStatus: string;
  settlementTerms?: string;
  settlementAmount?: number;
}

export default function SettlementActions({ 
  sessionId, 
  sessionCode, 
  sessionStatus, 
  settlementTerms, 
  settlementAmount 
}: SettlementActionsProps) {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const { toast } = useToast();

  const generateSettlementPdf = async () => {
    setGeneratingPdf(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-settlement-pdf', {
        body: { sessionId }
      });

      if (error) throw error;

      // Create and download HTML file
      const blob = new Blob([data.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Settlement document generated",
        description: "The settlement agreement has been downloaded to your device.",
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: "Generation Error",
        description: error.message || "Failed to generate settlement document",
        variant: "destructive",
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const canGenerateSettlement = sessionStatus === 'completed' || (settlementTerms && settlementTerms.trim().length > 0);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Settlement Actions
          </CardTitle>
          <CardDescription>
            Generate legal documents and process payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {canGenerateSettlement ? (
            <>
              <Button
                onClick={() => setPaymentModalOpen(true)}
                className="w-full"
                size="lg"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Process Payment & Finalize Agreement
              </Button>
              
              <Button
                onClick={generateSettlementPdf}
                variant="outline"
                className="w-full"
                disabled={generatingPdf}
              >
                <Download className="w-4 h-4 mr-2" />
                {generatingPdf ? "Generating..." : "Download Settlement Preview"}
              </Button>

              {settlementAmount && (
                <div className="text-center text-sm text-muted-foreground">
                  Settlement Amount: ${settlementAmount}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              <p className="mb-2">Settlement actions will be available once:</p>
              <ul className="text-sm space-y-1">
                <li>• Agreement terms are finalized</li>
                <li>• Both parties consent to settlement</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        sessionId={sessionId}
        sessionCode={sessionCode}
      />
    </>
  );
}
