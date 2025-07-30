import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Database, 
  Globe, 
  Settings, 
  Terminal, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { LogStreamViewer } from './LogStreamViewer';
import { EnvironmentValidator } from './EnvironmentValidator';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { AuthenticationDebugger } from './AuthenticationDebugger';
import { RuntimeErrorMonitor } from './RuntimeErrorMonitor';
import { getEnvironmentInfo, getHealthCheckStatus } from '@/lib/env-validation';
import { monitoringService } from '@/lib/monitoring';

interface ProductionDashboardProps {
  className?: string;
  enableSensitiveData?: boolean;
}

export function ProductionDashboard({ 
  className = '',
  enableSensitiveData = false 
}: ProductionDashboardProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [systemHealth, setSystemHealth] = useState<Record<string, unknown> | null>(null);
  const [envInfo, setEnvInfo] = useState<Record<string, unknown> | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSensitive, setShowSensitive] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load system data
  const loadSystemData = async () => {
    try {
      const [health, env] = await Promise.all([
        Promise.resolve(getHealthCheckStatus()),
        Promise.resolve(getEnvironmentInfo()),
      ]);
      
      setSystemHealth(health);
      setEnvInfo(env);
      setLastRefresh(new Date());
    } catch (error) => {
      console.error('Failed to load system data:', error);
    }
  };

  useEffect(() => {
    loadSystemData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) => {
    }
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
      case 'unhealthy':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary', 
      error: 'destructive',
      unhealthy: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'} className="text-xs">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const exportDiagnostics = async () => {
    try {
      const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: envInfo,
        health: systemHealth,
        metrics: monitoringService.getMetrics({ timeRange: 3600000 }), // Last hour
        events: monitoringService.getEvents({ timeRange: 3600000 }),
        userAgent: navigator.userAgent,
        url: window.location.href,
        online: isOnline,
      };

      const blob = new Blob([JSON.stringify(diagnostics, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jarvis-diagnostics-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) => {
      console.error('Failed to export diagnostics:', error);
    }
  };

  if (!systemHealth || !envInfo) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <CardTitle>Loading Production Dashboard...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Initializing production monitoring systems...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Activity className="h-6 w-6" />
                <div>
                  <CardTitle>Production Monitoring Dashboard</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Real-time system health, environment validation, and debugging tools
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className="flex items-center gap-2 text-sm">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-muted-foreground">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Controls */}
              {enableSensitiveData && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSensitive(!showSensitive)}
                  className="h-8"
                >
                  {showSensitive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showSensitive ? 'Hide' : 'Show'} Secrets
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={loadSystemData}
                className="h-8"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={exportDiagnostics}
                className="h-8"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* System Status Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-3 p-3 border border-border/50 rounded">
              {getStatusIcon(systemHealth.status)}
              <div>
                <div className="text-sm font-medium">System Health</div>
                <div className="text-xs text-muted-foreground">
                  {getStatusBadge(systemHealth.status)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border border-border/50 rounded">
              <Database className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Database</div>
                <div className="text-xs text-muted-foreground">
                  {envInfo.hasSupabase ? (
                    <Badge variant="default" className="text-xs">Connected</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">Not Connected</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border border-border/50 rounded">
              <Globe className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">Webhooks</div>
                <div className="text-xs text-muted-foreground">
                  {envInfo.hasN8nWebhook ? (
                    <Badge variant="default" className="text-xs">
                      {envInfo.hasSecureWebhook ? 'HTTPS' : 'HTTP'}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Fallback</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border border-border/50 rounded">
              <Settings className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-sm font-medium">Environment</div>
                <div className="text-xs text-muted-foreground">
                  <Badge variant={envInfo.environment === 'production' ? 'default' : 'secondary'} className="text-xs">
                    {envInfo.environment}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Last Refresh */}
          <div className="text-xs text-muted-foreground mt-4 text-center">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </CardHeader>
      </Card>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="environment" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Environment
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-xs">
            <Terminal className="h-3 w-3 mr-1" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="health" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Health
          </TabsTrigger>
          <TabsTrigger value="auth" className="text-xs">
            <Database className="h-3 w-3 mr-1" />
            Auth
          </TabsTrigger>
          <TabsTrigger value="errors" className="text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Errors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Environment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Environment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Application Environment:</span>
                    <Badge variant={envInfo.environment === 'production' ? 'default' : 'secondary'}>
                      {envInfo.environment}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Build Mode:</span>
                    <Badge variant={envInfo.isProduction ? 'default' : 'secondary'}>
                      {envInfo.mode}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Configuration Errors:</span>
                    <Badge variant={envInfo.errors?.length > 0 ? 'destructive' : 'default'}>
                      {envInfo.errors?.length || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Feature Flags Active:</span>
                    <span className="font-mono text-xs">
                      {[
                        envInfo.debugToolsEnabled && 'debug',
                        envInfo.experimentalFeaturesEnabled && 'experimental', 
                        envInfo.mockResponsesEnabled && 'mock',
                        envInfo.authBypassEnabled && 'auth-bypass'
                      ].filter(Boolean).join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Health Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Health Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Overall Status:</span>
                    {getStatusBadge(systemHealth.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Database Connection:</span>
                    {systemHealth.checks.database_configured ? (
                      <Badge variant="default">Connected</Badge>
                    ) : (
                      <Badge variant="destructive">Disconnected</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Webhook Configuration:</span>
                    {systemHealth.checks.webhook_configured ? (
                      <Badge variant="default">Configured</Badge>
                    ) : (
                      <Badge variant="secondary">Fallback Mode</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Error Tracking:</span>
                    {systemHealth.checks.error_tracking_configured ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Local Only</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Issues Alert */}
          {(envInfo.errors?.length > 0 || systemHealth.issues.critical_errors > 0) && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-base text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Critical Issues Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {envInfo.errors?.slice(0, 3).map((error: Record<string, unknown>, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-white/50 rounded border border-red-200">
                      <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">{error.variable}:</span>
                        <span className="text-muted-foreground ml-1">{error.message}</span>
                      </div>
                    </div>
                  ))}
                  {envInfo.errors?.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{envInfo.errors.length - 3} more issues in Environment tab
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="environment" className="mt-6">
          <EnvironmentValidator 
            showSensitiveData={enableSensitiveData} 
            className="w-full" 
          />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <LogStreamViewer 
            websocketUrl="ws://69.62.71.229:9001"
            enablePersistence={true}
            maxLogEntries={1000}
            className="w-full"
          />
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <SystemHealthMonitor 
            className="w-full"
          />
        </TabsContent>

        <TabsContent value="auth" className="mt-6">
          <AuthenticationDebugger 
            className="w-full"
          />
        </TabsContent>

        <TabsContent value="errors" className="mt-6">
          <RuntimeErrorMonitor 
            className="w-full"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}