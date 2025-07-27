import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

interface WebhookEvent {
  id: string;
  timestamp: string;
  event_type: string;
  status: 'success' | 'error' | 'warning';
  response_time: number;
  details: {
    repository?: string;
    action?: string;
    user_agent?: string;
    ip_address?: string;
    error_message?: string;
    payload_size?: number;
  };
}

export const WebhookEventLog: React.FC = () => {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Mock data generation
  const generateMockEvents = (): WebhookEvent[] => {
    const eventTypes = ['ping', 'workflow_run', 'push', 'pull_request'];
    const statuses: Array<'success' | 'error' | 'warning'> = ['success', 'error', 'warning'];
    const repositories = ['jarvis-chat', 'webhook-server', 'monitoring-dashboard'];
    const actions = ['completed', 'failed', 'in_progress', 'requested'];
    const userAgents = [
      'GitHub-Hookshot/abc123',
      'GitHub Actions Runner v2.1.0',
      'webhook-test-client/1.0'
    ];

    return Array.from({ length: 50 }, (_, i) => {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const timestamp = new Date(Date.now() - i * 60000 * Math.random() * 30).toISOString();
      
      return {
        id: `evt_${Date.now()}_${i}`,
        timestamp,
        event_type: eventType,
        status,
        response_time: Math.floor(Math.random() * 300) + 50,
        details: {
          repository: repositories[Math.floor(Math.random() * repositories.length)],
          action: eventType === 'workflow_run' ? actions[Math.floor(Math.random() * actions.length)] : undefined,
          user_agent: userAgents[Math.floor(Math.random() * userAgents.length)],
          ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          error_message: status === 'error' ? 'Invalid signature verification' : undefined,
          payload_size: Math.floor(Math.random() * 5000) + 500
        }
      };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockEvents = generateMockEvents();
      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = events;

    // Apply search filter
    if (searchTerm) => {
      filtered = filtered.filter(event =>
        event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.details.repository?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.details.error_message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') => {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    // Apply event type filter
    if (eventTypeFilter !== 'all') => {
      filtered = filtered.filter(event => event.event_type === eventTypeFilter);
    }

    // Apply sort order
    filtered = filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    setFilteredEvents(filtered);
  }, [events, searchTerm, statusFilter, eventTypeFilter, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) => {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) => {
      case 'success':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18A8 8 0 100 2a8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18A8 8 0 100 2a8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const getUniqueEventTypes = () => {
    return [...new Set(events.map(event => event.event_type))];
  };

  if (loading) => {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading webhook events...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Webhook Event Log</h3>
          <p className="text-sm text-gray-600">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
          </select>

          {/* Event Type Filter */}
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Events</option>
            {getUniqueEventTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center space-x-2 border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>Time</span>
            <svg
              className={`w-4 h-4 transform ${sortOrder === 'desc' ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Event List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Repository
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => {
                const timestamp = formatTimestamp(event.timestamp);
                return (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(event.status)}
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {event.event_type}
                      </div>
                      {event.details.action && (
                        <div className="text-sm text-gray-500">
                          {event.details.action}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {event.details.repository || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {timestamp.time}
                      </div>
                      <div className="text-sm text-gray-500">
                        {timestamp.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        event.response_time <= 200 ? 'text-green-600' :
                        event.response_time <= 500 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {event.response_time}ms
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 space-y-1">
                        {event.details.error_message && (
                          <div className="text-red-600 font-medium">
                            {event.details.error_message}
                          </div>
                        )}
                        <div className="text-gray-500 text-xs space-y-1">
                          <div>ID: {event.id}</div>
                          {event.details.ip_address && (
                            <div>IP: {event.details.ip_address}</div>
                          )}
                          {event.details.payload_size && (
                            <div>Size: {(event.details.payload_size / 1024).toFixed(1)}KB</div>
                          )}
                          {event.details.user_agent && (
                            <div className="truncate max-w-xs" title={event.details.user_agent}>
                              UA: {event.details.user_agent}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </Card>

      {/* Event Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {events.filter(e => e.status === 'success').length}
            </div>
            <div className="text-sm text-gray-500">Successful Events</div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {events.filter(e => e.status === 'error').length}
            </div>
            <div className="text-sm text-gray-500">Failed Events</div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {events.filter(e => e.status === 'warning').length}
            </div>
            <div className="text-sm text-gray-500">Warning Events</div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(events.reduce((sum, e) => sum + e.response_time, 0) / events.length)}ms
            </div>
            <div className="text-sm text-gray-500">Avg Response Time</div>
          </div>
        </Card>
      </div>
    </div>
  );
};