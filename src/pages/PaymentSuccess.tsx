
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Your settlement agreement fee has been processed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">What's Next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>• Your legal settlement document is being prepared</li>
                <li>• Both parties will receive signing instructions</li>
                <li>• Document becomes legally binding once signed</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Dashboard
                </Link>
              </Button>
              
              {sessionId && (
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/mediation/${sessionId}`}>
                    <FileText className="w-4 h-4 mr-2" />
                    View Session Details
                  </Link>
                </Button>
              )}
            </div>

            {countdown > 0 && (
              <p className="text-xs text-muted-foreground">
                Redirecting to dashboard in {countdown} seconds...
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
