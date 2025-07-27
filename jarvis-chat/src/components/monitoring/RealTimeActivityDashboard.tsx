/**
 * Real-Time Activity Dashboard
 * Live user activity monitoring with performance metrics and alerts
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  getCurrentPerformanceMetrics, 
  getPerformanceHistory,
  getPerformanceAlerts,
  getResourceUtilizationData,
  type PerformanceMetrics,
  type PerformanceAlert,
  type ResourceUtilization
} from '@/lib/performanceMetrics';
import { 
  getActiveUserSessions, 
  getUserActivityStatistics,
  getActivityHeatmap,
  type UserSession,
  type ActivityHeatmap
} from '@/lib/userActivityTracking';

interface RealTimeActivityDashboardProps {
  className?: string;
  refreshInterval?: number;
  autoRefresh?: boolean;
}

interface DashboardData {
  performance: PerformanceMetrics | null;
  alerts: PerformanceAlert[];
  resources: ResourceUtilization[];
  userSessions: UserSession[];
  activityStats: any;
  heatmap: ActivityHeatmap[];
}

export const RealTimeActivityDashboard: React.FC<RealTimeActivityDashboardProps> = ({
  className = '',
  refreshInterval = 5000, // 5 seconds
  autoRefresh = true
}) => {
  const [data, setData] = useState<DashboardData>({
    performance: null,
    alerts: [],
    resources: [],
    userSessions: [],
    activityStats: null,
    heatmap: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState<number>(1); // hours
  const [isConnected, setIsConnected] = useState(false);
  
  const websocketRef = useRef<WebSocket | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize dashboard
  useEffect(() => {
    initializeDashboard();
    return () => cleanup();
  }, []);

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
    
    return () => stopAutoRefresh();
  }, [autoRefresh, refreshInterval]);

  const initializeDashboard = async () => {
    try {
      setIsLoading(true);
      await refreshData();
      setupWebSocket();
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const [
        performance,
        alerts,
        resources,
        userSessions,
        activityStats,
        heatmap
      ] = await Promise.all([
        getCurrentPerformanceMetrics(),
        getPerformanceAlerts(),
        getResourceUtilizationData(),
        getActiveUserSessions(),
        getUserActivityStatistics(timeRange),
        getActivityHeatmap(timeRange)
      ]);

      setData({
        performance: performance || null,
        alerts,
        resources,
        userSessions,
        activityStats,
        heatmap
      });
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    }
  };

  const setupWebSocket = () => {
    const wsUrl = import.meta.env.VITE_ACTIVITY_WEBSOCKET_URL;
    if (!wsUrl) return;

    try {
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = () => {
        setIsConnected(true);
        console.log('Connected to real-time monitoring WebSocket');
      };

      websocketRef.current.onmessage = (event) {
        handleWebSocketMessage(event.data);
      };

      websocketRef.current.onclose = () => {
        setIsConnected(false);
        // Attempt reconnection after 5 seconds
        setTimeout(() => {
          if (websocketRef.current?.readyState === WebSocket.CLOSED) {
            setupWebSocket();
          }
        }, 5000);
      };

      websocketRef.current.onerror = (error) {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (data: string) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'activity_event':
          // Handle real-time activity updates
          updateActivityData(message.event);
          break;
        case 'performance_update':
          // Handle real-time performance updates
          updatePerformanceData(message.metrics);
          break;
        case 'alert_triggered':
          // Handle new alerts
          addAlert(message.alert);
          break;
        default:
          console.debug('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.warn('Failed to parse WebSocket message:', error);
    }
  };

  const updateActivityData = (event: any) {
    // Update activity statistics in real-time
    setData(prev => ({
      ...prev,
      activityStats: {
        ...prev.activityStats,
        totalEvents: (prev.activityStats?.totalEvents || 0) + 1
      }
    }));
  };

  const updatePerformanceData = (metrics: PerformanceMetrics) {
    setData(prev => ({
      ...prev,
      performance: metrics
    }));
  };

  const addAlert = (alert: PerformanceAlert) {
    setData(prev => ({
      ...prev,
      alerts: [alert, ...prev.alerts].slice(0, 10) // Keep latest 10 alerts
    }));
  };

  const startAutoRefresh = () => {
    refreshTimerRef.current = setInterval(() => {
      refreshData();
    }, refreshInterval);
  };

  const stopAutoRefresh = () => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const cleanup = () => {
    stopAutoRefresh();
    if (websocketRef.current) {
      websocketRef.current.close();
    }
  };

  const formatNumber = (num: number, decimals: number = 0): string => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getAlertSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100 border-red-200';
      case 'warning': return 'text-yellow-800 bg-yellow-100 border-yellow-200';
      default: return 'text-blue-800 bg-blue-100 border-blue-200';
    }
  };

  const getResourceUsageColor = (percentage: number): string => {
    if (percentage >= 85) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getMetricStatusIcon = (value: number, threshold: number, inverse: boolean = false): string => {
    const isGood = inverse ? value < threshold : value >= threshold;
    return isGood ? '✅' : '⚠️';
  };

  if (isLoading) {
    return (
      <div className={`real-time-dashboard ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`real-time-dashboard ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Real-Time Activity Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Active Users */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.activityStats?.concurrentUsers || 0}
              </p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {formatNumber(data.activityStats?.uniqueUsers || 0)} unique today
          </div>
        </div>

        {/* API Response Time */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">API Response</p>
              <p className="text-2xl font-bold text-green-600">
                {formatDuration(data.performance?.apiResponseTimes.avg || 0)}
              </p>
            </div>
            <div className="text-3xl">
              {getMetricStatusIcon(data.performance?.apiResponseTimes.avg || 0, 2000, true)}
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            95th: {formatDuration(data.performance?.apiResponseTimes.p95 || 0)}
          </div>
        </div>

        {/* Error Rate */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className="text-2xl font-bold text-red-600">
                {((data.performance?.errorRates.totalErrors || 0) / Math.max(data.activityStats?.totalEvents || 1, 1) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-3xl">
              {getMetricStatusIcon(data.performance?.errorRates.totalErrors || 0, 5)}
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {data.performance?.errorRates.totalErrors || 0} errors
          </div>
        </div>

        {/* System Load */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Load</p>
              <p className="text-2xl font-bold text-purple-600">
                {(data.performance?.systemResources.cpuUsage || 0).toFixed(0)}%
              </p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Memory: {(data.performance?.systemResources.memoryUsage || 0).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {data.alerts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Alerts</h2>
          <div className="space-y-2">
            {data.alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.alertId}
                className={`flex items-start p-3 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{alert.description}</p>
                    <span className="text-xs">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium">{alert.metricName}:</span> {alert.currentValue.toFixed(1)}
                    {alert.metricName.includes('time') ? 'ms' : alert.metricName.includes('rate') ? '%' : ''}
                    {' '}(threshold: {alert.threshold})
                  </div>
                  {alert.recommendations.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">Recommendations:</p>
                      <ul className="text-xs mt-1 list-disc list-inside">
                        {alert.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resource Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Utilization</h3>
          <div className="space-y-4">
            {data.resources.map((resource) => (
              <div key={resource.resourceType}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {resource.resourceType}
                  </span>
                  <span className="text-sm text-gray-600">
                    {resource.utilizationPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getResourceUsageColor(resource.utilizationPercentage)}`}
                    style={{ width: `${Math.min(resource.utilizationPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Warning: {resource.threshold.warning}%</span>
                  <span>Critical: {resource.threshold.critical}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h3>
          <div className="space-y-3">
            {data.userSessions.slice(0, 8).map((session) => (
              <div key={session.sessionId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${session.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {session.userId ? `User ${session.userId.slice(-8)}` : 'Anonymous'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.deviceInfo.platform} • {session.deviceInfo.isMobile ? 'Mobile' : 'Desktop'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDuration(session.totalDuration)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {session.totalEvents} events
                  </div>
                </div>
              </div>
            ))}
            
            {data.userSessions.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No active sessions
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      {data.heatmap.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Heatmap</h3>
          <div className="grid grid-cols-12 gap-1">
            {data.heatmap[0]?.intervals.slice(0, 24).map((interval, index) {
              const intensity = Math.min(interval.concurrentUsers / Math.max(data.heatmap[0]?.peakConcurrency || 1, 1), 1);
              return (
                <div
                  key={index}
                  className="aspect-square rounded"
                  style={{
                    backgroundColor: `rgba(59, 130, 246, ${intensity})`
                  }}
                  title={`${interval.timeSlot}: ${interval.concurrentUsers} users, ${interval.totalEvents} events`}
                >
                  <div className="w-full h-full flex items-center justify-center text-xs text-white font-medium">
                    {interval.concurrentUsers}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Last 24 hours</span>
            <span>Peak: {data.heatmap[0]?.peakConcurrency || 0} concurrent users</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0.5}>30 minutes</option>
            <option value={1}>1 hour</option>
            <option value={6}>6 hours</option>
            <option value={24}>24 hours</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => refreshData()}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Refresh
          </button>
          <button
            onClick={() => setData(prev => ({ ...prev, autoRefresh: !autoRefresh }))}
            className={`px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              autoRefresh 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {autoRefresh ? 'Stop Auto-refresh' : 'Start Auto-refresh'}
          </button>
        </div>
      </div>
    </div>
  );
};