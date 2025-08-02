import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Activity
} from "lucide-react";
import PartyDashboard from "@/components/PartyDashboard";
import SessionProgress from "@/components/SessionProgress";
import PartyNotifications from "@/components/PartyNotifications";
import SessionStats from "@/components/SessionStats";
import logoShield from "@/assets/accordnow-logo-shield.png";

interface Session {
  id: string;
  title: string;
  session_code: string;
  status: string;
  created_at: string;
  dispute_description?: string;
  settlement_amount?: number;
  party_a_id?: string;
  party_b_id?: string;
  created_by: string;
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserSessions();
  }, [user, navigate]);

  const fetchUserSessions = async () => {
    if (!user) return;

    try {
      // Get user's profile first
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Fetch sessions where user is creator, party A, or party B
      const { data: sessionsData, error } = await supabase
        .from('sessions')
        .select('*')
        .or(`created_by.eq.${userProfile.id},party_a_id.eq.${userProfile.id},party_b_id.eq.${userProfile.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSessions(sessionsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSessionStats = () => {
    const total = sessions.length;
    const active = sessions.filter(s => s.status === 'active').length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const waiting = sessions.filter(s => s.status === 'waiting').length;

    return { total, active, completed, waiting };
  };

  const stats = getSessionStats();

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3">
                <img 
                  src={logoShield} 
                  alt="AccordNow" 
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-foreground">AccordNow</span>
              </Link>
              <Badge variant="secondary" className="ml-2">Dashboard</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Welcome, {profile?.full_name || user.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your disputes and track resolution progress
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link to="/join-session">
                  <Users className="w-4 h-4 mr-2" />
                  Join Session
                </Link>
              </Button>
              <Button asChild>
                <Link to="/create-session">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Session
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                  </div>
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Waiting</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.waiting}</p>
                  </div>
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">My Sessions</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PartyDashboard sessions={sessions} onRefresh={fetchUserSessions} />
              </div>
              <div className="space-y-6">
                <SessionProgress sessions={sessions} />
                <PartyNotifications />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <PartyDashboard sessions={sessions} onRefresh={fetchUserSessions} view="detailed" />
          </TabsContent>

          <TabsContent value="notifications">
            <PartyNotifications />
          </TabsContent>

          <TabsContent value="analytics">
            <SessionStats sessions={sessions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}