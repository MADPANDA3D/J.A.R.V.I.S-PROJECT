/**
 * Session Timeline Component
 * Displays user session timeline with page views, actions, and events
 */

import React, { useMemo, useState } from 'react';
import { UserSession, PageView, UserAction, AuthEvent } from '@/lib/sessionTracking';

interface SessionTimelineProps {
  session: UserSession;
  className?: string;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'page_view' | 'user_action' | 'auth_event' | 'error';
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  icon: string;
  color: string;
}

export const SessionTimeline: React.FC<SessionTimelineProps> = ({
  session,
  className = ''
}) => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Add page views
    session.pageViews.forEach((pageView: PageView) {
      events.push({
        id: pageView.id,
        timestamp: pageView.timestamp,
        type: 'page_view',
        title: pageView.title || 'Page View',
        description: pageView.url,
        metadata: {
          duration: pageView.duration,
          interactions: pageView.interactions,
          scrollDepth: pageView.scrollDepth,
          referrer: pageView.referrer
        },
        icon: '📄',
        color: 'blue'
      });
    });

    // Add user actions
    session.userActions.forEach((action: UserAction) {
      const actionIcons = {
        chat_message: '💬',
        form_submit: '📝',
        navigation: '🧭',
        button_click: '👆',
        file_upload: '📤',
        search: '🔍',
        scroll: '⬇️'
      };

      events.push({
        id: action.id,
        timestamp: action.timestamp,
        type: 'user_action',
        title: `User Action: ${action.type.replace('_', ' ')}`,
        description: action.elementText || action.elementId || 'User interaction',
        metadata: action.metadata,
        icon: actionIcons[action.type] || '👆',
        color: 'green'
      });
    });

    // Add auth events
    session.authEvents.forEach((authEvent: AuthEvent) {
      const authIcons = {
        sign_in: '🔓',
        sign_up: '📝',
        sign_out: '🔒',
        token_refresh: '🔄',
        password_reset: '🔑',
        session_start: '▶️',
        session_end: '⏹️'
      };

      events.push({
        id: authEvent.id,
        timestamp: authEvent.timestamp,
        type: 'auth_event',
        title: `Auth: ${authEvent.type.replace('_', ' ')}`,
        description: authEvent.success ? 'Success' : authEvent.errorMessage || 'Failed',
        metadata: authEvent.metadata,
        icon: authIcons[authEvent.type] || '🔐',
        color: authEvent.success ? 'purple' : 'red'
      });
    });

    // Sort events by timestamp
    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [session]);

  const displayEvents = showAllEvents ? timelineEvents : timelineEvents.slice(0, 20);

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };

  const getEventColor = (color: string): string => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getEventIcon = (type: string): string => {
    const icons = {
      page_view: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      user_action: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122',
      auth_event: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      error: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z'
    };
    return icons[type as keyof typeof icons] || icons.user_action;
  };

  return (
    <div className={`session-timeline ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Session Timeline</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Started: {formatTimestamp(session.startTime)}</span>
          <span>Duration: {formatDuration(Date.now() - new Date(session.startTime).getTime())}</span>
          {!showAllEvents && timelineEvents.length > 20 && (
            <button
              onClick={() => setShowAllEvents(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Show all {timelineEvents.length} events
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-4">
          {displayEvents.map((event, index) => (
            <div key={event.id} className="relative flex items-start space-x-4">
              {/* Timeline dot */}
              <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 border-white shadow ${
                event.color === 'blue' ? 'bg-blue-500' :
                event.color === 'green' ? 'bg-green-500' :
                event.color === 'purple' ? 'bg-purple-500' :
                event.color === 'red' ? 'bg-red-500' :
                'bg-gray-500'
              } z-10`}></div>

              {/* Event content */}
              <div className="flex-1 min-w-0">
                <div 
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{event.icon}</span>
                      <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEventColor(event.color)}`}>
                        {event.type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>

                  {/* Quick metadata preview */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(event.metadata)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {key}: {String(value).length > 20 ? String(value).substring(0, 20) + '...' : String(value)}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Expanded details */}
                  {selectedEvent?.id === event.id && event.metadata && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Event Details:</h5>
                      <div className="bg-gray-50 rounded p-2 text-xs font-mono">
                        <pre className="whitespace-pre-wrap text-gray-800">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load more button */}
        {!showAllEvents && timelineEvents.length > 20 && (
          <div className="relative flex justify-center mt-6">
            <button
              onClick={() => setShowAllEvents(true)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              Load {timelineEvents.length - 20} more events
            </button>
          </div>
        )}
      </div>

      {/* Session Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Session Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Page Views:</span>
            <div className="font-medium">{session.pageViews.length}</div>
          </div>
          <div>
            <span className="text-gray-600">User Actions:</span>
            <div className="font-medium">{session.userActions.length}</div>
          </div>
          <div>
            <span className="text-gray-600">Auth Events:</span>
            <div className="font-medium">{session.authEvents.length}</div>
          </div>
          <div>
            <span className="text-gray-600">Errors:</span>
            <div className="font-medium text-red-600">{session.errorCount}</div>
          </div>
        </div>

        {/* Device info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="text-xs font-medium text-gray-700 mb-2">Device Information:</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium">Browser:</span>
              <div>{session.deviceInfo.browserName} {session.deviceInfo.browserVersion}</div>
            </div>
            <div>
              <span className="font-medium">Platform:</span>
              <div>{session.deviceInfo.platform}</div>
            </div>
            <div>
              <span className="font-medium">Screen:</span>
              <div>{session.deviceInfo.screenResolution}</div>
            </div>
            <div>
              <span className="font-medium">Language:</span>
              <div>{session.deviceInfo.language}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};