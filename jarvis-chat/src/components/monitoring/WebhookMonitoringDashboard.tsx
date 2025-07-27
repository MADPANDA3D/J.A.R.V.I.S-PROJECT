import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { HealthStatusIndicator } from './HealthStatusIndicator';
import { PerformanceCharts } from './PerformanceCharts';
import { WebhookEventLog } from './WebhookEventLog';
import { useWebhookMonitoring } from '../../hooks/useWebhookMonitoring';

export const WebhookMonitoringDashboard: React.FC = () => {
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [historicalData, setHistoricalData] = useState(null);

  const { metrics, loading, error, lastUpdated, refresh } = useWebhookMonitoring({
    refreshInterval,
    autoRefresh: true
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };


  // Effect to fetch historical data when tab is active or time range changes
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(`/webhook/analytics/historical?timeRange=${timeRange}&format=detailed`);
        if (response.ok) {
          const data = await response.json();
          setHistoricalData(data);
        }
      } catch (error) {
        console.error('Failed to fetch historical data:', error);
      }
    };

    if (activeTab === 'historical') {
      fetchHistoricalData();
    }
  }, [activeTab, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-lg">Loading webhook monitoring dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No metrics data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Webhook Monitoring Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time webhook server performance and health monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={`${getStatusColor(metrics.status)} text-white px-3 py-1`}>
                {metrics.status.toUpperCase()}
              </Badge>
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={10000}>10s refresh</option>
                <option value={30000}>30s refresh</option>
                <option value={60000}>1m refresh</option>
                <option value={300000}>5m refresh</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Server Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.uptime.human}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(metrics.services.webhook_server.status)}`}></div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.metrics.webhook_delivery.success_rate.toFixed(1)}%</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${metrics.metrics.webhook_delivery.success_rate >= 95 ? 'bg-green-500' : metrics.metrics.webhook_delivery.success_rate >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.metrics.webhook_delivery.total_processed.toLocaleString()}</p>
              </div>
              <div className="text-sm text-gray-500">
                {metrics.metrics.webhook_delivery.current_load}/min current
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.metrics.webhook_delivery.avg_response_time.toFixed(0)}ms</p>
              </div>
              <div className="text-sm text-gray-500">
                P95: {metrics.metrics.webhook_delivery.p95_response_time.toFixed(0)}ms
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'performance', label: 'Performance' },
                { id: 'historical', label: 'Historical Analytics' },
                { id: 'events', label: 'Event Log' },
                { id: 'services', label: 'Services' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <HealthStatusIndicator metrics={metrics} />
                
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Workflow Events</span>
                        <span className="font-medium">{metrics.metrics.event_processing.workflow_run_events}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Ping Events</span>
                        <span className="font-medium">{metrics.metrics.event_processing.ping_events}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Unsupported</span>
                        <span className="font-medium">{metrics.metrics.event_processing.unsupported_events}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Error Analysis</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Errors</span>
                        <span className="font-medium">{metrics.metrics.error_analysis.total_errors}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Most Common</span>
                        <span className="font-medium text-red-600">
                          {metrics.metrics.error_analysis.most_common_error.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Trend</span>
                        <Badge className={`${
                          metrics.metrics.error_analysis.error_trend === 'increasing' ? 'bg-red-100 text-red-800' :
                          metrics.metrics.error_analysis.error_trend === 'decreasing' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {metrics.metrics.error_analysis.error_trend}
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">WebSocket Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Connections</span>
                        <span className="font-medium">{metrics.services.websocket_server.active_connections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Messages Delivered</span>
                        <span className="font-medium">{metrics.services.websocket_server.messages_delivered}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Port</span>
                        <span className="font-medium">{metrics.services.websocket_server.port}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <PerformanceCharts metrics={metrics} />
            )}

            {activeTab === 'events' && (
              <WebhookEventLog />
            )}

            {activeTab === 'historical' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Historical Analytics</h3>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="border rounded px-3 py-1 text-sm"
                  >
                    <option value="1h">Last Hour</option>
                    <option value="6h">Last 6 Hours</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>

                {historicalData ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Reliability Trend */}
                    <Card className="p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center">
                        Reliability Trend
                        <Badge className={`ml-2 ${
                          historicalData.trend_analysis.reliability.trend === 'improving' ? 'bg-green-100 text-green-800' :
                          historicalData.trend_analysis.reliability.trend === 'declining' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {historicalData.trend_analysis.reliability.trend}
                        </Badge>
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Current Success Rate</span>
                          <span className="font-bold text-2xl text-green-600">
                            {historicalData.trend_analysis.reliability.current}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Based on {historicalData.trend_analysis.reliability.history.length} data points
                        </div>
                      </div>
                    </Card>

                    {/* Performance Trend */}
                    <Card className="p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center">
                        Performance Trend
                        <Badge className={`ml-2 ${
                          historicalData.trend_analysis.performance.trend === 'improving' ? 'bg-green-100 text-green-800' :
                          historicalData.trend_analysis.performance.trend === 'declining' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {historicalData.trend_analysis.performance.trend}
                        </Badge>
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Avg Response Time</span>
                          <span className="font-bold text-2xl text-blue-600">
                            {historicalData.trend_analysis.performance.current}ms
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Based on {historicalData.trend_analysis.performance.history.length} data points
                        </div>
                      </div>
                    </Card>

                    {/* Usage Trend */}
                    <Card className="p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center">
                        Usage Trend
                        <Badge className={`ml-2 ${
                          historicalData.trend_analysis.usage.trend === 'increasing' ? 'bg-blue-100 text-blue-800' :
                          historicalData.trend_analysis.usage.trend === 'decreasing' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {historicalData.trend_analysis.usage.trend}
                        </Badge>
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Current Volume</span>
                          <span className="font-bold text-2xl text-purple-600">
                            {historicalData.trend_analysis.usage.current}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Based on {historicalData.trend_analysis.usage.history.length} data points
                        </div>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading historical analytics data...</p>
                  </div>
                )}

                {/* Daily Aggregates Summary */}
                {historicalData && Object.keys(historicalData.daily_aggregates).length > 0 && (
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Daily Performance Summary</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auth Failures</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.entries(historicalData.daily_aggregates)
                            .sort(([a], [b]) => b.localeCompare(a))
                            .slice(0, 7)
                            .map(([date, aggregate]) => (
                              <tr key={date}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {aggregate.webhook_metrics.max_total_processed.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    aggregate.webhook_metrics.avg_success_rate >= 95 ? 'bg-green-100 text-green-800' :
                                    aggregate.webhook_metrics.avg_success_rate >= 85 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {aggregate.webhook_metrics.avg_success_rate.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {aggregate.webhook_metrics.avg_response_time.toFixed(0)}ms
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {aggregate.webhook_metrics.total_auth_failures}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Service Health Details</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Webhook Server */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Webhook Server</h4>
                      <Badge className={`${getStatusColor(metrics.services.webhook_server.status)} text-white`}>
                        {metrics.services.webhook_server.status}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Port</span>
                        <span className="font-medium">{metrics.services.webhook_server.port}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Uptime</span>
                        <span className="font-medium">{metrics.services.webhook_server.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Error Rate</span>
                        <span className={`font-medium ${metrics.services.webhook_server.error_rate > 10 ? 'text-red-600' : 'text-green-600'}`}>
                          {metrics.services.webhook_server.error_rate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Requests</span>
                        <span className="font-medium">{metrics.services.webhook_server.total_requests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Errors</span>
                        <span className="font-medium text-red-600">{metrics.services.webhook_server.errors}</span>
                      </div>
                    </div>
                  </Card>

                  {/* WebSocket Server */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">WebSocket Server</h4>
                      <Badge className={`${getStatusColor(metrics.services.websocket_server.status)} text-white`}>
                        {metrics.services.websocket_server.status}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Port</span>
                        <span className="font-medium">{metrics.services.websocket_server.port}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Connections</span>
                        <span className="font-medium">{metrics.services.websocket_server.active_connections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Connections</span>
                        <span className="font-medium">{metrics.services.websocket_server.total_connections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Messages Delivered</span>
                        <span className="font-medium">{metrics.services.websocket_server.messages_delivered}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Authentication */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Authentication</h4>
                      <Badge className={`${getStatusColor(metrics.services.webhook_auth.status)} text-white`}>
                        {metrics.services.webhook_auth.status}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Secret Configured</span>
                        <span className={`font-medium ${metrics.services.webhook_auth.secret_configured ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.services.webhook_auth.secret_configured ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className={`font-medium ${metrics.services.webhook_auth.success_rate >= 95 ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.services.webhook_auth.success_rate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Attempts</span>
                        <span className="font-medium">{metrics.services.webhook_auth.total_attempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Failures</span>
                        <span className="font-medium text-red-600">{metrics.services.webhook_auth.failures}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};