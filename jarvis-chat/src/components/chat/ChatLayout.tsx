import React, { useState, useRef, useEffect } from 'react';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { MessageSearch, SearchFilters, SearchResult } from './MessageSearch';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { screenReader } from '@/lib/accessibility';
import { chatService } from '@/lib/chatService';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface ChatLayoutProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  onRetry?: (messageId: string) => void;
  onMessageClick?: (messageId: string) => void;
  userId: string;
  isLoading?: boolean;
  className?: string;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  messages,
  onSendMessage,
  onRetry,
  onMessageClick,
  userId,
  isLoading = false,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [currentSearchTerms, setCurrentSearchTerms] = useState<string[]>([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSending) return;

    setIsSending(true);

    // Announce message sending to screen readers
    screenReader.announce({
      message: 'Sending message to JARVIS',
      priority: 'polite',
    });

    try {
      await onSendMessage(content);
      setInputValue('');

      // Announce successful send
      screenReader.announce({
        message: 'Message sent successfully',
        priority: 'polite',
      });
    } catch (error) {
      console.error('Failed to send message:', error);

      // Announce error to screen readers
      screenReader.announce({
        message: 'Failed to send message. Please try again.',
        priority: 'assertive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSearch = async (filters: SearchFilters): Promise<SearchResult[]> => {
    try {
      // Update current search terms for highlighting
      if (filters.query.trim()) {
        setCurrentSearchTerms(filters.query.trim().split(/\s+/));
      } else {
        setCurrentSearchTerms([]);
      }
      
      return await chatService.searchMessages(userId, filters);
    } catch (error) {
      console.error('Search failed:', error);
      screenReader.announce({
        message: 'Search failed. Please try again.',
        priority: 'assertive',
      });
      return [];
    }
  };

  const handleClearSearch = () => {
    setShowSearch(false);
    setCurrentSearchTerms([]);
    setHighlightedMessageId(null);
  };

  const handleSearchResultClick = (messageId: string) => {
    onMessageClick?.(messageId);
    setHighlightedMessageId(messageId);
    setShowSearch(false);
    
    // Scroll to the message if possible
    setTimeout(() => {
      const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div
      className={`flex flex-col h-full ${className}`}
      role="main"
      aria-label="Chat conversation with JARVIS"
    >
      {/* Search Section */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-3 sm:p-4">
          <MessageSearch
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
            onResultClick={handleSearchResultClick}
            userId={userId}
            placeholder="Search your conversation history..."
            className="max-w-none"
          />
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-hidden"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onRetry={onRetry}
          searchTerms={currentSearchTerms}
          highlightedMessageId={highlightedMessageId}
          className="h-full"
        />
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Input Area */}
      <div
        className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="form"
        aria-label="Message input area"
      >
        <div className="p-4">
          <MessageInput
            value={inputValue}
            onChange={setInputValue}
            onSendMessage={handleSendMessage}
            disabled={isSending || isLoading}
            placeholder="Type your message to JARVIS..."
          />
          {isSending && (
            <div
              className="flex items-center gap-2 mt-2 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <LoadingSpinner size="sm" />
              <span>Sending message...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
