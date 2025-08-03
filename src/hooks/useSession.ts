import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateSessionCode, validateInput, sanitizeText } from '@/lib/security';

interface SessionData {
  id: string;
  session_code: string;
  title: string;
  dispute_description: string;
  status: string;
  party_a_id: string | null;
  party_b_id: string | null;
  created_by: string;
  current_party: string;
  settlement_amount: number | null;
  settlement_terms: string | null;
  is_settled: boolean;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  session_id: string;
  sender_id: string | null;
  sender_role: string;
  content: string;
  message_type: string;
  created_at: string;
}

export const useSession = (sessionId?: string) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchSession = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        toast({
          title: "Session not found",
          description: "The session you're looking for doesn't exist.",
          variant: "destructive",
        });
        return;
      }

      setSession(data);
    } catch (error: any) {
      console.error('Error fetching session:', error);
      toast({
        title: "Error",
        description: "Failed to load session data.",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (content: string, messageType: 'text' | 'system' | 'ai_response' | 'settlement_proposal' = 'text') => {
    if (!session || !profile) return;
    
    // Validate and sanitize content
    if (!validateInput(content, 500)) {
      toast({
        title: "Invalid message",
        description: "Message content is invalid or too long.",
        variant: "destructive",
      });
      return;
    }
    
    const sanitizedContent = sanitizeText(content);

    try {
      const senderRole: 'party_a' | 'party_b' | 'mediator' = profile.id === session.party_a_id ? 'party_a' : 
                        profile.id === session.party_b_id ? 'party_b' : 'mediator';

      const { data, error } = await supabase
        .from('messages')
        .insert({
          session_id: session.id,
          sender_id: profile.id,
          sender_role: senderRole,
          content: sanitizedContent,
          message_type: messageType,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setMessages(prev => [...prev, data]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const createSession = async (title: string, disputeDescription: string) => {
    if (!profile) return null;

    try {
      const sessionCode = generateSessionCode();

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          session_code: sessionCode,
          title,
          dispute_description: disputeDescription,
          created_by: profile.id,
          party_a_id: profile.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Session created",
        description: `Session code: ${sessionCode}`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create session.",
        variant: "destructive",
      });
      return null;
    }
  };

  const joinSession = async (sessionCode: string) => {
    if (!profile) {
      toast({
        title: "Authentication Required",
        description: "Please ensure you're logged in to join a session.",
        variant: "destructive",
      });
      return null;
    }

    try {
      // First, find the session
      const { data: sessionData, error: findError } = await supabase
        .from('sessions')
        .select('*')
        .eq('session_code', sessionCode)
        .maybeSingle();

      if (findError) {
        console.error('Error finding session:', findError);
        throw findError;
      }

      if (!sessionData) {
        toast({
          title: "Session not found",
          description: "The session code you entered is invalid or the session no longer exists.",
          variant: "destructive",
        });
        return null;
      }

      // Check if user is already part of this session
      if (sessionData.party_a_id === profile.id || sessionData.party_b_id === profile.id) {
        toast({
          title: "Already joined",
          description: "You're already a participant in this session.",
          variant: "destructive",
        });
        return sessionData;
      }

      // Check if session is already full
      if (sessionData.party_b_id) {
        toast({
          title: "Session full",
          description: "This session already has two participants.",
          variant: "destructive",
        });
        return null;
      }

      // Check if session is still in waiting status
      if (sessionData.status !== 'waiting') {
        toast({
          title: "Session unavailable",
          description: `This session is ${sessionData.status} and cannot be joined.`,
          variant: "destructive",
        });
        return null;
      }

      // Update session to add this user as party_b
      const { data, error } = await supabase
        .from('sessions')
        .update({
          party_b_id: profile.id,
          status: 'active',
        })
        .eq('id', sessionData.id)
        .eq('status', 'waiting') // Additional safety check
        .eq('party_b_id', null) // Ensure it's still empty
        .select()
        .single();

      if (error) {
        console.error('Error joining session:', error);
        if (error.code === 'PGRST116') {
          toast({
            title: "Session unavailable",
            description: "This session is no longer available or has already been joined by someone else.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return null;
      }

      toast({
        title: "Joined session successfully",
        description: "You have successfully joined the mediation session.",
      });

      return data;
    } catch (error: any) {
      console.error('Error joining session:', error);
      
      if (error.message?.includes('policy')) {
        toast({
          title: "Permission denied",
          description: "You don't have permission to join this session.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection error",
          description: "Failed to join session. Please check your internet connection and try again.",
          variant: "destructive",
        });
      }
      return null;
    }
  };

  useEffect(() => {
    if (sessionId) {
      setLoading(true);
      Promise.all([
        fetchSession(sessionId),
        fetchMessages(sessionId),
      ]).finally(() => {
        setLoading(false);
      });

      // Set up real-time subscription for messages
      const messagesChannel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            console.log('New message received:', newMessage);
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(msg => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          }
        )
        .subscribe();

      // Set up real-time subscription for session updates
      const sessionChannel = supabase
        .channel('session-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'sessions',
            filter: `id=eq.${sessionId}`,
          },
          (payload) => {
            const updatedSession = payload.new as SessionData;
            console.log('Session updated:', updatedSession);
            setSession(updatedSession);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(sessionChannel);
      };
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  return {
    session,
    messages,
    loading,
    sendMessage,
    createSession,
    joinSession,
    fetchSession,
    fetchMessages,
  };
};
