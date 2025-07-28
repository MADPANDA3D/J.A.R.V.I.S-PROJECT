import React from 'react';
import {
  User,
  Bot,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { screenReader } from '@/lib/accessibility';
import type { Message } from './ChatLayout';

interface MessageBubbleProps {
  message: Message;
  onRetry?: (messageId: string) => void;
  highlightedContent?: string;
  searchTerms?: string[];
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRetry,
  highlightedContent,
  searchTerms,
  className = '',
}) => {
  const isUser = message.role === 'user';

  const highlightSearchTerms = (content: string, terms: string[]): string => {
    if (!terms || terms.length === 0) return content;

    let highlightedContent = content;
    terms.forEach(term => {
      if (term.trim()) {
        const regex = new RegExp(`(${term.trim()})`, 'gi');
        highlightedContent = highlightedContent.replace(
          regex,
          '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded" aria-label="Search match: $1">$1</mark>'
        );
      }
    });

    return highlightedContent;
  };

  const getDisplayContent = () => {
    if (highlightedContent) {
      return highlightedContent;
    }
    
    if (searchTerms && searchTerms.length > 0) {
      return highlightSearchTerms(message.content, searchTerms);
    }
    
    return message.content;
  };

  const hasHighlights = highlightedContent || (searchTerms && searchTerms.length > 0);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return (
          <Clock
            className="w-3 h-3 text-muted-foreground animate-pulse"
            aria-label="Message sending"
          />
        );
      case 'sent':
        return (
          <CheckCircle
            className="w-3 h-3 text-green-500"
            aria-label="Message sent successfully"
          />
        );
      case 'error':
        return (
          <XCircle
            className="w-3 h-3 text-destructive"
            aria-label="Message failed to send"
          />
        );
      default:
        return null;
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      screenReader.announce({
        message: 'Retrying message send',
        priority: 'polite',
      });
      onRetry(message.id);
    }
  };

  const messageLabel = `${isUser ? 'You' : 'JARVIS assistant'} said: ${message.content}`;
  const timeLabel = `Sent at ${formatTime(message.timestamp)}`;

  return (
    <div
      className={cn('flex gap-3', isUser && 'flex-row-reverse', className)}
      role="article"
      aria-label={messageLabel}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            isUser ? 'bg-primary' : 'bg-secondary'
          )}
          role="img"
          aria-label={isUser ? 'Your avatar' : 'JARVIS assistant avatar'}
        >
          {isUser ? (
            <User className="w-4 h-4 text-primary-foreground" />
          ) : (
            <Bot className="w-4 h-4 text-secondary-foreground" />
          )}
        </div>
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex flex-col max-w-xs lg:max-w-md',
          isUser && 'items-end'
        )}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-lg px-4 py-2 text-sm break-words',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          )}
          role="region"
          aria-label={`Message from ${isUser ? 'you' : 'JARVIS'}`}
        >
          {hasHighlights ? (
            <div
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: getDisplayContent() }}
              aria-label={`${message.content}${searchTerms ? ' - Contains search matches' : ''}`}
            />
          ) : (
            <p className="whitespace-pre-wrap" aria-label={message.content}>
              {message.content}
            </p>
          )}
        </div>

        {/* Timestamp and Status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1 text-xs text-muted-foreground',
            isUser && 'flex-row-reverse'
          )}
          role="complementary"
          aria-label="Message metadata"
        >
          <time
            dateTime={message.timestamp.toISOString()}
            aria-label={timeLabel}
          >
            {formatTime(message.timestamp)}
          </time>
          {isUser && getStatusIcon()}
          {isUser && message.status === 'error' && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="h-auto p-1 text-xs hover:bg-destructive/20"
              aria-label="Retry sending this message"
              title="Retry message"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
