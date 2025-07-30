/**
 * Bug Report Hook
 * React hook for managing bug report form state, validation, and submission
 */

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { bugReportOperations } from '@/lib/supabase';
import { centralizedLogging } from '@/lib/centralizedLogging';
import { errorTracker } from '@/lib/errorTracking';
import { performanceMetrics } from '@/lib/performanceMetrics';
import type { 
  BugReportFormData, 
  BugReportFormState, 
  BugReportFormValidation,
  BugSubmissionResult,
  BrowserInfo,
  EnhancedErrorContext
} from '@/types/bugReport';

// Validation schema
const bugReportSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  bugType: z.enum(['ui', 'functionality', 'performance', 'security', 'accessibility']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  reproductionSteps: z.string()
    .max(1000, 'Reproduction steps must be less than 1000 characters')
    .optional()
});

const attachmentSchema = z.object({
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  type: z.string().refine(
    (type) {
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'text/plain', 'text/csv', 'application/json',
        'application/pdf'
      ];
      return allowedTypes.includes(type) || type.startsWith('image/');
    },
    'File type not supported'
  )
});

export const useBugReport = (initialData: Partial<BugReportFormData> = {}) {
  const [formState, setFormState] = useState<BugReportFormState>({
    data: {
      title: '',
      description: '',
      bugType: 'functionality',
      severity: 'medium',
      reproductionSteps: '',
      ...initialData
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
  });

  // Collect browser information
  const collectBrowserInfo = useCallback((): BrowserInfo => {
    const nav = navigator;
    const screen = window.screen;
    
    return {
      name: getBrowserName(),
      version: getBrowserVersion(),
      platform: nav.platform,
      isMobile: /Mobi|Android/i.test(nav.userAgent),
      screenResolution: {
        width: screen.width,
        height: screen.height
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      colorDepth: screen.colorDepth,
      language: nav.language,
      languages: Array.from(nav.languages || [nav.language]),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookieEnabled: nav.cookieEnabled,
      javaEnabled: false, // Java is deprecated
      onLine: nav.onLine
    };
  }, []);

  // Collect enhanced error context
  const collectErrorContext = useCallback(async (): Promise<EnhancedErrorContext> => {
    try {
      // Get recent errors from error tracking
      const recentErrors = errorTracker.getRecentErrors(10);
      
      // Get performance metrics (for future use)
      // const currentMetrics = performanceMetrics.getCurrentMetrics();
      
      // Collect Core Web Vitals
      const coreWebVitals = await collectCoreWebVitals();
      
      return {
        recentErrors: recentErrors.map(error => ({
          errorId: error.errorId,
          timestamp: error.timestamp,
          message: error.message,
          stack: error.stack,
          source: error.source,
          line: error.line,
          column: error.column,
          userAgent: error.userAgent,
          url: error.url,
          userId: error.userId,
          sessionId: error.sessionId,
          severity: error.severity,
          category: error.category,
          metadata: error.metadata
        })),
        errorPatterns: [], // Would be populated by advanced error tracking
        performanceMetrics: coreWebVitals,
        userSession: {
          sessionId: errorTracker.getSessionId(),
          startTime: new Date().toISOString(),
          duration: performance.now(),
          pageViews: 1,
          interactions: 0,
          deviceInfo: collectBrowserInfo()
        }
      };
    } catch (error) {
      centralizedLogging.warn(
        'bug-report-hook',
        'system',
        'Failed to collect enhanced error context',
        { error }
      );
      
      return {
        recentErrors: [],
        errorPatterns: [],
        performanceMetrics: {},
        userSession: {
          sessionId: errorTracker.getSessionId(),
          startTime: new Date().toISOString(),
          duration: 0,
          pageViews: 1,
          interactions: 0,
          deviceInfo: collectBrowserInfo()
        }
      };
    }
  }, [collectBrowserInfo]);

  // Validate form data
  const validateForm = useCallback((): boolean => {
    const validation: BugReportFormValidation = {
      title: { isValid: true },
      description: { isValid: true },
      bugType: { isValid: true },
      severity: { isValid: true },
      reproductionSteps: { isValid: true },
      attachments: { isValid: true, errors: [] }
    };

    try {
      // Validate main form data
      bugReportSchema.parse(formState.data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          const field = err.path[0] as keyof BugReportFormValidation;
          if (field in validation) {
            validation[field].isValid = false;
            validation[field].error = err.message;
          }
        });
      }
    }

    // Validate attachments
    if (formState.data.attachments) {
      const attachmentErrors: string[] = [];
      
      formState.data.attachments.forEach((file) => {
        try {
          attachmentSchema.parse(file);
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach(err => {
              attachmentErrors.push(`${file.name}: ${err.message}`);
            });
          }
        }
      });

      if (attachmentErrors.length > 0) {
        validation.attachments.isValid = false;
        validation.attachments.errors = attachmentErrors;
      }
    }

    const isValid = Object.values(validation).every(field => 
      'isValid' in field ? field.isValid : true
    );

    setFormState(prev => ({
      ...prev,
      validation
    }));

    return isValid;
  }, [formState.data]);

  // Update form data
  const updateFormData = useCallback((updates: Partial<BugReportFormData>) {
    setFormState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        ...updates
      },
      isDirty: true
    }));
  }, []);

  // Submit bug report
  const submitBugReport = useCallback(async (
    formData: BugReportFormData
  ): Promise<BugSubmissionResult> => {
    if (!validateForm()) {
      return {
        success: false,
        message: 'Please fix validation errors before submitting'
      };
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Collect technical data
      const browserInfo = collectBrowserInfo();
      const errorContext = await collectErrorContext();
      const monitoringData = performanceMetrics.getCurrentMetrics();

      // Prepare bug report data
      const bugReportData = {
        title: formData.title,
        description: formData.description,
        bugType: formData.bugType,
        severity: formData.severity,
        browserInfo,
        userAgent: navigator.userAgent,
        url: window.location.href,
        reproductionSteps: formData.reproductionSteps,
        errorContext: errorContext.recentErrors,
        monitoringData
      };

      // Submit bug report
      const { data: bugReport, error } = await bugReportOperations.createBugReport(bugReportData);

      if (error) {
        throw new Error(error.message || 'Failed to create bug report');
      }

      if (!bugReport) {
        throw new Error('No bug report data returned');
      }

      // Upload attachments if any
      if (formData.attachments && formData.attachments.length > 0) {
        const attachmentPromises = formData.attachments.map(async (file) => {
          try {
            setFormState(prev => ({
              ...prev,
              uploadProgress: prev.uploadProgress.map(p => 
                p.filename === file.name 
                  ? { ...p, status: 'uploading', progress: 0 }
                  : p
              )
            }));

            const result = await bugReportOperations.uploadBugAttachment({
              bugReportId: bugReport.id,
              file
            });

            if (result.error) {
              throw new Error(result.error.message);
            }

            setFormState(prev => ({
              ...prev,
              uploadProgress: prev.uploadProgress.map(p => 
                p.filename === file.name 
                  ? { ...p, status: 'completed', progress: 100 }
                  : p
              )
            }));

            return result.data;
          } catch (error) {
            setFormState(prev => ({
              ...prev,
              uploadProgress: prev.uploadProgress.map(p => 
                p.filename === file.name 
                  ? { ...p, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
                  : p
              )
            }));
            throw error;
          }
        });

        // Wait for all attachments to upload
        await Promise.all(attachmentPromises);
      }

      // Extract tracking number from monitoring data
      const trackingNumber = bugReport.monitoring_data?.tracking_number || `BUG-${bugReport.id.slice(-8)}`;

      // Log successful submission
      centralizedLogging.info(
        'bug-report-hook',
        'system',
        'Bug report submitted successfully',
        {
          bugId: bugReport.id,
          trackingNumber,
          bugType: formData.bugType,
          severity: formData.severity,
          hasAttachments: formData.attachments && formData.attachments.length > 0
        }
      );

      return {
        success: true,
        bugId: bugReport.id,
        trackingNumber,
        message: 'Bug report submitted successfully'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      centralizedLogging.error(
        'bug-report-hook',
        'system',
        'Failed to submit bug report',
        { error: errorMessage, formData }
      );

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [validateForm, collectBrowserInfo, collectErrorContext]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormState({
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
    });
  }, []);

  return {
    formState,
    validateForm,
    updateFormData,
    submitBugReport,
    resetForm
  };
};

// Helper functions
function getBrowserName(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  
  return 'Unknown';
}

function getBrowserVersion(): string {
  const userAgent = navigator.userAgent;
  const browserName = getBrowserName();
  
  const versionRegex = new RegExp(`${browserName}\\/(\\d+\\.\\d+)`);
  const match = userAgent.match(versionRegex);
  
  return match ? match[1] : 'Unknown';
}

interface CoreWebVitals {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

async function collectCoreWebVitals(): Promise<CoreWebVitals> {
  return new Promise((resolve) {
    const vitals: CoreWebVitals = {};
    
    // Use Performance Observer if available
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) {
          const entries = list.getEntries();
          entries.forEach((entry: PerformanceEventTiming) => {
            vitals.fid = entry.processingStart - entry.startTime;
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          vitals.cls = clsValue;
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        // Resolve after a short delay to collect metrics
        setTimeout(() => {
          resolve(vitals);
        }, 1000);
      } catch {
        resolve(vitals);
      }
    } else {
      resolve(vitals);
    }
  });
}