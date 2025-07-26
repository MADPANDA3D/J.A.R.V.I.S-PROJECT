import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Clock, Calendar, Zap, Filter, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { ConversationSession } from '@/lib/chatService';
import { cn } from '@/lib/utils';

type SessionOrder = 'chronological' | 'relevance' | 'updated';

interface SessionNavigationProps {
  sessions: ConversationSession[];
  activeSessionId?: string;
  sessionOrder: SessionOrder;
  totalSessions: number;
  totalMessages: number;
  hasMoreSessions: boolean;
  isLoading?: boolean;
  onSessionSelect: (sessionId: string) => void;
  onOrderChange: (order: SessionOrder) => void;
  onLoadMoreSessions: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  className?: string;
}

const orderOptions = [
  {
    value: 'updated' as const,
    label: 'Recently Updated',
    icon: Clock,
    description: 'Sort by last activity',
  },
  {
    value: 'chronological' as const,
    label: 'Chronological',
    icon: Calendar,
    description: 'Sort by creation date',
  },
  {
    value: 'relevance' as const,
    label: 'Relevance',
    icon: Zap,
    description: 'Sort by search relevance',
  },
];

export function SessionNavigation({
  sessions,
  activeSessionId,
  sessionOrder,
  totalSessions,
  totalMessages,
  hasMoreSessions,
  isLoading = false,
  onSessionSelect,
  onOrderChange,
  onLoadMoreSessions,
  onExpandAll,
  onCollapseAll,
  className = '',
}: SessionNavigationProps) {
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const currentOrderOption = orderOptions.find(option => option.value === sessionOrder);
  const activeSession = sessions.find(s => s.id === activeSessionId);

  const formatSessionTitle = (session: ConversationSession) => {
    if (session.title.length > 30) {
      return session.title.substring(0, 30) + '...';
    }
    return session.title;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div 
      className={cn('flex flex-col gap-3 p-4 bg-muted/30 border-b border-border', className)}
      role="navigation"
      aria-label="Conversation session navigation"
    >
      {/* Statistics and Controls Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium text-foreground">{sessions.length}</span>
            <span>of {totalSessions} conversation{totalSessions !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="font-medium text-foreground">{totalMessages}</span>
            <span>total message{totalMessages !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Expand/Collapse Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpandAll}
              className="h-8 px-2 text-xs"
              title="Expand all conversations"
            >
              <ArrowDown className="h-3 w-3 mr-1" />
              Expand All
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onCollapseAll}
              className="h-8 px-2 text-xs"
              title="Collapse all conversations"
            >
              <ArrowUp className="h-3 w-3 mr-1" />
              Collapse
            </Button>
          </div>

          {/* Sort Order Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 px-3 text-xs gap-2"
                disabled={isLoading}
              >
                {currentOrderOption ? (
                  <>
                    <currentOrderOption.icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{currentOrderOption.label}</span>
                  </>
                ) : (
                  <>
                    <Filter className="h-3 w-3" />
                    <span className="hidden sm:inline">Sort</span>
                  </>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort Sessions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {orderOptions.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onOrderChange(option.value)}
                  className="flex flex-col items-start py-2"
                >
                  <div className="flex items-center gap-2 w-full">
                    <option.icon className="h-4 w-4" />
                    <span className="font-medium">{option.label}</span>
                    {sessionOrder === option.value && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground ml-6">
                    {option.description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active Session Info */}
      {activeSession && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-md">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                Active: {formatSessionTitle(activeSession)}
              </span>
              <Badge variant="outline" className="text-xs">
                {activeSession.message_count} messages
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Last updated {formatDate(activeSession.updated_at)}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuickSelect(!showQuickSelect)}
            className="h-8 px-2 text-xs"
            aria-expanded={showQuickSelect}
            aria-label="Quick session selection"
          >
            <ChevronDown className={cn(
              "h-3 w-3 transition-transform",
              showQuickSelect && "rotate-180"
            )} />
          </Button>
        </div>
      )}

      {/* Quick Session Selection */}
      {showQuickSelect && sessions.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto border rounded-md bg-background p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1">
            Quick Select ({sessions.length} sessions)
          </div>
          
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => {
                onSessionSelect(session.id);
                setShowQuickSelect(false);
              }}
              className={cn(
                "w-full text-left p-2 rounded-sm text-sm transition-colors",
                "hover:bg-muted focus:bg-muted focus:outline-none",
                activeSessionId === session.id && "bg-primary/10 border border-primary/20"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate flex-1">
                  {formatSessionTitle(session)}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                  <span>{session.message_count}</span>
                  <span>•</span>
                  <span>{formatDate(session.updated_at)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Load More Sessions */}
      {hasMoreSessions && (
        <div className="pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMoreSessions}
            disabled={isLoading}
            className="w-full h-8 text-xs"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2" />
                Loading sessions...
              </>
            ) : (
              `Load more sessions (${totalSessions - sessions.length} remaining)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}