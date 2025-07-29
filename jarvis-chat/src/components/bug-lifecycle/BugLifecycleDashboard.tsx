/**
 * Bug Lifecycle Dashboard Component
 * Comprehensive overview of bug lifecycle management with metrics, workflows, and team insights
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  MessageSquare,
  Target,
  Zap,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBugLifecycleStats, useBugList } from '@/hooks/useBugLifecycle';
import { bugLifecycleService, BugStatus, BugPriority } from '@/lib/bugLifecycle';
import { bugAssignmentSystem, type WorkloadMetrics } from '@/lib/assignmentSystem';
import { feedbackCollectionService, type FeedbackAnalytics } from '@/lib/feedbackCollection';
import { internalCommunicationService } from '@/lib/internalCommunication';

interface DashboardProps {
  dateRange?: { start: string; end: string };
  teamFilter?: string[];
  onBugSelect?: (bugId: string) => void;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}

function MetricCard({ title, value, change, changeType = 'neutral', icon, description }: MetricCardProps) {
  const getChangeColor = (type: typeof changeType) => {
    switch (type) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = (type: typeof changeType) => {
    switch (type) {
      case 'positive': return <TrendingUp className="h-3 w-3" />;
      case 'negative': return <TrendingDown className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center text-xs ${getChangeColor(changeType)}`}>
                {getChangeIcon(changeType)}
                <span className="ml-1">
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BugLifecycleDashboard({ dateRange, teamFilter, onBugSelect }: DashboardProps) {
  const { toast } = useToast();
  const { stats, loading: statsLoading } = useBugLifecycleStats();
  const { bugs, loading: bugsLoading, refreshBugs } = useBugList();
  
  const [workloadMetrics, setWorkloadMetrics] = useState<WorkloadMetrics[]>([]);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, teamFilter, selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Load workload metrics
      const metrics = bugAssignmentSystem.getWorkloadMetrics();
      setWorkloadMetrics(metrics);

      // Load feedback analytics
      const analytics = feedbackCollectionService.getFeedbackAnalytics(dateRange);
      setFeedbackAnalytics(analytics);

      await refreshBugs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  // Prepare chart data
  const statusDistributionData = stats ? Object.entries(stats.statusDistribution).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count,
    color: getStatusColor(status as BugStatus)
  })) : [];

  const workloadDistributionData = workloadMetrics.map(metric => ({
    name: metric.userName,
    workload: metric.workloadPercentage,
    assigned: metric.totalAssigned,
    capacity: 100
  }));

  const satisfactionTrendData = feedbackAnalytics?.trendData.map(trend => ({
    date: new Date(trend.date).toLocaleDateString(),
    rating: trend.averageRating,
    responseRate: trend.responseRate,
    feedbackCount: trend.feedbackCount
  })) || [];

  const priorityDistribution = bugs.reduce((acc, bug) => {
    const priority = bug.priority || 'medium';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityDistributionData = Object.entries(priorityDistribution).map(([priority, count]) => ({
    name: priority,
    value: count,
    color: getPriorityColor(priority as BugPriority)
  }));

  function getStatusColor(status: BugStatus): string {
    const colors = {
      [BugStatus.OPEN]: '#ef4444',
      [BugStatus.TRIAGED]: '#f97316',
      [BugStatus.IN_PROGRESS]: '#3b82f6',
      [BugStatus.PENDING_VERIFICATION]: '#8b5cf6',
      [BugStatus.RESOLVED]: '#10b981',
      [BugStatus.CLOSED]: '#6b7280',
      [BugStatus.REOPENED]: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  }

  function getPriorityColor(priority: BugPriority): string {
    const colors = {
      [BugPriority.LOW]: '#10b981',
      [BugPriority.MEDIUM]: '#f59e0b',
      [BugPriority.HIGH]: '#f97316',
      [BugPriority.CRITICAL]: '#ef4444',
      [BugPriority.URGENT]: '#dc2626'
    };
    return colors[priority] || '#6b7280';
  }

  if (statsLoading || bugsLoading) => {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bug Lifecycle Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of bug management and team performance
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Active Bugs"
          value={bugs.length}
          change={5.2}
          changeType="negative"
          icon={<Activity className="h-6 w-6" />}
          description="Currently open and in-progress"
        />
        
        <MetricCard
          title="Avg Resolution Time"
          value={`${stats?.averageResolutionTime.toFixed(1) || 0}h`}
          change={-12.3}
          changeType="positive"
          icon={<Clock className="h-6 w-6" />}
          description="Time from open to resolved"
        />
        
        <MetricCard
          title="Customer Satisfaction"
          value={`${feedbackAnalytics?.satisfactionMetrics.averageRating.toFixed(1) || 0}/5`}
          change={8.7}
          changeType="positive"
          icon={<Star className="h-6 w-6" />}
          description="Average user rating"
        />
        
        <MetricCard
          title="Team Utilization"
          value={`${Math.round(workloadMetrics.reduce((sum, m) => sum + m.workloadPercentage, 0) / workloadMetrics.length)}%`}
          change={-3.1}
          changeType="neutral"
          icon={<Users className="h-6 w-6" />}
          description="Average team workload"
        />
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workload">Team Workload</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Bug Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {stats?.recentActivity.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-3">
                        <Badge variant={activity.toStatus === BugStatus.RESOLVED ? 'default' : 'secondary'}>
                          {activity.fromStatus} → {activity.toStatus}
                        </Badge>
                        <span className="text-sm">Bug #{activity.bugReportId.slice(-6)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )) || (
                    <p className="text-center text-muted-foreground py-4">No recent activity</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Workload Tab */}
        <TabsContent value="workload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workload Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Team Workload Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workloadDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="workload" fill="#3b82f6" name="Workload %" />
                      <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity" fillOpacity={0.3} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Team Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workloadMetrics.map((metric) => (
                    <div key={metric.userId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{metric.userName}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {metric.totalAssigned} assigned
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {metric.workloadPercentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <Progress value={metric.workloadPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Avg resolution: {metric.averageResolutionTime}h</span>
                        <span>Completion rate: {metric.completionRate.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workload Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Workload Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workloadMetrics.filter(m => m.workloadPercentage > 80).length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>High workload detected:</strong> Consider redistributing bugs from overloaded team members.
                      <div className="mt-2 space-y-1">
                        {workloadMetrics.filter(m => m.workloadPercentage > 80).map(metric => (
                          <div key={metric.userId} className="text-sm">
                            • {metric.userName} is at {metric.workloadPercentage.toFixed(0)}% capacity
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                {workloadMetrics.filter(m => m.workloadPercentage < 50).length > 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Available capacity:</strong> These team members can take on more work.
                      <div className="mt-2 space-y-1">
                        {workloadMetrics.filter(m => m.workloadPercentage < 50).map(metric => (
                          <div key={metric.userId} className="text-sm">
                            • {metric.userName} has {(100 - metric.workloadPercentage).toFixed(0)}% available capacity
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bug Resolution Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={satisfactionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="feedbackCount"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Feedback Count"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Satisfaction Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall Rating</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (feedbackAnalytics?.satisfactionMetrics.averageRating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">
                        {feedbackAnalytics?.satisfactionMetrics.averageRating.toFixed(1) || 0}/5
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Resolution Quality</span>
                      <span>{feedbackAnalytics?.satisfactionMetrics.resolutionQualityAverage.toFixed(1) || 0}/5</span>
                    </div>
                    <Progress 
                      value={(feedbackAnalytics?.satisfactionMetrics.resolutionQualityAverage || 0) * 20} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Time</span>
                      <span>{feedbackAnalytics?.satisfactionMetrics.responseTimeAverage.toFixed(1) || 0}/5</span>
                    </div>
                    <Progress 
                      value={(feedbackAnalytics?.satisfactionMetrics.responseTimeAverage || 0) * 20} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Response Rate</span>
                    <span className="font-medium">
                      {feedbackAnalytics?.responseRate.toFixed(1) || 0}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Avg Response Time</span>
                    <span className="font-medium">
                      {feedbackAnalytics?.averageResponseTime.toFixed(1) || 0}h
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Verification Rate</span>
                    <span className="font-medium">
                      {feedbackAnalytics?.resolutionVerification.verificationRate.toFixed(1) || 0}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Total Requests</span>
                    <span className="font-medium">
                      {feedbackAnalytics?.totalFeedbackRequests || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Satisfaction Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Satisfaction Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={satisfactionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Average Rating"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Workflow Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Bottleneck Analysis */}
                <div>
                  <h4 className="font-medium mb-3">Workflow Bottlenecks</h4>
                  <div className="space-y-2">
                    {Object.entries(stats?.statusDistribution || {}).map(([status, count]) => {
                      const percentage = count / (stats?.totalStatusChanges || 1) * 100;
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{status.replace('_', ' ')}</Badge>
                            <span className="text-sm">{count} bugs</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="w-20 h-2" />
                            <span className="text-xs text-muted-foreground w-10">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Process Efficiency */}
                <div>
                  <h4 className="font-medium mb-3">Process Efficiency</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Automated Actions</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">78%</p>
                      <p className="text-xs text-muted-foreground">Of status changes</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">SLA Compliance</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">92%</p>
                      <p className="text-xs text-muted-foreground">Within target time</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BugLifecycleDashboard;