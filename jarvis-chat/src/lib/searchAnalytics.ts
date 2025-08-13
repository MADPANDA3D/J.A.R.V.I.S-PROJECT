import { SearchFilters } from '@/hooks/useSearchState';
import { QueryPerformanceMetrics } from './searchOptimization';

// Analytics and monitoring for search functionality
export interface SearchAnalyticsEvent {
  id: string;
  timestamp: Date;
  userId: string;
  eventType: 'search_started' | 'search_completed' | 'search_failed' | 'result_clicked' | 'filter_applied' | 'suggestion_selected';
  query?: string;
  filters?: SearchFilters;
  resultCount?: number;
  executionTime?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchPerformanceReport {
  period: {
    start: Date;
    end: Date;
  };
  totalSearches: number;
  averageExecutionTime: number;
  averageResultCount: number;
  successRate: number;
  popularQueries: Array<{ query: string; count: number; avgResults: number }>;
  performanceBottlenecks: Array<{
    type: 'slow_query' | 'large_result_set' | 'frequent_failures';
    description: string;
    impact: number;
    recommendation: string;
  }>;
  userBehaviorInsights: {
    mostActiveUsers: Array<{ userId: string; searchCount: number }>;
    peakUsageHours: Array<{ hour: number; searchCount: number }>;
    commonFilterCombinations: Array<{ filters: string; usage: number }>;
  };
}

export interface SearchQualityMetrics {
  zeroResultQueries: string[];
  highPerformanceQueries: string[];
  problematicQueries: Array<{
    query: string;
    issues: string[];
    suggestedImprovements: string[];
  }>;
  filterEffectiveness: Record<string, {
    usage: number;
    averageResultImprovement: number;
    userSatisfaction: number;
  }>;
}

// Search analytics collector and analyzer
export class SearchAnalyticsCollector {
  private events: SearchAnalyticsEvent[] = [];
  private readonly maxEvents = 10000;
  private readonly localStorageKey = 'jarvis-search-analytics';

  constructor(private userId: string) {
    this.loadFromStorage();
  }

  // Record a search analytics event
  recordEvent(event: Omit<SearchAnalyticsEvent, 'id' | 'timestamp' | 'userId'>): void {
    const analyticsEvent: SearchAnalyticsEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId: this.userId,
      ...event,
    };

    this.events.push(analyticsEvent);

    // Keep only recent events to prevent memory issues
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    this.saveToStorage();
    this.sendToMonitoring(analyticsEvent);
  }

  // Record search performance metrics
  recordPerformanceMetrics(
    query: string,
    filters: SearchFilters,
    metrics: QueryPerformanceMetrics
  ): void {
    this.recordEvent({
      eventType: 'search_completed',
      query,
      filters,
      resultCount: metrics.rowsReturned,
      executionTime: metrics.executionTime,
      metadata: {
        rowsScanned: metrics.rowsScanned,
        indexesUsed: metrics.indexesUsed,
        cacheHit: metrics.cacheHit,
        optimizationApplied: metrics.optimizationApplied,
      },
    });
  }

  // Record search failure
  recordSearchFailure(query: string, filters: SearchFilters, error: string): void {
    this.recordEvent({
      eventType: 'search_failed',
      query,
      filters,
      errorMessage: error,
    });
  }

  // Record user interaction with search results
  recordResultClick(query: string, resultIndex: number, messageId: string): void {
    this.recordEvent({
      eventType: 'result_clicked',
      query,
      metadata: {
        resultIndex,
        messageId,
      },
    });
  }

  // Record filter application
  recordFilterApplied(filterType: string, filterValue: unknown): void {
    this.recordEvent({
      eventType: 'filter_applied',
      metadata: {
        filterType,
        filterValue,
      },
    });
  }

  // Record suggestion selection
  recordSuggestionSelected(originalQuery: string, selectedSuggestion: string): void {
    this.recordEvent({
      eventType: 'suggestion_selected',
      query: selectedSuggestion,
      metadata: {
        originalQuery,
      },
    });
  }

  // Generate performance report for a given period
  generatePerformanceReport(
    startDate: Date,
    endDate: Date
  ): SearchPerformanceReport {
    const periodEvents = this.events.filter(
      event => event.timestamp >= startDate && event.timestamp <= endDate
    );

    const searchEvents = periodEvents.filter(
      event => event.eventType === 'search_completed' || event.eventType === 'search_failed'
    );

    const successfulSearches = searchEvents.filter(
      event => event.eventType === 'search_completed'
    );

    // Calculate basic metrics
    const totalSearches = searchEvents.length;
    const successRate = totalSearches > 0 ? (successfulSearches.length / totalSearches) * 100 : 0;
    
    const averageExecutionTime = successfulSearches.length > 0
      ? successfulSearches.reduce((sum, event) => sum + (event.executionTime || 0), 0) / successfulSearches.length
      : 0;

    const averageResultCount = successfulSearches.length > 0
      ? successfulSearches.reduce((sum, event) => sum + (event.resultCount || 0), 0) / successfulSearches.length
      : 0;

    // Analyze popular queries
    const queryStats = new Map<string, { count: number; totalResults: number }>();
    successfulSearches.forEach(event => {
      if (event.query) {
        const existing = queryStats.get(event.query) || { count: 0, totalResults: 0 };
        existing.count += 1;
        existing.totalResults += event.resultCount || 0;
        queryStats.set(event.query, existing);
      }
    });

    const popularQueries = Array.from(queryStats.entries())
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        avgResults: stats.totalResults / stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Identify performance bottlenecks
    const performanceBottlenecks = this.identifyPerformanceBottlenecks(successfulSearches);

    // Analyze user behavior
    const userBehaviorInsights = this.analyzeUserBehavior(periodEvents);

    return {
      period: { start: startDate, end: endDate },
      totalSearches,
      averageExecutionTime,
      averageResultCount,
      successRate,
      popularQueries,
      performanceBottlenecks,
      userBehaviorInsights,
    };
  }

  // Generate search quality metrics
  generateQualityMetrics(): SearchQualityMetrics {
    const recentEvents = this.events.filter(
      event => event.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    );

    const searchEvents = recentEvents.filter(
      event => event.eventType === 'search_completed'
    );

    // Identify zero result queries
    const zeroResultQueries = searchEvents
      .filter(event => event.resultCount === 0)
      .map(event => event.query || '')
      .filter(query => query.length > 0);

    // Identify high performance queries
    const highPerformanceQueries = searchEvents
      .filter(event => (event.executionTime || 0) < 100 && (event.resultCount || 0) > 5)
      .map(event => event.query || '')
      .filter(query => query.length > 0);

    // Identify problematic queries
    const problematicQueries = this.identifyProblematicQueries(searchEvents);

    // Analyze filter effectiveness
    const filterEffectiveness = this.analyzeFilterEffectiveness(searchEvents);

    return {
      zeroResultQueries: Array.from(new Set(zeroResultQueries)),
      highPerformanceQueries: Array.from(new Set(highPerformanceQueries)),
      problematicQueries,
      filterEffectiveness,
    };
  }

  // Get real-time search metrics
  getRealTimeMetrics() {
    const recentEvents = this.events.filter(
      event => event.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    const searches = recentEvents.filter(event => 
      event.eventType === 'search_completed' || event.eventType === 'search_failed'
    );

    const currentHourSearches = searches.length;
    const averageResponseTime = searches.length > 0
      ? searches.reduce((sum, event) => sum + (event.executionTime || 0), 0) / searches.length
      : 0;

    const errorRate = searches.length > 0
      ? (searches.filter(event => event.eventType === 'search_failed').length / searches.length) * 100
      : 0;

    return {
      currentHourSearches,
      averageResponseTime,
      errorRate,
      cacheHitRate: this.calculateCacheHitRate(recentEvents),
      activeUsers: new Set(recentEvents.map(event => event.userId)).size,
    };
  }

  // Private helper methods
  private identifyPerformanceBottlenecks(events: SearchAnalyticsEvent[]) {
    const bottlenecks = [];

    // Check for slow queries
    const slowQueries = events.filter(event => (event.executionTime || 0) > 1000);
    if (slowQueries.length > 0) {
      bottlenecks.push({
        type: 'slow_query' as const,
        description: `${slowQueries.length} queries taking over 1 second`,
        impact: (slowQueries.length / events.length) * 100,
        recommendation: 'Consider adding database indexes or query optimization',
      });
    }

    // Check for large result sets
    const largeResultSets = events.filter(event => (event.resultCount || 0) > 1000);
    if (largeResultSets.length > 0) {
      bottlenecks.push({
        type: 'large_result_set' as const,
        description: `${largeResultSets.length} queries returning over 1000 results`,
        impact: (largeResultSets.length / events.length) * 100,
        recommendation: 'Implement better pagination or more specific filtering',
      });
    }

    return bottlenecks;
  }

  private analyzeUserBehavior(events: SearchAnalyticsEvent[]) {
    // Most active users
    const userStats = new Map<string, number>();
    events.forEach(event => {
      userStats.set(event.userId, (userStats.get(event.userId) || 0) + 1);
    });

    const mostActiveUsers = Array.from(userStats.entries())
      .map(([userId, searchCount]) => ({ userId, searchCount }))
      .sort((a, b) => b.searchCount - a.searchCount)
      .slice(0, 5);

    // Peak usage hours
    const hourStats = new Map<number, number>();
    events.forEach(event => {
      const hour = event.timestamp.getHours();
      hourStats.set(hour, (hourStats.get(hour) || 0) + 1);
    });

    const peakUsageHours = Array.from(hourStats.entries())
      .map(([hour, searchCount]) => ({ hour, searchCount }))
      .sort((a, b) => b.searchCount - a.searchCount)
      .slice(0, 5);

    // Common filter combinations
    const filterCombinations = new Map<string, number>();
    events
      .filter(event => event.filters)
      .forEach(event => {
        const filterKey = JSON.stringify({
          hasDateRange: !!(event.filters?.dateRange),
          messageTypes: event.filters?.messageTypes || [],
          hasSessionFilter: !!event.filters?.sessionId,
          hasErrorFilter: !!event.filters?.hasErrors,
        });
        filterCombinations.set(filterKey, (filterCombinations.get(filterKey) || 0) + 1);
      });

    const commonFilterCombinations = Array.from(filterCombinations.entries())
      .map(([filters, usage]) => ({ filters, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);

    return {
      mostActiveUsers,
      peakUsageHours,
      commonFilterCombinations,
    };
  }

  private identifyProblematicQueries(events: SearchAnalyticsEvent[]) {
    const queryProblems = new Map<string, string[]>();

    events.forEach(event => {
      if (!event.query) return;

      const issues = [];
      const query = event.query.trim();

      // Check for common issues
      if (query.length < 3) {
        issues.push('Query too short (less than 3 characters)');
      }
      if (query.includes('*') || query.includes('%')) {
        issues.push('Contains wildcard characters that may slow performance');
      }
      if (event.resultCount === 0) {
        issues.push('Returns no results');
      }
      if ((event.executionTime || 0) > 500) {
        issues.push('Slow execution time');
      }

      if (issues.length > 0) {
        queryProblems.set(query, issues);
      }
    });

    return Array.from(queryProblems.entries())
      .map(([query, issues]) => ({
        query,
        issues,
        suggestedImprovements: this.generateQueryImprovements(query, issues),
      }))
      .slice(0, 10);
  }

  private generateQueryImprovements(query: string, issues: string[]): string[] {
    const improvements = [];

    if (issues.some(issue => issue.includes('too short'))) {
      improvements.push('Use more specific search terms (3+ characters)');
    }
    if (issues.some(issue => issue.includes('wildcard'))) {
      improvements.push('Remove wildcard characters and use specific terms');
    }
    if (issues.some(issue => issue.includes('no results'))) {
      improvements.push('Try broader search terms or different keywords');
    }
    if (issues.some(issue => issue.includes('slow execution'))) {
      improvements.push('Use more specific filters to narrow search scope');
    }

    return improvements;
  }

  private analyzeFilterEffectiveness(events: SearchAnalyticsEvent[]) {
    const filterStats: Record<string, {
      usage: number;
      averageResultImprovement: number;
      userSatisfaction: number;
    }> = {};

    // Analyze different filter types
    const filterTypes = ['dateRange', 'messageTypes', 'sessionId', 'hasErrors'];
    
    filterTypes.forEach(filterType => {
      const withFilter = events.filter(event => {
        if (!event.filters) return false;
        if (filterType === 'dateRange') return !!(event.filters.dateRange);
        if (filterType === 'messageTypes') return event.filters.messageTypes.length < 2;
        if (filterType === 'sessionId') return !!event.filters.sessionId;
        if (filterType === 'hasErrors') return !!event.filters.hasErrors;
        return false;
      });

      const withoutFilter = events.filter(event => {
        if (!event.filters) return true;
        if (filterType === 'dateRange') return !(event.filters.dateRange);
        if (filterType === 'messageTypes') return event.filters.messageTypes.length === 2;
        if (filterType === 'sessionId') return !event.filters.sessionId;
        if (filterType === 'hasErrors') return !event.filters.hasErrors;
        return true;
      });

      const avgResultsWithFilter = withFilter.length > 0
        ? withFilter.reduce((sum, event) => sum + (event.resultCount || 0), 0) / withFilter.length
        : 0;

      const avgResultsWithoutFilter = withoutFilter.length > 0
        ? withoutFilter.reduce((sum, event) => sum + (event.resultCount || 0), 0) / withoutFilter.length
        : 0;

      filterStats[filterType] = {
        usage: withFilter.length,
        averageResultImprovement: avgResultsWithFilter - avgResultsWithoutFilter,
        userSatisfaction: 85, // Placeholder - would need click-through analysis
      };
    });

    return filterStats;
  }

  private calculateCacheHitRate(events: SearchAnalyticsEvent[]): number {
    const searchEvents = events.filter(event => 
      event.eventType === 'search_completed' && event.metadata?.cacheHit !== undefined
    );

    if (searchEvents.length === 0) return 0;

    const cacheHits = searchEvents.filter(event => event.metadata?.cacheHit === true).length;
    return (cacheHits / searchEvents.length) * 100;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(`${this.localStorageKey}-${this.userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.events = parsed.map((event: Record<string, unknown>) => ({
          ...event,
          timestamp: new Date(event.timestamp as string),
        }));
      }
    } catch (error) {
      console.error('Failed to load analytics from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      // Keep only recent events for storage
      const recentEvents = this.events.filter(
        event => event.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      );
      localStorage.setItem(`${this.localStorageKey}-${this.userId}`, JSON.stringify(recentEvents));
    } catch (error) {
      console.error('Failed to save analytics to storage:', error);
    }
  }

  private sendToMonitoring(event: SearchAnalyticsEvent): void {
    // In a real implementation, this would send data to external monitoring service
    // For now, we'll just log important events
    if (event.eventType === 'search_failed' || (event.executionTime && event.executionTime > 1000)) {
      console.warn('Search Analytics Event:', {
        type: event.eventType,
        query: event.query,
        executionTime: event.executionTime,
        error: event.errorMessage,
      });
    }
  }

  // Export analytics data for external analysis
  exportAnalyticsData(startDate?: Date, endDate?: Date): SearchAnalyticsEvent[] {
    let events = this.events;

    if (startDate) {
      events = events.filter(event => event.timestamp >= startDate);
    }
    if (endDate) {
      events = events.filter(event => event.timestamp <= endDate);
    }

    return events.map(event => ({
      ...event,
      // Remove potentially sensitive user information
      userId: 'anonymized',
    }));
  }

  // Clear analytics data (for privacy compliance)
  clearAnalyticsData(): void {
    this.events = [];
    try {
      localStorage.removeItem(`${this.localStorageKey}-${this.userId}`);
    } catch (error) {
      console.error('Failed to clear analytics data:', error);
    }
  }
}

// Export singleton instance
export const createSearchAnalytics = (userId: string) => new SearchAnalyticsCollector(userId);