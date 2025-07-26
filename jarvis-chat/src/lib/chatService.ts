import { supabase } from './supabase';
import { webhookService, WebhookPayload } from './webhookService';
import { DateRange } from 'react-day-picker';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  user_id: string;
  conversation_id?: string;
}

export interface N8nWebhookResponse {
  response: string;
  success: boolean;
  error?: string;
}

export interface SearchFilters {
  query: string;
  dateRange?: DateRange;
  messageTypes: ('user' | 'assistant')[];
  sessionId?: string;
  hasErrors?: boolean;
}

export interface SearchResult {
  messageId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  highlightedContent: string;
  matchScore: number;
}

export interface ConversationSession {
  id: string;
  title: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  message_count: number;
  status: 'active' | 'archived' | 'deleted';
}

class ChatService {
  private n8nWebhookUrl: string;

  constructor() {
    this.n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

    if (!this.n8nWebhookUrl) {
      console.warn('N8N webhook URL not configured. Using fallback responses.');
    }
  }

  /**
   * Send message to n8n webhook and get AI response
   * Enhanced with robust error handling, retry logic, and circuit breaker
   */
  async sendMessageToAI(
    message: string,
    userId: string,
    conversationId?: string,
    selectedTools?: string[]
  ): Promise<string> {
    if (!this.n8nWebhookUrl) {
      // Fallback for development/testing
      return this.getFallbackResponse(message);
    }

    try {
      const payload: WebhookPayload = {
        type: 'Text',
        message,
        sessionId: conversationId || `session_${Date.now()}_${userId}`,
        source: 'webapp',
        chatId: parseInt(userId) || 1,
        timestamp: new Date().toISOString(),
        selected_tools: selectedTools || [],
      };

      const response = await webhookService.sendMessage(payload);
      return response.response;
    } catch (error) {
      console.error('Error calling n8n webhook:', error);

      // Provide fallback response for better user experience
      if (error instanceof Error) {
        // If webhook is completely unavailable, use fallback
        if (
          error.message.includes('Circuit breaker is open') ||
          error.message.includes('Webhook URL not configured') ||
          error.message.includes('n8n Webhook Error') ||
          error.message.includes('not registered') ||
          error.message.includes('empty response') ||
          error.message.includes('Respond to Webhook')
        ) {
          console.warn(
            'Webhook unavailable, using fallback response. Error:',
            error.message
          );
          return this.getFallbackResponse(message);
        }
      }

      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  /**
   * Save message to Supabase database
   */
  async saveMessage(
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): Promise<ChatMessage> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            content: message.content,
            role: message.role,
            user_id: message.user_id,
            conversation_id: message.conversation_id,
            status: message.status || 'sent',
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        content: data.content,
        role: data.role,
        timestamp: new Date(data.created_at),
        status: data.status as ChatMessage['status'],
        user_id: data.user_id,
        conversation_id: data.conversation_id,
      };
    } catch (error) {
      console.error('Error saving message:', error);
      throw new Error('Failed to save message');
    }
  }

  /**
   * Load message history for a user
   */
  async loadMessageHistory(
    userId: string,
    limit: number = 50
  ): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.created_at),
        status: msg.status as ChatMessage['status'],
        user_id: msg.user_id,
        conversation_id: msg.conversation_id,
      }));
    } catch (error) {
      console.error('Error loading message history:', error);
      return []; // Return empty array on error, don't break the chat
    }
  }

  /**
   * Subscribe to real-time message updates
   */
  subscribeToMessages(
    userId: string,
    callback: (message: ChatMessage) => void
  ) {
    const subscription = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          const newMessage: ChatMessage = {
            id: payload.new.id,
            content: payload.new.content,
            role: payload.new.role,
            timestamp: new Date(payload.new.created_at),
            status: payload.new.status as ChatMessage['status'],
            user_id: payload.new.user_id,
            conversation_id: payload.new.conversation_id,
          };
          callback(newMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }

  /**
   * Process a complete chat interaction: save user message, get AI response, save AI response
   */
  async processChatMessage(
    userMessage: string,
    userId: string,
    conversationId?: string,
    selectedTools?: string[]
  ): Promise<{ userMsg: ChatMessage; aiMsg: ChatMessage }> {
    try {
      // Save user message
      const userMsg = await this.saveMessage({
        content: userMessage,
        role: 'user',
        user_id: userId,
        conversation_id: conversationId,
        status: 'sent',
      });

      // Get AI response
      const aiResponse = await this.sendMessageToAI(
        userMessage,
        userId,
        conversationId,
        selectedTools
      );

      // Save AI response
      const aiMsg = await this.saveMessage({
        content: aiResponse,
        role: 'assistant',
        user_id: userId,
        conversation_id: conversationId,
        status: 'sent',
      });

      return { userMsg, aiMsg };
    } catch (error) {
      console.error('Error processing chat message:', error);
      throw error;
    }
  }

  /**
   * Search messages with advanced filtering
   */
  async searchMessages(
    userId: string,
    filters: SearchFilters
  ): Promise<SearchResult[]> {
    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply text search filter
      if (filters.query.trim()) {
        query = query.ilike('content', `%${filters.query.trim()}%`);
      }

      // Apply message type filter
      if (filters.messageTypes.length > 0 && filters.messageTypes.length < 2) {
        query = query.in('role', filters.messageTypes);
      }

      // Apply date range filter
      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        // Include the entire end date by setting time to end of day
        const endDate = new Date(filters.dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      // Apply session filter
      if (filters.sessionId) {
        query = query.eq('conversation_id', filters.sessionId);
      }

      // Apply error filter
      if (filters.hasErrors) {
        query = query.eq('status', 'error');
      }

      const { data, error } = await query.limit(100);

      if (error) {
        throw error;
      }

      return data.map(msg => ({
        messageId: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.created_at),
        highlightedContent: this.highlightSearchTerms(msg.content, filters.query),
        matchScore: this.calculateMatchScore(msg.content, filters.query),
      }));
    } catch (error) {
      console.error('Error searching messages:', error);
      throw new Error('Failed to search messages');
    }
  }

  /**
   * Highlight search terms in content
   */
  private highlightSearchTerms(content: string, query: string): string {
    if (!query.trim()) return content;

    const terms = query.trim().split(/\s+/);
    let highlightedContent = content;

    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedContent = highlightedContent.replace(
        regex, 
        '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>'
      );
    });

    return highlightedContent;
  }

  /**
   * Calculate match score based on search relevance
   */
  private calculateMatchScore(content: string, query: string): number {
    if (!query.trim()) return 0;

    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    // Exact match gets highest score
    if (lowerContent.includes(lowerQuery)) {
      return 1.0;
    }

    // Partial matches get proportional scores
    const words = lowerQuery.split(/\s+/);
    const matchedWords = words.filter(word => lowerContent.includes(word));
    
    return matchedWords.length / words.length;
  }

  /**
   * Get conversation sessions for a user
   */
  async getConversationSessions(userId: string): Promise<ConversationSession[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(session => ({
        id: session.id,
        title: session.title,
        user_id: session.user_id,
        created_at: new Date(session.created_at),
        updated_at: new Date(session.updated_at),
        message_count: session.message_count,
        status: session.status,
      }));
    } catch (error) {
      console.error('Error loading conversation sessions:', error);
      throw new Error('Failed to load conversation sessions');
    }
  }

  /**
   * Create a new conversation session
   */
  async createConversationSession(
    userId: string,
    title: string = 'New Conversation'
  ): Promise<ConversationSession> {
    try {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .insert([
          {
            title,
            user_id: userId,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        user_id: data.user_id,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        message_count: data.message_count,
        status: data.status,
      };
    } catch (error) {
      console.error('Error creating conversation session:', error);
      throw new Error('Failed to create conversation session');
    }
  }

  /**
   * Get webhook service health status and metrics
   */
  async getWebhookStatus() {
    try {
      const [healthStatus, metrics] = await Promise.all([
        webhookService.healthCheck(),
        Promise.resolve(webhookService.getMetrics()),
      ]);

      return {
        health: healthStatus,
        metrics: metrics,
        isConfigured: !!this.n8nWebhookUrl,
      };
    } catch (error) {
      console.error('Error getting webhook status:', error);
      return {
        health: { status: 'unhealthy' as const, error: 'Failed to get status' },
        metrics: webhookService.getMetrics(),
        isConfigured: !!this.n8nWebhookUrl,
      };
    }
  }

  /**
   * Fallback response for development/testing
   */
  private async getFallbackResponse(message: string): Promise<string> {
    // Simulate network delay
    await new Promise(resolve =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    const responses = [
      `I understand you said: "${message}". I'm JARVIS, your AI assistant. How can I help you today?`,
      `That's an interesting point about "${message}". Let me think about that and provide you with some insights.`,
      `Regarding "${message}" - I'm here to assist you. Could you provide more details about what you'd like to know?`,
      `I've processed your message: "${message}". As your AI assistant, I'm ready to help with any questions or tasks you have.`,
      `Thank you for sharing: "${message}". I'm JARVIS, and I'm designed to be helpful, accurate, and efficient in my responses.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const chatService = new ChatService();
