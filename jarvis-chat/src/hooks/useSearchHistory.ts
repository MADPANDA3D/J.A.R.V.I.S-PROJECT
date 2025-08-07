import { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchHistoryItem, SearchFilters, FavoriteFilter } from './useSearchState';

export interface SearchSuggestion {
  query: string;
  score: number;
  type: 'history' | 'popular' | 'similar' | 'completion';
  metadata?: {
    resultCount?: number;
    lastUsed?: Date;
    useCount?: number;
  };
}

export interface SearchPattern {
  pattern: string;
  frequency: number;
  avgResultCount: number;
  lastUsed: Date;
  filters: Partial<SearchFilters>;
}

interface SearchHistoryState {
  frequentQueries: SearchPattern[];
  searchSuggestions: SearchSuggestion[];
  queryCompletions: string[];
  searchTrends: {
    daily: Record<string, number>;
    weekly: Record<string, number>;
    monthly: Record<string, number>;
  };
}

const SUGGESTION_STORAGE_KEY = 'jarvis-chat-search-suggestions';
// const PATTERNS_STORAGE_KEY = 'jarvis-chat-search-patterns'; // Reserved for future use

export function useSearchHistory(
  userId: string,
  searchHistory: SearchHistoryItem[],
  favoriteFilters: FavoriteFilter[],
  popularQueries: string[]
) {
  const [historyState, setHistoryState] = useState<SearchHistoryState>({
    frequentQueries: [],
    searchSuggestions: [],
    queryCompletions: [],
    searchTrends: { daily: {}, weekly: {}, monthly: {} },
  });

  // Analyze search patterns from history
  const searchPatterns = useMemo(() => {
    const patterns = new Map<string, SearchPattern>();

    searchHistory.forEach(item => {
      const key = item.query.toLowerCase().trim();
      const existing = patterns.get(key);

      if (existing) {
        existing.frequency += 1;
        existing.avgResultCount = (existing.avgResultCount + item.resultCount) / 2;
        if (item.timestamp > existing.lastUsed) {
          existing.lastUsed = item.timestamp;
          existing.filters = item.filters;
        }
      } else {
        patterns.set(key, {
          pattern: item.query,
          frequency: 1,
          avgResultCount: item.resultCount,
          lastUsed: item.timestamp,
          filters: item.filters,
        });
      }
    });

    return Array.from(patterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20);
  }, [searchHistory]);

  // Generate intelligent search suggestions
  const generateSuggestions = useCallback((partialQuery: string): SearchSuggestion[]  => {
    if (!partialQuery.trim()) return [];

    const query = partialQuery.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    // Add exact matches from history
    searchHistory.forEach(item => {
      if (item.query.toLowerCase().includes(query)) {
        suggestions.push({
          query: item.query,
          score: 1.0,
          type: 'history',
          metadata: {
            resultCount: item.resultCount,
            lastUsed: item.timestamp,
          },
        });
      }
    });

    // Add popular query matches
    popularQueries.forEach((popularQuery, index) => {
      if (popularQuery.includes(query)) {
        const score = Math.max(0.8 - (index * 0.05), 0.3); // Score based on popularity rank
        suggestions.push({
          query: popularQuery,
          score,
          type: 'popular',
          metadata: {
            useCount: popularQueries.length - index,
          },
        });
      }
    });

    // Add similar queries (fuzzy matching)
    searchPatterns.forEach(pattern => {
      const similarity = calculateSimilarity(query, pattern.pattern.toLowerCase());
      if (similarity > 0.6 && !suggestions.some(s => s.query === pattern.pattern)) {
        suggestions.push({
          query: pattern.pattern,
          score: similarity * 0.7, // Lower weight for similar matches
          type: 'similar',
          metadata: {
            resultCount: Math.round(pattern.avgResultCount),
            lastUsed: pattern.lastUsed,
            useCount: pattern.frequency,
          },
        });
      }
    });

    // Add query completions
    const completions = generateQueryCompletions(query, searchHistory);
    completions.forEach(completion => {
      if (!suggestions.some(s => s.query === completion)) {
        suggestions.push({
          query: completion,
          score: 0.5,
          type: 'completion',
        });
      }
    });

    // Sort by score and relevance, limit to top 8
    return suggestions
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        // Secondary sort by recency for same scores
        const aTime = a.metadata?.lastUsed?.getTime() || 0;
        const bTime = b.metadata?.lastUsed?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, 8);
  }, [searchHistory, popularQueries, searchPatterns]);

  // Generate search trends analytics
  const generateSearchTrends = useCallback(() => {
    const daily: Record<string, number> = {};
    const weekly: Record<string, number> = {};
    const monthly: Record<string, number> = {};

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    searchHistory.forEach(item => {
      const query = item.query.toLowerCase();
      
      if (item.timestamp >= oneDayAgo) {
        daily[query] = (daily[query] || 0) + 1;
      }
      if (item.timestamp >= oneWeekAgo) {
        weekly[query] = (weekly[query] || 0) + 1;
      }
      if (item.timestamp >= oneMonthAgo) {
        monthly[query] = (monthly[query] || 0) + 1;
      }
    });

    return { daily, weekly, monthly };
  }, [searchHistory]);

  // Update state when dependencies change
  useEffect(() => {
    setHistoryState(prev => ({
      ...prev,
      frequentQueries: searchPatterns,
      searchTrends: generateSearchTrends(),
    }));
  }, [searchPatterns, generateSearchTrends]);

  // Save/load suggestions from localStorage
  useEffect(() => {
    if (!userId) return;

    try {
      const savedSuggestions = localStorage.getItem(`${SUGGESTION_STORAGE_KEY}-${userId}`);
      if (savedSuggestions) {
        const parsed = JSON.parse(savedSuggestions);
        setHistoryState(prev => ({ ...prev, queryCompletions: parsed.completions || [] }));
      }
    } catch (error) {
      console.error('Failed to load search suggestions:', error);
    }
  }, [userId]);

  // Get suggestions for query input
  const getSuggestions = useCallback((partialQuery: string): SearchSuggestion[]  => {
    return generateSuggestions(partialQuery);
  }, [generateSuggestions]);

  // Get frequent search patterns for analytics
  const getFrequentPatterns = useCallback((limit = 10): SearchPattern[]  => {
    return searchPatterns.slice(0, limit);
  }, [searchPatterns]);

  // Get search trends for specified period
  const getTrends = useCallback((period: 'daily' | 'weekly' | 'monthly', limit = 10) => {
    const trends = historyState.searchTrends[period];
    return Object.entries(trends)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }, [historyState.searchTrends]);

  // Get recommended filters based on successful searches
  const getRecommendedFilters = useCallback((): Partial<SearchFilters>[]  => {
    // Analyze successful searches (high result count) to recommend filters
    const successfulSearches = searchHistory.filter(item => item.resultCount > 5);
    const filterRecommendations = new Map<string, number>();

    successfulSearches.forEach(item => {
      // Analyze filter combinations that produced good results
      const filtersKey = JSON.stringify({
        messageTypes: item.filters.messageTypes,
        hasErrors: item.filters.hasErrors,
        sessionId: !!item.filters.sessionId,
        dateRange: !!item.filters.dateRange,
      });
      
      filterRecommendations.set(filtersKey, (filterRecommendations.get(filtersKey) || 0) + 1);
    });

    return Array.from(filterRecommendations.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([filtersKey]) => JSON.parse(filtersKey));
  }, [searchHistory]);

  return {
    // State
    frequentQueries: historyState.frequentQueries,
    searchTrends: historyState.searchTrends,

    // Actions
    getSuggestions,
    getFrequentPatterns,
    getTrends,
    getRecommendedFilters,

    // Analytics
    getTotalSearches: () => searchHistory.length,
    getAverageResults: () => {
      if (searchHistory.length === 0) return 0;
      return searchHistory.reduce((sum, item) => sum + item.resultCount, 0) / searchHistory.length;
    },
    getSuccessRate: () => {
      if (searchHistory.length === 0) return 0;
      const successfulSearches = searchHistory.filter(item => item.resultCount > 0).length;
      return (successfulSearches / searchHistory.length) * 100;
    },
    getMostProductiveTime: () => {
      if (searchHistory.length === 0) return null;
      
      const hourCounts: Record<number, number> = {};
      searchHistory.forEach(item => {
        const hour = item.timestamp.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      
      const mostActiveHour = Object.entries(hourCounts)
        .sort(([, a], [, b]) => b - a)[0];
      
      return mostActiveHour ? {
        hour: parseInt(mostActiveHour[0]),
        count: mostActiveHour[1],
      } : null;
    },
  };
}

// Helper functions
const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

const generateQueryCompletions = (partialQuery: string, history: SearchHistoryItem[]): string[] => {
  const completions = new Set<string>();
  
  history.forEach(item => {
    if (item.query.toLowerCase().startsWith(partialQuery)) {
      completions.add(item.query);
    }
  });
  
  return Array.from(completions).slice(0, 3);
}