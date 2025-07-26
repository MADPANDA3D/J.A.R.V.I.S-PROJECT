import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, X, Filter, Calendar } from 'lucide-react';
import { DateRange } from 'react-day-picker';
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
} from '../ui/dropdown-menu';

export interface SearchFilters {
  query: string;
  dateRange?: DateRange;
  messageTypes: ('user' | 'assistant')[];
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

interface MessageSearchProps {
  onSearch: (filters: SearchFilters) => Promise<SearchResult[]>;
  onClearSearch: () => void;
  onResultClick: (messageId: string) => void;
  className?: string;
  placeholder?: string;
}

export function MessageSearch({
  onSearch,
  onClearSearch,
  onResultClick,
  className = '',
  placeholder = 'Search messages...',
}: MessageSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    messageTypes: ['user', 'assistant'],
  });

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) count++;
    if (filters.messageTypes.length < 2) count++;
    if (filters.hasErrors) count++;
    return count;
  }, [filters]);

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setShowResults(false);
        onClearSearch();
        return;
      }

      setIsSearching(true);
      try {
        const searchFilters: SearchFilters = {
          ...filters,
          query: searchQuery.trim(),
        };

        const searchResults = await onSearch(searchFilters);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [filters, onSearch, onClearSearch]
  );

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        handleSearch(query);
      } else {
        setResults([]);
        setShowResults(false);
        onClearSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, handleSearch, onClearSearch]);

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    onClearSearch();
  };

  const toggleMessageType = (type: 'user' | 'assistant') => {
    setFilters(prev => ({
      ...prev,
      messageTypes: prev.messageTypes.includes(type)
        ? prev.messageTypes.filter(t => t !== type)
        : [...prev.messageTypes, type],
    }));
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result.messageId);
    setShowResults(false);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2 items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-10"
            disabled={isSearching}
          />
          {query && (
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

        {/* Date Range Picker */}
        <DateRangePicker
          dateRange={filters.dateRange}
          onDateRangeChange={(range) => 
            setFilters(prev => ({ ...prev, dateRange: range }))
          }
          placeholder="Select dates"
          disabled={isSearching}
        />

        {/* Filters Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
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
              onCheckedChange={checked =>
                setFilters(prev => ({ ...prev, hasErrors: checked }))
              }
            >
              Failed Messages Only
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-4 w-4 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-2 border-b bg-muted/50">
                <span className="text-sm text-muted-foreground">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {results.map(result => (
                  <button
                    key={result.messageId}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-3 text-left hover:bg-muted/50 border-b last:border-b-0 focus:bg-muted/50 focus:outline-none"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              result.role === 'user' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {result.role === 'user' ? 'You' : 'AI'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(result.timestamp)}
                          </span>
                        </div>
                        <div
                          className="text-sm line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: result.highlightedContent,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
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
