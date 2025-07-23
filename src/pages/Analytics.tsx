import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, MessageSquare, CheckCircle, Clock, DollarSign } from "lucide-react";

const Analytics = () => {
  // Mock data - in real app, this would come from your database
  const stats = {
    totalSessions: 1247,
    successfulResolutions: 934,
    averageResolutionTime: "18 hours",
    totalRevenue: 4670,
    activeUsers: 156,
    messagesExchanged: 45892
  };

  const successRate = Math.round((stats.successfulResolutions / stats.totalSessions) * 100);

  const recentSessions = [
    { id: "S-2024-001", status: "Resolved", type: "Contract Dispute", duration: "12h", amount: "$5.00" },
    { id: "S-2024-002", status: "In Progress", type: "Property Damage", duration: "6h", amount: "-" },
    { id: "S-2024-003", status: "Resolved", type: "Refund Request", duration: "8h", amount: "$5.00" },
    { id: "S-2024-004", status: "Pending", type: "Service Complaint", duration: "2h", amount: "-" },
  ];

  const disputeTypes = [
    { type: "Contract Disputes", count: 423, percentage: 34 },
    { type: "Refund Requests", count: 312, percentage: 25 },
    { type: "Property Damage", count: 267, percentage: 21 },
    { type: "Service Complaints", count: 189, percentage: 15 },
    { type: "Other", count: 56, percentage: 5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Platform Analytics
          </h1>
          <p className="text-xl text-muted-foreground">
            Real-time insights into our mediation platform performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.successfulResolutions} successful resolutions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageResolutionTime}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                15% faster than industry average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From {stats.successfulResolutions} completed agreements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Currently in mediation sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Exchanged</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messagesExchanged.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total platform messages
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Dispute Types */}
          <Card>
            <CardHeader>
              <CardTitle>Dispute Types</CardTitle>
              <CardDescription>Distribution of mediation cases by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {disputeTypes.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.type}</span>
                    <span className="text-muted-foreground">{item.count} cases</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Latest mediation activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{session.id}</span>
                        <Badge variant={
                          session.status === "Resolved" ? "default" :
                          session.status === "In Progress" ? "secondary" : "outline"
                        }>
                          {session.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{session.type}</p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{session.amount}</div>
                      <div className="text-muted-foreground">{session.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Metrics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>Key indicators of mediation effectiveness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{successRate}%</div>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">4.8/5</div>
                <p className="text-sm text-muted-foreground">User Satisfaction</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">92%</div>
                <p className="text-sm text-muted-foreground">Agreement Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;