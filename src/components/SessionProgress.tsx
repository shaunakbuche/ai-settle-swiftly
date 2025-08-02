import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Calendar
} from "lucide-react";

interface Session {
  id: string;
  title: string;
  status: string;
  created_at: string;
  settlement_amount?: number;
}

interface SessionProgressProps {
  sessions: Session[];
}

export default function SessionProgress({ sessions }: SessionProgressProps) {
  const getProgressData = () => {
    const total = sessions.length;
    if (total === 0) return { completionRate: 0, avgDays: 0, recentActivity: [] };

    const completed = sessions.filter(s => s.status === 'completed').length;
    const completionRate = (completed / total) * 100;

    // Calculate average resolution time for completed sessions
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const avgDays = completedSessions.length > 0 
      ? completedSessions.reduce((acc, session) => {
          const days = Math.ceil((Date.now() - new Date(session.created_at).getTime()) / (1000 * 60 * 60 * 24));
          return acc + days;
        }, 0) / completedSessions.length 
      : 0;

    // Get recent activity (last 5 sessions)
    const recentActivity = sessions
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    return { completionRate, avgDays, recentActivity };
  };

  const { completionRate, avgDays, recentActivity } = getProgressData();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'active':
        return <Clock className="w-3 h-3 text-blue-500" />;
      case 'waiting':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      default:
        return <AlertCircle className="w-3 h-3 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.ceil(diffInDays / 7)} weeks ago`;
    return `${Math.ceil(diffInDays / 30)} months ago`;
  };

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-4 h-4" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm text-muted-foreground">{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{sessions.filter(s => s.status === 'completed').length}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(avgDays)}</div>
              <div className="text-xs text-muted-foreground">Avg Days</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-4 h-4" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest dispute sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            ) : (
              recentActivity.map((session) => (
                <div key={session.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getStatusIcon(session.status)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{session.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatTimeAgo(session.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      session.status === 'completed' ? 'bg-green-100 text-green-800' :
                      session.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {session.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-4 h-4" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Sessions</span>
              <span className="font-semibold">{sessions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Disputes</span>
              <span className="font-semibold text-blue-600">
                {sessions.filter(s => s.status === 'active').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Waiting for Party</span>
              <span className="font-semibold text-yellow-600">
                {sessions.filter(s => s.status === 'waiting').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Value</span>
              <span className="font-semibold text-green-600">
                ${sessions
                  .filter(s => s.settlement_amount)
                  .reduce((sum, s) => sum + (s.settlement_amount || 0), 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}