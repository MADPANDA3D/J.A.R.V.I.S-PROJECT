import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Settings,
  Zap,
} from 'lucide-react';
import { performHealthCheck, type HealthCheckResult } from '@/lib/healthCheck';

export const HealthPage: React.FC = () {
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const runHealthCheck = async () => {
    setIsLoading(true);
    try {
      const result = await performHealthCheck();
      setHealthData(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getStatusIcon = (status: string) {
    switch (status) {
      case 'healthy':
      case 'up':
      case 'valid':
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
      case 'fallback':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
      case 'down':
      case 'invalid':
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) {
    switch (status) {
      case 'healthy':
      case 'up':
      case 'valid':
      case 'connected':
        return 'text-green-600 bg-green-50';
      case 'degraded':
      case 'fallback':
        return 'text-yellow-600 bg-yellow-50';
      case 'unhealthy':
      case 'down':
      case 'invalid':
      case 'disconnected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              System Health
            </h1>
            <p className="text-muted-foreground">
              Monitor the health and status of all system components.
            </p>
          </div>
          <Button
            onClick={runHealthCheck}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>

        {healthData && (
          <>
            {/* Overall Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Overall Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(healthData.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        healthData.status
                      )}`}
                    >
                      {healthData.status.toUpperCase()}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Version</p>
                    <p className="font-medium">{healthData.version}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Environment</p>
                    <p className="font-medium capitalize">
                      {healthData.environment}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {lastUpdated?.toLocaleTimeString() || 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Timestamp</p>
                    <p className="font-medium">
                      {new Date(healthData.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(healthData.checks.database.status)}
                    <div>
                      <p className="font-medium">
                        Supabase Database -{' '}
                        {healthData.checks.database.status.toUpperCase()}
                      </p>
                      {healthData.checks.database.responseTime && (
                        <p className="text-sm text-muted-foreground">
                          Response time:{' '}
                          {healthData.checks.database.responseTime}ms
                        </p>
                      )}
                      {healthData.checks.database.error && (
                        <p className="text-sm text-red-600">
                          Error: {healthData.checks.database.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environment Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Environment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(healthData.checks.environment.status)}
                    <div>
                      <p className="font-medium">
                        Configuration -{' '}
                        {healthData.checks.environment.status.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {healthData.checks.environment.errors.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="font-medium text-red-800 mb-2">Errors:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {healthData.checks.environment.errors.map(
                          (error, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span>•</span>
                              <span>{error}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {healthData.checks.environment.warnings.length > 0 && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="font-medium text-yellow-800 mb-2">
                        Warnings:
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {healthData.checks.environment.warnings.map(
                          (warning, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span>•</span>
                              <span>{warning}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Services Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  External Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(healthData.checks.services.supabase)}
                      <span className="font-medium">Supabase</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getStatusColor(
                        healthData.checks.services.supabase
                      )}`}
                    >
                      {healthData.checks.services.supabase.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(healthData.checks.services.n8n)}
                      <span className="font-medium">AI Service (n8n)</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getStatusColor(
                        healthData.checks.services.n8n
                      )}`}
                    >
                      {healthData.checks.services.n8n.toUpperCase()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {isLoading && !healthData && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Running health check...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
