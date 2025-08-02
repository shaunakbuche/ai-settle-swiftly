import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target,
  Calendar,
  Award,
  Activity
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

interface Session {
  id: string;
  title: string;
  status: string;
  created_at: string;
  settlement_amount?: number;
}

interface SessionStatsProps {
  sessions: Session[];
}

export default function SessionStats({ sessions }: SessionStatsProps) {
  const analytics = useMemo(() => {
    const now = new Date();
    const last30Days = subDays(now, 30);
    const thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };
    
    // Filter sessions for different time periods
    const recent30Days = sessions.filter(s => new Date(s.created_at) >= last30Days);
    const thisMonthSessions = sessions.filter(s => 
      isWithinInterval(new Date(s.created_at), thisMonth)
    );
    
    // Basic metrics
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const activeSessions = sessions.filter(s => s.status === 'active');
    const waitingSessions = sessions.filter(s => s.status === 'waiting');
    
    // Success rate
    const successRate = totalSessions > 0 ? (completedSessions.length / totalSessions) * 100 : 0;
    
    // Average resolution time (in days) for completed sessions
    const avgResolutionTime = completedSessions.length > 0 
      ? completedSessions.reduce((acc, session) => {
          const days = Math.ceil((Date.now() - new Date(session.created_at).getTime()) / (1000 * 60 * 60 * 24));
          return acc + days;
        }, 0) / completedSessions.length 
      : 0;
    
    // Total settlement value
    const totalSettlementValue = sessions
      .filter(s => s.settlement_amount)
      .reduce((sum, s) => sum + (s.settlement_amount || 0), 0);
    
    // Monthly trends
    const monthlyTrend = thisMonthSessions.length - 
      sessions.filter(s => {
        const sessionDate = new Date(s.created_at);
        const lastMonth = { 
          start: startOfMonth(subDays(now, 30)), 
          end: endOfMonth(subDays(now, 30)) 
        };
        return isWithinInterval(sessionDate, lastMonth);
      }).length;
    
    // Resolution rate trend
    const recentCompletionRate = recent30Days.filter(s => s.status === 'completed').length / 
      Math.max(recent30Days.length, 1) * 100;
    
    return {
      totalSessions,
      completedSessions: completedSessions.length,
      activeSessions: activeSessions.length,
      waitingSessions: waitingSessions.length,
      successRate,
      avgResolutionTime,
      totalSettlementValue,
      monthlyTrend,
      recentCompletionRate,
      recent30Days: recent30Days.length,
      thisMonth: thisMonthSessions.length
    };
  }, [sessions]);

  const statCards = [
    {
      title: "Success Rate",
      value: `${analytics.successRate.toFixed(1)}%`,
      icon: Target,
      description: "Disputes resolved successfully",
      trend: analytics.successRate > 75 ? "positive" : analytics.successRate > 50 ? "neutral" : "negative"
    },
    {
      title: "Avg Resolution Time",
      value: `${Math.round(analytics.avgResolutionTime)} days`,
      icon: Clock,
      description: "Time to complete disputes",
      trend: analytics.avgResolutionTime < 7 ? "positive" : analytics.avgResolutionTime < 14 ? "neutral" : "negative"
    },
    {
      title: "Settlement Value",
      value: `$${analytics.totalSettlementValue.toLocaleString()}`,
      icon: DollarSign,
      description: "Total value of settlements",
      trend: analytics.totalSettlementValue > 0 ? "positive" : "neutral"
    },
    {
      title: "This Month",
      value: analytics.thisMonth.toString(),
      icon: Calendar,
      description: "New disputes this month",
      trend: analytics.monthlyTrend > 0 ? "positive" : analytics.monthlyTrend < 0 ? "negative" : "neutral"
    }
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "positive":
        return <TrendingUp className="w-3 h-3 text-green-600" />;
      case "negative":
        return <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />;
      default:
        return <Activity className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                  {getTrendIcon(stat.trend)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Status Distribution
            </CardTitle>
            <CardDescription>
              Current status of all your disputes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Completed</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.completedSessions} sessions
                  </span>
                </div>
                <Progress 
                  value={(analytics.completedSessions / Math.max(analytics.totalSessions, 1)) * 100} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Active</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.activeSessions} sessions
                  </span>
                </div>
                <Progress 
                  value={(analytics.activeSessions / Math.max(analytics.totalSessions, 1)) * 100} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Waiting</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.waitingSessions} sessions
                  </span>
                </div>
                <Progress 
                  value={(analytics.waitingSessions / Math.max(analytics.totalSessions, 1)) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Your dispute resolution performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.successRate.toFixed(0)}%
                </div>
                <div className="text-xs text-green-600">Success Rate</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.recent30Days}
                </div>
                <div className="text-xs text-blue-600">Last 30 Days</div>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completion Rate (30d)</span>
                <Badge className={`${
                  analytics.recentCompletionRate > 75 ? 'bg-green-100 text-green-800' :
                  analytics.recentCompletionRate > 50 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {analytics.recentCompletionRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monthly Trend</span>
                <div className="flex items-center gap-1">
                  {analytics.monthlyTrend !== 0 && getTrendIcon(analytics.monthlyTrend > 0 ? "positive" : "negative")}
                  <span className={`text-sm ${getTrendColor(analytics.monthlyTrend > 0 ? "positive" : analytics.monthlyTrend < 0 ? "negative" : "neutral")}`}>
                    {analytics.monthlyTrend > 0 ? `+${analytics.monthlyTrend}` : analytics.monthlyTrend}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="text-sm font-medium">
                  ${analytics.totalSettlementValue.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance */}
      {analytics.totalSessions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">{analytics.totalSessions}</div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {analytics.avgResolutionTime ? `${Math.round(analytics.avgResolutionTime)}d` : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Avg Resolution</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {analytics.successRate.toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}