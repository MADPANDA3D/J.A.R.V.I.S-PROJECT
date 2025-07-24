import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  MessageSearch,
  type SearchFilters,
  type SearchResult,
} from '../MessageSearch';

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
    mockOnSearch.mockResolvedValue(mockSearchResults);
  });

  const renderComponent = (
    props: Partial<React.ComponentProps<typeof MessageSearch>> = {}
  ) => {
    return render(
      <MessageSearch
        onSearch={mockOnSearch}
        onClearSearch={mockOnClearSearch}
        onResultClick={mockOnResultClick}
        {...props}
      />
    );
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
      fireEvent.change(input, { target: { value: 'hello' } });

      // Should not call immediately
      expect(mockOnSearch).not.toHaveBeenCalled();

      // Should call after debounce delay
      await waitFor(
        () => {
          expect(mockOnSearch).toHaveBeenCalledWith({
            query: 'hello',
            messageTypes: ['user', 'assistant'],
          });
        },
        { timeout: 500 }
      );
    });

    it('should display search results', async () => {
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      fireEvent.change(input, { target: { value: 'hello' } });

      await waitFor(() => {
        expect(screen.getByText('2 results found')).toBeInTheDocument();
      });

      expect(screen.getByText('Hello world')).toBeInTheDocument();
      expect(screen.getByText('AI response about hello')).toBeInTheDocument();
    });

    it('should clear search when input is emptied', async () => {
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');

      // Type something first
      fireEvent.change(input, { target: { value: 'hello' } });
      await waitFor(() => expect(mockOnSearch).toHaveBeenCalled());

      // Clear the input
      fireEvent.change(input, { target: { value: '' } });

      await waitFor(() => {
        expect(mockOnClearSearch).toHaveBeenCalled();
      });
    });

    it('should handle search errors gracefully', async () => {
      mockOnSearch.mockRejectedValue(new Error('Search failed'));
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      fireEvent.change(input, { target: { value: 'hello' } });

      await waitFor(() => {
        expect(screen.getByText('No messages found')).toBeInTheDocument();
      });
    });
  });

  describe('filters', () => {
    it('should show active filter count', async () => {
      renderComponent();

      const filtersButton = screen.getByText('Filters');
      fireEvent.click(filtersButton);

      // Toggle off user messages
      const userMessagesCheckbox = screen.getByText('My Messages');
      fireEvent.click(userMessagesCheckbox);

      // Should show filter count
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // Filter count badge
      });
    });

    it('should filter by message type', async () => {
      renderComponent();

      // Open filters
      const filtersButton = screen.getByText('Filters');
      fireEvent.click(filtersButton);

      // Disable user messages
      const userMessagesCheckbox = screen.getByText('My Messages');
      fireEvent.click(userMessagesCheckbox);

      // Search
      const input = screen.getByPlaceholderText('Search messages...');
      fireEvent.change(input, { target: { value: 'hello' } });

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith({
          query: 'hello',
          messageTypes: ['assistant'], // Only assistant messages
        });
      });
    });

    it('should filter by error messages', async () => {
      renderComponent();

      // Open filters
      const filtersButton = screen.getByText('Filters');
      fireEvent.click(filtersButton);

      // Enable failed messages filter
      const failedMessagesCheckbox = screen.getByText('Failed Messages Only');
      fireEvent.click(failedMessagesCheckbox);

      // Search
      const input = screen.getByPlaceholderText('Search messages...');
      fireEvent.change(input, { target: { value: 'hello' } });

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith({
          query: 'hello',
          messageTypes: ['user', 'assistant'],
          hasErrors: true,
        });
      });
    });
  });

  describe('result interaction', () => {
    it('should call onResultClick when result is clicked', async () => {
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      fireEvent.change(input, { target: { value: 'hello' } });

      await waitFor(() => {
        expect(screen.getByText('Hello world')).toBeInTheDocument();
      });

      const firstResult = screen.getByText('Hello world').closest('button');
      expect(firstResult).toBeInTheDocument();

      fireEvent.click(firstResult!);
      expect(mockOnResultClick).toHaveBeenCalledWith('1');
    });

    it('should hide results after clicking a result', async () => {
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      fireEvent.change(input, { target: { value: 'hello' } });

      await waitFor(() => {
        expect(screen.getByText('Hello world')).toBeInTheDocument();
      });

      const firstResult = screen.getByText('Hello world').closest('button');
      fireEvent.click(firstResult!);

      await waitFor(() => {
        expect(screen.queryByText('Hello world')).not.toBeInTheDocument();
      });
    });
  });

  describe('clear functionality', () => {
    it('should show clear button when text is entered', () => {
      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      fireEvent.change(input, { target: { value: 'hello' } });

      expect(
        screen.getByRole('button', { name: /clear/i })
      ).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', () => {
      renderComponent();

      const input = screen.getByPlaceholderText(
        'Search messages...'
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'hello' } });

      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);

      expect(input.value).toBe('');
      expect(mockOnClearSearch).toHaveBeenCalled();
    });
  });

  describe('loading states', () => {
    it('should show loading state during search', async () => {
      // Make search take time
      let resolveSearch: (value: SearchResult[]) => void;
      const searchPromise = new Promise<SearchResult[]>(resolve => {
        resolveSearch = resolve;
      });
      mockOnSearch.mockReturnValue(searchPromise);

      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      fireEvent.change(input, { target: { value: 'hello' } });

      await waitFor(() => {
        expect(screen.getByText('Searching...')).toBeInTheDocument();
      });

      // Resolve the search
      resolveSearch!(mockSearchResults);

      await waitFor(() => {
        expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
      });
    });

    it('should disable input during search', async () => {
      let resolveSearch: (value: SearchResult[]) => void;
      const searchPromise = new Promise<SearchResult[]>(resolve => {
        resolveSearch = resolve;
      });
      mockOnSearch.mockReturnValue(searchPromise);

      renderComponent();

      const input = screen.getByPlaceholderText('Search messages...');
      fireEvent.change(input, { target: { value: 'hello' } });

      await waitFor(() => {
        expect(input).toBeDisabled();
      });

      resolveSearch!(mockSearchResults);

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
      fireEvent.change(input, { target: { value: 'hello' } });

      await waitFor(() => {
        expect(screen.getByText('Hello world')).toBeInTheDocument();
      });

      const firstResult = screen.getByText('Hello world').closest('button');
      expect(firstResult).toHaveAttribute('tabindex', '0');
    });
  });
});
