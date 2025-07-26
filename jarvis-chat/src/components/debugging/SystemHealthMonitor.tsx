import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Globe, 
  Server, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { getHealthCheckStatus } from '@/lib/env-validation';
import { monitoringService } from '@/lib/monitoring';

interface SystemHealthMonitorProps {
  className?: string;
  refreshInterval?: number;
}

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  responseTime?: number;
  lastChecked: Date;
  details?: Record<string, unknown>;
  url?: string;
}

interface SystemMetrics {
  uptime: number;
  memoryUsage?: number;
  responseTime: number;
  errorRate: number;
  requestCount: number;
}

export function SystemHealthMonitor({ 
  className = '', 
  refreshInterval = 30000 
}: SystemHealthMonitorProps) {
  const [healthChecks, setHealthChecks] = useState<HealthCheckResult[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [trends, setTrends] = useState<Record<string, 'up' | 'down' | 'stable'>>({});

  // VPS and service endpoints to monitor
  const monitoredServices = [
    {
      name: 'VPS Server',
      url: 'http://69.62.71.229:9000/health',
      type: 'webhook_server',
      timeout: 5000,
    },
    {
      name: 'N8N Webhook',
      url: import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://69.62.71.229:9000',
      type: 'n8n_webhook',
      timeout: 10000,
    },
    {
      name: 'Supabase',
      url: import.meta.env.VITE_SUPABASE_URL,
      type: 'database',
      timeout: 5000,
    },
    {
      name: 'Log Stream WebSocket',
      url: 'ws://69.62.71.229:9001',
      type: 'websocket',
      timeout: 3000,
    },
    {
      name: 'Auto-Deployment',
      url: 'https://api.github.com',
      type: 'github',
      timeout: 5000,
    },
  ];

  // Perform health check for a single service
  const checkServiceHealth = useCallback(async (service: typeof monitoredServices[0]): Promise<HealthCheckResult> => {
    const startTime = performance.now();
    
    try {
      if (service.type === 'websocket') {
        // WebSocket health check
        return new Promise((resolve) => {
          const ws = new WebSocket(service.url);
          const timeout = setTimeout(() => {
            ws.close();
            resolve({
              service: service.name,
              status: 'error',
              lastChecked: new Date(),
              details: { error: 'WebSocket connection timeout' },
              url: service.url,
            });
          }, service.timeout);

          ws.onopen = () => {
            clearTimeout(timeout);
            const responseTime = performance.now() - startTime;
            ws.close();
            resolve({
              service: service.name,
              status: 'healthy',
              responseTime,
              lastChecked: new Date(),
              details: { protocol: 'WebSocket' },
              url: service.url,
            });
          };

          ws.onerror = () => {
            clearTimeout(timeout);
            resolve({
              service: service.name,
              status: 'error',
              lastChecked: new Date(),
              details: { error: 'WebSocket connection failed' },
              url: service.url,
            });
          };
        });
      } else {
        // HTTP health check
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), service.timeout);
        
        const response = await fetch(service.url, {
          method: service.type === 'database' ? 'HEAD' : 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'JARVIS-HealthCheck/1.0',
          },
        });

        clearTimeout(timeoutId);
        const responseTime = performance.now() - startTime;

        let status: HealthCheckResult['status'] = 'healthy';
        let details: Record<string, unknown> = {
          statusCode: response.status,
          statusText: response.statusText,
        };

        if (response.status >= 500) {
          status = 'error';
        } else if (response.status >= 400) {
          status = 'warning';
        } else if (responseTime > 2000) {
          status = 'warning';
          details.slowResponse = true;
        }

        // Try to get additional health info if available
        if (response.headers.get('content-type')?.includes('application/json')) {
          try {
            const healthData = await response.json();
            details = { ...details, ...healthData };
          } catch {
            // Ignore JSON parsing errors
          }
        }

        return {
          service: service.name,
          status,
          responseTime,
          lastChecked: new Date(),
          details,
          url: service.url,
        };
      }
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      return {
        service: service.name,
        status: 'error',
        responseTime: responseTime > service.timeout ? undefined : responseTime,
        lastChecked: new Date(),
        details: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timeout: responseTime > service.timeout,
        },
        url: service.url,
      };
    }
  }, []);

  // Run all health checks
  const runHealthChecks = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const results = await Promise.allSettled(
        monitoredServices.map(service => checkServiceHealth(service))
      );

      const healthResults = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            service: monitoredServices[index].name,
            status: 'error' as const,
            lastChecked: new Date(),
            details: { error: 'Health check failed to execute' },
            url: monitoredServices[index].url,
          };
        }
      });

      // Calculate trends
      const newTrends: Record<string, 'up' | 'down' | 'stable'> = {};
      healthResults.forEach(result => {
        const previous = healthChecks.find(h => h.service === result.service);
        if (previous && result.responseTime && previous.responseTime) {
          const change = result.responseTime - previous.responseTime;
          const changePercent = Math.abs(change) / previous.responseTime;
          
          if (changePercent > 0.2) { // 20% change threshold
            newTrends[result.service] = change > 0 ? 'down' : 'up';
          } else {
            newTrends[result.service] = 'stable';
          }
        }
      });

      setHealthChecks(healthResults);
      setTrends(newTrends);
      setLastUpdate(new Date());

      // Update system metrics
      const avgResponseTime = healthResults
        .filter(r => r.responseTime)
        .reduce((sum, r) => sum + (r.responseTime || 0), 0) / 
        healthResults.filter(r => r.responseTime).length;

      const errorCount = healthResults.filter(r => r.status === 'error').length;
      const errorRate = (errorCount / healthResults.length) * 100;

      setSystemMetrics({
        uptime: performance.now() / 1000, // Rough uptime in seconds
        responseTime: avgResponseTime || 0,
        errorRate,
        requestCount: healthResults.length,
      });

    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [healthChecks, checkServiceHealth]);

  // Auto-refresh health checks
  useEffect(() => {
    runHealthChecks();
    
    const interval = setInterval(runHealthChecks, refreshInterval);
    return () => clearInterval(interval);
  }, [runHealthChecks, refreshInterval]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
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
      unknown: 'outline',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'} className="text-xs">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getTrendIcon = (service: string) => {
    const trend = trends[service];
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const formatResponseTime = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const overallStatus = healthChecks.length > 0 ? (
    healthChecks.every(h => h.status === 'healthy') ? 'healthy' :
    healthChecks.some(h => h.status === 'error') ? 'error' : 'warning'
  ) : 'unknown';

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* System Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(overallStatus)}
              <div>
                <CardTitle className="text-lg">System Health Status</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time monitoring of VPS, webhooks, and critical services
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getStatusBadge(overallStatus)}
              <Button
                variant="outline"
                size="sm"
                onClick={runHealthChecks}
                disabled={isLoading}
                className="h-8"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* System Metrics */}
          {systemMetrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 border border-border/50 rounded">
                <div className="text-lg font-semibold text-blue-600">
                  {formatUptime(systemMetrics.uptime)}
                </div>
                <div className="text-xs text-muted-foreground">Session Uptime</div>
              </div>
              <div className="text-center p-3 border border-border/50 rounded">
                <div className="text-lg font-semibold text-green-600">
                  {formatResponseTime(systemMetrics.responseTime)}
                </div>
                <div className="text-xs text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center p-3 border border-border/50 rounded">
                <div className={`text-lg font-semibold ${systemMetrics.errorRate > 20 ? 'text-red-600' : systemMetrics.errorRate > 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {systemMetrics.errorRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Error Rate</div>
              </div>
              <div className="text-center p-3 border border-border/50 rounded">
                <div className="text-lg font-semibold text-purple-600">
                  {healthChecks.filter(h => h.status === 'healthy').length}/{healthChecks.length}
                </div>
                <div className="text-xs text-muted-foreground">Services Up</div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Detailed Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service Health Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && healthChecks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Running health checks...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {healthChecks.map((check, index) => (
                <div
                  key={check.service}
                  className="flex items-center justify-between p-4 border border-border/50 rounded hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(check.status)}
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{check.service}</span>
                        {check.url && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {new URL(check.url).hostname}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{check.lastChecked.toLocaleTimeString()}</span>
                        </div>
                        
                        {check.responseTime && (
                          <div className="flex items-center gap-1">
                            {getTrendIcon(check.service)}
                            <span>{formatResponseTime(check.responseTime)}</span>
                          </div>
                        )}
                        
                        {check.details?.statusCode && (
                          <span>HTTP {check.details.statusCode}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(check.status)}
                    
                    {check.details && Object.keys(check.details).length > 0 && (
                      <details className="cursor-pointer">
                        <summary className="text-xs text-blue-600 hover:text-blue-800">
                          Details
                        </summary>
                        <div className="absolute right-0 mt-2 p-2 bg-popover border border-border rounded shadow-lg z-10 min-w-64 max-w-80">
                          <pre className="text-xs text-foreground overflow-x-auto">
                            {JSON.stringify(check.details, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Last Update Info */}
          <div className="mt-6 pt-4 border-t border-border/50 text-center">
            <div className="text-xs text-muted-foreground">
              Last updated: {lastUpdate.toLocaleString()} • 
              Next refresh: {new Date(lastUpdate.getTime() + refreshInterval).toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {healthChecks.some(h => h.status === 'error') && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-base text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Critical Service Failures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthChecks
                .filter(h => h.status === 'error')
                .map(check => (
                  <div key={check.service} className="flex items-start gap-3 p-3 bg-white/50 rounded border border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-red-800">{check.service}</div>
                      <div className="text-sm text-red-600">
                        {check.details?.error || 'Service is not responding'}
                      </div>
                      {check.url && (
                        <div className="text-xs text-muted-foreground mt-1 font-mono">
                          {check.url}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}