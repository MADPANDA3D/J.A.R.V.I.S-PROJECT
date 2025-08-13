import React, { useEffect } from 'react';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { screenReader } from '@/lib/accessibility';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    sendMessage,
    retryMessage,
    clearError,
  } = useChat();

  // Announce page load and updates to screen readers
  useEffect(() => {
    screenReader.announce({
      message: 'Chat page loaded. Start typing to send a message to JARVIS.',
      priority: 'polite',
    });
  }, []);

  // Announce errors to screen readers
  useEffect(() => {
    if (error) {
      screenReader.announce({
        message: `Error: ${error}`,
        priority: 'assertive',
      });
    }
  }, [error]);

  // Show loading spinner while loading message history
  if (isLoadingHistory) {
    return (
      <div
        className="h-full flex items-center justify-center"
        role="status"
        aria-label="Loading conversation history"
      >
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">
            Loading conversation history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {error && (
        <div
          className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 text-sm"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-2 hover:bg-destructive/20 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-destructive"
              aria-label="Close error message"
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <ChatLayout
        messages={messages}
        onSendMessage={sendMessage}
        onRetry={retryMessage}
        userId={user?.id || ''}
        isLoading={isLoading}
        className="h-full"
      />
    </div>
  );
};
