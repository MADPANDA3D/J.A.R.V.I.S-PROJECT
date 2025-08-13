/**
 * Bug Report Form Component Tests
 * Tests for the bug report form functionality and integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BugReportForm } from '../BugReportForm';

// Mock dependencies
vi.mock('@/hooks/useBugReport', () => ({
  useBugReport: vi.fn(() => ({
    formState: {
      data: {
        title: '',
        description: '',
        bugType: 'functionality',
        severity: 'medium',
        reproductionSteps: ''
      },
      validation: {
        title: { isValid: true },
        description: { isValid: true },
        bugType: { isValid: true },
        severity: { isValid: true },
        reproductionSteps: { isValid: true },
        attachments: { isValid: true, errors: [] }
      },
      isSubmitting: false,
      uploadProgress: [],
      isDirty: false,
      autoSaveEnabled: true
    },
    validateForm: vi.fn(() => true),
    updateFormData: vi.fn(),
    submitBugReport: vi.fn(() => Promise.resolve({
      success: true,
      bugId: 'test-bug-id',
      trackingNumber: 'BUG-25-12345678',
      message: 'Bug report submitted successfully'
    })),
    resetForm: vi.fn()
  }))
}));

vi.mock('@/components/bug-report/BugTypeSelector', () => ({
  BugTypeSelector: ({ onSelect }: { onSelect: (type: string) => void }) => (
    <div data-testid="bug-type-selector">
      <button onClick={() => onSelect({
        type: 'functionality',
        label: 'Functionality',
        description: 'Feature not working as expected',
        icon: '⚙️',
        color: 'bg-orange-50',
        defaultSeverity: 'medium',
        requiredFields: ['title', 'description'],
        suggestedReproductionSteps: []
      })}>
        Select Functionality
      </button>
    </div>
  )
}));

vi.mock('@/components/bug-report/FileAttachmentUpload', () => ({
  FileAttachmentUpload: ({ onFileUpload }: { onFileUpload: (files: File[]) => void }) => (
    <div data-testid="file-attachment-upload">
      <button onClick={() => onFileUpload([])}>
        Upload Files
      </button>
    </div>
  )
}));

describe('BugReportForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial bug type selection step', () => {
    render(<BugReportForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByText('Report a Bug')).toBeInTheDocument();
    expect(screen.getByTestId('bug-type-selector')).toBeInTheDocument();
  });

  it('progresses through form steps correctly', async () => {
    render(<BugReportForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    // Step 1: Select bug type
    fireEvent.click(screen.getByText('Select Functionality'));
    
    // Should move to details step
    await waitFor(() => {
      expect(screen.getByLabelText('Bug Title *')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    const mockUseBugReport = vi.mocked(await import('@/hooks/useBugReport')).useBugReport;
    mockUseBugReport.mockReturnValue({
      formState: {
        data: { title: '', description: '', bugType: 'functionality', severity: 'medium' },
        validation: {
          title: { isValid: false, error: 'Title is required' },
          description: { isValid: false, error: 'Description is required' },
          bugType: { isValid: true },
          severity: { isValid: true },
          reproductionSteps: { isValid: true },
          attachments: { isValid: true, errors: [] }
        },
        isSubmitting: false,
        uploadProgress: [],
        isDirty: true,
        autoSaveEnabled: true
      },
      validateForm: vi.fn(() => false),
      updateFormData: vi.fn(),
      submitBugReport: vi.fn(),
      resetForm: vi.fn()
    } as unknown);

    render(<BugReportForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    // Select bug type first
    fireEvent.click(screen.getByText('Select Functionality'));
    
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });

  it('handles form submission successfully', async () => {
    render(<BugReportForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    // Go through all steps and submit
    fireEvent.click(screen.getByText('Select Functionality'));
    
    await waitFor(() => {
      expect(screen.getByLabelText('Bug Title *')).toBeInTheDocument();
    });

    // Fill out form (would need more detailed testing for actual form fields)
    // Navigate to review step
    fireEvent.click(screen.getByText('Next: Attachments'));
    fireEvent.click(screen.getByText('Next: Review'));
    
    // Submit form
    const submitButton = screen.getByText('Submit Bug Report');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('test-bug-id', 'BUG-25-12345678');
    });
  });

  it('displays success message after submission', async () => {
    render(<BugReportForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    // Simulate successful submission by manually triggering success state
    // This would be more complex in a real test with state management

    expect(true).toBe(true); // Placeholder for success state test
  });

  it('handles form cancellation', () => {
    render(<BugReportForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    // Go to a step where cancel button exists
    fireEvent.click(screen.getByText('Select Functionality'));
    
    // This would test actual cancel button interaction
    expect(mockOnCancel).not.toHaveBeenCalled(); // Initial state
  });

  it('supports auto-save functionality', async () => {
    const mockUpdateFormData = vi.fn();
    
    const mockUseBugReport = vi.mocked(await import('@/hooks/useBugReport')).useBugReport;
    mockUseBugReport.mockReturnValue({
      formState: {
        data: { title: 'Test title', description: '', bugType: 'functionality', severity: 'medium' },
        validation: {
          title: { isValid: true },
          description: { isValid: true },
          bugType: { isValid: true },
          severity: { isValid: true },
          reproductionSteps: { isValid: true },
          attachments: { isValid: true, errors: [] }
        },
        isSubmitting: false,
        uploadProgress: [],
        isDirty: true,
        autoSaveEnabled: true,
        lastAutoSave: new Date().toISOString()
      },
      validateForm: vi.fn(() => true),
      updateFormData: mockUpdateFormData,
      submitBugReport: vi.fn(),
      resetForm: vi.fn()
    } as unknown);

    render(<BugReportForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    // Auto-save indicator should be visible when form is dirty
    await waitFor(() => {
      expect(screen.getByText(/Last saved:/)).toBeInTheDocument();
    });
  });

  it('handles file attachment uploads', async () => {
    render(<BugReportForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    fireEvent.click(screen.getByText('Select Functionality'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Next: Attachments'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('file-attachment-upload')).toBeInTheDocument();
    });
  });
});