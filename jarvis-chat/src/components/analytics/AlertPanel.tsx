/**
 * Alert Panel Component
 * Displays real-time alerts and notifications with acknowledgment functionality
 */

import React, { useState } from 'react';
import { AlertNotification } from '@/lib/monitoring';

interface AlertPanelProps {
  alerts: AlertNotification[];
  onAcknowledge: (alertId: string) => void;
  className?: string;
  compact?: boolean;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  onAcknowledge,
  className = '',
  compact = false
}) => {
  const [selectedAlert, setSelectedAlert] = useState<AlertNotification | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity === 'all') return true;
    return alert.severity === filterSeverity;
  });

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high' | 'critical'): string => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical'): string => {
    switch (severity) => {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (alerts.length === 0) => {
    return (
      <div className={`alert-panel ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-lg font-medium mb-1">No Active Alerts</div>
          <div className="text-sm">All systems are operating normally</div>
        </div>
      </div>
    );
  }

  if (compact) => {
    // Compact banner view for critical alerts
    const criticalAlerts = filteredAlerts.filter(alert => 
      alert.severity === 'critical' && !alert.acknowledged
    );

    if (criticalAlerts.length === 0) return null;

    return (
      <div className={`alert-panel-compact ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🚨</div>
              <div>
                <div className="font-medium text-red-800">
                  {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
                </div>
                <div className="text-sm text-red-700">
                  {criticalAlerts[0].message}
                  {criticalAlerts.length > 1 && ` +${criticalAlerts.length - 1} more`}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => criticalAlerts.forEach(alert => onAcknowledge(alert.id))}
                className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
              >
                Acknowledge All
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`alert-panel ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Alerts ({filteredAlerts.length})
        </h3>
        
        {/* Severity Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Filter:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as 'all' | 'critical' | 'high' | 'medium' | 'low')}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {['critical', 'high', 'medium', 'low'].map(severity => {
          const count = alerts.filter(a => a.severity === severity && !a.acknowledged).length;
          return (
            <div key={severity} className="text-center">
              <div className={`text-lg font-semibold ${
                severity === 'critical' ? 'text-red-600' :
                severity === 'high' ? 'text-orange-600' :
                severity === 'medium' ? 'text-yellow-600' :
                'text-blue-600'
              }`}>
                {count}
              </div>
              <div className="text-xs text-gray-600 capitalize">{severity}</div>
            </div>
          );
        })}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className={`border rounded-lg transition-all ${
            alert.acknowledged 
              ? 'border-gray-200 opacity-60' 
              : 'border-gray-300 shadow-sm hover:shadow-md'
          }`}>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getSeverityIcon(alert.severity)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      {alert.acknowledged && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          ACKNOWLEDGED
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-gray-900 mt-1">{alert.message}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">{getTimeAgo(alert.timestamp)}</div>
                  <div className="text-xs text-gray-400">{formatTimestamp(alert.timestamp)}</div>
                </div>
              </div>

              {/* Alert Actions */}
              <div className="flex justify-between items-center mt-3">
                <button
                  onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedAlert?.id === alert.id ? 'Hide Details' : 'Show Details'}
                </button>
                
                {!alert.acknowledged && (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
              </div>

              {/* Alert Details */}
              {selectedAlert?.id === alert.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="space-y-3">
                    {/* Rule Information */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Rule ID:</h5>
                      <p className="text-sm text-gray-600 font-mono">{alert.ruleId}</p>
                    </div>

                    {/* Metadata */}
                    {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Alert Metadata:</h5>
                        <div className="bg-gray-50 rounded p-3 text-xs font-mono">
                          <pre className="whitespace-pre-wrap text-gray-800">
                            {JSON.stringify(alert.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Troubleshooting Suggestions */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Troubleshooting Suggestions:</h5>
                      <div className="bg-blue-50 rounded p-3 text-sm text-blue-800">
                        {alert.severity === 'critical' && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Check system resources and performance metrics</li>
                            <li>Review recent error logs for patterns</li>
                            <li>Verify external service connectivity</li>
                            <li>Consider scaling resources if needed</li>
                          </ul>
                        )}
                        {alert.severity === 'high' && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Monitor the situation closely</li>
                            <li>Check for recent deployments or changes</li>
                            <li>Review application logs</li>
                            <li>Consider preventive measures</li>
                          </ul>
                        )}
                        {(alert.severity === 'medium' || alert.severity === 'low') && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Schedule investigation during business hours</li>
                            <li>Document the occurrence for trend analysis</li>
                            <li>Review if alert thresholds need adjustment</li>
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      {filteredAlerts.filter(a => !a.acknowledged).length > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {filteredAlerts.filter(a => !a.acknowledged).length} unacknowledged alerts
          </span>
          <button
            onClick={() => {
              filteredAlerts
                .filter(a => !a.acknowledged)
                .forEach(alert => onAcknowledge(alert.id));
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Acknowledge All
          </button>
        </div>
      )}
    </div>
  );
};