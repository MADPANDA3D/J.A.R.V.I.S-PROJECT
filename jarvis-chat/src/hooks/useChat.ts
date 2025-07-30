import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { chatService, type ChatMessage } from '@/lib/chatService';
import type { Message } from '@/components/chat/ChatLayout';

// Convert ChatMessage to Message format for UI components
const chatMessageToMessage = (chatMsg: ChatMessage): Message => ({
  id: chatMsg.id,
  content: chatMsg.content,
  role: chatMsg.role,
  timestamp: chatMsg.timestamp,
  status: chatMsg.status,
});

// Convert Message to ChatMessage format for database (currently unused but kept for future use)
// const messageToChatMessage = (
//   msg: Message,
//   userId: string
// ): Omit<ChatMessage, 'id' | 'timestamp'> => ({
//   content: msg.content,
//   role: msg.role,
//   status: msg.status,
//   user_id: userId,
// });

export const useChat = () {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load message history when user logs in
  useEffect(() => {
    if (!user?.id) return;

    const loadHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const history = await chatService.loadMessageHistory(user.id);
        setMessages(history.map(chatMessageToMessage));
      } catch (err) {
        console.error('Failed to load message history:', err);
        // Don't set error for history loading failure, just log it
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [user?.id]);

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = chatService.subscribeToMessages(
      user.id,
      chatMessage => {
        const message = chatMessageToMessage(chatMessage);
        setMessages(prev => {
          // Avoid duplicates by checking if message already exists
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    );

    return unsubscribe;
  }, [user?.id]);

  // Send a new message
  const sendMessage = useCallback(
    async (content: string, selectedTools?: string[]) => {
      if (!user?.id || !content.trim()) return;

      setError(null);
      setIsLoading(true);

      // Create temporary user message for immediate UI feedback
      const tempUserMessage: Message = {
        id: `temp-user-${Date.now()}`,
        content: content.trim(),
        role: 'user',
        timestamp: new Date(),
        status: 'sending',
      };

      setMessages(prev => [...prev, tempUserMessage]);

      try {
        // Process the complete chat interaction with selected tools
        const { userMsg, aiMsg } = await chatService.processChatMessage(
          content.trim(),
          user.id,
          undefined, // conversationId - for future use
          selectedTools
        );

        // Remove temporary message and add actual messages
        setMessages(prev => {
          const withoutTemp = prev.filter(m => m.id !== tempUserMessage.id);
          return [
            ...withoutTemp,
            chatMessageToMessage(userMsg),
            chatMessageToMessage(aiMsg),
          ];
        });
      } catch (err) {
        console.error('Failed to send message:', err);

        // Update temporary message to show error
        setMessages(prev =>
          prev.map(m =>
            m.id === tempUserMessage.id ? { ...m, status: 'error' as const } : m
          )
        );

        // Add error message from AI
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          content:
            'Sorry, I encountered an error while processing your message. Please try again.',
          role: 'assistant',
          timestamp: new Date(),
          status: 'error',
        };

        setMessages(prev => [...prev, errorMessage]);
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  // Retry failed message
  const retryMessage = useCallback(
    async (messageId: string) => {
      const message = messages.find(
        m => m.id === messageId && m.role === 'user'
      );
      if (!message) return;

      // Remove the failed message and retry
      setMessages(prev => prev.filter(m => m.id !== messageId));
      await sendMessage(message.content);
    },
    [messages, sendMessage]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear all messages (for new conversation)
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    sendMessage,
    retryMessage,
    clearError,
    clearMessages,
  };
};
