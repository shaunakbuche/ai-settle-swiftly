
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, CreditCard, Users, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PaymentModal from "./PaymentModal";

interface DocuSignEnvelope {
  id: string;
  envelope_id: string;
  status: string;
  party_a_signed: boolean;
  party_b_signed: boolean;
  completed_at?: string;
}

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
  const [envelope, setEnvelope] = useState<DocuSignEnvelope | null>(null);
  const [creatingEnvelope, setCreatingEnvelope] = useState(false);
  const { toast } = useToast();

  // Fetch DocuSign envelope status
  useEffect(() => {
    const fetchEnvelope = async () => {
      try {
        const { data, error } = await supabase
          .from('docusign_envelopes')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (!error && data) {
          setEnvelope(data);
        }
      } catch (error) {
        // No envelope exists yet, which is fine
      }
    };

    fetchEnvelope();
  }, [sessionId]);

  const createDocuSignEnvelope = async () => {
    setCreatingEnvelope(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-docusign-envelope', {
        body: { sessionId }
      });

      if (error) throw error;

      toast({
        title: "Settlement sent for signature",
        description: "DocuSign envelopes have been sent to both parties for electronic signature.",
      });

      // Refresh envelope status
      setTimeout(() => {
        const fetchEnvelope = async () => {
          const { data: envelopeData } = await supabase
            .from('docusign_envelopes')
            .select('*')
            .eq('session_id', sessionId)
            .single();
          
          if (envelopeData) {
            setEnvelope(envelopeData);
          }
        };
        fetchEnvelope();
      }, 1000);

    } catch (error: any) {
      console.error('DocuSign envelope creation error:', error);
      toast({
        title: "DocuSign Error",
        description: error.message || "Failed to create settlement envelope",
        variant: "destructive",
      });
    } finally {
      setCreatingEnvelope(false);
    }
  };

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

  const getSigningStatus = () => {
    if (!envelope) return null;
    
    if (envelope.status === 'envelope-completed') {
      return {
        icon: CheckCircle,
        text: "Settlement Fully Executed",
        subtext: "Both parties have signed the agreement",
        color: "text-green-600"
      };
    }
    
    if (envelope.party_a_signed && envelope.party_b_signed) {
      return {
        icon: CheckCircle,
        text: "Settlement Fully Executed",
        subtext: "Both parties have signed the agreement",
        color: "text-green-600"
      };
    }
    
    if (envelope.party_a_signed || envelope.party_b_signed) {
      return {
        icon: Clock,
        text: "Partially Signed",
        subtext: "Waiting for remaining party to sign",
        color: "text-amber-600"
      };
    }
    
    return {
      icon: Users,
      text: "Sent for Signatures",
      subtext: "Waiting for both parties to sign",
      color: "text-blue-600"
    };
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
        <CardContent className="space-y-4">
          {/* DocuSign Status Display */}
          {envelope && (
            <div className="p-4 border rounded-lg bg-muted/50">
              {(() => {
                const status = getSigningStatus();
                if (!status) return null;
                const Icon = status.icon;
                return (
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${status.color}`} />
                    <div>
                      <p className={`font-medium ${status.color}`}>{status.text}</p>
                      <p className="text-sm text-muted-foreground">{status.subtext}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {canGenerateSettlement ? (
            <>
              {!envelope ? (
                <>
                  <Button
                    onClick={() => setPaymentModalOpen(true)}
                    className="w-full"
                    size="lg"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Process Payment & Send for Signature
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={createDocuSignEnvelope}
                      variant="outline"
                      className="flex-1"
                      disabled={creatingEnvelope}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {creatingEnvelope ? "Sending..." : "Send for E-Signature"}
                    </Button>
                    
                    <Button
                      onClick={generateSettlementPdf}
                      variant="outline"
                      className="flex-1"
                      disabled={generatingPdf}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {generatingPdf ? "Generating..." : "Preview PDF"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {envelope.status === 'envelope-completed' || (envelope.party_a_signed && envelope.party_b_signed) ? (
                    <div className="space-y-2">
                      <Button
                        onClick={generateSettlementPdf}
                        className="w-full"
                        size="lg"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Signed Agreement
                      </Button>
                      <p className="text-center text-sm text-green-600">
                        ✓ Settlement agreement fully executed
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={generateSettlementPdf}
                        variant="outline"
                        className="w-full"
                        disabled={generatingPdf}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {generatingPdf ? "Generating..." : "Download Current Version"}
                      </Button>
                      <p className="text-center text-sm text-muted-foreground">
                        Signatures pending - document will update once both parties sign
                      </p>
                    </div>
                  )}
                </>
              )}

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
