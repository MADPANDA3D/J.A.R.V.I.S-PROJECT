import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MessageSquare, Calendar, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ConversationSessionGroup as SessionGroup } from '@/lib/chatService';
import { cn } from '@/lib/utils';

interface ConversationSessionGroupProps {
  sessionGroup: SessionGroup;
  isExpanded?: boolean;
  onToggleExpanded: (sessionId: string) => void;
  onSessionSelect?: (sessionId: string) => void;
  onMessageClick: (messageId: string) => void;
  onLoadMore?: (sessionId: string) => void;
  isActive?: boolean;
  searchTerms?: string[];
  className?: string;
}

export function ConversationSessionGroup({
  sessionGroup,
  isExpanded = false,
  onToggleExpanded,
  onSessionSelect,
  onMessageClick,
  onLoadMore,
  isActive = false,
  searchTerms = [],
  className = '',
}: ConversationSessionGroupProps) => {
  const { session, messages, messageCount, hasMoreMessages } = sessionGroup;
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleToggleExpanded = () => {
    onToggleExpanded(session.id);
    
    // Announce to screen readers
    const message = isExpanded 
      ? `Collapsed ${session.title} conversation` 
      : `Expanded ${session.title} conversation`;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const handleSessionSelect = () => {
    onSessionSelect?.(session.id);
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreMessages) return;
    
    setIsLoadingMore(true);
    try {
      await onLoadMore?.(session.id);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(date);
  };

  return (
    <div 
      className={cn(
        'border rounded-lg bg-card transition-colors duration-200',
        isActive && 'ring-2 ring-primary ring-opacity-50 bg-primary/5',
        className
      )}
      role="group"
      aria-labelledby={`session-${session.id}-title`}
    >
      {/* Session Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpanded}
            className="h-8 w-8 p-0 flex-shrink-0"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${session.title} conversation`}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          <div 
            className="flex-1 min-w-0 cursor-pointer" 
            onClick={handleSessionSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') => {
                e.preventDefault();
                handleSessionSelect();
              }
            }}
          >
            <h3 
              id={`session-${session.id}-title`}
              className="font-semibold text-foreground truncate text-sm"
            >
              {session.title}
            </h3>
            
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{messageCount} message{messageCount !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span title={formatDate(session.updated_at)}>
                  {formatRelativeTime(session.updated_at)}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span title={`Created ${formatDate(session.created_at)}`}>
                  {formatDate(session.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {searchTerms.length > 0 && messages.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {messages.length} match{messages.length !== 1 ? 'es' : ''}
            </Badge>
          )}
          
          <Badge variant="outline" className="text-xs">
            {session.status}
          </Badge>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4" role="region" aria-labelledby={`session-${session.id}-title`}>
          {messages.length > 0 ? (
            <>
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.messageId}
                    className="border-l-2 border-muted pl-4 py-2 hover:bg-muted/30 rounded-r-md transition-colors cursor-pointer"
                    onClick={() => onMessageClick(message.messageId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') => {
                        e.preventDefault();
                        onMessageClick(message.messageId);
                      }
                    }}
                    aria-label={`Go to ${message.role} message: ${message.content.slice(0, 50)}...`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={message.role === 'user' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {message.role === 'user' ? 'You' : 'AI'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <div 
                      className="text-sm text-foreground line-clamp-2"
                      dangerouslySetInnerHTML={{ 
                        __html: message.highlightedContent 
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMoreMessages && (
                <div className="mt-4 pt-3 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="w-full text-xs"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2" />
                        Loading more...
                      </>
                    ) : (
                      `Load ${Math.min(5, messageCount - messages.length)} more message${messageCount - messages.length !== 1 ? 's' : ''}`
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No matching messages in this conversation</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}