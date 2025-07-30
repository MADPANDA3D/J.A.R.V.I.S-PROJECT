import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, X, Filter, MessageSquare, History, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { DateRangePicker } from '../ui/date-range-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { 
  chatService, 
  ConversationSession, 
  ConversationSessionGroup, 
  SessionSearchFilters, 
  GroupedSearchResponse,
  SearchResult
} from '@/lib/chatService';
import { useSearchState, SearchFilters } from '@/hooks/useSearchState';
import { ConversationSessionGroup as SessionGroupComponent } from './ConversationSessionGroup';
import { SessionNavigation } from './SessionNavigation';

interface SearchResponse {
  results: SearchResult[];
  total: number;
  hasMore: boolean;
}

interface MessageSearchProps {
  onSearch: (filters: SearchFilters, options?: { limit?: number; offset?: number }) => Promise<SearchResponse>;
  onClearSearch: () => void;
  onResultClick: (messageId: string) => void;
  userId: string;
  className?: string;
  placeholder?: string;
  // Session grouping support
  enableSessionGrouping?: boolean;
  onSessionGroupedSearch?: (filters: SessionSearchFilters, options?: { 
    sessionLimit?: number; 
    sessionOffset?: number; 
    messagesPerSession?: number; 
  }) => Promise<GroupedSearchResponse>;
  onSessionSelect?: (sessionId: string) => void;
}

export function MessageSearch({
  onSearch,
  onClearSearch,
  onResultClick,
  userId,
  className = '',
  placeholder = 'Search messages...',
  enableSessionGrouping = false,
  onSessionGroupedSearch,
  onSessionSelect,
}: MessageSearchProps) {
  const {
    filters,
    currentQuery,
    searchHistory,
    updateFilters,
    setCurrentQuery,
    addToHistory,
    applyFromHistory,
    clearSearch: clearSearchState,
    clearHistory,
    removeFromHistory,
  } = useSearchState(userId);

  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [conversationSessions, setConversationSessions] = useState<ConversationSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Session grouping state
  const [sessionGroups, setSessionGroups] = useState<ConversationSessionGroup[]>([]);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [sessionOrder, setSessionOrder] = useState<'chronological' | 'relevance' | 'updated'>('updated');
  const [totalSessions, setTotalSessions] = useState(0);
  const [hasMoreSessions, setHasMoreSessions] = useState(false);
  const [isLoadingMoreSessions, setIsLoadingMoreSessions] = useState(false);

  const activeFiltersCount = useMemo(() {
    let count = 0;
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) count++;
    if (filters.messageTypes.length < 2) count++;
    if (filters.sessionId) count++;
    if (filters.hasErrors) count++;
    return count;
  }, [filters]);

  const handleSearch = useCallback(
    async (searchQuery: string, loadMore = false) {
      if (!searchQuery.trim()) {
        setResults([]);
        setSessionGroups([]);
        setShowResults(false);
        setSearchTotal(0);
        setHasMoreResults(false);
        setTotalSessions(0);
        setHasMoreSessions(false);
        onClearSearch();
        return;
      }

      // Determine if we're doing session-grouped search
      const useSessionGrouping = enableSessionGrouping && onSessionGroupedSearch;
      
      if (useSessionGrouping) {
        await handleSessionGroupedSearch(searchQuery, loadMore);
      } else {
        await handleRegularSearch(searchQuery, loadMore);
      }
    },
    [enableSessionGrouping, onSessionGroupedSearch, handleRegularSearch, handleSessionGroupedSearch, onClearSearch]
  );

  const handleRegularSearch = useCallback(
    async (searchQuery: string, loadMore = false) {
      const isLoadingMoreResults = loadMore && results.length > 0;
      const searchStartTime = performance.now();
      
      if (isLoadingMoreResults) {
        setIsLoadingMore(true);
      } else {
        setIsSearching(true);
      }

      try {
        const searchFilters: SearchFilters = {
          ...filters,
          query: searchQuery.trim(),
        };

        const offset = isLoadingMoreResults ? results.length : 0;
        const searchResponse = await onSearch(searchFilters, { limit: 25, offset });
        
        if (isLoadingMoreResults) {
          setResults(prev => [...prev, ...searchResponse.results]);
        } else {
          setResults(searchResponse.results);
        }
        
        setSearchTotal(searchResponse.total);
        setHasMoreResults(searchResponse.hasMore);
        setShowResults(true);

        // Add to search history with execution time if this is a new search
        if (!isLoadingMoreResults && searchResponse.results.length > 0) {
          const executionTime = performance.now() - searchStartTime;
          addToHistory(searchQuery, searchResponse.total, executionTime, 'regular');
        }
      } catch (error) {
        console.error('Search failed:', error);
        if (!isLoadingMoreResults) {
          setResults([]);
          setSearchTotal(0);
          setHasMoreResults(false);
        }
      } finally {
        if (isLoadingMoreResults) {
          setIsLoadingMore(false);
        } else {
          setIsSearching(false);
        }
      }
    },
    [filters, onSearch, results.length, addToHistory]
  );

  const handleSessionGroupedSearch = useCallback(
    async (searchQuery: string, loadMore = false) {
      if (!onSessionGroupedSearch) return;

      const isLoadingMoreSessions = loadMore && sessionGroups.length > 0;
      const searchStartTime = performance.now();
      
      if (isLoadingMoreSessions) {
        setIsLoadingMoreSessions(true);
      } else {
        setIsSearching(true);
      }

      try {
        const sessionFilters: SessionSearchFilters = {
          ...filters,
          query: searchQuery.trim(),
          groupBySession: true,
          sessionOrder,
        };

        const sessionOffset = isLoadingMoreSessions ? sessionGroups.length : 0;
        const sessionResponse = await onSessionGroupedSearch(sessionFilters, {
          sessionLimit: 10,
          sessionOffset,
          messagesPerSession: 5,
        });
        
        if (isLoadingMoreSessions) {
          setSessionGroups(prev => [...prev, ...sessionResponse.sessionGroups]);
        } else {
          setSessionGroups(sessionResponse.sessionGroups);
        }
        
        setTotalSessions(sessionResponse.totalSessions);
        setSearchTotal(sessionResponse.totalMessages);
        setHasMoreSessions(sessionResponse.hasMoreSessions);
        setShowResults(true);

        // Add to search history with execution time if this is a new search
        if (!isLoadingMoreSessions && sessionResponse.sessionGroups.length > 0) {
          const executionTime = performance.now() - searchStartTime;
          addToHistory(searchQuery, sessionResponse.totalMessages, executionTime, 'session-grouped');
        }
      } catch (error) {
        console.error('Session grouped search failed:', error);
        if (!isLoadingMoreSessions) {
          setSessionGroups([]);
          setTotalSessions(0);
          setSearchTotal(0);
          setHasMoreSessions(false);
        }
      } finally {
        if (isLoadingMoreSessions) {
          setIsLoadingMoreSessions(false);
        } else {
          setIsSearching(false);
        }
      }
    },
    [filters, onSessionGroupedSearch, sessionGroups.length, sessionOrder, addToHistory]
  );

  const handleQueryChange = useCallback((value: string) {
    setCurrentQuery(value);
  }, [setCurrentQuery]);

  // Load conversation sessions
  useEffect(() {
    if (!userId) return;

    const loadSessions = async () {
      setLoadingSessions(true);
      try {
        const sessions = await chatService.getConversationSessions(userId);
        setConversationSessions(sessions);
      } catch (error) {
        console.error('Failed to load conversation sessions:', error);
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessions();
  }, [userId]);

  // Debounced search effect
  useEffect(() {
    const timeoutId = setTimeout(() {
      if (currentQuery) {
        handleSearch(currentQuery);
      } else {
        setResults([]);
        setShowResults(false);
        setSearchTotal(0);
        setHasMoreResults(false);
        onClearSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentQuery, handleSearch, onClearSearch]);

  const handleLoadMore = useCallback(() {
    if (currentQuery && hasMoreResults && !isLoadingMore) {
      handleSearch(currentQuery, true);
    }
  }, [currentQuery, hasMoreResults, isLoadingMore, handleSearch]);

  // Session-specific handlers
  const handleToggleSessionExpanded = useCallback((sessionId: string) {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  }, []);

  const handleSessionSelect = useCallback((sessionId: string) {
    setActiveSessionId(sessionId);
    onSessionSelect?.(sessionId);
  }, [onSessionSelect]);

  const handleSessionOrderChange = useCallback((order: 'chronological' | 'relevance' | 'updated') {
    setSessionOrder(order);
    // Re-trigger search with new order
    if (currentQuery.trim()) {
      handleSearch(currentQuery, false);
    }
  }, [currentQuery, handleSearch]);

  const handleLoadMoreSessions = useCallback(() {
    if (currentQuery.trim() && hasMoreSessions && !isLoadingMoreSessions) {
      handleSearch(currentQuery, true);
    }
  }, [currentQuery, hasMoreSessions, isLoadingMoreSessions, handleSearch]);

  const handleExpandAllSessions = useCallback(() {
    setExpandedSessions(new Set(sessionGroups.map(sg => sg.session.id)));
  }, [sessionGroups]);

  const handleCollapseAllSessions = useCallback(() {
    setExpandedSessions(new Set());
  }, []);

  const handleLoadMoreInSession = useCallback(async (sessionId: string) {
    // This would require additional API support to load more messages within a specific session
    console.log('Load more messages in session:', sessionId);
    // Implementation would depend on additional backend support
  }, []);

  const handleClearSearch = () {
    clearSearchState();
    setResults([]);
    setSessionGroups([]);
    setShowResults(false);
    setSearchTotal(0);
    setHasMoreResults(false);
    setTotalSessions(0);
    setHasMoreSessions(false);
    setExpandedSessions(new Set());
    setActiveSessionId(undefined);
    onClearSearch();
    
    // Announce to screen readers
    setTimeout(() {
      const message = 'Search cleared';
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }, 100);
  };

  const toggleMessageType = (type: 'user' | 'assistant') {
    const newMessageTypes = filters.messageTypes.includes(type)
      ? filters.messageTypes.filter(t => t !== type)
      : [...filters.messageTypes, type];
    
    updateFilters({ messageTypes: newMessageTypes });
  };

  const handleResultClick = (result: SearchResult) {
    onResultClick(result.messageId);
    setShowResults(false);
  };

  const formatTimestamp = (timestamp: Date) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={currentQuery}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-10"
            disabled={isSearching}
            aria-label="Search messages"
            role="searchbox"
            aria-expanded={showResults}
            aria-haspopup="listbox"
          />
          {currentQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          
          {/* Date Range Picker */}
          <DateRangePicker
            dateRange={filters.dateRange}
            onDateRangeChange={(range) => updateFilters({ dateRange: range })}
            placeholder="Select dates"
            disabled={isSearching}
            className="w-full sm:w-auto"
          />

          {/* Conversation Session Selector */}
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isSearching || loadingSessions}
              className="w-full sm:w-auto justify-start"
            >
              <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {filters.sessionId 
                  ? conversationSessions.find(s => s.id === filters.sessionId)?.title?.slice(0, 20) + '...'
                  : 'All Conversations'
                }
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            <DropdownMenuLabel>Conversation Sessions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => updateFilters({ sessionId: undefined })}
              className={!filters.sessionId ? 'bg-muted/50' : ''}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              All Conversations
            </DropdownMenuItem>
            
            {loadingSessions ? (
              <DropdownMenuItem disabled>
                Loading sessions...
              </DropdownMenuItem>
            ) : conversationSessions.length > 0 ? (
              conversationSessions.map(session => (
                <DropdownMenuItem
                  key={session.id}
                  onClick={() => updateFilters({ sessionId: session.id })}
                  className={filters.sessionId === session.id ? 'bg-muted/50' : ''}
                >
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm font-medium truncate w-full">
                      {session.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {session.message_count} messages • {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(session.updated_at)}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>
                No conversations found
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

          {/* Additional Filters Dropdown */}
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="relative w-full sm:w-auto justify-start"
            >
              <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 min-w-[1.25rem] text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>Search Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Message Types
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={filters.messageTypes.includes('user')}
              onCheckedChange={() => toggleMessageType('user')}
            >
              My Messages
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.messageTypes.includes('assistant')}
              onCheckedChange={() => toggleMessageType('assistant')}
            >
              AI Responses
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            <DropdownMenuCheckboxItem
              checked={filters.hasErrors || false}
              onCheckedChange={checked => updateFilters({ hasErrors: checked })}
            >
              Failed Messages Only
            </DropdownMenuCheckboxItem>

            {/* Search History Section */}
            {searchHistory.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="flex items-center justify-between">
                  <div className="flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    Recent Searches
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      clearHistory();
                    }}
                    className="h-6 w-6 p-0"
                    title="Clear search history"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </DropdownMenuLabel>
                {searchHistory.slice(0, 5).map(historyItem => (
                  <DropdownMenuItem
                    key={historyItem.id}
                    onClick={() => applyFromHistory(historyItem)}
                    className="flex flex-col items-start"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium truncate flex-1">
                        {historyItem.query}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromHistory(historyItem.id);
                        }}
                        className="h-5 w-5 p-0 ml-2 opacity-50 hover:opacity-100"
                        title="Remove from history"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {historyItem.resultCount} result{historyItem.resultCount !== 1 ? 's' : ''} • {' '}
                      {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(historyItem.timestamp)}
                    </span>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        </div>
      </div>

      {/* Search Results - Session Grouped View */}
      {showResults && enableSessionGrouping && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
          {/* Session Navigation */}
          <SessionNavigation
            sessions={sessionGroups.map(sg => sg.session)}
            activeSessionId={activeSessionId}
            sessionOrder={sessionOrder}
            totalSessions={totalSessions}
            totalMessages={searchTotal}
            hasMoreSessions={hasMoreSessions}
            isLoading={isSearching || isLoadingMoreSessions}
            onSessionSelect={handleSessionSelect}
            onOrderChange={handleSessionOrderChange}
            onLoadMoreSessions={handleLoadMoreSessions}
            onExpandAll={handleExpandAllSessions}
            onCollapseAll={handleCollapseAllSessions}
          />

          {/* Session Groups */}
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-4 w-4 animate-spin mx-auto mb-2" />
              Searching conversations...
            </div>
          ) : sessionGroups.length > 0 ? (
            <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
              {sessionGroups.map(sessionGroup => (
                <SessionGroupComponent
                  key={sessionGroup.session.id}
                  sessionGroup={sessionGroup}
                  isExpanded={expandedSessions.has(sessionGroup.session.id)}
                  onToggleExpanded={handleToggleSessionExpanded}
                  onSessionSelect={handleSessionSelect}
                  onMessageClick={onResultClick}
                  onLoadMore={handleLoadMoreInSession}
                  isActive={activeSessionId === sessionGroup.session.id}
                  searchTerms={currentQuery.trim().split(/\s+/).filter(Boolean)}
                />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No conversations found</p>
              <p className="text-xs mt-1">
                Try different keywords or adjust filters
              </p>
            </div>
          )}
        </div>
      )}

      {/* Search Results - Regular View */}
      {showResults && !enableSessionGrouping && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-md shadow-lg max-h-80 md:max-h-96 overflow-y-auto z-50"
          role="listbox"
          aria-label="Search results"
        >
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-4 w-4 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-2 border-b bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {results.length} of {searchTotal} result{searchTotal !== 1 ? 's' : ''}
                  </span>
                  {hasMoreResults && (
                    <span className="text-xs text-muted-foreground">
                      {searchTotal - results.length} more available
                    </span>
                  )}
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {results.map(result => (
                  <button
                    key={result.messageId}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-3 text-left hover:bg-muted/50 border-b last:border-b-0 focus:bg-muted/50 focus:outline-none transition-colors"
                    role="option"
                    aria-label={`Go to ${result.role === 'user' ? 'your' : 'AI'} message: ${result.content.slice(0, 50)}...`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <Badge
                            variant={
                              result.role === 'user' ? 'default' : 'secondary'
                            }
                            className="text-xs w-fit"
                          >
                            {result.role === 'user' ? 'You' : 'AI'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(result.timestamp)}
                          </span>
                        </div>
                        <div
                          className="text-sm line-clamp-3 sm:line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: result.highlightedContent,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
                
                {/* Load More Button */}
                {hasMoreResults && (
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="w-full"
                    >
                      {isLoadingMore ? (
                        <>
                          <Search className="h-4 w-4 animate-spin mr-2" />
                          Loading more...
                        </>
                      ) : (
                        `Load ${Math.min(25, searchTotal - results.length)} more results`
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No messages found</p>
              <p className="text-xs mt-1">
                Try different keywords or adjust filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
