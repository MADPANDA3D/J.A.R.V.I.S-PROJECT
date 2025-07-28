/**
 * Error Trend Chart Component
 * Displays error trends and patterns over time for troubleshooting
 */

import React, { useMemo } from 'react';
import { EnhancedErrorReport } from '@/lib/errorTracking';

interface ErrorTrendChartProps {
  errors: EnhancedErrorReport[];
  className?: string;
  timeWindow?: number; // hours
}

interface DataPoint {
  timestamp: number;
  hour: string;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  criticalErrors: string[];
}

export const ErrorTrendChart: React.FC<ErrorTrendChartProps> = ({
  errors,
  className = '',
  timeWindow = 24 // 24 hours
}) => {
  const chartData = useMemo(() => {
    const now = Date.now();
    const windowStart = now - (timeWindow * 60 * 60 * 1000);
    
    // Create hourly buckets
    const buckets: Record<string, DataPoint> = {};
    for (let i = timeWindow - 1; i >= 0; i--) {
      const bucketTime = now - (i * 60 * 60 * 1000);
      const hour = new Date(bucketTime).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        hour12: false 
      });
      const key = Math.floor(bucketTime / (60 * 60 * 1000)).toString();
      
      buckets[key] = {
        timestamp: bucketTime,
        hour,
        errorCount: 0,
        warningCount: 0,
        infoCount: 0,
        criticalErrors: []
      };
    }

    // Categorize errors into buckets
    errors
      .filter(error => new Date(error.timestamp).getTime() >= windowStart)
      .forEach(error => {
        const errorTime = new Date(error.timestamp).getTime();
        const bucketKey = Math.floor(errorTime / (60 * 60 * 1000)).toString();
        
        if (buckets[bucketKey]) => {
          const bucket = buckets[bucketKey];
          
          switch (error.level) => {
            case 'error':
              bucket.errorCount++;
              if (error.context?.critical || error.tags.severity === 'critical') => {
                bucket.criticalErrors.push(error.message);
              }
              break;
            case 'warning':
              bucket.warningCount++;
              break;
            case 'info':
              bucket.infoCount++;
              break;
          }
        }
      });

    return Object.values(buckets).sort((a, b) => a.timestamp - b.timestamp);
  }, [errors, timeWindow]);

  const maxErrors = Math.max(...chartData.map(d => d.errorCount + d.warningCount + d.infoCount), 1);
  const totalErrors = errors.filter(e => e.level === 'error').length;
  const totalWarnings = errors.filter(e => e.level === 'warning').length;
  const criticalErrorsCount = errors.filter(e => 
    e.context?.critical || e.tags.severity === 'critical'
  ).length;

  const getBarHeight = (count: number): number => {
    return Math.max((count / maxErrors) * 100, 2); // Minimum 2% height for visibility
  };

  return (
    <div className={`error-trend-chart ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Error Trends ({timeWindow}h)</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Errors ({totalErrors})</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">Warnings ({totalWarnings})</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Info ({errors.filter(e => e.level === 'info').length})</span>
          </div>
        </div>
      </div>

      {/* Critical Errors Alert */}
      {criticalErrorsCount > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-red-800">
              {criticalErrorsCount} critical error{criticalErrorsCount > 1 ? 's' : ''} detected
            </span>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-end justify-between h-64 space-x-1">
          {chartData.map((dataPoint, index) => {
            const totalCount = dataPoint.errorCount + dataPoint.warningCount + dataPoint.infoCount;
            
            return (
              <div 
                key={index} 
                className="flex flex-col items-center flex-1 group relative"
                style={{ minWidth: '20px' }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                  <div className="bg-black text-white text-xs rounded py-2 px-3 whitespace-nowrap">
                    <div className="font-medium">{dataPoint.hour}:00</div>
                    <div className="space-y-1 mt-1">
                      <div className="flex justify-between space-x-2">
                        <span>Errors:</span>
                        <span className="text-red-400">{dataPoint.errorCount}</span>
                      </div>
                      <div className="flex justify-between space-x-2">
                        <span>Warnings:</span>
                        <span className="text-yellow-400">{dataPoint.warningCount}</span>
                      </div>
                      <div className="flex justify-between space-x-2">
                        <span>Info:</span>
                        <span className="text-blue-400">{dataPoint.infoCount}</span>
                      </div>
                      {dataPoint.criticalErrors.length > 0 && (
                        <div className="border-t border-gray-600 pt-1 mt-1">
                          <div className="text-red-400 font-medium">Critical:</div>
                          {dataPoint.criticalErrors.slice(0, 2).map((error, i) => (
                            <div key={i} className="text-xs truncate max-w-xs">{error}</div>
                          ))}
                          {dataPoint.criticalErrors.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{dataPoint.criticalErrors.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                  </div>
                </div>

                {/* Bar */}
                <div className="flex flex-col w-full h-full justify-end">
                  {totalCount > 0 ? (
                    <>
                      {/* Error bar (red) */}
                      {dataPoint.errorCount > 0 && (
                        <div 
                          className="w-full bg-red-500 hover:bg-red-600 transition-colors"
                          style={{ height: `${getBarHeight(dataPoint.errorCount)}%` }}
                        />
                      )}
                      {/* Warning bar (yellow) */}
                      {dataPoint.warningCount > 0 && (
                        <div 
                          className="w-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
                          style={{ height: `${getBarHeight(dataPoint.warningCount)}%` }}
                        />
                      )}
                      {/* Info bar (blue) */}
                      {dataPoint.infoCount > 0 && (
                        <div 
                          className="w-full bg-blue-500 hover:bg-blue-600 transition-colors"
                          style={{ height: `${getBarHeight(dataPoint.infoCount)}%` }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full bg-gray-300 h-1" />
                  )}
                </div>

                {/* Hour label */}
                <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                  {dataPoint.hour}
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
          <span>0</span>
          <span className="text-center">Error Count per Hour</span>
          <span>{maxErrors}</span>
        </div>
      </div>

      {/* Error Pattern Analysis */}
      {errors.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Most Common Errors */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Most Common Errors</h4>
            <div className="space-y-2">
              {Object.entries(
                errors
                  .filter(e => e.level === 'error')
                  .reduce((acc, error) => {
                    const key = error.message.substring(0, 50);
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([message, count]) => (
                  <div key={message} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 truncate" title={message}>
                      {message}...
                    </span>
                    <span className="font-medium text-red-600">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Error Sources */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Error Sources</h4>
            <div className="space-y-2">
              {Object.entries(
                errors
                  .filter(e => e.level === 'error')
                  .reduce((acc, error) => {
                    const source = error.component || error.context?.source || 'Unknown';
                    acc[source] = (acc[source] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([source, count]) => (
                  <div key={source} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{source}</span>
                    <span className="font-medium text-red-600">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Error Rate */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Error Rate</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Last Hour</span>
                <span className="font-medium text-red-600">
                  {chartData[chartData.length - 1]?.errorCount || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Average/Hour</span>
                <span className="font-medium text-orange-600">
                  {Math.round(totalErrors / timeWindow)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">Peak Hour</span>
                <span className="font-medium text-yellow-600">
                  {Math.max(...chartData.map(d => d.errorCount))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};