/**
 * User Feedback Collection Service
 * System for collecting user feedback on bug resolution, satisfaction ratings, and additional information
 */

import { centralizedLogging } from './centralizedLogging';
import { bugReportOperations } from './supabase';
import { trackBugReportEvent } from './monitoring';
import { sendFeedbackRequest } from './notificationService';

// Feedback types and interfaces
export type FeedbackType = 'resolution_verification' | 'satisfaction_rating' | 'additional_info' | 'follow_up';
export type FeedbackStatus = 'pending' | 'submitted' | 'expired' | 'cancelled';
export type SatisfactionRating = 1 | 2 | 3 | 4 | 5;

// Main feedback interface
export interface BugFeedback {
  id: string;
  bugReportId: string;
  userId: string;
  feedbackType: FeedbackType;
  status: FeedbackStatus;
  
  // Resolution verification fields
  isResolved?: boolean;
  verificationNotes?: string;
  additionalIssues?: string;
  
  // Satisfaction rating fields
  satisfactionRating?: SatisfactionRating;
  resolutionQuality?: SatisfactionRating;
  responseTime?: SatisfactionRating;
  overallExperience?: SatisfactionRating;
  improvementSuggestions?: string;
  
  // Additional information fields
  additionalDescription?: string;
  newReproductionSteps?: string;
  environmentChanges?: string;
  
  // Follow-up fields
  followUpType?: 'bug_recurrence' | 'related_issue' | 'feature_request';
  followUpDescription?: string;
  
  // Metadata
  submittedAt?: string;
  requestedAt: string;
  expiresAt: string;
  remindersSent: number;
  metadata?: Record<string, unknown>;
}

// Feedback request configuration
export interface FeedbackRequest {
  id: string;
  bugReportId: string;
  userId: string;
  requestType: FeedbackType;
  message: string;
  requiredFields: string[];
  priority: 'low' | 'normal' | 'high';
  expiresAt: string;
  reminderSchedule: {
    enabled: boolean;
    intervals: number[]; // Days after initial request
    maxReminders: number;
  };
  customFields?: Record<string, unknown>;
}

// Feedback analytics data
export interface FeedbackAnalytics {
  totalFeedbackRequests: number;
  responseRate: number;
  averageResponseTime: number; // hours
  satisfactionMetrics: {
    averageRating: number;
    distributionByRating: Record<SatisfactionRating, number>;
    resolutionQualityAverage: number;
    responseTimeAverage: number;
  };
  resolutionVerification: {
    totalVerifications: number;
    confirmedResolutions: number;
    verificationRate: number;
    falsePositiveRate: number;
  };
  commonIssues: Array<{
    issue: string;
    frequency: number;
    category: string;
  }>;
  trendData: Array<{
    date: string;
    feedbackCount: number;
    averageRating: number;
    responseRate: number;
  }>;
}

// Feedback form template
export interface FeedbackFormTemplate {
  feedbackType: FeedbackType;
  title: string;
  description: string;
  fields: FeedbackFormField[];
  submitButtonText: string;
  thankyouMessage: string;
}

export interface FeedbackFormField {
  id: string;
  type: 'text' | 'textarea' | 'rating' | 'boolean' | 'select' | 'multiselect';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  options?: Array<{ value: string; label: string }>;
  conditional?: {
    dependsOn: string;
    showWhen: unknown;
  };
}

class FeedbackCollectionService {
  private static instance: FeedbackCollectionService;
  private feedbackStorage: Map<string, BugFeedback> = new Map();
  private feedbackRequests: Map<string, FeedbackRequest> = new Map();
  private reminderTimers: Map<string, NodeJS.Timeout> = new Map();
  private formTemplates: Map<FeedbackType, FeedbackFormTemplate> = new Map();

  private constructor() {
    this.initializeFormTemplates();
  }

  static getInstance(): FeedbackCollectionService {
    if (!FeedbackCollectionService.instance) {
      FeedbackCollectionService.instance = new FeedbackCollectionService();
    }
    return FeedbackCollectionService.instance;
  }

  /**
   * Request feedback from user
   */
  async requestFeedback(
    bugId: string,
    userId: string,
    feedbackType: FeedbackType,
    customMessage?: string,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    const correlationId = this.generateCorrelationId();

    try {
      centralizedLogging.info(
        'feedback-collection',
        'system',
        'Requesting user feedback',
        { correlationId, bugId, userId, feedbackType, priority }
      );

      // Get bug report
      const { data: bugReport, error: fetchError } = await bugReportOperations.getBugReportById(bugId);
      if (fetchError || !bugReport) {
        throw new Error(`Failed to fetch bug report: ${fetchError?.message || 'Bug not found'}`);
      }

      // Check for existing pending feedback requests
      const existingRequest = Array.from(this.feedbackRequests.values())
        .find(req => req.bugReportId === bugId && req.userId === userId && req.requestType === feedbackType);

      if (existingRequest) {
        centralizedLogging.warn(
          'feedback-collection',
          'system',
          'Feedback request already exists',
          { correlationId, bugId, userId, existingRequestId: existingRequest.id }
        );
        return {
          success: false,
          error: 'Feedback request already pending for this user and bug'
        };
      }

      // Create feedback request
      const request: FeedbackRequest = {
        id: this.generateRequestId(),
        bugReportId: bugId,
        userId,
        requestType: feedbackType,
        message: customMessage || this.getDefaultMessage(feedbackType, bugReport),
        requiredFields: this.getRequiredFields(feedbackType),
        priority,
        expiresAt: this.calculateExpirationDate(feedbackType),
        reminderSchedule: this.getReminderSchedule(feedbackType, priority),
        customFields: {
          correlationId,
          bugTitle: bugReport.title,
          bugType: bugReport.bug_type,
          severity: bugReport.severity
        }
      };

      // Store feedback request
      this.feedbackRequests.set(request.id, request);

      // Create initial feedback record
      const feedback: BugFeedback = {
        id: this.generateFeedbackId(),
        bugReportId: bugId,
        userId,
        feedbackType,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        expiresAt: request.expiresAt,
        remindersSent: 0,
        metadata: {
          requestId: request.id,
          correlationId,
          priority
        }
      };

      this.feedbackStorage.set(feedback.id, feedback);

      // Send notification to user
      try {
        await sendFeedbackRequest(bugId, userId, this.mapFeedbackTypeToNotification(feedbackType));
      } catch (error) {
        centralizedLogging.warn(
          'feedback-collection',
          'system',
          'Failed to send feedback notification, continuing with request',
          { correlationId, bugId, userId, error }
        );
      }

      // Schedule reminders
      this.scheduleReminders(request, feedback);

      // Track feedback request event
      trackBugReportEvent('feedback_requested', {
        bugId,
        userId,
        feedbackType,
        requestId: request.id,
        priority
      });

      centralizedLogging.info(
        'feedback-collection',
        'system',
        'Feedback request created successfully',
        {
          correlationId,
          bugId,
          userId,
          requestId: request.id,
          feedbackId: feedback.id
        }
      );

      return {
        success: true,
        requestId: request.id
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      centralizedLogging.error(
        'feedback-collection',
        'system',
        'Failed to request feedback',
        { correlationId, bugId, userId, feedbackType, error: errorMessage }
      );

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Submit user feedback
   */
  async submitFeedback(
    feedbackId: string,
    feedbackData: Partial<BugFeedback>
  ): Promise<{ success: boolean; error?: string }> {
    const correlationId = this.generateCorrelationId();

    try {
      centralizedLogging.info(
        'feedback-collection',
        'system',
        'Processing feedback submission',
        { correlationId, feedbackId }
      );

      // Get existing feedback record
      const existingFeedback = this.feedbackStorage.get(feedbackId);
      if (!existingFeedback) {
        throw new Error('Feedback record not found');
      }

      if (existingFeedback.status !== 'pending') {
        throw new Error(`Feedback already ${existingFeedback.status}`);
      }

      // Check if feedback has expired
      if (new Date() > new Date(existingFeedback.expiresAt)) {
        existingFeedback.status = 'expired';
        this.feedbackStorage.set(feedbackId, existingFeedback);
        throw new Error('Feedback request has expired');
      }

      // Validate required fields
      const validation = await this.validateFeedbackSubmission(existingFeedback, feedbackData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Update feedback record
      const updatedFeedback: BugFeedback = {
        ...existingFeedback,
        ...feedbackData,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        metadata: {
          ...existingFeedback.metadata,
          submissionCorrelationId: correlationId,
          validationWarnings: validation.warnings
        }
      };

      this.feedbackStorage.set(feedbackId, updatedFeedback);

      // Clear any pending reminders
      this.clearReminders(feedbackId);

      // Process feedback based on type
      await this.processFeedbackSubmission(updatedFeedback);

      // Track submission event
      trackBugReportEvent('feedback_submitted', {
        bugId: updatedFeedback.bugReportId,
        userId: updatedFeedback.userId,
        feedbackType: updatedFeedback.feedbackType,
        feedbackId,
        satisfactionRating: updatedFeedback.satisfactionRating,
        isResolved: updatedFeedback.isResolved
      });

      centralizedLogging.info(
        'feedback-collection',
        'system',
        'Feedback submitted successfully',
        {
          correlationId,
          feedbackId,
          bugId: updatedFeedback.bugReportId,
          feedbackType: updatedFeedback.feedbackType
        }
      );

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      centralizedLogging.error(
        'feedback-collection',
        'system',
        'Failed to submit feedback',
        { correlationId, feedbackId, error: errorMessage }
      );

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get feedback for a bug
   */
  getBugFeedback(bugId: string): BugFeedback[] {
    return Array.from(this.feedbackStorage.values())
      .filter(feedback => feedback.bugReportId === bugId)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  /**
   * Get feedback for a user
   */
  getUserFeedback(userId: string, status?: FeedbackStatus): BugFeedback[] {
    return Array.from(this.feedbackStorage.values())
      .filter(feedback => feedback.userId === userId && (!status || feedback.status === status))
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  /**
   * Get pending feedback requests for user
   */
  getPendingFeedbackRequests(userId: string): FeedbackRequest[] {
    const pendingFeedback = this.getUserFeedback(userId, 'pending');
    return pendingFeedback
      .map(feedback => this.feedbackRequests.get(feedback.metadata?.requestId as string))
      .filter(Boolean) as FeedbackRequest[];
  }

  /**
   * Cancel feedback request
   */
  async cancelFeedbackRequest(feedbackId: string, reason?: string): Promise<boolean>  {
    const feedback = this.feedbackStorage.get(feedbackId);
    if (!feedback || feedback.status !== 'pending') {
      return false;
    }

    feedback.status = 'cancelled';
    feedback.metadata = {
      ...feedback.metadata,
      cancellationReason: reason,
      cancelledAt: new Date().toISOString()
    };

    this.feedbackStorage.set(feedbackId, feedback);
    this.clearReminders(feedbackId);

    centralizedLogging.info(
      'feedback-collection',
      'system',
      'Feedback request cancelled',
      { feedbackId, reason }
    );

    return true;
  }

  /**
   * Get feedback analytics
   */
  getFeedbackAnalytics(dateRange?: { start: string; end: string }): FeedbackAnalytics {
    const allFeedback = Array.from(this.feedbackStorage.values());
    const filteredFeedback = dateRange
      ? allFeedback.filter(f => {
          const requestDate = new Date(f.requestedAt);
          return requestDate >= new Date(dateRange.start) && requestDate <= new Date(dateRange.end);
        })
      : allFeedback;

    const submittedFeedback = filteredFeedback.filter(f => f.status === 'submitted');
    const satisfactionFeedback = submittedFeedback.filter(f => f.feedbackType === 'satisfaction_rating');
    const verificationFeedback = submittedFeedback.filter(f => f.feedbackType === 'resolution_verification');

    // Calculate satisfaction metrics
    const satisfactionRatings = satisfactionFeedback
      .map(f => f.satisfactionRating)
      .filter(Boolean) as SatisfactionRating[];

    const satisfactionDistribution = satisfactionRatings.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<SatisfactionRating, number>);

    // Calculate response metrics
    const responseTime = submittedFeedback
      .map(f => {
        if (f.submittedAt && f.requestedAt) {
          return (new Date(f.submittedAt).getTime() - new Date(f.requestedAt).getTime()) / (1000 * 60 * 60);
        }
        return 0;
      })
      .filter(time => time > 0);

    // Calculate verification metrics
    const confirmedResolutions = verificationFeedback.filter(f => f.isResolved === true).length;
    const totalVerifications = verificationFeedback.length;

    return {
      totalFeedbackRequests: filteredFeedback.length,
      responseRate: filteredFeedback.length > 0 ? (submittedFeedback.length / filteredFeedback.length) * 100 : 0,
      averageResponseTime: responseTime.length > 0 ? responseTime.reduce((a, b) => a + b, 0) / responseTime.length : 0,
      satisfactionMetrics: {
        averageRating: satisfactionRatings.length > 0 ? satisfactionRatings.reduce((a, b) => a + b, 0) / satisfactionRatings.length : 0,
        distributionByRating: satisfactionDistribution,
        resolutionQualityAverage: this.calculateAverageRating(satisfactionFeedback, 'resolutionQuality'),
        responseTimeAverage: this.calculateAverageRating(satisfactionFeedback, 'responseTime')
      },
      resolutionVerification: {
        totalVerifications,
        confirmedResolutions,
        verificationRate: totalVerifications > 0 ? (confirmedResolutions / totalVerifications) * 100 : 0,
        falsePositiveRate: totalVerifications > 0 ? ((totalVerifications - confirmedResolutions) / totalVerifications) * 100 : 0
      },
      commonIssues: this.analyzeCommonIssues(submittedFeedback),
      trendData: this.generateTrendData(filteredFeedback)
    };
  }

  /**
   * Get form template for feedback type
   */
  getFormTemplate(feedbackType: FeedbackType): FeedbackFormTemplate | null {
    return this.formTemplates.get(feedbackType) || null;
  }

  // Private helper methods
  private initializeFormTemplates(): void {
    const templates: FeedbackFormTemplate[] = [
      {
        feedbackType: 'resolution_verification',
        title: 'Verify Bug Resolution',
        description: 'Please help us verify that your reported bug has been resolved.',
        submitButtonText: 'Submit Verification',
        thankyouMessage: 'Thank you for verifying the bug resolution!',
        fields: [
          {
            id: 'isResolved',
            type: 'boolean',
            label: 'Has the issue been resolved?',
            required: true
          },
          {
            id: 'verificationNotes',
            type: 'textarea',
            label: 'Additional notes about the resolution',
            placeholder: 'Please describe your experience with the fix...',
            required: false,
            validation: { maxLength: 1000 }
          },
          {
            id: 'additionalIssues',
            type: 'textarea',
            label: 'Are there any related issues or concerns?',
            placeholder: 'Describe any remaining or related issues...',
            required: false,
            conditional: { dependsOn: 'isResolved', showWhen: false },
            validation: { maxLength: 1000 }
          }
        ]
      },
      {
        feedbackType: 'satisfaction_rating',
        title: 'Rate Your Experience',
        description: 'Please rate your experience with our bug resolution process.',
        submitButtonText: 'Submit Rating',
        thankyouMessage: 'Thank you for your feedback!',
        fields: [
          {
            id: 'satisfactionRating',
            type: 'rating',
            label: 'Overall satisfaction with the resolution',
            required: true
          },
          {
            id: 'resolutionQuality',
            type: 'rating',
            label: 'Quality of the solution provided',
            required: true
          },
          {
            id: 'responseTime',
            type: 'rating',
            label: 'Timeliness of the response',
            required: true
          },
          {
            id: 'improvementSuggestions',
            type: 'textarea',
            label: 'How can we improve our service?',
            placeholder: 'Your suggestions for improvement...',
            required: false,
            validation: { maxLength: 1000 }
          }
        ]
      },
      {
        feedbackType: 'additional_info',
        title: 'Provide Additional Information',
        description: 'We need more information to better understand and resolve your bug report.',
        submitButtonText: 'Submit Information',
        thankyouMessage: 'Thank you for providing additional information!',
        fields: [
          {
            id: 'additionalDescription',
            type: 'textarea',
            label: 'Additional description of the issue',
            placeholder: 'Please provide more details about the problem...',
            required: true,
            validation: { minLength: 20, maxLength: 2000 }
          },
          {
            id: 'newReproductionSteps',
            type: 'textarea',
            label: 'Updated reproduction steps',
            placeholder: 'Step 1: ...\nStep 2: ...\nStep 3: ...',
            required: false,
            validation: { maxLength: 1000 }
          },
          {
            id: 'environmentChanges',
            type: 'textarea',
            label: 'Any changes to your environment since reporting?',
            placeholder: 'Browser updates, system changes, etc...',
            required: false,
            validation: { maxLength: 500 }
          }
        ]
      }
    ];

    templates.forEach(template => {
      this.formTemplates.set(template.feedbackType, template);
    });
  }

  private async validateFeedbackSubmission(
    feedback: BugFeedback,
    data: Partial<BugFeedback>
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const template = this.formTemplates.get(feedback.feedbackType);
    if (!template) {
      errors.push('Invalid feedback type');
      return { isValid: false, errors, warnings };
    }

    // Validate required fields
    for (const field of template.fields) {
      if (field.required) {
        const value = (data as Record<string, unknown>)[field.id];
        if (value === undefined || value === null || value === '') {
          errors.push(`${field.label} is required`);
        }
      }
    }

    // Validate field formats and constraints
    for (const field of template.fields) {
      const value = (data as Record<string, unknown>)[field.id];
      if (value !== undefined && value !== null && field.validation) {
        const validation = field.validation;

        if (typeof value === 'string') {
          if (validation.minLength && value.length < validation.minLength) {
            errors.push(`${field.label} must be at least ${validation.minLength} characters`);
          }
          if (validation.maxLength && value.length > validation.maxLength) {
            errors.push(`${field.label} must not exceed ${validation.maxLength} characters`);
          }
          if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
            errors.push(`${field.label} format is invalid`);
          }
        }
      }
    }

    // Type-specific validations
    if (feedback.feedbackType === 'satisfaction_rating') {
      const ratings = ['satisfactionRating', 'resolutionQuality', 'responseTime'];
      ratings.forEach(ratingField => {
        const rating = (data as Record<string, unknown>)[ratingField];
        if (rating !== undefined && rating !== null && typeof rating === 'number' && (rating < 1 || rating > 5)) {
          errors.push(`${ratingField} must be between 1 and 5`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async processFeedbackSubmission(feedback: BugFeedback): Promise<void>  {
    try {
      // Process based on feedback type
      switch (feedback.feedbackType) {
        case 'resolution_verification':
          await this.processResolutionVerification(feedback);
          break;
        case 'satisfaction_rating':
          await this.processSatisfactionRating(feedback);
          break;
        case 'additional_info':
          await this.processAdditionalInfo(feedback);
          break;
      }
    } catch (error) {
      centralizedLogging.warn(
        'feedback-collection',
        'system',
        'Failed to process feedback submission',
        { feedbackId: feedback.id, error }
      );
    }
  }

  private async processResolutionVerification(feedback: BugFeedback): Promise<void>  {
    if (feedback.isResolved === false) {
      // Bug was not actually resolved - reopen it
      centralizedLogging.info(
        'feedback-collection',
        'system',
        'Bug resolution verification failed - considering reopening',
        { bugId: feedback.bugReportId, feedbackId: feedback.id }
      );

      // In a real implementation, this would trigger bug reopening
      trackBugReportEvent('resolution_verification_failed', {
        bugId: feedback.bugReportId,
        userId: feedback.userId,
        feedbackId: feedback.id
      });
    } else {
      // Bug resolution confirmed
      trackBugReportEvent('resolution_verification_confirmed', {
        bugId: feedback.bugReportId,
        userId: feedback.userId,
        feedbackId: feedback.id
      });
    }
  }

  private async processSatisfactionRating(feedback: BugFeedback): Promise<void>  {
    // Log satisfaction metrics for analytics
    centralizedLogging.info(
      'feedback-collection',
      'system',
      'Satisfaction rating received',
      {
        bugId: feedback.bugReportId,
        userId: feedback.userId,
        satisfactionRating: feedback.satisfactionRating,
        resolutionQuality: feedback.resolutionQuality,
        responseTime: feedback.responseTime
      }
    );

    // If rating is low, consider escalation
    if (feedback.satisfactionRating && feedback.satisfactionRating <= 2) {
      centralizedLogging.warn(
        'feedback-collection',
        'system',
        'Low satisfaction rating received',
        { bugId: feedback.bugReportId, rating: feedback.satisfactionRating }
      );

      trackBugReportEvent('low_satisfaction_rating', {
        bugId: feedback.bugReportId,
        userId: feedback.userId,
        rating: feedback.satisfactionRating
      });
    }
  }

  private async processAdditionalInfo(feedback: BugFeedback): Promise<void>  {
    // Update bug report with additional information
    if (feedback.additionalDescription || feedback.newReproductionSteps) {
      centralizedLogging.info(
        'feedback-collection',
        'system',
        'Additional information received for bug',
        { bugId: feedback.bugReportId, feedbackId: feedback.id }
      );

      // In a real implementation, this would update the bug report
      trackBugReportEvent('additional_info_received', {
        bugId: feedback.bugReportId,
        userId: feedback.userId,
        feedbackId: feedback.id
      });
    }
  }

  private scheduleReminders(request: FeedbackRequest, feedback: BugFeedback): void {
    if (!request.reminderSchedule.enabled) return;

    // In test environment, use much shorter timeouts to prevent overflow warnings
    const isTestEnv = process.env.NODE_ENV === 'test';

    request.reminderSchedule.intervals.forEach((dayInterval, index) => {
      if (index >= request.reminderSchedule.maxReminders) return;

      const reminderTime = isTestEnv 
        ? Math.min(dayInterval * 100, 1000) // Short timeouts for tests (100ms per "day")
        : dayInterval * 24 * 60 * 60 * 1000; // Full days in production
      
      const timer = setTimeout(() => {
        this.sendReminder(feedback.id, index + 1);
      }, reminderTime);

      this.reminderTimers.set(`${feedback.id}_reminder_${index}`, timer);
    });
  }

  private clearReminders(feedbackId: string): void {
    for (const [key, timer] of this.reminderTimers.entries()) {
      if (key.startsWith(feedbackId + '_reminder_')) {
        clearTimeout(timer);
        this.reminderTimers.delete(key);
      }
    }
  }

  private async sendReminder(feedbackId: string, reminderNumber: number): Promise<void>  {
    const feedback = this.feedbackStorage.get(feedbackId);
    if (!feedback || feedback.status !== 'pending') return;

    try {
      feedback.remindersSent = reminderNumber;
      this.feedbackStorage.set(feedbackId, feedback);

      await sendFeedbackRequest(
        feedback.bugReportId,
        feedback.userId,
        this.mapFeedbackTypeToNotification(feedback.feedbackType)
      );

      centralizedLogging.info(
        'feedback-collection',
        'system',
        'Feedback reminder sent',
        { feedbackId, reminderNumber }
      );
    } catch (error) {
      centralizedLogging.error(
        'feedback-collection',
        'system',
        'Failed to send feedback reminder',
        { feedbackId, reminderNumber, error }
      );
    }
  }

  private getDefaultMessage(feedbackType: FeedbackType, bugReport: { title: string; id: string }): string {
    const messages = {
      resolution_verification: `We believe we have resolved your bug report "${bugReport.title}". Please verify that the issue has been fixed.`,
      satisfaction_rating: `Your bug report "${bugReport.title}" has been resolved. Please rate your experience with our support.`,
      additional_info: `We need more information about your bug report "${bugReport.title}" to better assist you.`,
      follow_up: `We'd like to follow up on your bug report "${bugReport.title}".`
    };

    return messages[feedbackType] || 'We would appreciate your feedback on this bug report.';
  }

  private getRequiredFields(feedbackType: FeedbackType): string[] {
    const requiredFields = {
      resolution_verification: ['isResolved'],
      satisfaction_rating: ['satisfactionRating', 'resolutionQuality', 'responseTime'],
      additional_info: ['additionalDescription'],
      follow_up: ['followUpType', 'followUpDescription']
    };

    return requiredFields[feedbackType] || [];
  }

  private calculateExpirationDate(feedbackType: FeedbackType): string {
    const expirationDays = {
      resolution_verification: 7,
      satisfaction_rating: 14,
      additional_info: 30,
      follow_up: 7
    };

    const days = expirationDays[feedbackType] || 7;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  private getReminderSchedule(feedbackType: FeedbackType, priority: string) {
    const baseSchedule = {
      enabled: true,
      intervals: [1, 3, 7], // Days
      maxReminders: 3
    };

    if (priority === 'high') {
      return {
        ...baseSchedule,
        intervals: [1, 2, 5],
        maxReminders: 4
      };
    }

    if (feedbackType === 'additional_info') {
      return {
        ...baseSchedule,
        intervals: [2, 7, 14],
        maxReminders: 3
      };
    }

    return baseSchedule;
  }

  private mapFeedbackTypeToNotification(feedbackType: FeedbackType): 'verification' | 'satisfaction' | 'more_info' {
    const mapping = {
      resolution_verification: 'verification' as const,
      satisfaction_rating: 'satisfaction' as const,
      additional_info: 'more_info' as const,
      follow_up: 'more_info' as const
    };

    return mapping[feedbackType] || 'more_info';
  }

  private calculateAverageRating(feedback: BugFeedback[], field: keyof BugFeedback): number {
    const ratings = feedback
      .map(f => f[field] as number)
      .filter(rating => typeof rating === 'number' && rating >= 1 && rating <= 5);

    return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  }

  private analyzeCommonIssues(feedback: BugFeedback[]): Array<{ issue: string; frequency: number; category: string }> {
    // Analyze common issues from feedback content
    const issueKeywords = new Map<string, number>();

    feedback.forEach(f => {
      const text = [
        f.verificationNotes,
        f.additionalIssues,
        f.improvementSuggestions,
        f.additionalDescription
      ].filter(Boolean).join(' ').toLowerCase();

      // Simple keyword extraction (in a real implementation, this would be more sophisticated)
      const words = text.split(/\s+/).filter(word => word.length > 3);
      words.forEach(word => {
        issueKeywords.set(word, (issueKeywords.get(word) || 0) + 1);
      });
    });

    return Array.from(issueKeywords.entries())
      .filter(([, frequency]) => frequency > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([issue, frequency]) => ({
        issue,
        frequency,
        category: 'general' // In a real implementation, this would categorize issues
      }));
  }

  private generateTrendData(feedback: BugFeedback[]): Array<{
    date: string;
    feedbackCount: number;
    averageRating: number;
    responseRate: number;
  }> {
    const dailyData = new Map<string, { 
      total: number; 
      submitted: number; 
      ratings: number[]; 
    }>();

    feedback.forEach(f => {
      const date = f.requestedAt.split('T')[0];
      const data = dailyData.get(date) || { total: 0, submitted: 0, ratings: [] };
      
      data.total++;
      if (f.status === 'submitted') {
        data.submitted++;
        if (f.satisfactionRating) {
          data.ratings.push(f.satisfactionRating);
        }
      }
      
      dailyData.set(date, data);
    });

    return Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        feedbackCount: data.total,
        averageRating: data.ratings.length > 0 
          ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length 
          : 0,
        responseRate: data.total > 0 ? (data.submitted / data.total) * 100 : 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private generateCorrelationId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFeedbackId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup method
  destroy(): void {
    // Clear all reminder timers
    this.reminderTimers.forEach(timer => clearTimeout(timer));
    this.reminderTimers.clear();
  }

  // Reset method for testing
  reset(): void {
    this.feedbackStorage.clear();
    this.feedbackRequests.clear();
    this.reminderTimers.forEach(timer => clearTimeout(timer));
    this.reminderTimers.clear();
  }
}

// Export singleton instance
export const feedbackCollectionService = FeedbackCollectionService.getInstance();

// Export convenience functions
export const requestFeedback = (
  bugId: string,
  userId: string,
  feedbackType: FeedbackType,
  customMessage?: string,
  priority?: 'low' | 'normal' | 'high'
) => feedbackCollectionService.requestFeedback(bugId, userId, feedbackType, customMessage, priority);

export const submitFeedback = (feedbackId: string, feedbackData: Partial<BugFeedback>) =>
  feedbackCollectionService.submitFeedback(feedbackId, feedbackData);

export const getBugFeedback = (bugId: string) => feedbackCollectionService.getBugFeedback(bugId);

export const getUserFeedback = (userId: string, status?: FeedbackStatus) =>
  feedbackCollectionService.getUserFeedback(userId, status);

export const getFeedbackAnalytics = (dateRange?: { start: string; end: string }) =>
  feedbackCollectionService.getFeedbackAnalytics(dateRange);

export default feedbackCollectionService;