import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  MessageSearch,
  type SearchResult,
} from '../MessageSearch';

// Create mock functions that will be shared across hook calls
const mockUpdateFilters = vi.fn();
const mockSetCurrentQuery = vi.fn();
const mockAddToHistory = vi.fn();
const mockApplyFromHistory = vi.fn();
const mockClearSearch = vi.fn();
const mockClearHistory = vi.fn();
const mockRemoveFromHistory = vi.fn();

// Mock the useSearchState hook
vi.mock('@/hooks/useSearchState', () => ({
  useSearchState: () => ({
    filters: {
      query: '',
      messageTypes: ['user', 'assistant'],
    },
    currentQuery: '',
    searchHistory: [],
    updateFilters: mockUpdateFilters,
    setCurrentQuery: mockSetCurrentQuery,
    addToHistory: mockAddToHistory,
    applyFromHistory: mockApplyFromHistory,
    clearSearch: mockClearSearch,
    clearHistory: mockClearHistory,
    removeFromHistory: mockRemoveFromHistory,
  }),
}));

// Mock the chatService
vi.mock('@/lib/chatService', () => ({
  chatService: {
    getConversationSessions: vi.fn().mockResolvedValue([]),
  },
}));

describe('MessageSearch', () => {
  const mockOnSearch = vi.fn();
  const mockOnClearSearch = vi.fn();
  const mockOnResultClick = vi.fn();

  const mockSearchResults: SearchResult[] = [
    {
      messageId: '1',
      content: 'Hello world',
      role: 'user',
      timestamp: new Date('2023-01-01'),
      highlightedContent: '<mark>Hello</mark> world',
      matchScore: 0.9,
    },
    {
      messageId: '2',
      content: 'AI response about hello',
      role: 'assistant',
      timestamp: new Date('2023-01-02'),
      highlightedContent: 'AI response about <mark>hello</mark>',
      matchScore: 0.8,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSearch.mockResolvedValue({
      results: mockSearchResults,
      total: mockSearchResults.length,
      hasMore: false,
    });
    
    // Reset hook mocks
    mockUpdateFilters.mockClear();
    mockSetCurrentQuery.mockClear();
    mockAddToHistory.mockClear();
    mockApplyFromHistory.mockClear();
    mockClearSearch.mockClear();
    mockClearHistory.mockClear();
    mockRemoveFromHistory.mockClear();
  });

  const renderComponent = (
    props: Partial<React.ComponentProps<typeof MessageSearch>> = {}
  ) => {
    let result: ReturnType<typeof render>;
    act(() => {
      result = render(
        <MessageSearch
          onSearch={mockOnSearch}
          onClearSearch={mockOnClearSearch}
          onResultClick={mockOnResultClick}
          userId="test-user-id"
          {...props}
        />
      );
    });
    return result!;
  };

  describe('basic rendering', () => {
    it('should render search input with placeholder', () => {
      renderComponent();

      expect(
        screen.getByPlaceholderText('Search messages...')
      ).toBeInTheDocument();
    });

    it('should render custom placeholder', () => {
      renderComponent({ placeholder: 'Custom placeholder' });

      expect(
        screen.getByPlaceholderText('Custom placeholder')
      ).toBeInTheDocument();
    });

    it('should render filters button', () => {
      renderComponent();

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should trigger search after typing with debounce', async () => {
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });

      // Should not call immediately
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Should call after debounce delay
      await waitFor(
        () => {
          expect(mockOnSearch).toHaveBeenCalledWith(
            {
              query: 'hello',
              messageTypes: ['user', 'assistant'],
            },
            { limit: 25, offset: 0 }
          );
        },
        { timeout: 500 }
      );
    });

    it('should display search results', async () => {
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });

      await waitFor(() => {
        expect(screen.getByText('2 of 2 results')).toBeInTheDocument();
      });

      expect(screen.getByText('Hello world')).toBeInTheDocument();
      expect(screen.getByText('AI response about hello')).toBeInTheDocument();
    });

    it('should clear search when input is emptied', async () => {
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');

      // Type something first
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });
      await waitFor(() => expect(mockOnSearch).toHaveBeenCalled());

      // Clear the input
      await act(async () => {
        fireEvent.change(input, { target: { value: '' } });
      });

      await waitFor(() => {
        expect(mockOnClearSearch).toHaveBeenCalled();
      });
    });

    it('should handle search errors gracefully', async () => {
      mockOnSearch.mockRejectedValue(new Error('Search failed'));
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });

      await waitFor(() => {
        expect(screen.getByText('No messages found')).toBeInTheDocument();
      });
    });
  });

  describe('filters', () => {
    it('should show active filter count', async () => {
      renderComponent();

      const filtersButton = screen.getByText('Filters');
      
      await act(async () => {
        fireEvent.click(filtersButton);
      });

      // Toggle off user messages
      const userMessagesCheckbox = screen.getByText('My Messages');
      
      await act(async () => {
        fireEvent.click(userMessagesCheckbox);
      });

      // Should show filter count
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // Filter count badge
      });
    });

    it('should filter by message type', async () => {
      renderComponent();

      // Open filters
      const filtersButton = screen.getByText('Filters');
      
      await act(async () => {
        fireEvent.click(filtersButton);
      });

      // Disable user messages
      const userMessagesCheckbox = screen.getByText('My Messages');
      
      await act(async () => {
        fireEvent.click(userMessagesCheckbox);
      });

      // Search
      const input = screen.getByPlaceholderText('Search messages...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          {
            query: 'hello',
            messageTypes: ['assistant'], // Only assistant messages
          },
          { limit: 25, offset: 0 }
        );
      });
    });

    it('should filter by error messages', async () => {
      renderComponent();

      // Open filters
      const filtersButton = screen.getByText('Filters');
      
      await act(async () => {
        fireEvent.click(filtersButton);
      });

      // Enable failed messages filter
      const failedMessagesCheckbox = screen.getByText('Failed Messages Only');
      
      await act(async () => {
        fireEvent.click(failedMessagesCheckbox);
      });

      // Search
      const input = screen.getByPlaceholderText('Search messages...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          {
            query: 'hello',
            messageTypes: ['user', 'assistant'],
            hasErrors: true,
          },
          { limit: 25, offset: 0 }
        );
      });
    });
  });

  describe('result interaction', () => {
    it('should call onResultClick when result is clicked', async () => {
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Hello world')).toBeInTheDocument();
      });

      const firstResult = screen.getByText('Hello world').closest('button');
      expect(firstResult).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(firstResult!);
      });
      
      expect(mockOnResultClick).toHaveBeenCalledWith('1');
    });

    it('should hide results after clicking a result', async () => {
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Hello world')).toBeInTheDocument();
      });

      const firstResult = screen.getByText('Hello world').closest('button');
      
      await act(async () => {
        fireEvent.click(firstResult!);
      });

      await waitFor(() => {
        expect(screen.queryByText('Hello world')).not.toBeInTheDocument();
      });
    });
  });

  describe('clear functionality', () => {
    it('should show clear button when text is entered', async () => {
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });

      expect(
        screen.getByRole('button', { name: /clear/i })
      ).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', async () => {
      renderComponent();

      const input = screen.getByPlaceholderText(
        'Search messages...'
      ) as HTMLInputElement;
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });

      const clearButton = screen.getByRole('button', { name: /clear/i });
      
      await act(async () => {
        fireEvent.click(clearButton);
      });

      expect(input.value).toBe('');
      expect(mockOnClearSearch).toHaveBeenCalled();
    });
  });

  describe('loading states', () => {
    it('should show loading state during search', async () => {
      // Make search take time
      let resolveSearch: (value: { results: SearchResult[]; total: number; hasMore: boolean }) => void;
      const searchPromise = new Promise<{ results: SearchResult[]; total: number; hasMore: boolean }>(resolve => {
        resolveSearch = resolve;
      });
      mockOnSearch.mockReturnValue(searchPromise);

      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Searching...')).toBeInTheDocument();
      });

      // Resolve the search
      await act(async () => {
        resolveSearch!({
          results: mockSearchResults,
          total: mockSearchResults.length,
          hasMore: false,
        });
      });

      await waitFor(() => {
        expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
      });
    });

    it('should disable input during search', async () => {
      let resolveSearch: (value: { results: SearchResult[]; total: number; hasMore: boolean }) => void;
      const searchPromise = new Promise<{ results: SearchResult[]; total: number; hasMore: boolean }>(resolve => {
        resolveSearch = resolve;
      });
      mockOnSearch.mockReturnValue(searchPromise);

      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });

      await waitFor(() => {
        expect(input).toBeDisabled();
      });

      await act(async () => {
        resolveSearch!({
          results: mockSearchResults,
          total: mockSearchResults.length,
          hasMore: false,
        });
      });

      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      expect(input).toHaveAttribute('type', 'text');

      const filtersButton = screen.getByText('Filters');
      expect(filtersButton).toBeInTheDocument();
    });

    it('should support keyboard navigation in results', async () => {
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Hello world')).toBeInTheDocument();
      });

      const firstResult = screen.getByText('Hello world').closest('button');
      expect(firstResult).toHaveAttribute('tabindex', '0');
    });
  });

  describe('pagination', () => {
    it('should show pagination info and load more button when hasMore is true', async () => {
      mockOnSearch.mockResolvedValue({
        results: mockSearchResults,
        total: 50,
        hasMore: true,
      });

      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });

      await waitFor(() => {
        expect(screen.getByText('2 of 50 results')).toBeInTheDocument();
        expect(screen.getByText('48 more available')).toBeInTheDocument();
        expect(screen.getByText(/Load \d+ more results/)).toBeInTheDocument();
      });
    });

    it('should hide load more button when hasMore is false', async () => {
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello' } });
      });

      await waitFor(() => {
        expect(screen.getByText('2 of 2 results')).toBeInTheDocument();
        expect(screen.queryByText(/Load \d+ more results/)).not.toBeInTheDocument();
      });
    });
  });

  describe('date range filtering', () => {
    it('should render date range picker', () => {
      renderComponent();
      expect(screen.getByText('Select dates')).toBeInTheDocument();
    });
  });

  describe('session filtering', () => {
    it('should render conversation session selector', () => {
      renderComponent();
      expect(screen.getByText('All Conversations')).toBeInTheDocument();
    });
  });
});
