import { useState, useEffect, useCallback } from 'react';
import type { DateRange } from 'react-day-picker';

export interface SearchFilters {
  query: string;
  dateRange?: DateRange;
  messageTypes: ('user' | 'assistant')[];
  sessionId?: string;
  hasErrors?: boolean;
  // Advanced filters for future compatibility
  sortBy?: 'relevance' | 'date' | 'conversation';
  includeSystemMessages?: boolean;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: SearchFilters;
  timestamp: Date;
  resultCount: number;
  executionTime?: number;
  searchMode?: 'regular' | 'session-grouped';
}

export interface SearchPreferences {
  autoSaveSearch: boolean;
  defaultSearchMode: 'regular' | 'session-grouped';
  maxHistoryItems: number;
  enableSearchSuggestions: boolean;
  sessionExpansionState: Record<string, boolean>;
}

export interface FavoriteFilter {
  id: string;
  name: string;
  filters: SearchFilters;
  timestamp: Date;
  useCount: number;
}

interface PersistentSearchState {
  version: string;
  filters: SearchFilters;
  searchHistory: SearchHistoryItem[];
  favoriteFilters: FavoriteFilter[];
  preferences: SearchPreferences;
  currentQuery: string;
  isActive: boolean;
  // Analytics data
  searchCount: number;
  totalResultsFound: number;
  averageExecutionTime: number;
  popularQueries: string[];
  lastUsed: Date;
}

// State migration and versioning
const CURRENT_VERSION = '1.2.0';
const STORAGE_KEY = 'jarvis-chat-search-state';
// const HISTORY_KEY = 'jarvis-chat-search-history'; // Reserved for future use
// const FAVORITES_KEY = 'jarvis-chat-favorite-filters'; // Reserved for future use  
// const PREFERENCES_KEY = 'jarvis-chat-search-preferences'; // Reserved for future use
const MAX_HISTORY_ITEMS = 20;

const defaultFilters: SearchFilters = {
  query: '',
  messageTypes: ['user', 'assistant'],
};

const defaultPreferences: SearchPreferences = {
  autoSaveSearch: true,
  defaultSearchMode: 'regular',
  maxHistoryItems: MAX_HISTORY_ITEMS,
  enableSearchSuggestions: true,
  sessionExpansionState: {},
};

const defaultState: PersistentSearchState = {
  version: CURRENT_VERSION,
  filters: defaultFilters,
  searchHistory: [],
  favoriteFilters: [],
  preferences: defaultPreferences,
  currentQuery: '',
  isActive: false,
  searchCount: 0,
  totalResultsFound: 0,
  averageExecutionTime: 0,
  popularQueries: [],
  lastUsed: new Date(),
};

// State migration functions
function migrateState(savedState: Record<string, unknown>): PersistentSearchState {
  const version = savedState.version as string || '1.0.0';
  
  // Migration from version 1.0.0 to 1.2.0
  if (version === '1.0.0' || !version) {
    return {
      ...defaultState,
      filters: savedState.filters as SearchFilters || defaultFilters,
      searchHistory: (savedState.searchHistory as SearchHistoryItem[]) || [],
      currentQuery: savedState.currentQuery as string || '',
      isActive: savedState.isActive as boolean || false,
      version: CURRENT_VERSION,
    };
  }
  
  // Future migrations would go here
  if (version === '1.1.0') {
    // Add any 1.1.0 -> 1.2.0 migration logic
    return {
      ...defaultState,
      ...savedState,
      version: CURRENT_VERSION,
    } as PersistentSearchState;
  }
  
  // Already current version
  return savedState as PersistentSearchState;
}

function parseStoredDates(state: PersistentSearchState): PersistentSearchState {
  // Parse date strings back to Date objects
  const parsedState = { ...state };
  
  // Parse filter dates
  if (parsedState.filters.dateRange) {
    if (parsedState.filters.dateRange.from) {
      parsedState.filters.dateRange.from = new Date(parsedState.filters.dateRange.from);
    }
    if (parsedState.filters.dateRange.to) {
      parsedState.filters.dateRange.to = new Date(parsedState.filters.dateRange.to);
    }
  }
  
  // Parse search history dates
  parsedState.searchHistory = parsedState.searchHistory.map(item => ({
    ...item,
    timestamp: new Date(item.timestamp),
    filters: {
      ...item.filters,
      dateRange: item.filters.dateRange ? {
        from: item.filters.dateRange.from ? new Date(item.filters.dateRange.from) : undefined,
        to: item.filters.dateRange.to ? new Date(item.filters.dateRange.to) : undefined,
      } : undefined,
    },
  }));
  
  // Parse favorite filters dates
  parsedState.favoriteFilters = parsedState.favoriteFilters.map(favorite => ({
    ...favorite,
    timestamp: new Date(favorite.timestamp),
    filters: {
      ...favorite.filters,
      dateRange: favorite.filters.dateRange ? {
        from: favorite.filters.dateRange.from ? new Date(favorite.filters.dateRange.from) : undefined,
        to: favorite.filters.dateRange.to ? new Date(favorite.filters.dateRange.to) : undefined,
      } : undefined,
    },
  }));
  
  // Parse lastUsed date
  if (parsedState.lastUsed) {
    parsedState.lastUsed = new Date(parsedState.lastUsed);
  }
  
  return parsedState;
}

export function useSearchState(userId: string) {
  const [searchState, setSearchState] = useState<PersistentSearchState>(defaultState);

  // Load persisted state on mount with migration support
  useEffect(() => {
    if (!userId) return;

    try {
      const savedState = localStorage.getItem(`${STORAGE_KEY}-${userId}`);

      if (savedState) {
        const parsed = JSON.parse(savedState);
        
        // Migrate state if necessary
        const migratedState = migrateState(parsed);
        
        // Parse dates back from JSON
        const stateWithDates = parseStoredDates(migratedState);
        
        setSearchState(stateWithDates);
      }
    } catch {
      console.error('Failed to load search state:', error);
      // If loading fails, try to preserve any existing state but reset to default
      setSearchState(defaultState);
    }
  }, [userId]);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (!userId) return;

    try {
      // Update last used timestamp
      const stateToSave = {
        ...searchState,
        lastUsed: new Date(),
      };
      
      localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(stateToSave));
    } catch {
      console.error('Failed to save search state:', error);
      
      // Try to clear corrupted data and reset to default
      try {
        localStorage.removeItem(`${STORAGE_KEY}-${userId}`);
        setSearchState(defaultState);
      } catch (clearError) {
        console.error('Failed to clear corrupted search state:', clearError);
      }
    }
  }, [userId, searchState]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) {
    setSearchState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
    }));
  }, []);

  // Update current query
  const setCurrentQuery = useCallback((query: string) {
    setSearchState(prev => ({
      ...prev,
      currentQuery: query,
      isActive: query.trim().length > 0,
    }));
  }, []);

  // Update preferences
  const updatePreferences = useCallback((newPreferences: Partial<SearchPreferences>) {
    setSearchState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...newPreferences },
    }));
  }, []);

  // Update session expansion state
  const updateSessionExpansion = useCallback((sessionId: string, isExpanded: boolean) {
    setSearchState(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        sessionExpansionState: {
          ...prev.preferences.sessionExpansionState,
          [sessionId]: isExpanded,
        },
      },
    }));
  }, []);

  // Add search to history with analytics
  const addToHistory = useCallback((query: string, resultCount: number, executionTime?: number, searchMode?: 'regular' | 'session-grouped') {
    if (!query.trim() || !searchState.preferences.autoSaveSearch) return;

    const historyItem: SearchHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query: query.trim(),
      filters: { ...searchState.filters, query: query.trim() },
      timestamp: new Date(),
      resultCount,
      executionTime,
      searchMode,
    };

    setSearchState(prev => {
      // Remove duplicate queries
      const filteredHistory = prev.searchHistory.filter(
        item => item.query.toLowerCase() !== query.toLowerCase()
      );

      // Add new item at the beginning and limit to user's preference
      const maxItems = prev.preferences.maxHistoryItems;
      const newHistory = [historyItem, ...filteredHistory].slice(0, maxItems);

      // Update analytics
      const newSearchCount = prev.searchCount + 1;
      const newTotalResults = prev.totalResultsFound + resultCount;
      const newAvgExecutionTime = executionTime 
        ? (prev.averageExecutionTime * (newSearchCount - 1) + executionTime) / newSearchCount
        : prev.averageExecutionTime;

      // Update popular queries
      const trimmedQuery = query.trim().toLowerCase();
      const popularQueries = [...prev.popularQueries];
      const existingIndex = popularQueries.indexOf(trimmedQuery);
      
      if (existingIndex !== -1) {
        // Move to front if already exists
        popularQueries.splice(existingIndex, 1);
      }
      popularQueries.unshift(trimmedQuery);
      
      // Keep only top 10 popular queries
      const updatedPopularQueries = popularQueries.slice(0, 10);

      return {
        ...prev,
        searchHistory: newHistory,
        searchCount: newSearchCount,
        totalResultsFound: newTotalResults,
        averageExecutionTime: newAvgExecutionTime,
        popularQueries: updatedPopularQueries,
      };
    });
  }, [searchState.filters, searchState.preferences.autoSaveSearch]);

  // Apply filters from history item
  const applyFromHistory = useCallback((historyItem: SearchHistoryItem) {
    setSearchState(prev => ({
      ...prev,
      filters: historyItem.filters,
      currentQuery: historyItem.query,
      isActive: true,
    }));
  }, []);

  // Favorite filters management
  const saveFavoriteFilter = useCallback((name: string, filters: SearchFilters) {
    const favoriteFilter: FavoriteFilter = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      filters: { ...filters },
      timestamp: new Date(),
      useCount: 0,
    };

    setSearchState(prev => {
      // Remove existing filter with same name
      const filteredFavorites = prev.favoriteFilters.filter(
        fav => fav.name.toLowerCase() !== name.toLowerCase()
      );

      return {
        ...prev,
        favoriteFilters: [favoriteFilter, ...filteredFavorites].slice(0, 10), // Max 10 favorites
      };
    });
  }, []);

  const applyFavoriteFilter = useCallback((favoriteId: string) {
    setSearchState(prev => {
      const favorite = prev.favoriteFilters.find(fav => fav.id === favoriteId);
      if (!favorite) return prev;

      // Update use count
      const updatedFavorites = prev.favoriteFilters.map(fav =>
        fav.id === favoriteId
          ? { ...fav, useCount: fav.useCount + 1 }
          : fav
      );

      return {
        ...prev,
        filters: favorite.filters,
        currentQuery: favorite.filters.query,
        isActive: favorite.filters.query.trim().length > 0,
        favoriteFilters: updatedFavorites,
      };
    });
  }, []);

  const removeFavoriteFilter = useCallback((favoriteId: string) {
    setSearchState(prev => ({
      ...prev,
      favoriteFilters: prev.favoriteFilters.filter(fav => fav.id !== favoriteId),
    }));
  }, []);

  // Get search suggestions based on history and popular queries
  const getSearchSuggestions = useCallback((partialQuery: string): string[] => {
    if (!searchState.preferences.enableSearchSuggestions || !partialQuery.trim()) {
      return [];
    }

    const query = partialQuery.toLowerCase();
    const suggestions = new Set<string>();

    // Add matching queries from history
    searchState.searchHistory.forEach(item => {
      if (item.query.toLowerCase().includes(query)) {
        suggestions.add(item.query);
      }
    });

    // Add matching popular queries
    searchState.popularQueries.forEach(popularQuery => {
      if (popularQuery.includes(query)) {
        suggestions.add(popularQuery);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }, [searchState.searchHistory, searchState.popularQueries, searchState.preferences.enableSearchSuggestions]);

  // Clear search state
  const clearSearch = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      filters: { ...defaultFilters },
      currentQuery: '',
      isActive: false,
    }));
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      searchHistory: [],
      popularQueries: [],
    }));
  }, []);

  // Remove item from history
  const removeFromHistory = useCallback((itemId: string) {
    setSearchState(prev => ({
      ...prev,
      searchHistory: prev.searchHistory.filter(item => item.id !== itemId),
    }));
  }, []);

  // Reset all analytics
  const resetAnalytics = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      searchCount: 0,
      totalResultsFound: 0,
      averageExecutionTime: 0,
      popularQueries: [],
    }));
  }, []);

  return {
    // Core State
    filters: searchState.filters,
    currentQuery: searchState.currentQuery,
    searchHistory: searchState.searchHistory,
    isActive: searchState.isActive,

    // New Features
    favoriteFilters: searchState.favoriteFilters,
    preferences: searchState.preferences,
    
    // Analytics
    searchCount: searchState.searchCount,
    totalResultsFound: searchState.totalResultsFound,
    averageExecutionTime: searchState.averageExecutionTime,
    popularQueries: searchState.popularQueries,
    lastUsed: searchState.lastUsed,

    // Core Actions
    updateFilters,
    setCurrentQuery,
    addToHistory,
    applyFromHistory,
    clearSearch,
    clearHistory,
    removeFromHistory,

    // New Actions
    updatePreferences,
    updateSessionExpansion,
    saveFavoriteFilter,
    applyFavoriteFilter,
    removeFavoriteFilter,
    getSearchSuggestions,
    resetAnalytics,

    // Utility functions
    getSessionExpansionState: (sessionId: string) => searchState.preferences.sessionExpansionState[sessionId] || false,
    getMostUsedFilters: () => searchState.favoriteFilters.sort((a, b) => b.useCount - a.useCount).slice(0, 5),
    getRecentQueries: (limit = 5) => searchState.searchHistory.slice(0, limit).map(item => item.query),
  };
}