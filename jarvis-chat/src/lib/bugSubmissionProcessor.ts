/**
 * Bug Submission Processing Service
 * Handles bug report submission, validation, deduplication, and file processing
 */

import { centralizedLogging } from './centralizedLogging';
import { bugReportOperations } from './supabase';
import { errorTracker } from './errorTracking';
import { performanceMetrics } from './performanceMetrics';
import type { 
  BugReportData, 
  BugSubmissionResult,
  FileUploadProgress,
  AttachmentUploadResult
} from '@/types/bugReport';

export interface BugSubmissionConfig {
  maxFileSize: number; // bytes
  maxFiles: number;
  allowedFileTypes: string[];
  virusScanEnabled: boolean;
  deduplicationEnabled: boolean;
  deduplicationTimeWindow: number; // minutes
  autoNotificationEnabled: boolean;
  emailNotificationEnabled: boolean;
}

class BugSubmissionProcessor {
  private static instance: BugSubmissionProcessor;
  private config: BugSubmissionConfig;
  private submissionQueue: Map<string, BugReportData> = new Map();
  private processingSubmissions: Set<string> = new Set();

  private constructor() {
    this.config = this.loadConfiguration();
  }

  static getInstance(): BugSubmissionProcessor {
    if (!BugSubmissionProcessor.instance) {
      BugSubmissionProcessor.instance = new BugSubmissionProcessor();
    }
    return BugSubmissionProcessor.instance;
  }

  private loadConfiguration(): BugSubmissionConfig {
    return {
      maxFileSize: parseInt(import.meta.env.VITE_BUG_REPORT_MAX_FILE_SIZE || '10485760'), // 10MB
      maxFiles: parseInt(import.meta.env.VITE_BUG_REPORT_MAX_FILES || '5'),
      allowedFileTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'text/plain', 'text/csv', 'application/json', 'application/pdf',
        'text/log', 'application/x-log'
      ],
      virusScanEnabled: import.meta.env.VITE_BUG_REPORT_VIRUS_SCAN === 'true',
      deduplicationEnabled: import.meta.env.VITE_BUG_REPORT_DEDUPLICATION === 'true',
      deduplicationTimeWindow: parseInt(import.meta.env.VITE_BUG_REPORT_DEDUP_WINDOW || '5'), // 5 minutes
      autoNotificationEnabled: import.meta.env.VITE_BUG_REPORT_AUTO_NOTIFY === 'true',
      emailNotificationEnabled: import.meta.env.VITE_BUG_REPORT_EMAIL_NOTIFY === 'true'
    };
  }

  /**
   * Process and submit a bug report
   */
  async processBugSubmission(bugData: BugReportData): Promise<BugSubmissionResult> {
    const submissionId = this.generateSubmissionId();
    
    try {
      centralizedLogging.info(
        'bug-submission-processor',
        'system',
        'Starting bug submission processing',
        { 
          submissionId,
          bugType: bugData.bugType,
          severity: bugData.severity,
          hasAttachments: bugData.attachments ? bugData.attachments.length > 0 : false
        }
      );

      // Add to processing queue
      this.submissionQueue.set(submissionId, bugData);
      this.processingSubmissions.add(submissionId);

      // Step 1: Validate submission
      const validationResult = await this.validateSubmission(bugData);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Step 2: Check for duplicates
      if (this.config.deduplicationEnabled) {
        const duplicateCheck = await this.checkForDuplicates(bugData);
        if (duplicateCheck.isDuplicate) {
          return {
            success: false,
            message: `Similar bug report already exists: ${duplicateCheck.existingBugId}`,
            errors: ['Duplicate submission detected']
          };
        }
      }

      // Step 3: Sanitize and enhance data
      const sanitizedData = await this.sanitizeAndEnhanceData(bugData);

      // Step 4: Submit to database
      const submissionResult = await this.submitToDatabase(sanitizedData, submissionId);
      
      if (!submissionResult.success || !submissionResult.bugId) {
        throw new Error(submissionResult.message || 'Database submission failed');
      }

      // Step 5: Process file attachments if any
      if (sanitizedData.attachments && sanitizedData.attachments.length > 0) {
        const attachmentResults = await this.processAttachments(
          submissionResult.bugId,
          sanitizedData.attachments
        );
        
        // Log attachment processing results
        const failedAttachments = attachmentResults.filter(r => !r.success);
        if (failedAttachments.length > 0) {
          centralizedLogging.warn(
            'bug-submission-processor',
            'system',
            'Some attachments failed to upload',
            { 
              submissionId,
              bugId: submissionResult.bugId,
              failedCount: failedAttachments.length,
              errors: failedAttachments.map(r => r.error)
            }
          );
        }
      }

      // Step 6: Send notifications if enabled
      if (this.config.autoNotificationEnabled) {
        await this.sendNotifications(submissionResult.bugId, sanitizedData);
      }

      // Step 7: Update metrics
      this.updateSubmissionMetrics('success', {
        bugType: sanitizedData.bugType,
        severity: sanitizedData.severity,
        processingTime: performance.now()
      });

      // Clean up
      this.submissionQueue.delete(submissionId);
      this.processingSubmissions.delete(submissionId);

      centralizedLogging.info(
        'bug-submission-processor',
        'system',
        'Bug submission processed successfully',
        { 
          submissionId,
          bugId: submissionResult.bugId,
          trackingNumber: submissionResult.trackingNumber
        }
      );

      return {
        success: true,
        bugId: submissionResult.bugId,
        trackingNumber: submissionResult.trackingNumber,
        message: 'Bug report submitted successfully'
      };

    } catch {
      // Clean up
      this.submissionQueue.delete(submissionId);
      this.processingSubmissions.delete(submissionId);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      centralizedLogging.error(
        'bug-submission-processor',
        'system',
        'Bug submission processing failed',
        { 
          submissionId,
          error: errorMessage,
          bugData: this.sanitizeBugDataForLogging(bugData)
        }
      );

      this.updateSubmissionMetrics('error', {
        error: errorMessage,
        bugType: bugData.bugType,
        severity: bugData.severity
      });

      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Validate bug submission data
   */
  private async validateSubmission(bugData: BugReportData): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Validate required fields
    if (!bugData.title || bugData.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long');
    }

    if (!bugData.description || bugData.description.trim().length < 20) {
      errors.push('Description must be at least 20 characters long');
    }

    if (!['ui', 'functionality', 'performance', 'security', 'accessibility'].includes(bugData.bugType)) {
      errors.push('Invalid bug type');
    }

    if (!['low', 'medium', 'high', 'critical'].includes(bugData.severity)) {
      errors.push('Invalid severity level');
    }

    // Validate attachments if present
    if (bugData.attachments && bugData.attachments.length > 0) {
      if (bugData.attachments.length > this.config.maxFiles) {
        errors.push(`Too many attachments. Maximum ${this.config.maxFiles} files allowed`);
      }

      bugData.attachments.forEach((file, index) => {
        if (file.size > this.config.maxFileSize) {
          errors.push(`File ${file.name} is too large. Maximum size: ${this.formatFileSize(this.config.maxFileSize)}`);
        }

        if (!this.config.allowedFileTypes.includes(file.type)) {
          errors.push(`File ${file.name} has unsupported type: ${file.type}`);
        }
      });
    }

    // Validate browser info
    if (!bugData.browserInfo) {
      errors.push('Browser information is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check for duplicate submissions
   */
  private async checkForDuplicates(bugData: BugReportData): Promise<{
    isDuplicate: boolean;
    existingBugId?: string;
  }> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - this.config.deduplicationTimeWindow);

      // Search for similar bug reports in the time window
      const { data: similarReports } = await bugReportOperations.searchBugReports({
        search: bugData.title,
        bugType: [bugData.bugType],
        dateRange: {
          start: cutoffTime.toISOString(),
          end: new Date().toISOString()
        },
        limit: 5
      });

      if (similarReports && similarReports.length > 0) {
        // Use simple text similarity for duplicate detection
        const titleSimilarity = this.calculateTextSimilarity(
          bugData.title.toLowerCase(),
          similarReports[0].title.toLowerCase()
        );

        if (titleSimilarity > 0.8) {
          return {
            isDuplicate: true,
            existingBugId: similarReports[0].id
          };
        }
      }

      return { isDuplicate: false };
    } catch {
      centralizedLogging.warn(
        'bug-submission-processor',
        'system',
        'Failed to check for duplicates',
        { error }
      );
      return { isDuplicate: false };
    }
  }

  /**
   * Sanitize and enhance bug data
   */
  private async sanitizeAndEnhanceData(bugData: BugReportData): Promise<BugReportData> {
    const sanitized = { ...bugData };

    // Sanitize text fields
    sanitized.title = this.sanitizeText(sanitized.title);
    sanitized.description = this.sanitizeText(sanitized.description);
    if (sanitized.reproductionSteps) {
      sanitized.reproductionSteps = this.sanitizeText(sanitized.reproductionSteps);
    }

    // Enhance with additional technical data
    if (!sanitized.errorContext) {
      sanitized.errorContext = errorTracker.getRecentErrors(5);
    }

    if (!sanitized.monitoringData) {
      sanitized.monitoringData = performanceMetrics.getCurrentMetrics();
    }

    // Add correlation ID for tracking
    if (!sanitized.currentUrl) {
      sanitized.currentUrl = window.location.href;
    }

    return sanitized;
  }

  /**
   * Submit bug data to database
   */
  private async submitToDatabase(
    bugData: BugReportData, 
    submissionId: string
  ): Promise<BugSubmissionResult> {
    try {
      const { data, error } = await bugReportOperations.createBugReport({
        title: bugData.title,
        description: bugData.description,
        bugType: bugData.bugType,
        severity: bugData.severity,
        browserInfo: bugData.browserInfo,
        errorStack: this.extractErrorStack(bugData.errorContext),
        userAgent: bugData.userAgent,
        url: bugData.currentUrl,
        reproductionSteps: bugData.reproductionSteps,
        errorContext: bugData.errorContext,
        monitoringData: {
          ...bugData.monitoringData,
          submissionId,
          submissionTimestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned from database');
      }

      const trackingNumber = data.monitoring_data?.tracking_number || 
        `BUG-${new Date().getFullYear().toString().slice(-2)}-${data.id.slice(-8).toUpperCase()}`;

      return {
        success: true,
        bugId: data.id,
        trackingNumber,
        message: 'Bug report created successfully'
      };
    } catch {
      throw new Error(`Database submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process file attachments
   */
  private async processAttachments(
    bugId: string,
    attachments: File[]
  ): Promise<AttachmentUploadResult[]> {
    const results: AttachmentUploadResult[] = [];

    for (const file of attachments) {
      try {
        // Virus scan if enabled
        if (this.config.virusScanEnabled) {
          const scanResult = await this.scanFileForViruses(file);
          if (!scanResult.clean) {
            results.push({
              success: false,
              filename: file.name,
              fileSize: file.size,
              mimeType: file.type,
              error: 'File failed virus scan'
            });
            continue;
          }
        }

        // Upload file
        const { data, error } = await bugReportOperations.uploadBugAttachment({
          bugReportId: bugId,
          file
        });

        if (error) {
          results.push({
            success: false,
            filename: file.name,
            fileSize: file.size,
            mimeType: file.type,
            error: error.message
          });
        } else if (data) {
          results.push({
            success: true,
            attachmentId: data.id,
            filename: file.name,
            fileSize: file.size,
            mimeType: file.type
          });
        }
      } catch {
        results.push({
          success: false,
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type,
          error: error instanceof Error ? error.message : 'Upload failed'
        });
      }
    }

    return results;
  }

  /**
   * Send notifications for new bug report
   */
  private async sendNotifications(bugId: string, bugData: BugReportData): Promise<void> {
    try {
      // This would integrate with notification services
      centralizedLogging.info(
        'bug-submission-processor',
        'system',
        'Bug report notification sent',
        { 
          bugId,
          bugType: bugData.bugType,
          severity: bugData.severity
        }
      );
    } catch {
      centralizedLogging.warn(
        'bug-submission-processor',
        'system',
        'Failed to send bug report notification',
        { bugId, error }
      );
    }
  }

  /**
   * Update submission metrics
   */
  private updateSubmissionMetrics(result: 'success' | 'error', data: any): void {
    try {
      centralizedLogging.info(
        'bug-submission-processor',
        'system',
        `Bug submission ${result}`,
        data
      );

      // Update performance metrics if available
      if (result === 'success') {
        // Track successful submissions
      } else {
        // Track failed submissions
      }
    } catch {
      // Silently fail - metrics are not critical
    }
  }

  // Helper methods
  private generateSubmissionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeBugDataForLogging(bugData: BugReportData): any {
    return {
      title: bugData.title,
      bugType: bugData.bugType,
      severity: bugData.severity,
      hasAttachments: bugData.attachments ? bugData.attachments.length > 0 : false,
      attachmentCount: bugData.attachments?.length || 0,
      hasErrorContext: bugData.errorContext ? bugData.errorContext.length > 0 : false,
      hasMonitoringData: !!bugData.monitoringData
    };
  }

  private sanitizeText(text: string): string {
    // Remove potentially harmful content
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[script removed]')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim();
  }

  private extractErrorStack(errorContext?: unknown[]): string | undefined {
    if (errorContext && errorContext.length > 0) {
      return errorContext[0].stack;
    }
    return undefined;
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity
    const set1 = new Set(text1.split(' '));
    const set2 = new Set(text2.split(' '));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  private async scanFileForViruses(file: File): Promise<{ clean: boolean; threats?: string[] }> {
    // Mock virus scanning - in production this would call a real antivirus API
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Basic file type and size checks
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.vbs', '.js'];
    const isDangerous = dangerousExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    return {
      clean: !isDangerous,
      threats: isDangerous ? ['Potentially dangerous file type'] : undefined
    };
  }

  // Public methods for queue management
  getQueueStatus(): {
    queueSize: number;
    processingCount: number;
  } {
    return {
      queueSize: this.submissionQueue.size,
      processingCount: this.processingSubmissions.size
    };
  }

  getConfiguration(): BugSubmissionConfig {
    return { ...this.config };
  }

  updateConfiguration(updates: Partial<BugSubmissionConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Export singleton instance
export const bugSubmissionProcessor = BugSubmissionProcessor.getInstance();

// Export convenience functions
export const processBugSubmission = (bugData: BugReportData) => 
  bugSubmissionProcessor.processBugSubmission(bugData);

export default bugSubmissionProcessor;