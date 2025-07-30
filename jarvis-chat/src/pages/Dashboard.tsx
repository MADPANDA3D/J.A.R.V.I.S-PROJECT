import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageSquare,
  Settings,
  CheckSquare,
  TrendingUp,
  Clock,
  User,
  Database,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { screenReader } from '@/lib/accessibility';

export const Dashboard: React.FC = () {
  const { user } = useAuth();

  // Announce page load to screen readers
  useEffect(() => {
    screenReader.announce({
      message:
        'Dashboard page loaded. Overview of your JARVIS assistant activity and system status.',
      priority: 'polite',
    });
  }, []);

  // Mock data for demonstration - in production this would come from API
  const stats = {
    totalChats: 0,
    todayChats: 0,
    totalTasks: 0,
    completedTasks: 0,
    responseTime: '1.2s',
    uptime: '99.9%',
  };

  const recentActivity = [
    {
      id: 1,
      type: 'chat',
      title: 'Welcome to JARVIS!',
      description: 'Your AI assistant is ready to help',
      time: 'Just now',
      icon: MessageSquare,
    },
  ];

  const quickActions = [
    {
      title: 'Start New Chat',
      description: 'Begin a conversation with JARVIS',
      icon: MessageSquare,
      link: '/chat',
      color: 'bg-primary',
    },
    {
      title: 'Manage Tasks',
      description: 'View and organize your tasks',
      icon: CheckSquare,
      link: '/tasks',
      color: 'bg-blue-600',
    },
    {
      title: 'Settings',
      description: 'Configure your preferences',
      icon: Settings,
      link: '/settings',
      color: 'bg-gray-600',
    },
  ];

  return (
    <div className="p-6" role="main" aria-label="Dashboard overview">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1
              className="text-3xl font-bold text-foreground"
              role="heading"
              aria-level={1}
            >
              Welcome back!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your JARVIS assistant
            </p>
          </div>
          <div
            className="text-right"
            role="complementary"
            aria-label="User information"
          >
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p
              className="font-medium"
              aria-label={`Signed in as ${user?.email}`}
            >
              {user?.email}
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <section
          aria-labelledby="stats-heading"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <h2 id="stats-heading" className="sr-only">
            Statistics Overview
          </h2>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Conversations
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChats}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.todayChats} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Tasks
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedTasks} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Response Time
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseTime}</div>
              <p className="text-xs text-green-600">Excellent performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                System Status
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.uptime}
              </div>
              <p className="text-xs text-muted-foreground">Uptime this month</p>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <Link to={action.link}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <activity.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No recent activity. Start a chat to get going!
                    </p>
                    <Link to="/chat">
                      <Button className="mt-4">Start Your First Chat</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Authentication</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    ✅ Connected
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Database</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    ✅ Connected
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">AI Service</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    🔄 Ready
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Real-time Updates</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    ✅ Active
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Account Type</span>
                    <span className="text-xs text-muted-foreground">User</span>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium">User ID</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {user?.id?.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Getting Started with JARVIS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">💬 Start Chatting</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Begin your first conversation with JARVIS. Ask questions,
                  request help, or just chat!
                </p>
                <Link to="/chat">
                  <Button size="sm" variant="outline">
                    Go to Chat
                  </Button>
                </Link>
              </div>

              <div>
                <h4 className="font-medium mb-2">⚙️ Customize Settings</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure your preferences, notification settings, and AI
                  parameters.
                </p>
                <Link to="/settings">
                  <Button size="sm" variant="outline">
                    Open Settings
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
