
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import ChatInterface from "@/components/ChatInterface";
import AIMediatorPanel from "@/components/AIMediatorPanel";
import PartyViews from "@/components/PartyViews";

export default function Mediation() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { session, messages, loading, sendMessage } = useSession(sessionId);
  const [profiles, setProfiles] = useState<{ [key: string]: { full_name: string } }>({});
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (session && profile) {
      // Determine current user's role
      if (session.party_a_id === profile.id) {
        setCurrentUserRole('party_a');
      } else if (session.party_b_id === profile.id) {
        setCurrentUserRole('party_b');
      } else if (session.created_by === profile.id) {
        setCurrentUserRole('party_a'); // Creator is party A
      }

      // Fetch profiles for all participants
      const fetchProfiles = async () => {
        const userIds = [session.party_a_id, session.party_b_id, session.created_by].filter(Boolean);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        if (error) {
          console.error('Error fetching profiles:', error);
          return;
        }

        const profileMap = data.reduce((acc, profile) => {
          acc[profile.id] = { full_name: profile.full_name };
          return acc;
        }, {} as { [key: string]: { full_name: string } });

        setProfiles(profileMap);
      };

      fetchProfiles();
    }
  }, [session, profile]);

  const statusConfig = {
    waiting: { icon: Clock, color: "bg-yellow-500", text: "Waiting for both parties" },
    active: { icon: Users, color: "bg-blue-500", text: "Mediation in progress" },
    paused: { icon: AlertCircle, color: "bg-orange-500", text: "Session paused" },
    completed: { icon: CheckCircle, color: "bg-green-500", text: "Settlement reached!" },
    cancelled: { icon: AlertCircle, color: "bg-red-500", text: "Session cancelled" }
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  const getPartyName = (partyId: string | null) => {
    if (!partyId || !profiles[partyId]) return "Unknown Party";
    return profiles[partyId].full_name;
  };

  const getAISummary = () => {
    if (messages.length === 0) return "Waiting for conversation to begin...";
    if (messages.length < 3) return "Listening to both parties...";
    if (messages.length < 10) return "Analyzing conflict points and identifying common ground...";
    return "Preparing settlement recommendations based on discussion...";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Session Not Found</h1>
          <p className="text-muted-foreground">The session you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[session.status as keyof typeof statusConfig]?.icon || AlertCircle;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-primary">AccordNow Mediation</h1>
              <p className="text-muted-foreground">Session: {session.session_code}</p>
              <p className="text-sm text-muted-foreground">{session.title}</p>
            </div>
            <Badge 
              variant="secondary" 
              className={`${statusConfig[session.status as keyof typeof statusConfig]?.color || 'bg-gray-500'} text-white px-4 py-2`}
            >
              <StatusIcon className="w-4 h-4 mr-2" />
              {statusConfig[session.status as keyof typeof statusConfig]?.text || 'Unknown Status'}
            </Badge>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Party Views and Chat */}
          <div className="lg:col-span-2 space-y-6">
            <PartyViews
              partyAName={getPartyName(session.party_a_id)}
              partyBName={getPartyName(session.party_b_id)}
              currentUserRole={currentUserRole}
              sessionStatus={session.status}
            />

            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              disputeDescription={session.dispute_description || "No description provided"}
              currentUserRole={currentUserRole}
              profiles={profiles}
            />
          </div>

          {/* AI Mediator Section */}
          <div>
            <AIMediatorPanel
              sessionStatus={session.status}
              aiSummary={getAISummary()}
              messageCount={messages.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
