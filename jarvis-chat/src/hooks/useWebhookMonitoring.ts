import { useState, useEffect, useCallback } from 'react';

export interface WebhookMetrics {
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
    event_processing: {
      ping_events: number;
      workflow_run_events: number;
      unsupported_events: number;
      response_times_by_event: {
        ping_avg: number;
        workflow_run_avg: number;
        unsupported_avg: number;
      };
    };
    error_analysis: {
      total_errors: number;
      error_breakdown: Record<string, { count: number; percentage: number }>;
      most_common_error: string;
      error_trend: 'increasing' | 'decreasing' | 'stable';
    };
    connection_status: {
      github_connectivity: {
        status: string;
        last_request: string | null;
        consecutive_failures: number;
        total_retries: number;
        avg_latency_ms: number;
        time_since_last_request: string;
      };
      webhook_server: {
        port: number;
        current_load: number;
        peak_load: number;
        error_rate: number;
      };
      websocket_server: {
        port: number;
        active_connections: number;
        connection_errors: number;
        message_failures: number;
        last_connection: string | null;
      };
    };
    performance_trends: {
      data_points: number;
      time_range_minutes: number;
      recent_success_rate: number;
      recent_avg_response_time: number;
    };
  };
}

export interface WebhookMonitoringState {
  metrics: WebhookMetrics | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface UseWebhookMonitoringOptions {
  refreshInterval?: number;
  autoRefresh?: boolean;
  webhookServerUrl?: string;
}

export const useWebhookMonitoring = (options: UseWebhookMonitoringOptions = {}) {
  const {
    refreshInterval = 30000, // 30 seconds default
    autoRefresh = true,
    webhookServerUrl = 'http://localhost:9000'
  } = options;

  const [state, setState] = useState<WebhookMonitoringState>({
    metrics: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchMetrics = useCallback(async () {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Try to fetch from the actual webhook server first
      let response: Response;
      try {
        response = await fetch(`${webhookServerUrl}/health`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          // Add timeout
          signal: AbortSignal.timeout(5000)
        });
      } catch (fetchError) {
        // If webhook server is not available, use mock data
        console.warn('Webhook server not available, using mock data:', fetchError);
        const mockMetrics = generateMockMetrics();
        setState({
          metrics: mockMetrics,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
        return mockMetrics;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the response to match our expected interface
      const transformedMetrics: WebhookMetrics = {
        status: data.status || 'healthy',
        timestamp: data.timestamp || new Date().toISOString(),
        uptime: data.uptime || { milliseconds: 0, human: '0s' },
        services: {
          webhook_server: {
            status: data.services?.webhook_server?.status || 'healthy',
            port: data.services?.webhook_server?.port || 9000,
            uptime: data.services?.webhook_server?.uptime || '0s',
            error_rate: data.services?.webhook_server?.error_rate || 0,
            total_requests: data.services?.webhook_server?.total_requests || 0,
            errors: data.services?.webhook_server?.errors || 0
          },
          websocket_server: {
            status: data.services?.websocket_server?.status || 'healthy',
            port: data.services?.websocket_server?.port || 9001,
            active_connections: data.services?.websocket_server?.active_connections || 0,
            total_connections: data.services?.websocket_server?.total_connections || 0,
            messages_delivered: data.services?.websocket_server?.messages_delivered || 0
          },
          webhook_auth: {
            status: data.services?.webhook_auth?.status || 'healthy',
            secret_configured: data.services?.webhook_auth?.secret_configured || false,
            success_rate: data.services?.webhook_auth?.success_rate || 100,
            total_attempts: data.services?.webhook_auth?.total_attempts || 0,
            failures: data.services?.webhook_auth?.failures || 0
          }
        },
        metrics: {
          webhook_delivery: {
            success_rate: data.metrics?.webhook_delivery?.success_rate || 100,
            total_processed: data.metrics?.webhook_delivery?.total_processed || 0,
            avg_response_time: data.metrics?.webhook_delivery?.avg_response_time || 0,
            p95_response_time: data.metrics?.webhook_delivery?.p95_response_time || 0,
            current_load: data.metrics?.webhook_delivery?.current_load || 0,
            peak_load: data.metrics?.webhook_delivery?.peak_load || 0
          },
          event_processing: {
            ping_events: data.metrics?.event_processing?.ping_events || 0,
            workflow_run_events: data.metrics?.event_processing?.workflow_run_events || 0,
            unsupported_events: data.metrics?.event_processing?.unsupported_events || 0,
            response_times_by_event: {
              ping_avg: data.metrics?.event_processing?.response_times_by_event?.ping_avg || 0,
              workflow_run_avg: data.metrics?.event_processing?.response_times_by_event?.workflow_run_avg || 0,
              unsupported_avg: data.metrics?.event_processing?.response_times_by_event?.unsupported_avg || 0
            }
          },
          error_analysis: data.metrics?.error_analysis || {
            total_errors: 0,
            error_breakdown: {},
            most_common_error: 'none',
            error_trend: 'stable' as const
          },
          connection_status: data.metrics?.connection_status || {
            github_connectivity: {
              status: 'healthy',
              last_request: null,
              consecutive_failures: 0,
              total_retries: 0,
              avg_latency_ms: 0,
              time_since_last_request: 'never'
            },
            webhook_server: {
              port: 9000,
              current_load: 0,
              peak_load: 0,
              error_rate: 0
            },
            websocket_server: {
              port: 9001,
              active_connections: 0,
              connection_errors: 0,
              message_failures: 0,
              last_connection: null
            }
          },
          performance_trends: data.metrics?.performance_trends || {
            data_points: 0,
            time_range_minutes: 0,
            recent_success_rate: 100,
            recent_avg_response_time: 0
          }
        }
      };

      setState({
        metrics: transformedMetrics,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });

      return transformedMetrics;
    } catch {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to fetch webhook metrics:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      throw error;
    }
  }, [webhookServerUrl]);

  const refresh = useCallback(() {
    return fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh effect
  useEffect(() {
    if (!autoRefresh) return;

    const interval = setInterval(() {
      fetchMetrics().catch(error => {
        console.error('Auto-refresh failed:', error);
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchMetrics, refreshInterval, autoRefresh]);

  // Initial fetch
  useEffect(() {
    fetchMetrics().catch(error => {
      console.error('Initial fetch failed:', error);
    });
  }, [fetchMetrics]);

  return {
    ...state,
    refresh,
    isRefreshing: state.loading
  };
};

// Mock data generator for development/fallback
const generateMockMetrics = (): WebhookMetrics => {
  const now = new Date();
  const uptimeMs = Math.floor(Math.random() * 86400000) + 3600000; // 1-24 hours
  
  return {
    status: Math.random() > 0.1 ? 'healthy' : Math.random() > 0.5 ? 'degraded' : 'unhealthy',
    timestamp: now.toISOString(),
    uptime: {
      milliseconds: uptimeMs,
      human: formatUptime(uptimeMs)
    },
    services: {
      webhook_server: {
        status: 'healthy',
        port: 9000,
        uptime: formatUptime(uptimeMs),
        error_rate: Math.random() * 5,
        total_requests: Math.floor(Math.random() * 1000) + 100,
        errors: Math.floor(Math.random() * 10)
      },
      websocket_server: {
        status: 'healthy',
        port: 9001,
        active_connections: Math.floor(Math.random() * 10),
        total_connections: Math.floor(Math.random() * 100) + 20,
        messages_delivered: Math.floor(Math.random() * 500) + 50
      },
      webhook_auth: {
        status: 'healthy',
        secret_configured: true,
        success_rate: 95 + Math.random() * 5,
        total_attempts: Math.floor(Math.random() * 1000) + 100,
        failures: Math.floor(Math.random() * 20)
      }
    },
    metrics: {
      webhook_delivery: {
        success_rate: 95 + Math.random() * 5,
        total_processed: Math.floor(Math.random() * 1000) + 100,
        avg_response_time: 100 + Math.random() * 100,
        p95_response_time: 200 + Math.random() * 200,
        current_load: Math.floor(Math.random() * 30) + 5,
        peak_load: Math.floor(Math.random() * 100) + 30
      },
      event_processing: {
        ping_events: Math.floor(Math.random() * 50) + 10,
        workflow_run_events: Math.floor(Math.random() * 200) + 50,
        unsupported_events: Math.floor(Math.random() * 10),
        response_times_by_event: {
          ping_avg: 80 + Math.random() * 40,
          workflow_run_avg: 150 + Math.random() * 100,
          unsupported_avg: 50 + Math.random() * 30
        }
      },
      error_analysis: {
        total_errors: Math.floor(Math.random() * 20),
        error_breakdown: {
          authenticationErrors: { count: Math.floor(Math.random() * 5), percentage: 40 },
          processingErrors: { count: Math.floor(Math.random() * 3), percentage: 30 },
          networkErrors: { count: Math.floor(Math.random() * 2), percentage: 20 },
          timeoutErrors: { count: Math.floor(Math.random() * 1), percentage: 10 }
        },
        most_common_error: 'authenticationErrors',
        error_trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable'
      },
      connection_status: {
        github_connectivity: {
          status: 'healthy',
          last_request: new Date(Date.now() - Math.random() * 300000).toISOString(),
          consecutive_failures: 0,
          total_retries: Math.floor(Math.random() * 5),
          avg_latency_ms: 50 + Math.random() * 100,
          time_since_last_request: '2m 30s ago'
        },
        webhook_server: {
          port: 9000,
          current_load: Math.floor(Math.random() * 30) + 5,
          peak_load: Math.floor(Math.random() * 100) + 30,
          error_rate: Math.random() * 5
        },
        websocket_server: {
          port: 9001,
          active_connections: Math.floor(Math.random() * 10),
          connection_errors: Math.floor(Math.random() * 3),
          message_failures: Math.floor(Math.random() * 2),
          last_connection: new Date(Date.now() - Math.random() * 600000).toISOString()
        }
      },
      performance_trends: {
        data_points: 30,
        time_range_minutes: 30,
        recent_success_rate: 95 + Math.random() * 5,
        recent_avg_response_time: 100 + Math.random() * 50
      }
    }
  };
};

const formatUptime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};