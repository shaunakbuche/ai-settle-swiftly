import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
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
import { FileText, Users, Edit, CreditCard, Download, ArrowRight, ArrowLeft, Copy, UserCheck, Home, LogOut, SkipBack, SkipForward } from "lucide-react";
import PaymentModal from "@/components/PaymentModal";

interface SessionData {
  id: string;
  title: string;
  dispute_description: string;
  session_code: string;
  status: string;
  party_a_id?: string;
  party_b_id?: string;
  created_by: string;
  settlement_terms?: string;
  settlement_amount?: number;
}

interface DisputeData {
  title: string;
  description: string;
  partyAOutcome: string;
  partyBOutcome: string;
  generatedSettlement: string;
  partyAEdits: string[];
  partyBEdits: string[];
  finalSettlement: string;
}

type Step = 'waiting-for-party' | 'party-inputs' | 'settlement-draft' | 'edit-rounds' | 'checkout' | 'complete';
type UserRole = 'creator' | 'party_a' | 'party_b' | null;

export default function DisputeResolution() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { toast } = useToast();
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentStep, setCurrentStep] = useState<Step>('waiting-for-party');
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
  
  const [currentPartyTurn, setCurrentPartyTurn] = useState<'party_a' | 'party_b'>('party_a');
  const [generatingSettlement, setGeneratingSettlement] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (sessionId) {
      fetchSession();
    } else {
      // If no sessionId, redirect to create session
      navigate('/create-session');
    }
  }, [user, sessionId, navigate]);

  const fetchSession = async () => {
    if (!sessionId || !user) return;

    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Get user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      // Determine user role
      let role: UserRole = null;
      if (sessionData.created_by === profile.id) {
        role = 'creator';
      } else if (sessionData.party_a_id === profile.id) {
        role = 'party_a';
      } else if (sessionData.party_b_id === profile.id) {
        role = 'party_b';
      }

      setSession(sessionData);
      setUserRole(role);
      
      // Set dispute data from session
      setDisputeData(prev => ({
        ...prev,
        title: sessionData.title,
        description: sessionData.dispute_description || '',
        finalSettlement: sessionData.settlement_terms || ''
      }));

      // Determine current step based on session status
      if (sessionData.status === 'waiting' && !sessionData.party_b_id) {
        setCurrentStep('waiting-for-party');
      } else if (sessionData.status === 'active') {
        // Check if party inputs are complete
        if (!sessionData.settlement_terms) {
          setCurrentStep('party-inputs');
        } else {
          setCurrentStep('settlement-draft');
        }
      } else if (sessionData.status === 'completed') {
        setCurrentStep('complete');
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const stepProgress = {
    'waiting-for-party': 20,
    'party-inputs': 40,
    'settlement-draft': 60,
    'edit-rounds': 80,
    'checkout': 90,
    'complete': 100
  };

  const copySessionCode = () => {
    if (session?.session_code) {
      navigator.clipboard.writeText(session.session_code);
      toast({
        title: "Copied!",
        description: "Session code copied to clipboard"
      });
    }
  };

  const handleLeaveDispute = () => {
    if (confirm("Are you sure you want to leave this dispute? You can rejoin using the session code.")) {
      navigate('/');
    }
  };

  const handleGoBack = () => {
    const steps: Step[] = ['waiting-for-party', 'party-inputs', 'settlement-draft', 'edit-rounds', 'checkout', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleGoForward = () => {
    const steps: Step[] = ['waiting-for-party', 'party-inputs', 'settlement-draft', 'edit-rounds', 'checkout', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const canGoBack = () => {
    const steps: Step[] = ['waiting-for-party', 'party-inputs', 'settlement-draft', 'edit-rounds', 'checkout', 'complete'];
    return steps.indexOf(currentStep) > 0;
  };

  const canGoForward = () => {
    const steps: Step[] = ['waiting-for-party', 'party-inputs', 'settlement-draft', 'edit-rounds', 'checkout', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    return currentIndex < steps.length - 1 && currentIndex >= 0;
  };

  const handlePartyInputsSubmit = async () => {
    if (!disputeData.partyAOutcome || !disputeData.partyBOutcome) {
      toast({
        title: "Missing Information",
        description: "Both parties must enter their preferred outcomes",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save party inputs to session
      const { error } = await supabase
        .from('sessions')
        .update({
          status: 'active',
          // Store party inputs in settlement_terms temporarily
          settlement_terms: JSON.stringify({
            partyAOutcome: disputeData.partyAOutcome,
            partyBOutcome: disputeData.partyBOutcome
          })
        })
        .eq('id', sessionId);

      if (error) throw error;

      setCurrentStep('settlement-draft');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const generateSettlement = async () => {
    setGeneratingSettlement(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-mediator', {
        body: {
          sessionId: sessionId,
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

      // Save generated settlement to database
      await supabase
        .from('sessions')
        .update({ settlement_terms: settlement })
        .eq('id', sessionId);

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

    const isCurrentUserPartyA = userRole === 'party_a' || userRole === 'creator';
    const edits = isCurrentUserPartyA ? disputeData.partyAEdits : disputeData.partyBEdits;
    
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
      [isCurrentUserPartyA ? 'partyAEdits' : 'partyBEdits']: newEdits,
      finalSettlement: `${prev.generatedSettlement}\n\n${isCurrentUserPartyA ? 'Party A' : 'Party B'} Edit ${newEdits.length}: ${editText}`
    }));

    // Check if both parties have completed their edits
    const otherPartyEdits = isCurrentUserPartyA ? disputeData.partyBEdits : disputeData.partyAEdits;
    if (newEdits.length === 2 && otherPartyEdits.length === 2) {
      setCurrentStep('checkout');
    }
  };

  const handleCheckoutComplete = async () => {
    try {
      await supabase
        .from('sessions')
        .update({ 
          status: 'completed',
          settlement_terms: disputeData.finalSettlement 
        })
        .eq('id', sessionId);
      
      setCurrentStep('complete');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const downloadPDF = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-settlement-pdf', {
        body: { 
          sessionId: sessionId,
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

  const renderWaitingForParty = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Waiting for Second Party
        </CardTitle>
        <CardDescription>
          Share the session code with the other party to begin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Session Code</h3>
          <div className="flex items-center justify-center gap-2">
            <code className="text-2xl font-mono bg-background px-4 py-2 rounded">
              {session?.session_code}
            </code>
            <Button variant="outline" size="sm" onClick={copySessionCode}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Dispute Details:</h4>
          <div className="text-left p-4 bg-muted/50 rounded">
            <h5 className="font-medium">{session?.title}</h5>
            <p className="text-sm text-muted-foreground mt-1">
              {session?.dispute_description}
            </p>
          </div>
        </div>

        <p className="text-muted-foreground">
          Once the second party joins, you'll both be able to enter your preferred outcomes.
        </p>
      </CardContent>
    </Card>
  );

  const renderPartyInputs = () => {
    const isPartyA = userRole === 'party_a' || userRole === 'creator';
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Party Preferred Outcomes
            <Badge variant="secondary">
              You are {isPartyA ? 'Party A' : 'Party B'}
            </Badge>
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
              disabled={!isPartyA}
            />
            {isPartyA && disputeData.partyAOutcome && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                <UserCheck className="w-4 h-4" />
                Your input has been saved
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="partyB">Party B Preferred Outcome</Label>
            <Textarea
              id="partyB"
              value={disputeData.partyBOutcome}
              onChange={(e) => setDisputeData(prev => ({ ...prev, partyBOutcome: e.target.value }))}
              placeholder="What would Party B consider a fair resolution?"
              rows={4}
              disabled={isPartyA}
            />
            {!isPartyA && disputeData.partyBOutcome && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                <UserCheck className="w-4 h-4" />
                Your input has been saved
              </div>
            )}
          </div>
          
          {disputeData.partyAOutcome && disputeData.partyBOutcome ? (
            <Button onClick={handlePartyInputsSubmit} className="w-full">
              Generate Settlement <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="text-center text-muted-foreground">
              Waiting for both parties to complete their inputs...
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
            <Button onClick={() => setCurrentStep('edit-rounds')} className="w-full">
              Proceed to Edits <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderEditRounds = () => {
    const [editText, setEditText] = useState('');
    const isCurrentUserPartyA = userRole === 'party_a' || userRole === 'creator';
    const currentPartyEdits = isCurrentUserPartyA ? disputeData.partyAEdits : disputeData.partyBEdits;
    const otherPartyEdits = isCurrentUserPartyA ? disputeData.partyBEdits : disputeData.partyAEdits;
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Rounds
            <Badge variant="secondary">
              You are {isCurrentUserPartyA ? 'Party A' : 'Party B'}
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

          {currentPartyEdits.length < 2 ? (
            <>
              <div>
                <Label htmlFor="edit">
                  {isCurrentUserPartyA ? 'Party A' : 'Party B'} Edit {currentPartyEdits.length + 1}
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
                  You have completed your edits. Waiting for the other party...
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
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (!session) return <div className="min-h-screen bg-background flex items-center justify-center">Session not found</div>;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Dispute Resolution</h1>
          <p className="text-muted-foreground">
            Session Code: <code className="bg-muted px-2 py-1 rounded">{session.session_code}</code>
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoBack}
              disabled={!canGoBack()}
            >
              <SkipBack className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoForward}
              disabled={!canGoForward()}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Forward
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLeaveDispute}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Dispute
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-2xl mx-auto">
          <Progress value={stepProgress[currentStep]} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Waiting</span>
            <span>Inputs</span>
            <span>Settlement</span>
            <span>Edits</span>
            <span>Checkout</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'waiting-for-party' && renderWaitingForParty()}
        {currentStep === 'party-inputs' && renderPartyInputs()}
        {currentStep === 'settlement-draft' && renderSettlementDraft()}
        {currentStep === 'edit-rounds' && renderEditRounds()}
        {currentStep === 'checkout' && renderCheckout()}
        {currentStep === 'complete' && renderComplete()}

        {/* Payment Modal */}
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          sessionId={sessionId!}
          sessionCode={session.session_code}
        />
      </div>
    </div>
  );
}