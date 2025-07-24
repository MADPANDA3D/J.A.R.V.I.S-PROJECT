import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ToolsSelector } from '../ToolsSelector';
import { useTools } from '../../../hooks/useTools';
import { AVAILABLE_TOOLS } from '../../../types/tools';

// Mock the useTools hook
vi.mock('../../../hooks/useTools');
const mockUseTools = vi.mocked(useTools);

// Mock the UI components
vi.mock('../../ui/dropdown-menu', () => ({
  DropdownMenu: ({ children, open, onOpenChange }: any) => (
    <div
      data-testid="dropdown-menu"
      data-open={open}
      onClick={() => onOpenChange?.(!open)}
    >
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: any) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuCheckboxItem: ({ children, checked, onCheckedChange }: any) => (
    <div
      data-testid="dropdown-checkbox-item"
      data-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
    >
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: any) => (
    <div data-testid="dropdown-label">{children}</div>
  ),
  DropdownMenuSeparator: () => <div data-testid="dropdown-separator" />,
}));

vi.mock('../../ui/button', () => ({
  Button: ({ children, onClick, disabled, 'aria-label': ariaLabel }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid="tools-button"
    >
      {children}
    </button>
  ),
}));

vi.mock('../../ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

describe('ToolsSelector', () => {
  const mockToggleTool = vi.fn();
  const mockIsToolSelected = vi.fn();
  const mockGetSelectedToolIds = vi.fn();

  const defaultMockReturn = {
    availableTools: AVAILABLE_TOOLS,
    selectedTools: [
      {
        tool_id: 'file_analysis',
        tool_name: 'File Analysis',
        enabled: true,
        priority: 1,
      },
    ],
    preferences: {
      auto_suggest: true,
      persist_selections: true,
      analytics_enabled: true,
    },
    toggleTool: mockToggleTool,
    updatePreferences: vi.fn(),
    getSelectedToolIds: mockGetSelectedToolIds,
    isToolSelected: mockIsToolSelected,
    resetToDefaults: vi.fn(),
    loading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSelectedToolIds.mockReturnValue(['file_analysis']);
    mockIsToolSelected.mockImplementation(
      (toolId: string) => toolId === 'file_analysis'
    );
    mockUseTools.mockReturnValue(defaultMockReturn);
  });

  describe('rendering', () => {
    it('should render the tools button with correct selected count', () => {
      render(<ToolsSelector />);

      const button = screen.getByTestId('tools-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Select tools (1 selected)');

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('1');
    });

    it('should render compact version correctly', () => {
      mockGetSelectedToolIds.mockReturnValue(['file_analysis', 'web_search']);

      render(<ToolsSelector compact={true} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges[0]).toHaveTextContent('2');
    });

    it('should show loading state', () => {
      mockUseTools.mockReturnValue({
        ...defaultMockReturn,
        loading: true,
      });

      render(<ToolsSelector />);

      const button = screen.getByTestId('tools-button');
      expect(button).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('tool selection', () => {
    it('should toggle tool selection when checkbox is clicked', async () => {
      render(<ToolsSelector />);

      // Open dropdown
      fireEvent.click(screen.getByTestId('dropdown-menu'));

      await waitFor(() => {
        expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      });

      // Find and click a tool checkbox
      const checkboxItems = screen.getAllByTestId('dropdown-checkbox-item');
      const webSearchItem = checkboxItems.find(item =>
        item.textContent?.includes('Web Search')
      );

      expect(webSearchItem).toBeInTheDocument();
      fireEvent.click(webSearchItem!);

      expect(mockToggleTool).toHaveBeenCalledWith('web_search');
    });

    it('should display tools grouped by category', () => {
      render(<ToolsSelector />);

      // Open dropdown
      fireEvent.click(screen.getByTestId('dropdown-menu'));

      // Check that category labels are present
      const labels = screen.getAllByTestId('dropdown-label');
      const categoryLabels = labels.filter(label =>
        ['research', 'analysis', 'technical', 'creative', 'productivity'].some(
          cat => label.textContent?.toLowerCase().includes(cat)
        )
      );

      expect(categoryLabels.length).toBeGreaterThan(0);
    });
  });

  describe('selected tools display', () => {
    it('should show correct selected count in main label', () => {
      mockGetSelectedToolIds.mockReturnValue([
        'file_analysis',
        'web_search',
        'code_review',
      ]);

      render(<ToolsSelector />);

      const button = screen.getByTestId('tools-button');
      expect(button).toHaveAttribute('aria-label', 'Select tools (3 selected)');
    });

    it('should show "No tools selected" message when none are selected', () => {
      mockGetSelectedToolIds.mockReturnValue([]);

      render(<ToolsSelector />);

      // Open dropdown
      fireEvent.click(screen.getByTestId('dropdown-menu'));

      expect(screen.getByText(/No tools selected/)).toBeInTheDocument();
    });
  });

  describe('tool information display', () => {
    it('should display tool names and descriptions', () => {
      render(<ToolsSelector />);

      // Open dropdown
      fireEvent.click(screen.getByTestId('dropdown-menu'));

      // Check that tool information is displayed
      expect(screen.getByText('File Analysis')).toBeInTheDocument();
      expect(
        screen.getByText('Analyze uploaded documents and files')
      ).toBeInTheDocument();
    });

    it('should show helpful message about tool usage', () => {
      render(<ToolsSelector />);

      // Open dropdown
      fireEvent.click(screen.getByTestId('dropdown-menu'));

      expect(
        screen.getByText(/Selected tools will be available to the AI assistant/)
      ).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label for the main button', () => {
      mockGetSelectedToolIds.mockReturnValue(['file_analysis']);

      render(<ToolsSelector />);

      const button = screen.getByTestId('tools-button');
      expect(button).toHaveAttribute('aria-label', 'Select tools (1 selected)');
    });

    it('should update aria-label when selection changes', () => {
      mockGetSelectedToolIds.mockReturnValue(['file_analysis', 'web_search']);

      render(<ToolsSelector />);

      const button = screen.getByTestId('tools-button');
      expect(button).toHaveAttribute('aria-label', 'Select tools (2 selected)');
    });
  });

  describe('error handling', () => {
    it('should handle tools loading error gracefully', () => {
      mockUseTools.mockReturnValue({
        ...defaultMockReturn,
        loading: false,
        error: 'Failed to load tools',
      });

      render(<ToolsSelector />);

      // Should still render the button, but might show some error indication
      expect(screen.getByTestId('tools-button')).toBeInTheDocument();
    });
  });

  describe('dropdown behavior', () => {
    it('should open and close dropdown correctly', () => {
      render(<ToolsSelector />);

      const dropdown = screen.getByTestId('dropdown-menu');

      // Initially closed
      expect(dropdown).toHaveAttribute('data-open', 'false');

      // Click to open
      fireEvent.click(dropdown);
      expect(dropdown).toHaveAttribute('data-open', 'true');
    });
  });
});
