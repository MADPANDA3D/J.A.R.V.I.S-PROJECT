import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface PerformanceChartsProps {
  metrics: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      webhook_delivery: {
        success_rate: number;
        total_processed: number;
        avg_response_time: number;
        p95_response_time: number;
        current_load: number;
        peak_load: number;
      };
      event_processing: {
        ping_events: number;
        workflow_run_events: number;
        unsupported_events: number;
      };
      error_analysis: {
        total_errors: number;
        error_breakdown: Record<string, { count: number; percentage: number }>;
        most_common_error: string;
        error_trend: 'increasing' | 'decreasing' | 'stable';
      };
      performance_trends: {
        data_points: number;
        time_range_minutes: number;
        recent_success_rate: number;
        recent_avg_response_time: number;
      };
    };
  };
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ metrics }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  // Mock trend data - in a real implementation, this would come from the API
  const generateMockTrendData = (points: number) {
    const now = Date.now();
    const interval = (60 * 60 * 1000) / points; // 1 hour divided by points
    
    return Array.from({ length: points }, (_, i) {
      const timestamp = now - (points - 1 - i) * interval;
      const baseSuccessRate = 95 + Math.random() * 4;
      const baseResponseTime = 140 + Math.random() * 60;
      const errorRate = Math.max(0, 100 - baseSuccessRate);
      
      return {
        timestamp,
        success_rate: Math.round(baseSuccessRate * 100) / 100,
        response_time: Math.round(baseResponseTime * 100) / 100,
        error_rate: Math.round(errorRate * 100) / 100,
        requests_per_minute: Math.floor(Math.random() * 30) + 5
      };
    });
  };

  const trendData = generateMockTrendData(30);

  const SimpleLineChart: React.FC<{
    data: Array<{ timestamp: number; value: number }>;
    color: string;
    label: string;
    unit?: string;
  }> = ({ data, color, label, unit = '' }) {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 300; // 300px width
      const y = 100 - ((point.value - minValue) / range) * 80; // 80px usable height, inverted
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">{label}</h4>
          <span className="text-sm text-gray-500">
            {data[data.length - 1]?.value.toFixed(1)}{unit}
          </span>
        </div>
        <div className="relative">
          <svg width="300" height="100" className="w-full h-20">
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.1 }} />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={points}
            />
            <polygon
              fill={`url(#gradient-${color})`}
              points={`0,100 ${points} 300,100`}
            />
          </svg>
          <div className="absolute bottom-0 left-0 text-xs text-gray-400">
            {minValue.toFixed(1)}{unit}
          </div>
          <div className="absolute top-0 left-0 text-xs text-gray-400">
            {maxValue.toFixed(1)}{unit}
          </div>
        </div>
      </div>
    );
  };

  const SimpleBarChart: React.FC<{
    data: Array<{ label: string; value: number; color: string }>;
    title: string;
  }> = ({ data, title }) {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-16 text-sm text-gray-600 text-right">
                {item.label}
              </div>
              <div className="flex-1 relative">
                <div className="bg-gray-200 rounded h-4">
                  <div
                    className="h-4 rounded transition-all duration-300"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
                <div className="absolute right-2 top-0 h-4 flex items-center">
                  <span className="text-xs text-white font-medium">
                    {item.value}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const DonutChart: React.FC<{
    data: Array<{ label: string; value: number; color: string }>;
    title: string;
  }> = ({ data, title }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;
    
    const radius = 40;
    const strokeWidth = 20;
    const normalizedRadius = radius - strokeWidth * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <svg width={radius * 2} height={radius * 2} className="transform -rotate-90">
              <circle
                stroke="#e5e7eb"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const strokeDasharray = `${percentage / 100 * circumference} ${circumference}`;
                const strokeDashoffset = -cumulativePercentage / 100 * circumference;
                cumulativePercentage += percentage;
                
                return (
                  <circle
                    key={index}
                    stroke={item.color}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Performance Analytics</h3>
        <div className="flex space-x-2">
          {['30m', '1h', '6h', '24h'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-3 py-1 text-sm rounded ${
                selectedTimeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.metrics.webhook_delivery.success_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Success Rate</div>
            <div className="text-xs text-gray-400 mt-1">
              Target: 95%+
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.metrics.webhook_delivery.avg_response_time.toFixed(0)}ms
            </div>
            <div className="text-sm text-gray-500">Avg Response Time</div>
            <div className="text-xs text-gray-400 mt-1">
              P95: {metrics.metrics.webhook_delivery.p95_response_time.toFixed(0)}ms
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.metrics.webhook_delivery.current_load}
            </div>
            <div className="text-sm text-gray-500">Current Load (req/min)</div>
            <div className="text-xs text-gray-400 mt-1">
              Peak: {metrics.metrics.webhook_delivery.peak_load}
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {metrics.metrics.error_analysis.total_errors}
            </div>
            <div className="text-sm text-gray-500">Total Errors</div>
            <div className="text-xs text-gray-400 mt-1">
              Trend: 
              <Badge className={`ml-1 ${
                metrics.metrics.error_analysis.error_trend === 'increasing' ? 'bg-red-100 text-red-800' :
                metrics.metrics.error_analysis.error_trend === 'decreasing' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {metrics.metrics.error_analysis.error_trend}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <SimpleLineChart
            data={trendData.map(d => ({ timestamp: d.timestamp, value: d.success_rate }))}
            color="#10b981"
            label="Success Rate Trend"
            unit="%"
          />
        </Card>
        
        <Card className="p-6">
          <SimpleLineChart
            data={trendData.map(d => ({ timestamp: d.timestamp, value: d.response_time }))}
            color="#3b82f6"
            label="Response Time Trend"
            unit="ms"
          />
        </Card>
        
        <Card className="p-6">
          <SimpleLineChart
            data={trendData.map(d => ({ timestamp: d.timestamp, value: d.error_rate }))}
            color="#ef4444"
            label="Error Rate Trend"
            unit="%"
          />
        </Card>
        
        <Card className="p-6">
          <SimpleLineChart
            data={trendData.map(d => ({ timestamp: d.timestamp, value: d.requests_per_minute }))}
            color="#8b5cf6"
            label="Request Volume"
            unit=" req/min"
          />
        </Card>
      </div>

      {/* Event Distribution and Error Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <DonutChart
            title="Event Type Distribution"
            data={[
              {
                label: 'Workflow Run',
                value: metrics.metrics.event_processing.workflow_run_events,
                color: '#3b82f6'
              },
              {
                label: 'Ping Events',
                value: metrics.metrics.event_processing.ping_events,
                color: '#10b981'
              },
              {
                label: 'Unsupported',
                value: metrics.metrics.event_processing.unsupported_events,
                color: '#f59e0b'
              }
            ]}
          />
        </Card>

        <Card className="p-6">
          <SimpleBarChart
            title="Error Categories"
            data={Object.entries(metrics.metrics.error_analysis.error_breakdown).map(([key, value], index) => ({
              label: key.replace(/([A-Z])/g, ' $1').trim(),
              value: value.count,
              color: ['#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'][index % 5]
            }))}
          />
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Reliability</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className={`text-sm font-medium ${
                  metrics.metrics.webhook_delivery.success_rate >= 95 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.metrics.webhook_delivery.success_rate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Processed</span>
                <span className="text-sm font-medium">{metrics.metrics.webhook_delivery.total_processed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Error Trend</span>
                <Badge className={`${
                  metrics.metrics.error_analysis.error_trend === 'increasing' ? 'bg-red-100 text-red-800' :
                  metrics.metrics.error_analysis.error_trend === 'decreasing' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {metrics.metrics.error_analysis.error_trend}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-medium text-gray-700 mb-2">Performance</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className={`text-sm font-medium ${
                  metrics.metrics.webhook_delivery.avg_response_time <= 200 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {metrics.metrics.webhook_delivery.avg_response_time.toFixed(0)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">P95 Response Time</span>
                <span className={`text-sm font-medium ${
                  metrics.metrics.webhook_delivery.p95_response_time <= 500 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {metrics.metrics.webhook_delivery.p95_response_time.toFixed(0)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Load</span>
                <span className="text-sm font-medium">{metrics.metrics.webhook_delivery.current_load} req/min</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-medium text-gray-700 mb-2">Volume</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Peak Load</span>
                <span className="text-sm font-medium">{metrics.metrics.webhook_delivery.peak_load} req/min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Data Points</span>
                <span className="text-sm font-medium">{metrics.metrics.performance_trends.data_points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Time Range</span>
                <span className="text-sm font-medium">{metrics.metrics.performance_trends.time_range_minutes} min</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};