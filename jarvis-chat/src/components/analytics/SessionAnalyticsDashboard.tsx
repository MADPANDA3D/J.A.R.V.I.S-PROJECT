/**
 * Session Analytics Dashboard Component
 * Displays comprehensive user session data, error trends, and troubleshooting information
 */

import React, { useState, useEffect } from 'react';
import { 
  getCurrentSession, 
  getSessionHistory, 
  getSessionAnalytics 
} from '@/lib/sessionTracking';
import { 
  getActiveAlerts, 
  getAllAlerts, 
  acknowledgeAlert,
  AlertNotification 
} from '@/lib/monitoring';
import { 
  getRecentErrors, 
  getBreadcrumbs,
  EnhancedErrorReport 
} from '@/lib/errorTracking';
import { ErrorTrendChart } from './ErrorTrendChart';
import { SessionTimeline } from './SessionTimeline';
import { AlertPanel } from './AlertPanel';

interface SessionAnalyticsDashboardProps {
  className?: string;
  refreshInterval?: number; // milliseconds
}

export const SessionAnalyticsDashboard: React.FC<SessionAnalyticsDashboardProps> = ({
  className = '',
  refreshInterval = 30000 // 30 seconds
}) => {
  const [currentSession, setCurrentSession] = useState(getCurrentSession());
  const [sessionHistory, setSessionHistory] = useState(getSessionHistory());
  const [analytics, setAnalytics] = useState(getSessionAnalytics());
  const [recentErrors, setRecentErrors] = useState<EnhancedErrorReport[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<AlertNotification[]>([]);
  const [, setBreadcrumbs] = useState(getBreadcrumbs());
  const [selectedTab, setSelectedTab] = useState<'overview' | 'errors' | 'sessions' | 'alerts'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh data periodically
  useEffect(() => {
    const refreshData = async () => {
      setIsRefreshing(true);
      
      try {
        setCurrentSession(getCurrentSession());
        setSessionHistory(getSessionHistory());
        setAnalytics(getSessionAnalytics());
        setRecentErrors(getRecentErrors(20));
        setActiveAlerts(getActiveAlerts());
        setBreadcrumbs(getBreadcrumbs().slice(-50)); // Last 50 breadcrumbs
      } catch (error) {
        console.error('Failed to refresh analytics data:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    // Initial load
    refreshData();

    // Set up interval
    const interval = setInterval(refreshData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleAlertAcknowledge = (alertId: string) => {
    if (acknowledgeAlert(alertId)) {
      setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getErrorSeverityColor = (level: 'error' | 'warning' | 'info'): string => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Alert severity color utility function (currently unused)
  // const getAlertSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical'): string => {
  //   switch (severity) {
  //     case 'critical': return 'text-red-800 bg-red-100 border-red-200';
  //     case 'high': return 'text-red-700 bg-red-50 border-red-200';
  //     case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  //     case 'low': return 'text-blue-700 bg-blue-50 border-blue-200';
  //     default: return 'text-gray-700 bg-gray-50 border-gray-200';
  //   }
  // };

  return (
    <div className={`session-analytics-dashboard ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Session Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          {isRefreshing && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="mb-6">
          <AlertPanel 
            alerts={activeAlerts} 
            onAcknowledge={handleAlertAcknowledge}
            compact={true}
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', count: null },
            { key: 'errors', label: 'Errors', count: recentErrors.length },
            { key: 'sessions', label: 'Sessions', count: sessionHistory.length },
            { key: 'alerts', label: 'Alerts', count: activeAlerts.length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key as 'overview' | 'errors' | 'sessions' | 'alerts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
              {count !== null && count > 0 && (
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
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Session Overview */}
          {currentSession && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Session</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-semibold text-blue-900">
                    {formatDuration(Date.now() - new Date(currentSession.startTime).getTime())}
                  </div>
                  <div className="text-sm text-blue-700">Session Duration</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-semibold text-green-900">
                    {currentSession.pageViews.length}
                  </div>
                  <div className="text-sm text-green-700">Page Views</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-semibold text-red-900">
                    {currentSession.errorCount}
                  </div>
                  <div className="text-sm text-red-700">Errors</div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">{analytics.totalSessions}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatDuration(analytics.averageSessionDuration)}
                </div>
                <div className="text-sm text-gray-600">Avg Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">{analytics.totalPageViews}</div>
                <div className="text-sm text-gray-600">Page Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">{analytics.totalErrors}</div>
                <div className="text-sm text-gray-600">Total Errors</div>
              </div>
            </div>
          </div>

          {/* Error Trend Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <ErrorTrendChart errors={recentErrors} />
          </div>

          {/* Most Visited Pages */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Most Visited Pages</h3>
            <div className="space-y-2">
              {analytics.mostVisitedPages.slice(0, 5).map((page, index) => (
                <div key={page.url} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-sm text-gray-900 truncate" title={page.url}>
                      {page.url.replace(window.location.origin, '')}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{page.count} visits</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'errors' && (
        <div className="space-y-6">
          {/* Error Trend Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <ErrorTrendChart errors={recentErrors} />
          </div>

          {/* Recent Errors List */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Errors</h3>
            <div className="space-y-3">
              {recentErrors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent errors found
                </div>
              ) : (
                recentErrors.map((error) => (
                  <div key={error.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getErrorSeverityColor(error.level)}`}>
                          {error.level.toUpperCase()}
                        </span>
                        {error.component && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {error.component}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{formatTimestamp(error.timestamp)}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1">{error.message}</div>
                    {error.context && Object.keys(error.context).length > 0 && (
                      <div className="text-xs text-gray-600 mt-2">
                        <strong>Context:</strong> {JSON.stringify(error.context, null, 2)}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                      <span>Session: {error.sessionId}</span>
                      <span>URL: {error.url}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'sessions' && (
        <div className="space-y-6">
          {/* Session Timeline */}
          {currentSession && (
            <div className="bg-white shadow rounded-lg p-6">
              <SessionTimeline session={currentSession} />
            </div>
          )}

          {/* Session History */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Session History</h3>
            <div className="space-y-3">
              {sessionHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No session history available
                </div>
              ) : (
                sessionHistory.slice(0, 10).map((session) => (
                  <div key={session.sessionId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          session.endTime ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {session.endTime ? 'ENDED' : 'ACTIVE'}
                        </span>
                        {session.userId && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                            User: {session.userId}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{formatTimestamp(session.startTime)}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <div className="font-medium">
                          {session.endTime 
                            ? formatDuration(new Date(session.endTime).getTime() - new Date(session.startTime).getTime())
                            : formatDuration(Date.now() - new Date(session.startTime).getTime())
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Page Views:</span>
                        <div className="font-medium">{session.pageViews.length}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">User Actions:</span>
                        <div className="font-medium">{session.userActions.length}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Errors:</span>
                        <div className="font-medium text-red-600">{session.errorCount}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'alerts' && (
        <div className="space-y-6">
          <AlertPanel 
            alerts={getAllAlerts()} 
            onAcknowledge={handleAlertAcknowledge}
            compact={false}
          />
        </div>
      )}
    </div>
  );
};