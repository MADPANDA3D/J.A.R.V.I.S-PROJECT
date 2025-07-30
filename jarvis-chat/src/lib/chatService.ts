import { supabase } from './supabase';
import { webhookService, WebhookPayload } from './webhookService';
import { searchOptimizer, SearchQueryOptimizer } from './searchOptimization';
import { createSearchAnalytics } from './searchAnalytics';
import { SearchFilters } from '@/hooks/useSearchState';
import type { DateRange } from 'react-day-picker';

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

export interface ConversationSessionGroup {
  session: ConversationSession;
  messages: SearchResult[];
  messageCount: number;
  hasMoreMessages: boolean;
}

export interface SessionSearchFilters extends SearchFilters {
  groupBySession?: boolean;
  sessionOrder?: 'chronological' | 'relevance' | 'updated';
}

export interface GroupedSearchResponse {
  sessionGroups: ConversationSessionGroup[];
  totalSessions: number;
  totalMessages: number;
  hasMoreSessions: boolean;
}

class ChatService {
  private n8nWebhookUrl: string;
  private searchOptimizer: SearchQueryOptimizer;
  private analyticsCollectors: Map<string, ReturnType<typeof createSearchAnalytics>> = new Map();

  constructor() {
    this.n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || '';
    this.searchOptimizer = searchOptimizer;

    if (!this.n8nWebhookUrl) {
      console.warn('N8N webhook URL not configured. Using fallback responses.');
    }
  }

  // Get or create analytics collector for user
  private getAnalyticsCollector(userId: string) {
    if (!this.analyticsCollectors.has(userId)) {
      this.analyticsCollectors.set(userId, createSearchAnalytics(userId));
    }
    return this.analyticsCollectors.get(userId)!;
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      console.error('Error processing chat message:', error);
      throw error;
    }
  }

  /**
   * Search messages with advanced filtering, pagination, caching, and analytics
   */
  async searchMessages(
    userId: string,
    filters: SearchFilters,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<{ results: SearchResult[]; total: number; hasMore: boolean }> {
    const startTime = performance.now();
    const analytics = this.getAnalyticsCollector(userId);
    
    try {
      analytics.recordEvent({
        eventType: 'search_started',
        query: filters.query,
        filters,
      });

      const { limit = 25, offset = 0 } = options || {};

      // Generate optimized query and check cache
      const optimizedQuery = this.searchOptimizer.buildOptimizedQuery(filters, {
        limit,
        offset,
        includeHighlights: true,
      });

      // Check cache first for performance
      const cachedResult = this.searchOptimizer.getCachedResult<{
        results: SearchResult[];
        total: number;
        hasMore: boolean;
      }>(optimizedQuery.cacheKey);

      if (cachedResult) {
        const executionTime = performance.now() - startTime;
        analytics.recordPerformanceMetrics(filters.query, filters, {
          executionTime,
          rowsScanned: cachedResult.results.length,
          rowsReturned: cachedResult.results.length,
          indexesUsed: ['cache'],
          cacheHit: true,
          optimizationApplied: ['cache_hit'],
        });

        return cachedResult;
      }

      // Build optimized database queries
      let countQuery = supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      let query = supabase
        .from('chat_messages')
        .select('id, content, role, created_at, conversation_id, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply optimized filters
      const applyFilters = (q: ReturnType<typeof supabase.from>) => {
        if (filters.query.trim()) {
          // Use more efficient full-text search if available
          const searchTerm = filters.query.trim();
          q = q.textSearch('content', searchTerm, {
            type: 'websearch',
            config: 'english'
          });
        }

        if (filters.messageTypes.length > 0 && filters.messageTypes.length < 2) {
          q = q.in('role', filters.messageTypes);
        }

        if (filters.dateRange?.from) {
          q = q.gte('created_at', filters.dateRange.from.toISOString());
        }
        if (filters.dateRange?.to) {
          const endDate = new Date(filters.dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          q = q.lte('created_at', endDate.toISOString());
        }

        if (filters.sessionId) {
          q = q.eq('conversation_id', filters.sessionId);
        }

        if (filters.hasErrors) {
          q = q.eq('status', 'error');
        }

        return q;
      };

      // Apply filters with error handling
      try {
        countQuery = applyFilters(countQuery);
        query = applyFilters(query);
      } catch {
        // Fallback to basic ILIKE search if full-text search fails
        if (filters.query.trim()) {
          countQuery = countQuery.ilike('content', `%${filters.query.trim()}%`);
          query = query.ilike('content', `%${filters.query.trim()}%`);
        }
      }

      // Add pagination
      query = query.range(offset, offset + limit - 1);

      // Execute queries with performance monitoring
      const [{ count, error: countError }, { data, error }] = await Promise.all([
        countQuery,
        query
      ]);

      if (error || countError) {
        const errorMsg = error?.message || countError?.message || 'Unknown database error';
        analytics.recordSearchFailure(filters.query, filters, errorMsg);
        throw error || countError;
      }

      const total = count || 0;
      const hasMore = offset + limit < total;
      
      // Process results with highlighting and scoring
      const results = (data || []).map(msg => ({
        messageId: msg.id,
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.created_at),
        highlightedContent: this.highlightSearchTerms(msg.content, filters.query),
        matchScore: this.calculateMatchScore(msg.content, filters.query),
      }));

      const finalResult = {
        results,
        total,
        hasMore,
      };

      // Cache the result for future use
      this.searchOptimizer.setCachedResult(optimizedQuery.cacheKey, finalResult);

      // Record performance metrics
      const totalExecutionTime = performance.now() - startTime;
      analytics.recordPerformanceMetrics(filters.query, filters, {
        executionTime: totalExecutionTime,
        rowsScanned: total,
        rowsReturned: results.length,
        indexesUsed: filters.query.trim() ? ['content_fts_idx', 'created_at_idx'] : ['created_at_idx'],
        cacheHit: false,
        optimizationApplied: ['query_optimization', 'result_caching'],
      });

      return finalResult;
    } catch {
      console.error('Error searching messages:', error);
      
      analytics.recordSearchFailure(
        filters.query,
        filters,
        error instanceof Error ? error.message : 'Unknown error'
      );

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
    } catch {
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
    } catch {
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
    } catch {
      console.error('Error getting webhook status:', error);
      return {
        health: { status: 'unhealthy' as const, error: 'Failed to get status' },
        metrics: webhookService.getMetrics(),
        isConfigured: !!this.n8nWebhookUrl,
      };
    }
  }

  /**
   * Search messages grouped by conversation sessions
   */
  async searchMessagesGroupedBySession(
    userId: string,
    filters: SessionSearchFilters,
    options?: {
      sessionLimit?: number;
      sessionOffset?: number;
      messagesPerSession?: number;
    }
  ): Promise<GroupedSearchResponse> {
    try {
      const { sessionLimit = 10, sessionOffset = 0, messagesPerSession = 5 } = options || {};
      
      // First, get conversation sessions for the user
      const sessionsQuery = supabase
        .from('conversation_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      // Apply session ordering
      switch (filters.sessionOrder) {
        case 'chronological':
          sessionsQuery.order('created_at', { ascending: false });
          break;
        case 'updated':
          sessionsQuery.order('updated_at', { ascending: false });
          break;
        default:
          sessionsQuery.order('updated_at', { ascending: false });
      }

      // Apply pagination
      sessionsQuery.range(sessionOffset, sessionOffset + sessionLimit - 1);

      const { data: sessions, error: sessionsError } = await sessionsQuery;
      
      if (sessionsError) {
        throw sessionsError;
      }

      const sessionGroups: ConversationSessionGroup[] = [];
      let totalMessages = 0;

      // For each session, get the matching messages
      for (const sessionData of sessions || []) {
        const session: ConversationSession = {
          id: sessionData.id,
          title: sessionData.title,
          user_id: sessionData.user_id,
          created_at: new Date(sessionData.created_at),
          updated_at: new Date(sessionData.updated_at),
          message_count: sessionData.message_count,
          status: sessionData.status,
        };

        // Search messages within this session
        const sessionFilters: SearchFilters = {
          ...filters,
          sessionId: session.id,
        };

        const sessionSearchResult = await this.searchMessages(
          userId,
          sessionFilters,
          { limit: messagesPerSession, offset: 0 }
        );

        if (sessionSearchResult.results.length > 0) {
          sessionGroups.push({
            session,
            messages: sessionSearchResult.results,
            messageCount: sessionSearchResult.total,
            hasMoreMessages: sessionSearchResult.hasMore,
          });
          
          totalMessages += sessionSearchResult.total;
        }
      }

      // Check if there are more sessions available
      const { count: totalSessionsCount } = await supabase
        .from('conversation_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active');

      const hasMoreSessions = sessionOffset + sessionLimit < (totalSessionsCount || 0);

      return {
        sessionGroups,
        totalSessions: totalSessionsCount || 0,
        totalMessages,
        hasMoreSessions,
      };
    } catch {
      console.error('Error searching messages grouped by session:', error);
      const analytics = this.getAnalyticsCollector(userId);
      analytics.recordSearchFailure(
        filters.query,
        filters,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw new Error('Failed to search messages by session');
    }
  }

  /**
   * Record user interaction with search results for analytics
   */
  recordSearchResultClick(userId: string, query: string, resultIndex: number, messageId: string): void {
    const analytics = this.getAnalyticsCollector(userId);
    analytics.recordResultClick(query, resultIndex, messageId);
  }

  /**
   * Record filter application for analytics
   */
  recordFilterApplied(userId: string, filterType: string, filterValue: unknown): void {
    const analytics = this.getAnalyticsCollector(userId);
    analytics.recordFilterApplied(filterType, filterValue);
  }

  /**
   * Record suggestion selection for analytics
   */
  recordSuggestionSelected(userId: string, originalQuery: string, selectedSuggestion: string): void {
    const analytics = this.getAnalyticsCollector(userId);
    analytics.recordSuggestionSelected(originalQuery, selectedSuggestion);
  }

  /**
   * Get search performance report for a user
   */
  getSearchPerformanceReport(userId: string, startDate: Date, endDate: Date) {
    const analytics = this.getAnalyticsCollector(userId);
    return analytics.generatePerformanceReport(startDate, endDate);
  }

  /**
   * Get search quality metrics for a user
   */
  getSearchQualityMetrics(userId: string) {
    const analytics = this.getAnalyticsCollector(userId);
    return analytics.generateQualityMetrics();
  }

  /**
   * Get real-time search metrics for a user
   */
  getRealTimeSearchMetrics(userId: string) {
    const analytics = this.getAnalyticsCollector(userId);
    return analytics.getRealTimeMetrics();
  }

  /**
   * Get search cache statistics
   */
  getSearchCacheStats() {
    return this.searchOptimizer.getCacheStats();
  }

  /**
   * Clear search cache for performance testing
   */
  clearSearchCache(): void {
    this.searchOptimizer.clearCache();
  }

  /**
   * Export search analytics data for external analysis
   */
  exportSearchAnalytics(userId: string, startDate?: Date, endDate?: Date) {
    const analytics = this.getAnalyticsCollector(userId);
    return analytics.exportAnalyticsData(startDate, endDate);
  }

  /**
   * Clear search analytics data for privacy compliance
   */
  clearSearchAnalytics(userId: string): void {
    const analytics = this.getAnalyticsCollector(userId);
    analytics.clearAnalyticsData();
    this.analyticsCollectors.delete(userId);
  }

  /**
   * Get session metadata with message preview
   */
  async getSessionWithPreview(
    sessionId: string,
    userId: string,
    previewCount: number = 3
  ): Promise<ConversationSessionGroup | null> {
    try {
      // Get session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('conversation_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError || !sessionData) {
        return null;
      }

      const session: ConversationSession = {
        id: sessionData.id,
        title: sessionData.title,
        user_id: sessionData.user_id,
        created_at: new Date(sessionData.created_at),
        updated_at: new Date(sessionData.updated_at),
        message_count: sessionData.message_count,
        status: sessionData.status,
      };

      // Get recent messages from the session
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('id, content, role, created_at')
        .eq('user_id', userId)
        .eq('conversation_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(previewCount);

      if (messagesError) {
        throw messagesError;
      }

      const searchResults: SearchResult[] = (messages || []).map(msg => ({
        messageId: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.created_at),
        highlightedContent: msg.content,
        matchScore: 1.0,
      }));

      return {
        session,
        messages: searchResults,
        messageCount: session.message_count,
        hasMoreMessages: session.message_count > previewCount,
      };
    } catch {
      console.error('Error getting session with preview:', error);
      throw new Error('Failed to get session preview');
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
