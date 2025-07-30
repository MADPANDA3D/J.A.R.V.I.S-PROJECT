/**
 * Bug Report Form Component
 * User-friendly bug submission form with validation and file upload support
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { BugTypeSelector } from './BugTypeSelector';
import { FileAttachmentUpload } from './FileAttachmentUpload';
import { useBugReport } from '@/hooks/useBugReport';
import type { 
  BugReportFormData, 
  BugTypeConfig,
  SeverityConfig
} from '@/types/bugReport';

interface BugReportFormProps {
  onSubmit?: (bugId: string, trackingNumber: string) => void;
  onCancel?: () => void;
  initialData?: Partial<BugReportFormData>;
  className?: string;
}

// Bug type configurations
const BUG_TYPE_CONFIGS: BugTypeConfig[] = [
  {
    type: 'ui',
    label: 'User Interface',
    description: 'Visual layout, styling, or display issues',
    icon: '🎨',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    defaultSeverity: 'medium',
    requiredFields: ['title', 'description'],
    suggestedReproductionSteps: [
      'Navigate to the affected page',
      'Describe what you see vs. what you expected',
      'Include browser and screen resolution'
    ]
  },
  {
    type: 'functionality',
    label: 'Functionality',
    description: 'Feature not working as expected',
    icon: '⚙️',
    color: 'bg-orange-50 border-orange-200 text-orange-800',
    defaultSeverity: 'medium',
    requiredFields: ['title', 'description', 'reproductionSteps'],
    suggestedReproductionSteps: [
      'Describe the exact steps to reproduce',
      'What did you expect to happen?',
      'What actually happened instead?'
    ]
  },
  {
    type: 'performance',
    label: 'Performance',
    description: 'Slow loading, timeouts, or resource issues',
    icon: '⚡',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    defaultSeverity: 'medium',
    requiredFields: ['title', 'description'],
    suggestedReproductionSteps: [
      'Describe when the slowness occurs',
      'Estimate how long it takes',
      'Include network conditions if relevant'
    ]
  },
  {
    type: 'security',
    label: 'Security',
    description: 'Security vulnerabilities or privacy concerns',
    icon: '🔒',
    color: 'bg-red-50 border-red-200 text-red-800',
    defaultSeverity: 'high',
    requiredFields: ['title', 'description'],
    suggestedReproductionSteps: [
      'Describe the security concern',
      'Do NOT include sensitive data in this form',
      'Contact security team directly for critical issues'
    ]
  },
  {
    type: 'accessibility',
    label: 'Accessibility',
    description: 'Issues with screen readers, keyboard navigation, or other accessibility features',
    icon: '♿',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    defaultSeverity: 'medium',
    requiredFields: ['title', 'description'],
    suggestedReproductionSteps: [
      'Describe the accessibility barrier',
      'Include assistive technology used',
      'Describe alternative ways you tried'
    ]
  }
];

const SEVERITY_CONFIGS: SeverityConfig[] = [
  {
    severity: 'low',
    label: 'Low',
    description: 'Minor issue that doesn\'t significantly impact usage',
    color: 'text-green-600',
    icon: '🟢',
    slaHours: 72,
    autoEscalation: false
  },
  {
    severity: 'medium',
    label: 'Medium',
    description: 'Moderate issue that affects some functionality',
    color: 'text-yellow-600',
    icon: '🟡',
    slaHours: 24,
    autoEscalation: true
  },
  {
    severity: 'high',
    label: 'High',
    description: 'Significant issue that impacts core functionality',
    color: 'text-orange-600',
    icon: '🟠',
    slaHours: 8,
    autoEscalation: true
  },
  {
    severity: 'critical',
    label: 'Critical',
    description: 'Severe issue that makes the application unusable',
    color: 'text-red-600',
    icon: '🔴',
    slaHours: 2,
    autoEscalation: true
  }
];

export const BugReportForm: React.FC<BugReportFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  className = ''
}) => {
  const {
    formState,
    submitBugReport,
    validateForm,
    updateFormData,
    resetForm
  } = useBugReport(initialData);

  const [currentStep, setCurrentStep] = useState<'type' | 'details' | 'attachments' | 'review'>('type');
  const [selectedBugType, setSelectedBugType] = useState<BugTypeConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<{ bugId: string; trackingNumber: string } | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (formState.autoSaveEnabled && formState.isDirty) {
      const autoSaveTimer = setTimeout(() => {
        localStorage.setItem('bugReportDraft', JSON.stringify(formState.data));
      }, 2000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [formState.data, formState.autoSaveEnabled, formState.isDirty]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('bugReportDraft');
    if (draft && !initialData.title) {
      try {
        const draftData = JSON.parse(draft);
        updateFormData(draftData);
      } catch (error) => {
        console.warn('Failed to load bug report draft:', error);
      }
    }
  }, []);

  const handleBugTypeSelect = useCallback((typeConfig: BugTypeConfig) => {
    setSelectedBugType(typeConfig);
    updateFormData({
      bugType: typeConfig.type,
      severity: typeConfig.defaultSeverity
    });
    setCurrentStep('details');
  }, [updateFormData]);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitBugReport(formState.data);
      
      if (result.success && result.bugId && result.trackingNumber) {
        setSubmitSuccess({
          bugId: result.bugId,
          trackingNumber: result.trackingNumber
        });
        
        // Clear draft
        localStorage.removeItem('bugReportDraft');
        
        // Call success callback
        onSubmit?.(result.bugId, result.trackingNumber);
      } else {
        setSubmitError(result.message || 'Failed to submit bug report');
      }
    } catch (error) => {
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [formState.data, validateForm, submitBugReport, onSubmit]);

  const handleCancel = useCallback(() => {
    if (formState.isDirty) {
      const confirmCancel = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmCancel) return;
    }
    
    resetForm();
    localStorage.removeItem('bugReportDraft');
    onCancel?.();
  }, [formState.isDirty, resetForm, onCancel]);


  // Success state
  if (submitSuccess) {
    return (
      <Card className={`bug-report-form success ${className}`}>
        <div className="p-6 text-center">
          <div className="mb-4 text-6xl">✅</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Bug Report Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Your bug report has been submitted with tracking number:
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <code className="text-blue-800 font-mono text-lg">
              {submitSuccess.trackingNumber}
            </code>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            You'll receive email updates about the status of your bug report.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                setSubmitSuccess(null);
                resetForm();
                setCurrentStep('type');
              }}
              variant="outline"
            >
              Submit Another Report
            </Button>
            <Button onClick={onCancel}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`bug-report-form ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Report a Bug
          </h2>
          <p className="text-gray-600 text-sm">
            Help us improve JARVIS Chat by reporting bugs and issues you encounter.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm">
            {[
              { key: 'type', label: 'Bug Type' },
              { key: 'details', label: 'Details' },
              { key: 'attachments', label: 'Attachments' },
              { key: 'review', label: 'Review' }
            ].map((step, index) => (
              <div
                key={step.key}
                className={`flex items-center ${index < 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep === step.key
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : currentStep === 'review' || 
                        (currentStep === 'attachments' && (step.key === 'type' || step.key === 'details')) ||
                        (currentStep === 'details' && step.key === 'type')
                      ? 'bg-green-100 border-green-500 text-green-600'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}
                >
                  {currentStep === 'review' || 
                   (currentStep === 'attachments' && (step.key === 'type' || step.key === 'details')) ||
                   (currentStep === 'details' && step.key === 'type') ? '✓' : index + 1}
                </div>
                <span className="ml-2 text-xs text-gray-600">{step.label}</span>
                {index < 3 && (
                  <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleFormSubmit}>
          {/* Step 1: Bug Type Selection */}
          {currentStep === 'type' && (
            <BugTypeSelector
              bugTypes={BUG_TYPE_CONFIGS}
              selectedType={selectedBugType}
              onSelect={handleBugTypeSelect}
            />
          )}

          {/* Step 2: Bug Details */}
          {currentStep === 'details' && selectedBugType && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{selectedBugType.icon}</span>
                  <h3 className="font-medium text-blue-900">
                    {selectedBugType.label} Bug Report
                  </h3>
                </div>
                <p className="text-sm text-blue-700">
                  {selectedBugType.description}
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bug Title *
                </label>
                <Input
                  type="text"
                  value={formState.data.title || ''}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  placeholder="Brief description of the issue"
                  className={formState.validation.title.isValid ? '' : 'border-red-500'}
                  required
                />
                {!formState.validation.title.isValid && (
                  <p className="text-red-600 text-xs mt-1">
                    {formState.validation.title.error}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formState.data.description || ''}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Detailed description of the bug..."
                  rows={4}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !formState.validation.description.isValid ? 'border-red-500' : ''
                  }`}
                  required
                />
                {!formState.validation.description.isValid && (
                  <p className="text-red-600 text-xs mt-1">
                    {formState.validation.description.error}
                  </p>
                )}
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SEVERITY_CONFIGS.map((severity) => (
                    <button
                      key={severity.severity}
                      type="button"
                      onClick={() => updateFormData({ severity: severity.severity })}
                      className={`p-3 border-2 rounded-lg text-left transition-colors ${
                        formState.data.severity === severity.severity
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{severity.icon}</span>
                        <span className={`font-medium ${severity.color}`}>
                          {severity.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {severity.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reproduction Steps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Steps to Reproduce
                  {selectedBugType.requiredFields.includes('reproductionSteps') && ' *'}
                </label>
                <textarea
                  value={formState.data.reproductionSteps || ''}
                  onChange={(e) => updateFormData({ reproductionSteps: e.target.value })}
                  placeholder={selectedBugType.suggestedReproductionSteps.join('\n')}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !formState.validation.reproductionSteps.isValid ? 'border-red-500' : ''
                  }`}
                  required={selectedBugType.requiredFields.includes('reproductionSteps')}
                />
                {!formState.validation.reproductionSteps.isValid && (
                  <p className="text-red-600 text-xs mt-1">
                    {formState.validation.reproductionSteps.error}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Include specific steps someone else can follow to reproduce the issue
                </p>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('type')}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep('attachments')}
                  disabled={!formState.validation.title.isValid || !formState.validation.description.isValid}
                >
                  Next: Attachments
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: File Attachments */}
          {currentStep === 'attachments' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  File Attachments (Optional)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload screenshots, error logs, or other files that help explain the issue.
                </p>
              </div>

              <FileAttachmentUpload
                onFileUpload={(files) => updateFormData({ attachments: files })}
                maxFiles={5}
                maxSizePerFile={10 * 1024 * 1024} // 10MB
                acceptedTypes={['image/*', '.txt', '.log', '.json']}
                uploadProgress={formState.uploadProgress}
              />

              {!formState.validation.attachments.isValid && (
                <Alert className="border-red-200 bg-red-50">
                  <div>
                    <p className="text-red-800 font-medium">File Upload Issues:</p>
                    <ul className="text-red-700 text-sm mt-1 list-disc list-inside">
                      {formState.validation.attachments.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </Alert>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('details')}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep('review')}
                >
                  Next: Review
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review and Submit */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Review Your Bug Report
                </h3>
              </div>

              {/* Review Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-2">{selectedBugType?.label}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Severity:</span>
                  <span className="ml-2 capitalize">{formState.data.severity}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Title:</span>
                  <span className="ml-2">{formState.data.title}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="mt-1 text-gray-600">{formState.data.description}</p>
                </div>
                {formState.data.reproductionSteps && (
                  <div>
                    <span className="font-medium text-gray-700">Reproduction Steps:</span>
                    <p className="mt-1 text-gray-600 whitespace-pre-line">
                      {formState.data.reproductionSteps}
                    </p>
                  </div>
                )}
                {formState.data.attachments && formState.data.attachments.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Attachments:</span>
                    <ul className="mt-1 text-gray-600 list-disc list-inside">
                      {formState.data.attachments.map((file, index) => (
                        <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Submit Error */}
              {submitError && (
                <Alert className="border-red-200 bg-red-50">
                  <p className="text-red-800">{submitError}</p>
                </Alert>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('attachments')}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !validateForm()}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Bug Report'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Auto-save indicator */}
        {formState.isDirty && formState.autoSaveEnabled && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              {formState.lastAutoSave 
                ? `Last saved: ${new Date(formState.lastAutoSave).toLocaleTimeString()}`
                : 'Changes are being auto-saved...'
              }
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};