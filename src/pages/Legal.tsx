import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Scale, Users, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useEffect } from 'react';
import logoShield from "@/assets/accordnow-logo-shield.png";

const Legal = () => {
  const { track } = useAnalytics();

  useEffect(() => {
    track({
      event_type: 'legal_page_view',
      event_data: { page: 'legal_compliance' }
    });
  }, [track]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
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
      
      <div className="container mx-auto py-8 max-w-4xl space-y-8">

        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Legal Information</h1>
          <p className="text-muted-foreground mt-2">
            Terms, policies, and legal framework for AccordNow dispute resolution services
          </p>
        </div>

        {/* Terms of Service */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Terms of Service
            </CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing and using AccordNow ("Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h3>2. Service Description</h3>
            <p>
              AccordNow provides AI-assisted dispute resolution and mediation services. We facilitate communication between parties and provide tools for settlement documentation, but do not provide legal advice.
            </p>

            <h3>3. User Responsibilities</h3>
            <ul>
              <li>Provide accurate and truthful information</li>
              <li>Participate in good faith in mediation processes</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Respect the confidentiality of mediation proceedings</li>
            </ul>

            <h3>4. Mediation Process</h3>
            <p>
              Our mediation process is non-binding unless parties agree to binding arbitration. Settlement agreements become legally binding upon execution by both parties through our DocuSign integration.
            </p>

            <h3>5. Confidentiality</h3>
            <p>
              All mediation communications are confidential and cannot be used in subsequent legal proceedings, except as required by law or to enforce settlement agreements.
            </p>

            <h3>6. Payment and Fees</h3>
            <p>
              Service fees are charged per successful settlement ($4.99 per agreement). Payment is processed securely through Stripe. Refunds may be available under specific circumstances outlined in our refund policy.
            </p>

            <h3>7. Electronic Signatures</h3>
            <p>
              Settlement agreements are executed through DocuSign electronic signature technology. Electronic signatures are legally binding and enforceable under the Electronic Signatures in Global and National Commerce Act (ESIGN) and Uniform Electronic Transactions Act (UETA).
            </p>

            <h3>8. Limitation of Liability</h3>
            <p>
              AccordNow's liability is limited to the amount paid for services. We are not liable for indirect, incidental, or consequential damages.
            </p>

            <h3>9. Intellectual Property</h3>
            <p>
              All content, trademarks, and intellectual property on this platform remain the property of AccordNow or respective owners.
            </p>

            <h3>10. Dispute Resolution</h3>
            <p>
              Any disputes arising from these terms shall be resolved through binding arbitration in accordance with the rules set forth below.
            </p>

            <h3>11. Termination</h3>
            <p>
              Either party may terminate this agreement at any time. Termination does not affect existing settlement agreements or obligations.
            </p>
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Policy
            </CardTitle>
            <CardDescription>
              How we collect, use, and protect your information
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h3>Information We Collect</h3>
            <ul>
              <li><strong>Personal Information:</strong> Name, email address, and contact details provided during registration</li>
              <li><strong>Dispute Information:</strong> Case details, messages, settlement terms, and mediation communications</li>
              <li><strong>Usage Data:</strong> Platform interactions, session analytics, page views, and performance metrics</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we don't store payment details)</li>
              <li><strong>Electronic Signature Data:</strong> DocuSign envelope status and signature completion information</li>
            </ul>

            <h3>How We Use Information</h3>
            <ul>
              <li>Facilitate dispute resolution and mediation services</li>
              <li>Generate AI-assisted settlement recommendations using OpenAI</li>
              <li>Process payments and maintain service records</li>
              <li>Create and manage electronic signature workflows</li>
              <li>Improve platform functionality and user experience through analytics</li>
              <li>Comply with legal obligations and enforce agreements</li>
            </ul>

            <h3>Information Sharing</h3>
            <p>
              We do not sell personal information. We may share information with:
            </p>
            <ul>
              <li>Other parties in your mediation (as necessary for the process)</li>
              <li>Service providers (Stripe for payments, Supabase for hosting, DocuSign for signatures, OpenAI for AI services)</li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h3>Data Security</h3>
            <p>
              We implement industry-standard security measures including:
            </p>
            <ul>
              <li>End-to-end encryption for all communications</li>
              <li>Secure cloud hosting with Supabase</li>
              <li>Role-based access controls and audit logging</li>
              <li>Regular security assessments and updates</li>
            </ul>

            <h3>Data Retention</h3>
            <p>
              We retain information for as long as necessary to provide services and comply with legal obligations. Settlement agreements and related documents are archived permanently for legal compliance. Session data may be retained for up to 7 years.
            </p>

            <h3>Your Rights</h3>
            <ul>
              <li>Access and review your personal information</li>
              <li>Request corrections to inaccurate data</li>
              <li>Request deletion of data (subject to legal requirements)</li>
              <li>Export your data in portable format</li>
              <li>Opt out of non-essential analytics tracking</li>
            </ul>

            <h3>Cookies and Analytics</h3>
            <p>
              We use essential cookies for platform functionality and analytics cookies to improve user experience. You can manage cookie preferences in your browser. We track anonymized usage patterns to improve our service.
            </p>

            <h3>International Users</h3>
            <p>
              If you are located outside the United States, please note that your information will be transferred to and processed in the United States, where our servers are located.
            </p>

            <h3>Contact Information</h3>
            <p>
              For privacy-related questions or requests, contact us at privacy@accordnow.com
            </p>
          </CardContent>
        </Card>

        {/* Arbitration Agreement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Binding Arbitration Agreement
            </CardTitle>
            <CardDescription>
              Resolution of disputes arising from service use
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h3>Mandatory Arbitration</h3>
            <p>
              <strong>PLEASE READ THIS SECTION CAREFULLY.</strong> Any dispute, claim, or controversy arising out of or relating to these Terms or the breach, termination, enforcement, interpretation, or validity thereof, including the determination of the scope or applicability of this agreement to arbitrate, shall be determined by arbitration before a single arbitrator rather than in court.
            </p>

            <h3>Arbitration Rules and Process</h3>
            <ul>
              <li><strong>Administrator:</strong> American Arbitration Association (AAA)</li>
              <li><strong>Rules:</strong> AAA Consumer Arbitration Rules (for consumer disputes) or Commercial Arbitration Rules (for business disputes)</li>
              <li><strong>Location:</strong> Your state of residence or mutually agreed location</li>
              <li><strong>Language:</strong> English</li>
              <li><strong>Arbitrator Selection:</strong> Single arbitrator selected according to AAA rules</li>
            </ul>

            <h3>Arbitrator Authority</h3>
            <p>
              The arbitrator shall have exclusive authority to resolve all disputes, including but not limited to:
            </p>
            <ul>
              <li>Interpretation and enforceability of this arbitration agreement</li>
              <li>Disputes about arbitration procedures or arbitrator selection</li>
              <li>All substantive matters relating to the dispute</li>
              <li>Awarding damages, injunctive relief, or other remedies available at law or equity</li>
            </ul>

            <h3>Class Action Waiver</h3>
            <p>
              <strong>YOU AGREE THAT ANY ARBITRATION SHALL BE CONDUCTED IN YOUR INDIVIDUAL CAPACITY ONLY AND NOT AS A CLASS ACTION OR OTHER REPRESENTATIVE ACTION.</strong> You agree to waive any right to participate in a class action lawsuit or class-wide arbitration.
            </p>

            <h3>Costs and Fees</h3>
            <p>
              Payment of arbitration fees shall be governed by AAA rules. For consumer disputes under $75,000, AccordNow will pay all arbitration fees. Each party shall bear their own attorney fees unless the arbitrator awards attorney fees under applicable law.
            </p>

            <h3>Exceptions to Arbitration</h3>
            <p>
              This arbitration agreement does not apply to:
            </p>
            <ul>
              <li>Individual actions in small claims court (up to the jurisdictional limit)</li>
              <li>Intellectual property disputes</li>
              <li>Claims seeking injunctive relief for unauthorized use of the service</li>
              <li>Enforcement of settlement agreements reached through our platform</li>
            </ul>

            <h3>Opt-Out Right</h3>
            <p>
              <strong>You may opt out of this arbitration agreement by emailing legal@accordnow.com within 30 days of first using the service.</strong> Your opt-out notice must include your name, address, email, and a clear statement that you wish to opt out of arbitration.
            </p>

            <h3>Severability</h3>
            <p>
              If any portion of this arbitration agreement is deemed unenforceable, the remainder shall remain in full force and effect, except that if the class action waiver is unenforceable, this entire arbitration agreement shall be null and void.
            </p>

            <h3>Future Changes</h3>
            <p>
              AccordNow may modify this arbitration agreement, but changes will not apply to disputes arising before the effective date of the modification.
            </p>
          </CardContent>
        </Card>

        {/* DMCA Notice */}
        <Card>
          <CardHeader>
            <CardTitle>Digital Millennium Copyright Act (DMCA) Notice</CardTitle>
            <CardDescription>
              Copyright infringement notification procedures
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              AccordNow respects intellectual property rights. If you believe content on our platform infringes your copyright, please send a DMCA notice to:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p><strong>DMCA Agent:</strong><br />
              AccordNow Legal Department<br />
              Email: dmca@accordnow.com<br />
              Address: 123 Legal Plaza, San Francisco, CA 94102</p>
            </div>
            <p>
              Your notice must include the required elements under 17 U.S.C. § 512(c)(3).
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contact Us
            </CardTitle>
            <CardDescription>
              Get in touch for legal questions or concerns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">General Legal Inquiries</h4>
                <p className="text-sm text-muted-foreground">legal@accordnow.com</p>
              </div>
              <div>
                <h4 className="font-medium">Privacy Concerns</h4>
                <p className="text-sm text-muted-foreground">privacy@accordnow.com</p>
              </div>
              <div>
                <h4 className="font-medium">Compliance Issues</h4>
                <p className="text-sm text-muted-foreground">compliance@accordnow.com</p>
              </div>
              <div>
                <h4 className="font-medium">DMCA Notices</h4>
                <p className="text-sm text-muted-foreground">dmca@accordnow.com</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium">Mailing Address</h4>
                <p className="text-sm text-muted-foreground">
                  AccordNow Legal Department<br />
                  123 Legal Plaza<br />
                  San Francisco, CA 94102<br />
                  United States
                </p>
              </div>
              <div>
                <h4 className="font-medium">Business Hours</h4>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday: 9:00 AM - 5:00 PM PST<br />
                  We aim to respond to all inquiries within 48 hours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Document History</CardTitle>
            <CardDescription>Track changes to our legal documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Terms of Service</span>
                <span className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Privacy Policy</span>
                <span className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Arbitration Agreement</span>
                <span className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              We may update these legal documents from time to time. Material changes will be communicated to users via email or platform notification at least 30 days before taking effect.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Legal;