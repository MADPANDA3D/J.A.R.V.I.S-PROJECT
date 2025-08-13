import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface HealthStatusIndicatorProps {
  metrics: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: {
      milliseconds: number;
      human: string;
    };
    services: {
      webhook_server: {
        status: string;
        port: number;
        uptime: string;
        error_rate: number;
        total_requests: number;
        errors: number;
      };
      websocket_server: {
        status: string;
        port: number;
        active_connections: number;
        total_connections: number;
        messages_delivered: number;
      };
      webhook_auth: {
        status: string;
        secret_configured: boolean;
        success_rate: number;
        total_attempts: number;
        failures: number;
      };
    };
    metrics: {
      webhook_delivery: {
        success_rate: number;
        total_processed: number;
        avg_response_time: number;
        p95_response_time: number;
        current_load: number;
        peak_load: number;
      };
    };
  };
}

export const HealthStatusIndicator: React.FC<HealthStatusIndicatorProps> = ({ metrics }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18A8 8 0 100 2a8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'degraded':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'unhealthy':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18A8 8 0 100 2a8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10A8 8 0 110 2a8 8 0 0116 8zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'All systems operational';
      case 'degraded':
        return 'Some performance issues detected';
      case 'unhealthy':
        return 'Critical issues require attention';
      default:
        return 'Status unknown';
    }
  };

  const getHealthScore = () => {
    const successRate = metrics.metrics.webhook_delivery.success_rate;
    const errorRate = metrics.services.webhook_server.error_rate;
    const authSuccessRate = metrics.services.webhook_auth.success_rate;
    
    // Calculate weighted health score
    const successWeight = 0.4;
    const errorWeight = 0.3;
    const authWeight = 0.3;
    
    const healthScore = (
      (successRate * successWeight) +
      ((100 - errorRate) * errorWeight) +
      (authSuccessRate * authWeight)
    );
    
    return Math.round(healthScore);
  };

  const healthScore = getHealthScore();

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon(metrics.status)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
              <p className="text-sm text-gray-600">{getStatusMessage(metrics.status)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{healthScore}%</div>
            <div className="text-sm text-gray-500">Health Score</div>
          </div>
        </div>

        {/* Health Score Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              healthScore >= 95 ? 'bg-green-500' :
              healthScore >= 85 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${healthScore}%` }}
          ></div>
        </div>

        {/* Quick Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.metrics.webhook_delivery.success_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.metrics.webhook_delivery.avg_response_time.toFixed(0)}ms
            </div>
            <div className="text-sm text-gray-500">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.services.websocket_server.active_connections}
            </div>
            <div className="text-sm text-gray-500">Active Connections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {metrics.uptime.human}
            </div>
            <div className="text-sm text-gray-500">Uptime</div>
          </div>
        </div>
      </Card>

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Webhook Server Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Webhook Server</h3>
            <Badge className={`${getStatusColor(metrics.services.webhook_server.status)} text-white`}>
              {metrics.services.webhook_server.status}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Port</span>
              <span className="font-medium">{metrics.services.webhook_server.port}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Error Rate</span>
              <span className={`font-medium ${
                metrics.services.webhook_server.error_rate > 10 ? 'text-red-600' : 
                metrics.services.webhook_server.error_rate > 5 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {metrics.services.webhook_server.error_rate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Requests</span>
              <span className="font-medium">{metrics.services.webhook_server.total_requests}</span>
            </div>
          </div>
          
          {/* Mini status indicator */}
          <div className="mt-3 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(metrics.services.webhook_server.status)}`}></div>
            <span className="text-xs text-gray-500">
              {metrics.services.webhook_server.status === 'healthy' ? 'Operating normally' :
               metrics.services.webhook_server.status === 'degraded' ? 'Performance issues' :
               'Critical errors detected'}
            </span>
          </div>
        </Card>

        {/* WebSocket Server Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">WebSocket Server</h3>
            <Badge className={`${getStatusColor(metrics.services.websocket_server.status)} text-white`}>
              {metrics.services.websocket_server.status}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Port</span>
              <span className="font-medium">{metrics.services.websocket_server.port}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Connections</span>
              <span className="font-medium">{metrics.services.websocket_server.active_connections}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Messages</span>
              <span className="font-medium">{metrics.services.websocket_server.messages_delivered}</span>
            </div>
          </div>
          
          {/* Connection status indicator */}
          <div className="mt-3 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(metrics.services.websocket_server.status)}`}></div>
            <span className="text-xs text-gray-500">
              {metrics.services.websocket_server.active_connections > 0 ? 
                `${metrics.services.websocket_server.active_connections} clients connected` : 
                'No active connections'}
            </span>
          </div>
        </Card>

        {/* Authentication Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Authentication</h3>
            <Badge className={`${getStatusColor(metrics.services.webhook_auth.status)} text-white`}>
              {metrics.services.webhook_auth.status}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Secret Config</span>
              <span className={`font-medium ${
                metrics.services.webhook_auth.secret_configured ? 'text-green-600' : 'text-red-600'
              }`}>
                {metrics.services.webhook_auth.secret_configured ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Success Rate</span>
              <span className={`font-medium ${
                metrics.services.webhook_auth.success_rate >= 95 ? 'text-green-600' :
                metrics.services.webhook_auth.success_rate >= 85 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.services.webhook_auth.success_rate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Failures</span>
              <span className="font-medium text-red-600">{metrics.services.webhook_auth.failures}</span>
            </div>
          </div>
          
          {/* Auth status indicator */}
          <div className="mt-3 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(metrics.services.webhook_auth.status)}`}></div>
            <span className="text-xs text-gray-500">
              {metrics.services.webhook_auth.secret_configured ? 
                'Authentication configured' : 
                'Authentication not configured'}
            </span>
          </div>
        </Card>
      </div>

      {/* Critical Alerts */}
      {(metrics.status === 'unhealthy' || metrics.services.webhook_server.error_rate > 25 || !metrics.services.webhook_auth.secret_configured) && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Critical Issues Detected</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {metrics.status === 'unhealthy' && (
                    <li>System health is critical - immediate attention required</li>
                  )}
                  {metrics.services.webhook_server.error_rate > 25 && (
                    <li>Webhook server error rate is critically high ({metrics.services.webhook_server.error_rate.toFixed(1)}%)</li>
                  )}
                  {!metrics.services.webhook_auth.secret_configured && (
                    <li>Webhook authentication is not properly configured</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};