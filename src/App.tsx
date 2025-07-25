
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecurityHeaders } from "@/components/SecurityHeaders";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import Index from "./pages/Index";
import CreateSession from "./pages/CreateSession";
import JoinSession from "./pages/JoinSession";
import Legal from "./pages/Legal";
import Mediation from "./pages/Mediation";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import HowItWorks from "./pages/HowItWorks";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import PaymentSuccess from "./pages/PaymentSuccess";
import DisputeResolution from "./pages/DisputeResolution";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SecurityHeaders />
    <AuthProvider>
      <AccessibilityProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create-session" element={<CreateSession />} />
            <Route path="/join-session" element={<JoinSession />} />
            <Route path="/mediation/:sessionId" element={<Mediation />} />
            <Route path="/dispute-resolution" element={<DisputeResolution />} />
            <Route path="/dispute-resolution/:sessionId" element={<DisputeResolution />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dispute-resolution" element={<DisputeResolution />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </AccessibilityProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
