import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsEvent {
  event_type: string;
  session_id?: string;
  event_data?: Record<string, any>;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  const track = async (event: AnalyticsEvent) => {
    try {
      // Input validation
      if (!event.event_type || typeof event.event_type !== 'string') {
        console.error('Analytics: Invalid event type');
        return;
      }

      // Ensure valid event types for null user_id tracking
      const allowedSystemEvents = ['page_view', 'system_event', 'error_tracking'];
      if (!user?.id && !allowedSystemEvents.includes(event.event_type)) {
        console.error('Analytics: Unauthorized event type for unauthenticated user');
        return;
      }

      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: user?.id || null,
          session_id: event.session_id || null,
          event_type: event.event_type,
          event_data: event.event_data || {}
        });

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  // Track page views automatically
  useEffect(() => {
    const path = window.location.pathname;
    track({
      event_type: 'page_view',
      event_data: { path }
    });
  }, []);

  return { track };
};