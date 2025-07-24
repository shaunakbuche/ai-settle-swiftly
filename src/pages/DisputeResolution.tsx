import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Users, Edit, CreditCard, Download, ArrowRight, ArrowLeft } from "lucide-react";
import PaymentModal from "@/components/PaymentModal";

interface DisputeData {
  title: string;
  description: string;
  partyAOutcome: string;
  partyBOutcome: string;
  generatedSettlement: string;
  partyAEdits: string[];
  partyBEdits: string[];
  finalSettlement: string;
  sessionId?: string;
  sessionCode?: string;
}

type Step = 'dispute' | 'party-inputs' | 'settlement-draft' | 'edit-rounds' | 'checkout' | 'complete';

export default function DisputeResolution() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<Step>('dispute');
  const [disputeData, setDisputeData] = useState<DisputeData>({
    title: '',
    description: '',
    partyAOutcome: '',
    partyBOutcome: '',
    generatedSettlement: '',
    partyAEdits: [],
    partyBEdits: [],
    finalSettlement: ''
  });
  
  const [isPartyA, setIsPartyA] = useState(true);
  const [generatingSettlement, setGeneratingSettlement] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentEditRound, setCurrentEditRound] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const stepProgress = {
    'dispute': 16,
    'party-inputs': 33,
    'settlement-draft': 50,
    'edit-rounds': 66,
    'checkout': 83,
    'complete': 100
  };

  const handleDisputeSubmit = async () => {
    if (!disputeData.title || !disputeData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all dispute details",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a session for this dispute resolution
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      const { data: session, error } = await supabase
        .from('sessions')
        .insert([{
          title: disputeData.title,
          dispute_description: disputeData.description,
          status: 'active',
          session_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          created_by: profile.id,
          party_a_id: profile.id
        }])
        .select()
        .single();

      if (error) throw error;

      setDisputeData(prev => ({
        ...prev,
        sessionId: session.id,
        sessionCode: session.session_code
      }));

      setCurrentStep('party-inputs');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handlePartyInputsSubmit = () => {
    if (!disputeData.partyAOutcome || !disputeData.partyBOutcome) {
      toast({
        title: "Missing Information",
        description: "Both parties must enter their preferred outcomes",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('settlement-draft');
  };

  const generateSettlement = async () => {
    setGeneratingSettlement(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-mediator', {
        body: {
          sessionId: disputeData.sessionId,
          prompt: `Generate a fair settlement proposal for this dispute:
          
Dispute: ${disputeData.description}
Party A wants: ${disputeData.partyAOutcome}
Party B wants: ${disputeData.partyBOutcome}

Please provide a balanced settlement that addresses both parties' concerns and suggests specific terms, including any monetary amounts if applicable.`
        }
      });

      if (error) throw error;

      const settlement = data.response || "Settlement generation failed. Please try again.";
      setDisputeData(prev => ({
        ...prev,
        generatedSettlement: settlement,
        finalSettlement: settlement
      }));

      toast({
        title: "Settlement Generated",
        description: "AI has generated a settlement proposal based on both parties' inputs"
      });

    } catch (error: any) {
      toast({
        title: "Generation Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setGeneratingSettlement(false);
    }
  };

  const handleEdit = (editText: string) => {
    if (!editText.trim()) return;

    const edits = isPartyA ? disputeData.partyAEdits : disputeData.partyBEdits;
    if (edits.length >= 2) {
      toast({
        title: "Edit Limit Reached",
        description: "Each party can only make 2 edits",
        variant: "destructive"
      });
      return;
    }

    const newEdits = [...edits, editText];
    setDisputeData(prev => ({
      ...prev,
      [isPartyA ? 'partyAEdits' : 'partyBEdits']: newEdits,
      finalSettlement: `${prev.generatedSettlement}\n\n${isPartyA ? 'Party A' : 'Party B'} Edit ${newEdits.length}: ${editText}`
    }));

    // Switch to other party or move to checkout if both parties have made their edits
    const otherPartyEdits = isPartyA ? disputeData.partyBEdits : disputeData.partyAEdits;
    if (newEdits.length === 2 && otherPartyEdits.length === 2) {
      setCurrentStep('checkout');
    } else if (newEdits.length < 2) {
      setIsPartyA(!isPartyA);
    }
  };

  const handleCheckoutComplete = () => {
    setCurrentStep('complete');
  };

  const downloadPDF = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-settlement-pdf', {
        body: { 
          sessionId: disputeData.sessionId,
          customSettlement: disputeData.finalSettlement
        }
      });

      if (error) throw error;

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
        title: "Settlement Downloaded",
        description: "Your final settlement agreement has been downloaded"
      });
    } catch (error: any) {
      toast({
        title: "Download Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const renderDisputeEntry = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Enter Dispute Details
        </CardTitle>
        <CardDescription>
          Describe the dispute that needs resolution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Dispute Title</Label>
          <Input
            id="title"
            value={disputeData.title}
            onChange={(e) => setDisputeData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Brief title for your dispute"
          />
        </div>
        <div>
          <Label htmlFor="description">Dispute Description</Label>
          <Textarea
            id="description"
            value={disputeData.description}
            onChange={(e) => setDisputeData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Provide detailed information about the dispute..."
            rows={6}
          />
        </div>
        <Button onClick={handleDisputeSubmit} className="w-full">
          Continue to Party Inputs <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderPartyInputs = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Party Preferred Outcomes
        </CardTitle>
        <CardDescription>
          Both parties should enter their ideal resolution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="partyA">Party A Preferred Outcome</Label>
          <Textarea
            id="partyA"
            value={disputeData.partyAOutcome}
            onChange={(e) => setDisputeData(prev => ({ ...prev, partyAOutcome: e.target.value }))}
            placeholder="What would Party A consider a fair resolution?"
            rows={4}
          />
        </div>
        <div>
          <Label htmlFor="partyB">Party B Preferred Outcome</Label>
          <Textarea
            id="partyB"
            value={disputeData.partyBOutcome}
            onChange={(e) => setDisputeData(prev => ({ ...prev, partyBOutcome: e.target.value }))}
            placeholder="What would Party B consider a fair resolution?"
            rows={4}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentStep('dispute')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={handlePartyInputsSubmit} className="flex-1">
            Generate Settlement <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSettlementDraft = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          AI-Generated Settlement Draft
        </CardTitle>
        <CardDescription>
          Review the automatically generated settlement proposal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!disputeData.generatedSettlement ? (
          <div className="text-center py-8">
            <Button 
              onClick={generateSettlement} 
              disabled={generatingSettlement}
              size="lg"
            >
              {generatingSettlement ? "Generating Settlement..." : "Generate AI Settlement"}
            </Button>
          </div>
        ) : (
          <>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Generated Settlement:</h4>
              <p className="whitespace-pre-wrap">{disputeData.generatedSettlement}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('party-inputs')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={() => setCurrentStep('edit-rounds')} className="flex-1">
                Proceed to Edits <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderEditRounds = () => {
    const [editText, setEditText] = useState('');
    const currentPartyEdits = isPartyA ? disputeData.partyAEdits : disputeData.partyBEdits;
    const otherPartyEdits = isPartyA ? disputeData.partyBEdits : disputeData.partyAEdits;
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Rounds
            <Badge variant="secondary">
              {isPartyA ? 'Party A' : 'Party B'} Turn
            </Badge>
          </CardTitle>
          <CardDescription>
            Each party can make up to 2 edits to refine the settlement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Party A Edits ({disputeData.partyAEdits.length}/2)</h4>
              {disputeData.partyAEdits.map((edit, index) => (
                <div key={index} className="p-2 bg-blue-50 rounded text-sm mb-2">
                  Edit {index + 1}: {edit}
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-semibold mb-2">Party B Edits ({disputeData.partyBEdits.length}/2)</h4>
              {disputeData.partyBEdits.map((edit, index) => (
                <div key={index} className="p-2 bg-green-50 rounded text-sm mb-2">
                  Edit {index + 1}: {edit}
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Current Settlement:</h4>
            <p className="whitespace-pre-wrap text-sm">{disputeData.finalSettlement}</p>
          </div>

          {currentPartyEdits.length < 2 && (otherPartyEdits.length < 2 || currentPartyEdits.length < otherPartyEdits.length) ? (
            <>
              <div>
                <Label htmlFor="edit">
                  {isPartyA ? 'Party A' : 'Party B'} Edit {currentPartyEdits.length + 1}
                </Label>
                <Textarea
                  id="edit"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Describe your requested changes to the settlement..."
                  rows={3}
                />
              </div>
              <Button 
                onClick={() => {
                  handleEdit(editText);
                  setEditText('');
                }}
                disabled={!editText.trim()}
                className="w-full"
              >
                Submit Edit
              </Button>
            </>
          ) : (
            <div className="text-center">
              {disputeData.partyAEdits.length === 2 && disputeData.partyBEdits.length === 2 ? (
                <Button onClick={() => setCurrentStep('checkout')} size="lg">
                  Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <p className="text-muted-foreground">
                  Waiting for {isPartyA ? 'Party B' : 'Party A'} to complete their edits...
                  <Button 
                    variant="outline" 
                    onClick={() => setIsPartyA(!isPartyA)}
                    className="ml-2"
                  >
                    Switch to {isPartyA ? 'Party B' : 'Party A'}
                  </Button>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCheckout = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Finalize Settlement
        </CardTitle>
        <CardDescription>
          Complete payment to finalize your settlement agreement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Final Settlement Agreement:</h4>
          <p className="whitespace-pre-wrap text-sm">{disputeData.finalSettlement}</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentStep('edit-rounds')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Edits
          </Button>
          <Button 
            onClick={() => setPaymentModalOpen(true)}
            className="flex-1"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Process Payment & Finalize
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderComplete = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Settlement Complete
        </CardTitle>
        <CardDescription>
          Your dispute has been successfully resolved
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="p-6 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            🎉 Settlement Finalized!
          </h3>
          <p className="text-green-700">
            Both parties have agreed to the terms and payment has been processed.
          </p>
        </div>

        <Button onClick={downloadPDF} size="lg" className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Download Final Settlement PDF
        </Button>

        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="w-full"
        >
          Return to Home
        </Button>
      </CardContent>
    </Card>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Structured Dispute Resolution</h1>
          <p className="text-muted-foreground">
            Follow the guided process to resolve your dispute efficiently
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-2xl mx-auto">
          <Progress value={stepProgress[currentStep]} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Dispute Entry</span>
            <span>Party Inputs</span>
            <span>Settlement</span>
            <span>Edits</span>
            <span>Checkout</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'dispute' && renderDisputeEntry()}
        {currentStep === 'party-inputs' && renderPartyInputs()}
        {currentStep === 'settlement-draft' && renderSettlementDraft()}
        {currentStep === 'edit-rounds' && renderEditRounds()}
        {currentStep === 'checkout' && renderCheckout()}
        {currentStep === 'complete' && renderComplete()}

        {/* Payment Modal */}
        {disputeData.sessionId && disputeData.sessionCode && (
          <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            sessionId={disputeData.sessionId}
            sessionCode={disputeData.sessionCode}
          />
        )}
      </div>
    </div>
  );
}