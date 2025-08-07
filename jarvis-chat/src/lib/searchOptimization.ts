import { SearchFilters } from '@/hooks/useSearchState';

// Query optimization utilities for improved search performance
export interface OptimizedQuery {
  text: string;
  params: Record<string, unknown>;
  estimatedRows: number;
  useIndex: boolean;
  cacheKey: string;
}

export interface QueryPerformanceMetrics {
  executionTime: number;
  rowsScanned: number;
  rowsReturned: number;
  indexesUsed: string[];
  cacheHit: boolean;
  optimizationApplied: string[];
}

export interface SearchOptimizationConfig {
  enableQueryOptimization: boolean;
  enableResultCaching: boolean;
  cacheTimeoutMs: number;
  maxCacheSize: number;
  debounceDelayMs: number;
  paginationSize: number;
  indexHints: string[];
}

const defaultConfig: SearchOptimizationConfig = {
  enableQueryOptimization: true,
  enableResultCaching: true,
  cacheTimeoutMs: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 100,
  debounceDelayMs: 300,
  paginationSize: 25,
  indexHints: ['content_gin_idx', 'timestamp_idx', 'session_id_idx'],
};

// Query builder with optimization
export class SearchQueryOptimizer {
  private config: SearchOptimizationConfig;
  private queryCache = new Map<string, { result: unknown; timestamp: number; hits: number }>();

  constructor(config: Partial<SearchOptimizationConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Build optimized search query for Supabase
  buildOptimizedQuery(filters: SearchFilters, options: {
    limit?: number;
    offset?: number;
    sortBy?: 'relevance' | 'date' | 'conversation';
    includeHighlights?: boolean;
  } = {}): OptimizedQuery  => {
    const { query, dateRange, messageTypes, sessionId, hasErrors } = filters;
    const { limit = this.config.paginationSize, offset = 0, sortBy = 'relevance' } = options;

    // Base query conditions
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    const optimizations: string[] = [];

    // Full-text search optimization
    if (query.trim()) {
      // Use full-text search index for better performance
      conditions.push("content_vector @@ to_tsquery('english', $query)");
      params.query = this.optimizeSearchQuery(query);
      optimizations.push('full_text_search_index');
    }

    // Date range optimization with index hints
    if (dateRange?.from || dateRange?.to) {
      if (dateRange.from && dateRange.to) {
        conditions.push("timestamp BETWEEN $dateFrom AND $dateTo");
        params.dateFrom = dateRange.from.toISOString();
        params.dateTo = dateRange.to.toISOString();
      } else if (dateRange.from) {
        conditions.push("timestamp >= $dateFrom");
        params.dateFrom = dateRange.from.toISOString();
      } else if (dateRange.to) {
        conditions.push("timestamp <= $dateTo");
        params.dateTo = dateRange.to.toISOString();
      }
      optimizations.push('timestamp_index');
    }

    // Message type filtering
    if (messageTypes.length === 1) {
      conditions.push("role = $role");
      params.role = messageTypes[0];
      optimizations.push('role_filter');
    } else if (messageTypes.length === 0) {
      // No message types selected - return empty result efficiently
      conditions.push("FALSE");
      optimizations.push('early_termination');
    }

    // Session filtering with index optimization
    if (sessionId) {
      conditions.push("session_id = $sessionId");
      params.sessionId = sessionId;
      optimizations.push('session_index');
    }

    // Error filtering
    if (hasErrors) {
      conditions.push("error_message IS NOT NULL");
      optimizations.push('error_filter');
    }

    // Build the complete query
    let sqlQuery = `
      SELECT 
        id,
        content,
        role,
        timestamp,
        session_id,
        error_message,
        ${query.trim() ? "ts_rank(content_vector, to_tsquery('english', $query)) as relevance_score," : "0 as relevance_score,"}
        ${options.includeHighlights ? "ts_headline('english', content, to_tsquery('english', $query)) as highlighted_content," : "content as highlighted_content,"}
        count(*) OVER() as total_count
      FROM chat_messages
      ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}
    `;

    // Optimize ordering
    if (sortBy === 'relevance' && query.trim()) {
      sqlQuery += ` ORDER BY relevance_score DESC, timestamp DESC`;
      optimizations.push('relevance_sort');
    } else if (sortBy === 'date') {
      sqlQuery += ` ORDER BY timestamp DESC`;
      optimizations.push('timestamp_sort');
    } else {
      sqlQuery += ` ORDER BY timestamp DESC`;
    }

    // Add pagination
    sqlQuery += ` LIMIT $limit OFFSET $offset`;
    params.limit = limit;
    params.offset = offset;

    // Estimate query complexity for caching decisions
    const estimatedRows = this.estimateQueryRows(filters);
    const useIndex = conditions.some(c => 
      c.includes('timestamp') || c.includes('session_id') || c.includes('content_vector')
    );

    // Generate cache key
    const cacheKey = this.generateCacheKey(filters, options);

    return {
      text: sqlQuery,
      params,
      estimatedRows,
      useIndex,
      cacheKey,
    };
  }

  // Optimize search query text for better full-text search
  private optimizeSearchQuery(query: string): string {
    let optimized = query.trim();

    // Remove special characters that might break tsquery
    optimized = optimized.replace(/[^\w\s'"]/g, ' ');

    // Handle quoted phrases
    const quotedPhrases = optimized.match(/"[^"]+"/g) || [];
    quotedPhrases.forEach(phrase => {
      const cleanPhrase = phrase.replace(/"/g, '');
      optimized = optimized.replace(phrase, `"${cleanPhrase}"`);
    });

    // Add prefix matching for partial words
    const words = optimized.split(/\s+/).filter(word => word.length > 0);
    const processedWords = words.map(word => {
      if (word.startsWith('"') && word.endsWith('"')) {
        return word; // Keep quoted phrases as-is
      }
      if (word.length >= 3) {
        return `${word}:*`; // Add prefix matching
      }
      return word;
    });

    return processedWords.join(' & ');
  }

  // Estimate query complexity for optimization decisions
  private estimateQueryRows(filters: SearchFilters): number {
    let estimate = 10000; // Base estimate

    // Reduce estimate based on filters
    if (filters.query.trim()) {
      estimate *= 0.1; // Text search significantly reduces results
    }
    if (filters.sessionId) {
      estimate *= 0.05; // Session filter is very selective
    }
    if (filters.dateRange?.from || filters.dateRange?.to) {
      estimate *= 0.3; // Date range reduces results
    }
    if (filters.messageTypes.length === 1) {
      estimate *= 0.5; // Role filter reduces by half
    }
    if (filters.hasErrors) {
      estimate *= 0.02; // Error filter is very selective
    }

    return Math.max(Math.round(estimate), 1);
  }

  // Generate cache key for result caching
  private generateCacheKey(filters: SearchFilters, options: Record<string, unknown>): string {
    const keyData = {
      query: filters.query.trim().toLowerCase(),
      dateRange: filters.dateRange ? {
        from: filters.dateRange.from?.toISOString(),
        to: filters.dateRange.to?.toISOString(),
      } : null,
      messageTypes: [...filters.messageTypes].sort(),
      sessionId: filters.sessionId,
      hasErrors: filters.hasErrors,
      limit: options.limit,
      offset: options.offset,
      sortBy: options.sortBy,
    };

    return `search:${btoa(JSON.stringify(keyData))}`;
  }

  // Check if query result is cached and still valid
  getCachedResult<T>(cacheKey: string): T | null  => {
    if (!this.config.enableResultCaching) return null;

    const cached = this.queryCache.get(cacheKey);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.config.cacheTimeoutMs;
    if (isExpired) {
      this.queryCache.delete(cacheKey);
      return null;
    }

    // Update hit count for LRU eviction
    cached.hits += 1;
    return cached.result as T;
  }

  // Cache query result with LRU eviction
  setCachedResult<T>(cacheKey: string, result: T): void  => {
    if (!this.config.enableResultCaching) return;

    // Evict oldest entries if cache is full
    if (this.queryCache.size >= this.config.maxCacheSize) {
      const entries = Array.from(this.queryCache.entries());
      entries.sort(([, a], [, b]) => a.hits - b.hits || a.timestamp - b.timestamp);
      
      // Remove least recently used entries
      const toRemove = Math.floor(this.config.maxCacheSize * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.queryCache.delete(entries[i][0]);
      }
    }

    this.queryCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      hits: 1,
    });
  }

  // Clear cache (useful for testing or memory management)
  clearCache(): void {
    this.queryCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    const entries = Array.from(this.queryCache.values());
    return {
      size: this.queryCache.size,
      totalHits: entries.reduce((sum, entry) => sum + entry.hits, 0),
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null,
    };
  }
}

// Debounced search function for performance
export function createDebouncedSearch<T extends unknown[], R>(
  searchFunction: (...args: T) => Promise<R>,
  delayMs: number = defaultConfig.debounceDelayMs
): (...args: T) => Promise<R> {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingResolvers: Array<{
    resolve: (value: R) => void;
    reject: (error: unknown) => void;
  }> = [];

  return(...args: T): Promise<R>  => {
    return new Promise<R>((resolve, reject) => {
      pendingResolvers.push({ resolve, reject });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        const resolvers = [...pendingResolvers];
        pendingResolvers = [];

        try {
          const result = await searchFunction(...args);
          resolvers.forEach(({ resolve }) => resolve(result));
        } catch (error) {
          resolvers.forEach(({ reject }) => reject(error));
        }
      }, delayMs);
    });
  };
}

// Batch query optimization for multiple searches
export class BatchQueryOptimizer {
  private pendingQueries: Array<{
    query: OptimizedQuery;
    resolve: (result: unknown) => void;
    reject: (error: unknown) => void;
  }> = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  constructor(private batchDelayMs: number = 50) {}

  // Add query to batch
  addQuery(query: OptimizedQuery): Promise<unknown>  => {
    return new Promise((resolve, reject) => {
      this.pendingQueries.push({ query, resolve, reject });

      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }

      this.batchTimeout = setTimeout(() => {
        this.executeBatch();
      }, this.batchDelayMs);
    });
  }

  // Execute all pending queries as a batch
  private async executeBatch(): Promise<void>  {
    if (this.pendingQueries.length === 0) return;

    const batch = [...this.pendingQueries];
    this.pendingQueries = [];
    this.batchTimeout = null;

    // Group similar queries for optimization
    const groupedQueries = this.groupSimilarQueries(batch);

    for (const group of groupedQueries) {
      try {
        // Execute grouped queries (implementation would depend on actual database client)
        const results = await this.executeQueryGroup(group);
        
        group.forEach((item, index) => {
          item.resolve(results[index]);
        });
      } catch (error) {
        group.forEach(item => {
          item.reject(error);
        });
      }
    }
  }

  // Group similar queries for batch execution
  private groupSimilarQueries(queries: Array<{
    query: OptimizedQuery;
    resolve: (result: unknown) => void;
    reject: (error: unknown) => void;
  }>): Array<Array<typeof queries[0]>> {
    // Simple grouping by table and basic conditions
    const groups = new Map<string, typeof queries>();

    queries.forEach(item => {
      const groupKey = this.getQueryGroupKey(item.query);
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    });

    return Array.from(groups.values());
  }

  // Generate group key for similar queries
  private getQueryGroupKey(query: OptimizedQuery): string {
    // Extract table name and basic structure for grouping
    const tableMatch = query.text.match(/FROM\s+(\w+)/i);
    const table = tableMatch ? tableMatch[1] : 'unknown';
    
    // Group by table and whether it uses indexes
    return `${table}:${query.useIndex}`;
  }

  // Execute a group of similar queries (placeholder implementation)
  private async executeQueryGroup(): Promise<unknown[]>  {
    // This would be implemented based on the actual database client
    // For Supabase, this might involve using batch queries or parallel execution
    throw new Error('executeQueryGroup not implemented - requires database client integration');
  }
}

// Export default optimizer instance
export const searchOptimizer = new SearchQueryOptimizer();