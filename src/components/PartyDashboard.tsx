import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search,
  Calendar,
  DollarSign,
  Users,
  ArrowRight,
  Filter
} from "lucide-react";
import { format } from "date-fns";

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

interface PartyDashboardProps {
  sessions: Session[];
  onRefresh: () => void;
  view?: "overview" | "detailed";
}

export default function PartyDashboard({ sessions, onRefresh, view = "overview" }: PartyDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'active':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'waiting':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextAction = (session: Session) => {
    switch (session.status) {
      case 'waiting':
        return 'Share session code with other party';
      case 'active':
        return 'Continue mediation process';
      case 'completed':
        return 'Download settlement agreement';
      default:
        return 'View details';
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.session_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const recentSessions = view === "overview" ? filteredSessions.slice(0, 5) : filteredSessions;

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first dispute resolution session to get started
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link to="/create-session">
                Create Session
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/join-session">
                Join Session
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {view === "overview" ? "Recent Sessions" : "All Sessions"}
          </div>
          {view === "detailed" && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
          )}
        </CardTitle>
        {view === "detailed" && (
          <CardDescription>
            Manage and track all your dispute resolution sessions
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {view === "detailed" && (
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="waiting">Waiting</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}

        <div className="space-y-3">
          {recentSessions.map((session) => (
            <div
              key={session.id}
              className="border border-border rounded-lg p-4 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(session.status)}
                    <h4 className="font-semibold truncate">{session.title}</h4>
                    <Badge className={`${getStatusColor(session.status)} capitalize`}>
                      {session.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(session.created_at), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      Code: {session.session_code}
                    </div>
                    {session.settlement_amount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3 h-3" />
                        ${session.settlement_amount.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {session.dispute_description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {session.dispute_description}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Next: {getNextAction(session)}
                  </p>
                </div>
                
                <div className="ml-4 flex flex-col gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dispute-resolution/${session.id}`}>
                      <ArrowRight className="w-3 h-3 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {view === "overview" && sessions.length > 5 && (
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard?tab=sessions">
                View All Sessions ({sessions.length})
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}