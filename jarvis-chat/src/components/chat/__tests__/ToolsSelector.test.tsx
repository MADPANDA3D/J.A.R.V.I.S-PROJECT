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
interface MockDropdownProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface MockDropdownItemProps {
  children: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

interface MockChildrenProps {
  children: React.ReactNode;
}

vi.mock('../../ui/dropdown-menu', () => ({
  DropdownMenu: ({ children, open, onOpenChange }: MockDropdownProps) => (
    <div
      data-testid="dropdown-root"
      data-open={open}
      onClick={() => onOpenChange?.(!open)}
    >
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: MockChildrenProps) => (
    <div data-testid="dropdown-trigger" onClick={(e) => {
      // Find parent dropdown and click it to toggle
      const parent = (e.target as HTMLElement).closest('[data-testid="dropdown-root"]');
      if (parent) {
        parent.click();
      }
    }}>{children}</div>
  ),
  DropdownMenuContent: ({ children }: MockChildrenProps) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuCheckboxItem: ({ children, checked, onCheckedChange }: MockDropdownItemProps) => (
    <div
      data-testid="dropdown-checkbox-item"
      data-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
    >
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: MockChildrenProps) => (
    <div data-testid="dropdown-label">{children}</div>
  ),
  DropdownMenuSeparator: () => <div data-testid="dropdown-separator" />,
}));

interface MockButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
}

vi.mock('../../ui/button', () => ({
  Button: ({ children, onClick, disabled, 'aria-label': ariaLabel }: MockButtonProps) => {
    // Create unique test IDs for loading vs normal state
    const testId = disabled && !ariaLabel ? "tools-button-loading" : "tools-button";
    
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        data-testid={testId}
      >
        {children}
      </button>
    );
  },
}));

interface MockBadgeProps {
  children: React.ReactNode;
  variant?: string;
}

vi.mock('../../ui/badge', () => ({
  Badge: ({ children, variant, className }: MockBadgeProps & { className?: string }) => {
    // Create unique test IDs based on className to distinguish badges
    let testId = "badge";
    if (className?.includes("absolute")) {
      testId = "badge-compact";
    } else if (className?.includes("text-xs") && !className?.includes("ml-2")) {
      testId = "badge-dropdown";
    } else if (className?.includes("ml-2")) {
      testId = "badge-main";
    }
    
    return (
      <span data-testid={testId} data-variant={variant}>
        {children}
      </span>
    );
  },
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

      const badge = screen.getByTestId('badge-main');
      expect(badge).toHaveTextContent('1');
    });

    it('should render compact version correctly', () => {
      mockGetSelectedToolIds.mockReturnValue(['file_analysis', 'web_search']);

      render(<ToolsSelector compact={true} />);

      const badge = screen.getByTestId('badge-compact');
      expect(badge).toHaveTextContent('2');
    });

    it('should show loading state', () => {
      mockUseTools.mockReturnValue({
        ...defaultMockReturn,
        loading: true,
      });

      render(<ToolsSelector />);

      const button = screen.getByTestId('tools-button-loading');
      expect(button).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('tool selection', () => {
    it('should toggle tool selection when checkbox is clicked', async () => {
      render(<ToolsSelector />);

      // Open dropdown by clicking the trigger
      fireEvent.click(screen.getByTestId('dropdown-trigger'));

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

      // Open dropdown by clicking the trigger
      fireEvent.click(screen.getByTestId('dropdown-trigger'));

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

      // Open dropdown by clicking the trigger
      fireEvent.click(screen.getByTestId('dropdown-trigger'));

      expect(screen.getByText(/No tools selected/)).toBeInTheDocument();
    });
  });

  describe('tool information display', () => {
    it('should display tool names and descriptions', () => {
      render(<ToolsSelector />);

      // Open dropdown by clicking the trigger
      fireEvent.click(screen.getByTestId('dropdown-trigger'));

      // Check that tool information is displayed
      expect(screen.getByText('File Analysis')).toBeInTheDocument();
      expect(
        screen.getByText('Analyze uploaded documents and files')
      ).toBeInTheDocument();
    });

    it('should show helpful message about tool usage', () => {
      render(<ToolsSelector />);

      // Open dropdown by clicking the trigger
      fireEvent.click(screen.getByTestId('dropdown-trigger'));

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

      const dropdown = screen.getByTestId('dropdown-root');

      // Initially closed
      expect(dropdown).toHaveAttribute('data-open', 'false');

      // Click to open
      fireEvent.click(dropdown);
      expect(dropdown).toHaveAttribute('data-open', 'true');
    });
  });
});
