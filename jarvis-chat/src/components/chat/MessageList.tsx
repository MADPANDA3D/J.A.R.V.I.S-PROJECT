import React from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { Message } from './ChatLayout';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onRetry?: (messageId: string) => void;
  searchTerms?: string[];
  highlightedMessageId?: string | null;
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  onRetry,
  searchTerms,
  highlightedMessageId,
  className = '',
}) => {
  return (
    <div
      className={`overflow-y-auto p-4 space-y-4 ${className}`}
      role="log"
      aria-label="Chat message history"
      tabIndex={0}
    >
      {messages.length === 0 && !isLoading ? (
        <div
          className="flex flex-col items-center justify-center h-full text-center"
          role="region"
          aria-label="Empty chat welcome screen"
        >
          <div className="max-w-md mx-auto space-y-4">
            <div
              className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
              role="img"
              aria-label="JARVIS assistant logo"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  J
                </span>
              </div>
            </div>
            <div>
              <h3
                className="text-lg font-semibold text-foreground mb-2"
                role="heading"
                aria-level={2}
              >
                Welcome to JARVIS
              </h3>
              <p className="text-muted-foreground text-sm">
                Start a conversation with your AI assistant. Ask questions,
                request help, or just have a chat. I'm here to help!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <ul role="list" className="space-y-4">
            {messages.map(message => (
              <li key={message.id} role="listitem" data-message-id={message.id}>
                <MessageBubble 
                  message={message} 
                  onRetry={onRetry}
                  searchTerms={searchTerms}
                  className={highlightedMessageId === message.id ? 'ring-2 ring-yellow-400 ring-opacity-50 rounded-lg' : ''}
                />
              </li>
            ))}
          </ul>

          {isLoading && (
            <div role="status" aria-label="Assistant is typing">
              <TypingIndicator />
            </div>
          )}
        </>
      )}
    </div>
  );
};
