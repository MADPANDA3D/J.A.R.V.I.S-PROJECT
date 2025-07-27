/**
 * Centralized Logging Dashboard
 * Comprehensive logging interface for system administrators and developers
 */

import React, { useState, useEffect, useMemo } from 'react';
import { centralizedLogging, type LogEntry } from '@/lib/centralizedLogging';
import { getServiceCalls, getServiceHealth, getServiceAnalytics } from '@/lib/serviceMonitoring';
import { distributedTracing } from '@/lib/distributedTracing';
import { getQueryLogs, getPerformanceAnalytics } from '@/lib/databaseLogging';

interface LoggingDashboardProps {
  className?: string;
  refreshInterval?: number;
}

interface LogFilter {
  level?: LogEntry['level'];
  service?: string;
  category?: LogEntry['category'];
  timeRange: number; // hours
  searchTerm: string;
  correlationId?: string;
  traceId?: string;
  limit: number;
}

export const LoggingDashboard: React.FC<LoggingDashboardProps> = ({
  className = '',
  refreshInterval = 30000 // 30 seconds
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>({
    timeRange: 1,
    searchTerm: '',
    limit: 100
  });
  const [selectedTab, setSelectedTab] = useState<'logs' | 'services' | 'database' | 'traces'>('logs');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [serviceHealth, setServiceHealth] = useState<any[]>([]);
  const [dbAnalytics, setDbAnalytics] = useState<any>(null);
  const [serviceAnalytics, setServiceAnalytics] = useState<any>(null);

  // Refresh data
  useEffect(() => {
    const refreshData = async () => {
      setIsLoading(true);
      try {
        // Get logs
        const filteredLogs = centralizedLogging.getLogs({
          level: filter.level,
          service: filter.service,
          category: filter.category,
          timeRange: filter.timeRange,
          correlationId: filter.correlationId,
          traceId: filter.traceId,
          limit: filter.limit
        });

        // Filter by search term if provided
        const searchFiltered = filter.searchTerm
          ? filteredLogs.filter(log =>
              log.message.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
              log.service.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
              JSON.stringify(log.metadata).toLowerCase().includes(filter.searchTerm.toLowerCase())
            )
          : filteredLogs;

        setLogs(searchFiltered);

        // Get service health and analytics
        setServiceHealth(getServiceHealth());
        setServiceAnalytics(getServiceAnalytics(undefined, filter.timeRange));
        setDbAnalytics(getPerformanceAnalytics(filter.timeRange));

      } catch (error) => {
        console.error('Failed to refresh logging data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    refreshData();
    const interval = setInterval(refreshData, refreshInterval);
    return () => clearInterval(interval);
  }, [filter, refreshInterval]);

  // Filtered and processed logs
  const processedLogs = useMemo(() => {
    return logs.map(log => ({
      ...log,
      formattedTimestamp: new Date(log.timestamp).toLocaleString(),
      formattedMetadata: JSON.stringify(log.metadata, null, 2)
    }));
  }, [logs]);

  // Log level counts
  const logLevelCounts = useMemo(() => {
    return logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [logs]);

  // Service distribution
  const serviceDistribution = useMemo(() => {
    return logs.reduce((acc, log) => {
      acc[log.service] = (acc[log.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [logs]);

  const handleFilterChange = (updates: Partial<LogFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  };

  const handleLogClick = (log: LogEntry) => {
    setSelectedLog(log);
  };

  const getLogLevelColor = (level: LogEntry['level']): string => {
    switch (level) => {
      case 'critical': return 'text-red-800 bg-red-100';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'debug': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: LogEntry['category']): string => {
    switch (category) => {
      case 'api': return '🌐';
      case 'database': return '🗄️';
      case 'auth': return '🔐';
      case 'webhook': return '🔗';
      case 'external': return '🌍';
      case 'system': return '⚙️';
      default: return '📝';
    }
  };

  return (
    <div className={`logging-dashboard ${className}`}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Centralized Logging Dashboard</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <div>Total logs: {logs.length}</div>
          <div>Time range: {filter.timeRange}h</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Error Rate</h3>
          <div className="text-2xl font-bold text-red-600">
            {logs.length > 0 ? (((logLevelCounts.error || 0) + (logLevelCounts.critical || 0)) / logs.length * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Critical Issues</h3>
          <div className="text-2xl font-bold text-red-800">
            {logLevelCounts.critical || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Services</h3>
          <div className="text-2xl font-bold text-blue-600">
            {Object.keys(serviceDistribution).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Response Time</h3>
          <div className="text-2xl font-bold text-green-600">
            {serviceAnalytics?.averageResponseTime?.toFixed(0) || 0}ms
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filter.searchTerm}
              onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
              placeholder="Search logs..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select
              value={filter.level || ''}
              onChange={(e) => handleFilterChange({ level: e.target.value as LogEntry['level'] || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All levels</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              value={filter.service || ''}
              onChange={(e) => handleFilterChange({ service: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All services</option>
              {Object.keys(serviceDistribution).map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filter.category || ''}
              onChange={(e) => handleFilterChange({ category: e.target.value as LogEntry['category'] || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All categories</option>
              <option value="api">API</option>
              <option value="database">Database</option>
              <option value="auth">Authentication</option>
              <option value="webhook">Webhook</option>
              <option value="external">External</option>
              <option value="system">System</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <select
              value={filter.timeRange}
              onChange={(e) => handleFilterChange({ timeRange: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0.5}>30 minutes</option>
              <option value={1}>1 hour</option>
              <option value={6}>6 hours</option>
              <option value={24}>24 hours</option>
              <option value={168}>7 days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
            <select
              value={filter.limit}
              onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'logs', label: 'Logs', count: logs.length },
            { key: 'services', label: 'Services', count: serviceHealth.length },
            { key: 'database', label: 'Database', count: dbAnalytics?.totalQueries || 0 },
            { key: 'traces', label: 'Traces', count: null }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
              {count !== null && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  selectedTab === key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'logs' && (
        <div className="space-y-4">
          {/* Log Entries */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Log Entries</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {processedLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No logs found matching the current filters
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {processedLogs.map((log) => (
                    <div
                      key={log.logId}
                      onClick={() => handleLogClick(log)}
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <span className="text-lg">{getCategoryIcon(log.category)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getLogLevelColor(log.level)}`}>
                                {log.level.toUpperCase()}
                              </span>
                              <span className="text-sm font-medium text-gray-900">{log.service}</span>
                              <span className="text-sm text-gray-500">{log.category}</span>
                            </div>
                            <p className="text-sm text-gray-900 truncate" title={log.message}>
                              {log.message}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span>{log.formattedTimestamp}</span>
                              {log.correlationId && <span>Correlation: {log.correlationId.slice(-8)}</span>}
                              {log.traceId && <span>Trace: {log.traceId.slice(-8)}</span>}
                              {log.userId && <span>User: {log.userId.slice(-8)}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'services' && (
        <div className="space-y-4">
          {/* Service Health */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Service Health</h3>
            </div>
            <div className="p-4">
              {serviceHealth.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No service health data available
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceHealth.map((service) => (
                    <div key={service.serviceId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          service.status === 'healthy' ? 'bg-green-100 text-green-800' :
                          service.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Uptime: {service.uptime.toFixed(1)}%</div>
                        <div>Avg Response: {service.averageResponseTime.toFixed(0)}ms</div>
                        <div>Error Rate: {service.errorRate.toFixed(1)}%</div>
                        <div>Last Checked: {new Date(service.lastChecked).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'database' && (
        <div className="space-y-4">
          {/* Database Analytics */}
          {dbAnalytics && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Database Performance</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{dbAnalytics.totalQueries}</div>
                    <div className="text-sm text-gray-600">Total Queries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{dbAnalytics.averageExecutionTime.toFixed(0)}ms</div>
                    <div className="text-sm text-gray-600">Avg Execution</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{dbAnalytics.slowQueries}</div>
                    <div className="text-sm text-gray-600">Slow Queries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{dbAnalytics.errorRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Error Rate</div>
                  </div>
                </div>

                {/* Top Slow Tables */}
                {dbAnalytics.topSlowTables && dbAnalytics.topSlowTables.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Slowest Tables</h4>
                    <div className="space-y-2">
                      {dbAnalytics.topSlowTables.slice(0, 5).map((table: any, index: number) => (
                        <div key={table.table} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <span className="text-sm font-medium text-gray-900">{table.table}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-red-600">{table.avgTime.toFixed(0)}ms avg</div>
                            <div className="text-xs text-gray-500">{table.count} queries</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'traces' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Distributed Traces</h3>
            </div>
            <div className="p-4">
              <div className="text-center text-gray-500 py-8">
                Distributed tracing visualization coming soon
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex">
                        <dt className="font-medium text-gray-600 w-24">Level:</dt>
                        <dd className={`px-2 py-1 text-xs font-medium rounded ${getLogLevelColor(selectedLog.level)}`}>
                          {selectedLog.level.toUpperCase()}
                        </dd>
                      </div>
                      <div className="flex">
                        <dt className="font-medium text-gray-600 w-24">Service:</dt>
                        <dd className="text-gray-900">{selectedLog.service}</dd>
                      </div>
                      <div className="flex">
                        <dt className="font-medium text-gray-600 w-24">Category:</dt>
                        <dd className="text-gray-900">{getCategoryIcon(selectedLog.category)} {selectedLog.category}</dd>
                      </div>
                      <div className="flex">
                        <dt className="font-medium text-gray-600 w-24">Timestamp:</dt>
                        <dd className="text-gray-900">{selectedLog.formattedTimestamp}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tracing Information</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex">
                        <dt className="font-medium text-gray-600 w-32">Log ID:</dt>
                        <dd className="text-gray-900 font-mono text-xs">{selectedLog.logId}</dd>
                      </div>
                      <div className="flex">
                        <dt className="font-medium text-gray-600 w-32">Correlation ID:</dt>
                        <dd className="text-gray-900 font-mono text-xs">{selectedLog.correlationId}</dd>
                      </div>
                      <div className="flex">
                        <dt className="font-medium text-gray-600 w-32">Trace ID:</dt>
                        <dd className="text-gray-900 font-mono text-xs">{selectedLog.traceId}</dd>
                      </div>
                      {selectedLog.userId && (
                        <div className="flex">
                          <dt className="font-medium text-gray-600 w-32">User ID:</dt>
                          <dd className="text-gray-900 font-mono text-xs">{selectedLog.userId}</dd>
                        </div>
                      )}
                      {selectedLog.sessionId && (
                        <div className="flex">
                          <dt className="font-medium text-gray-600 w-32">Session ID:</dt>
                          <dd className="text-gray-900 font-mono text-xs">{selectedLog.sessionId}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap">{selectedLog.message}</pre>
                  </div>
                </div>

                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Metadata</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <pre className="text-xs text-gray-900 whitespace-pre-wrap overflow-x-auto">
                        {selectedLog.formattedMetadata}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedLog.fingerprint && selectedLog.fingerprint.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Fingerprint</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLog.fingerprint.map((fp, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {fp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};