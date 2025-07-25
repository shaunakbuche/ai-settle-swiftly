import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, FileText, TrendingUp, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { ExportButton } from '@/components/ExportButton';
import ErrorState from '@/components/ErrorState';

interface AnalyticsSummary {
  date: string;
  event_type: string;
  event_count: number;
  unique_users: number;
  unique_sessions: number;
}

interface SessionStats {
  total_sessions: number;
  active_sessions: number;
  completed_sessions: number;
  avg_resolution_time: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [rawSessionData, setRawSessionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchAnalytics(), fetchSessionStats()]);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    const { data, error } = await supabase
      .from('analytics_summary')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;
    setAnalytics(data || []);
  };

  const fetchSessionStats = async () => {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, title, status, created_at, updated_at, settlement_amount, is_settled');

    if (error) throw error;

    // Store raw data for export
    setRawSessionData(sessions?.map(session => ({
      id: session.id,
      title: session.title,
      status: session.status,
      created_at: new Date(session.created_at).toLocaleDateString(),
      settlement_amount: session.settlement_amount || 0,
      is_settled: session.is_settled ? 'Yes' : 'No',
    })) || []);

    const stats = {
      total_sessions: sessions?.length || 0,
      active_sessions: sessions?.filter(s => s.status === 'active').length || 0,
      completed_sessions: sessions?.filter(s => s.status === 'completed').length || 0,
      avg_resolution_time: 0
    };

    // Calculate average resolution time for completed sessions
    const completedSessions = sessions?.filter(s => s.status === 'completed') || [];
    if (completedSessions.length > 0) {
      const totalTime = completedSessions.reduce((sum, session) => {
        const created = new Date(session.created_at).getTime();
        const updated = new Date(session.updated_at).getTime();
        return sum + (updated - created);
      }, 0);
      stats.avg_resolution_time = Math.round(totalTime / completedSessions.length / (1000 * 60 * 60)); // Hours
    }

    setSessionStats(stats);
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto py-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto py-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You need administrator privileges to view analytics.
            </p>
            <Button asChild>
              <Link to="/">Return to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto py-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <ErrorState
            title="Analytics Unavailable"
            description={error}
            retry={fetchData}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto py-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Aggregate data for charts
  const dailyActivity = analytics.reduce((acc, item) => {
    const date = new Date(item.date).toLocaleDateString();
    const existing = acc.find(a => a.date === date);
    if (existing) {
      existing.events += item.event_count;
      existing.users += item.unique_users;
    } else {
      acc.push({
        date,
        events: item.event_count,
        users: item.unique_users
      });
    }
    return acc;
  }, [] as { date: string; events: number; users: number }[]).slice(0, 7).reverse();

  const eventTypeData = analytics.reduce((acc, item) => {
    const existing = acc.find(a => a.name === item.event_type);
    if (existing) {
      existing.value += item.event_count;
    } else {
      acc.push({
        name: item.event_type,
        value: item.event_count
      });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const successRate = sessionStats && sessionStats.total_sessions > 0
    ? Math.round((sessionStats.completed_sessions / sessionStats.total_sessions) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <Button asChild variant="ghost">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <ExportButton 
            data={rawSessionData}
            filename="session-analytics"
            title="Session Analytics Report"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track dispute resolution metrics and user engagement
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionStats?.total_sessions || 0}</div>
              <p className="text-xs text-muted-foreground">All mediation sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionStats?.active_sessions || 0}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionStats?.completed_sessions || 0}</div>
              <p className="text-xs text-muted-foreground">Successfully resolved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionStats?.avg_resolution_time || 0}h</div>
              <p className="text-xs text-muted-foreground">Time to completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {analytics.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Events and unique users over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="events" fill="hsl(var(--primary))" name="Events" />
                    <Bar dataKey="users" fill="hsl(var(--secondary))" name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Distribution</CardTitle>
                <CardDescription>Breakdown of user actions and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Analytics Data Yet</h3>
              <p className="text-muted-foreground">
                Analytics will appear here once users start using the platform
              </p>
            </CardContent>
          </Card>
        )}

        {/* Resolution Success Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resolution Success Rate
            </CardTitle>
            <CardDescription>
              Percentage of sessions reaching successful settlement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="text-3xl font-bold text-primary">
                  {successRate}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {sessionStats?.completed_sessions || 0} of {sessionStats?.total_sessions || 0} sessions completed
                </p>
              </div>
              {sessionStats && sessionStats.total_sessions > 0 && (
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: sessionStats.completed_sessions },
                          { name: 'Other', value: sessionStats.total_sessions - sessionStats.completed_sessions }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="hsl(var(--primary))" />
                        <Cell fill="hsl(var(--muted))" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;