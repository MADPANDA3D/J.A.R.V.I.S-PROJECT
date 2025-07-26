import { useState, useEffect, useCallback } from 'react';
import { DateRange } from 'react-day-picker';

export interface SearchFilters {
  query: string;
  dateRange?: DateRange;
  messageTypes: ('user' | 'assistant')[];
  sessionId?: string;
  hasErrors?: boolean;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: SearchFilters;
  timestamp: Date;
  resultCount: number;
}

interface SearchState {
  filters: SearchFilters;
  searchHistory: SearchHistoryItem[];
  currentQuery: string;
  isActive: boolean;
}

const STORAGE_KEY = 'jarvis-chat-search-state';
const HISTORY_KEY = 'jarvis-chat-search-history';
const MAX_HISTORY_ITEMS = 10;

const defaultFilters: SearchFilters = {
  query: '',
  messageTypes: ['user', 'assistant'],
};

const defaultState: SearchState = {
  filters: defaultFilters,
  searchHistory: [],
  currentQuery: '',
  isActive: false,
};

export function useSearchState(userId: string) {
  const [searchState, setSearchState] = useState<SearchState>(defaultState);

  // Load persisted state on mount
  useEffect(() => {
    if (!userId) return;

    try {
      const savedState = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
      const savedHistory = localStorage.getItem(`${HISTORY_KEY}-${userId}`);

      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Parse dates back from JSON
        if (parsed.filters.dateRange) {
          if (parsed.filters.dateRange.from) {
            parsed.filters.dateRange.from = new Date(parsed.filters.dateRange.from);
          }
          if (parsed.filters.dateRange.to) {
            parsed.filters.dateRange.to = new Date(parsed.filters.dateRange.to);
          }
        }
        setSearchState(prev => ({ ...prev, ...parsed }));
      }

      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
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
        setSearchState(prev => ({ ...prev, searchHistory: parsedHistory }));
      }
    } catch (error) {
      console.error('Failed to load search state:', error);
    }
  }, [userId]);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (!userId) return;

    try {
      const stateToSave = {
        filters: searchState.filters,
        currentQuery: searchState.currentQuery,
        isActive: searchState.isActive,
      };
      localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(stateToSave));
      localStorage.setItem(`${HISTORY_KEY}-${userId}`, JSON.stringify(searchState.searchHistory));
    } catch (error) {
      console.error('Failed to save search state:', error);
    }
  }, [userId, searchState]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setSearchState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
    }));
  }, []);

  // Update current query
  const setCurrentQuery = useCallback((query: string) => {
    setSearchState(prev => ({
      ...prev,
      currentQuery: query,
      isActive: query.trim().length > 0,
    }));
  }, []);

  // Add search to history
  const addToHistory = useCallback((query: string, resultCount: number) => {
    if (!query.trim()) return;

    const historyItem: SearchHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query: query.trim(),
      filters: { ...searchState.filters, query: query.trim() },
      timestamp: new Date(),
      resultCount,
    };

    setSearchState(prev => {
      // Remove duplicate queries
      const filteredHistory = prev.searchHistory.filter(
        item => item.query.toLowerCase() !== query.toLowerCase()
      );

      // Add new item at the beginning and limit to MAX_HISTORY_ITEMS
      const newHistory = [historyItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);

      return {
        ...prev,
        searchHistory: newHistory,
      };
    });
  }, [searchState.filters]);

  // Apply filters from history item
  const applyFromHistory = useCallback((historyItem: SearchHistoryItem) => {
    setSearchState(prev => ({
      ...prev,
      filters: historyItem.filters,
      currentQuery: historyItem.query,
      isActive: true,
    }));
  }, []);

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
    }));
  }, []);

  // Remove item from history
  const removeFromHistory = useCallback((itemId: string) => {
    setSearchState(prev => ({
      ...prev,
      searchHistory: prev.searchHistory.filter(item => item.id !== itemId),
    }));
  }, []);

  return {
    // State
    filters: searchState.filters,
    currentQuery: searchState.currentQuery,
    searchHistory: searchState.searchHistory,
    isActive: searchState.isActive,

    // Actions
    updateFilters,
    setCurrentQuery,
    addToHistory,
    applyFromHistory,
    clearSearch,
    clearHistory,
    removeFromHistory,
  };
}