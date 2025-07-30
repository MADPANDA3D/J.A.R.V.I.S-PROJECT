/**
 * Bug Reporting Service
 * Core service for bug report creation, processing, and integration with error tracking
 */

import { centralizedLogging } from './centralizedLogging';
import { errorTracker } from './errorTracking';
import { performanceMetrics } from './performanceMetrics';
import { bugReportOperations } from './supabase';
import type { 
  BugReportData, 
  BugSubmissionResult,
  EnhancedErrorContext,
  ErrorReport,
  BrowserInfo
} from '@/types/bugReport';

class BugReportingService {
  private static instance: BugReportingService;
  
  private constructor() {}

  static getInstance(): BugReportingService {
    if (!BugReportingService.instance) {
      BugReportingService.instance = new BugReportingService();
    }
    return BugReportingService.instance;
  }

  /**
   * Create a new bug report with enhanced error context
   */
  async createBugReport(bugData: BugReportData): Promise<BugSubmissionResult> {
    const correlationId = this.generateCorrelationId();
    
    try {
      centralizedLogging.info(
        'bug-reporting',
        'system',
        'Starting bug report creation',
        { 
          correlationId,
          bugType: bugData.bugType,
          severity: bugData.severity 
        }
      );

      // Collect comprehensive error context
      const errorContext = await this.collectErrorContext();
      const monitoringData = await this.collectMonitoringData();

      // Enhance bug data with technical context
      const enhancedBugData = {
        ...bugData,
        errorContext: errorContext.recentErrors,
        runtimeErrors: errorContext.runtimeErrors,
        monitoringData,
        browserInfo: this.collectBrowserInfo(),
        timestamp: new Date().toISOString(),
        correlationId
      };

      // Store in database
      const result = await this.storeBugReport(enhancedBugData);

      if (result.success && result.bugId) {
        // Log successful creation
        centralizedLogging.info(
          'bug-reporting',
          'system',
          'Bug report created successfully',
          { 
            correlationId,
            bugId: result.bugId,
            trackingNumber: result.trackingNumber 
          }
        );

        // Trigger error tracking correlation
        this.correlateBugWithErrors(result.bugId, errorContext.recentErrors);

        // Update performance metrics
        this.updatePerformanceMetrics('bug_report_created', {
          bugType: bugData.bugType,
          severity: bugData.severity
        });
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      centralizedLogging.error(
        'bug-reporting',
        'system',
        'Failed to create bug report',
        { 
          correlationId,
          error: errorMessage,
          bugData: this.sanitizeBugData(bugData)
        }
      );

      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Collect enhanced error context from existing error tracking systems
   */
  private async collectErrorContext(): Promise<EnhancedErrorContext> {
    try {
      // Get recent errors from error tracking
      const recentErrors = errorTracker.getRecentErrors(10);
      
      // Get error patterns from advanced error tracking if available
      const errorPatterns = await this.getErrorPatterns();
      
      // Get performance metrics
      const performanceData = performanceMetrics.getCurrentMetrics();
      
      // Get user session information
      const userSession = this.getCurrentUserSession();

      // Detect component stack from React errors if available
      const componentStack = this.extractComponentStack(recentErrors);

      return {
        recentErrors: recentErrors.map(this.transformErrorReport),
        errorPatterns,
        performanceMetrics: {
          lcp: performanceData?.apiResponseTimes.p95,
          fid: performanceData?.apiResponseTimes.avg,
          cls: 0, // Would be collected from performance observer
          fcp: performanceData?.apiResponseTimes.p50,
          ttfb: performanceData?.apiResponseTimes.min
        },
        userSession,
        componentStack
      };
    } catch (error) {
      centralizedLogging.warn(
        'bug-reporting',
        'system',
        'Failed to collect error context',
        { error }
      );

      return {
        recentErrors: [],
        errorPatterns: [],
        performanceMetrics: {},
        userSession: this.getCurrentUserSession()
      };
    }
  }

  /**
   * Collect monitoring data from performance metrics
   */
  private async collectMonitoringData(): Promise<any> {
    try {
      const currentMetrics = performanceMetrics.getCurrentMetrics();
      // const resourceUtilization = performanceMetrics.getResourceUtilization(); // For future use
      const activeAlerts = performanceMetrics.getActiveAlerts();

      return {
        timestamp: new Date().toISOString(),
        performanceMetrics: currentMetrics ? {
          loadTime: currentMetrics.apiResponseTimes.avg,
          domReady: performance.timing ? 
            performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart : 0,
          firstPaint: this.getFirstPaintTime(),
          firstContentfulPaint: this.getFirstContentfulPaintTime(),
          largestContentfulPaint: this.getLargestContentfulPaintTime(),
          firstInputDelay: this.getFirstInputDelayTime(),
          cumulativeLayoutShift: this.getCumulativeLayoutShiftScore()
        } : {},
        resourceTiming: this.getResourceTimingData(),
        userSession: {
          sessionId: errorTracker.getSessionId(),
          duration: performance.now(),
          pageViews: 1, // Would be tracked by session management
          interactions: 0 // Would be tracked by user activity
        },
        networkInfo: this.getNetworkInfo(),
        systemResources: {
          cpu: currentMetrics?.systemResources.cpuUsage || 0,
          memory: currentMetrics?.systemResources.memoryUsage || 0,
          disk: currentMetrics?.systemResources.diskUsage || 0,
          network: currentMetrics?.systemResources.networkTraffic || 0
        },
        activeAlerts: activeAlerts.map(alert => ({
          alertId: alert.alertId,
          metricName: alert.metricName,
          severity: alert.severity,
          currentValue: alert.currentValue,
          threshold: alert.threshold,
          timestamp: alert.timestamp
        }))
      };
    } catch (error) {
      centralizedLogging.warn(
        'bug-reporting',
        'system',
        'Failed to collect monitoring data',
        { error }
      );
      return {};
    }
  }

  /**
   * Collect comprehensive browser information
   */
  private collectBrowserInfo(): BrowserInfo {
    const nav = navigator;
    const screen = window.screen;
    
    return {
      name: this.getBrowserName(),
      version: this.getBrowserVersion(),
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
      javaEnabled: false, // Java is deprecated in modern browsers
      onLine: nav.onLine
    };
  }

  /**
   * Store bug report in database
   */
  private async storeBugReport(enhancedBugData: any): Promise<BugSubmissionResult> {
    try {
      const { data, error } = await bugReportOperations.createBugReport({
        title: enhancedBugData.title,
        description: enhancedBugData.description,
        bugType: enhancedBugData.bugType,
        severity: enhancedBugData.severity,
        browserInfo: enhancedBugData.browserInfo,
        errorStack: this.extractErrorStack(enhancedBugData.errorContext),
        userAgent: enhancedBugData.userAgent,
        url: enhancedBugData.currentUrl,
        reproductionSteps: enhancedBugData.reproductionSteps,
        errorContext: enhancedBugData.errorContext,
        monitoringData: enhancedBugData.monitoringData
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned from bug report creation');
      }

      // Extract tracking number from monitoring data or generate one
      const trackingNumber = data.monitoring_data?.tracking_number || 
        `BUG-${new Date().getFullYear().toString().slice(-2)}-${data.id.slice(-8).toUpperCase()}`;

      return {
        success: true,
        bugId: data.id,
        trackingNumber,
        message: 'Bug report created successfully'
      };

    } catch (error) {
      throw new Error(`Database storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Correlate bug report with existing errors
   */
  private correlateBugWithErrors(bugId: string, recentErrors: ErrorReport[]): void {
    try {
      // Add bug correlation to recent errors
      recentErrors.forEach(error => {
        errorTracker.addCorrelation(error.errorId, {
          type: 'bug_report',
          id: bugId,
          timestamp: new Date().toISOString()
        });
      });

      centralizedLogging.info(
        'bug-reporting',
        'system',
        'Correlated bug report with errors',
        { 
          bugId,
          correlatedErrors: recentErrors.length 
        }
      );
    } catch (error) {
      centralizedLogging.warn(
        'bug-reporting',
        'system',
        'Failed to correlate bug with errors',
        { bugId, error }
      );
    }
  }

  /**
   * Update performance metrics for bug reporting
   */
  private updatePerformanceMetrics(event: string, data: any): void {
    try {
      centralizedLogging.info(
        'bug-reporting',
        'system',
        `Bug reporting event: ${event}`,
        data
      );
    } catch (error) {
      // Silently fail - metrics are not critical
    }
  }

  // Helper methods
  private generateCorrelationId(): string {
    return `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeBugData(bugData: BugReportData): any {
    return {
      title: bugData.title,
      bugType: bugData.bugType,
      severity: bugData.severity,
      hasAttachments: bugData.attachments ? bugData.attachments.length > 0 : false,
      attachmentCount: bugData.attachments?.length || 0
    };
  }

  private transformErrorReport(error: any): ErrorReport {
    return {
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
    };
  }

  private async getErrorPatterns(): Promise<any[]> {
    // Integration with advanced error tracking would go here
    return [];
  }

  private getCurrentUserSession(): any {
    return {
      sessionId: errorTracker.getSessionId(),
      startTime: new Date().toISOString(),
      duration: performance.now(),
      pageViews: 1,
      interactions: 0,
      deviceInfo: this.collectBrowserInfo()
    };
  }

  private extractComponentStack(errors: unknown[]): string | undefined {
    // Look for React component stacks in recent errors
    for (const error of errors) {
      if (error.metadata?.componentStack) {
        return error.metadata.componentStack;
      }
    }
    return undefined;
  }

  private extractErrorStack(errorContext: ErrorReport[]): string | undefined {
    if (errorContext.length > 0) {
      return errorContext[0].stack;
    }
    return undefined;
  }

  private getBrowserName(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'Unknown';
  }

  private getBrowserVersion(): string {
    const userAgent = navigator.userAgent;
    const browserName = this.getBrowserName();
    
    const versionRegex = new RegExp(`${browserName}\\/(\\d+\\.\\d+)`);
    const match = userAgent.match(versionRegex);
    
    return match ? match[1] : 'Unknown';
  }

  // Performance timing helpers
  private getFirstPaintTime(): number {
    if ('getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      return firstPaint ? firstPaint.startTime : 0;
    }
    return 0;
  }

  private getFirstContentfulPaintTime(): number {
    if ('getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return firstContentfulPaint ? firstContentfulPaint.startTime : 0;
    }
    return 0;
  }

  private getLargestContentfulPaintTime(): number {
    // Would be collected via PerformanceObserver in a real implementation
    return 0;
  }

  private getFirstInputDelayTime(): number {
    // Would be collected via PerformanceObserver in a real implementation
    return 0;
  }

  private getCumulativeLayoutShiftScore(): number {
    // Would be collected via PerformanceObserver in a real implementation
    return 0;
  }

  private getResourceTimingData(): unknown[] {
    if ('getEntriesByType' in performance) {
      const resourceEntries = performance.getEntriesByType('resource');
      return resourceEntries.slice(0, 10).map((entry: any) => ({
        name: entry.name,
        type: this.getResourceType(entry),
        startTime: entry.startTime,
        duration: entry.duration,
        size: entry.transferSize || 0
      }));
    }
    return [];
  }

  private getResourceType(entry: any): string {
    if (entry.initiatorType) return entry.initiatorType;
    if (entry.name.includes('.js')) return 'script';
    if (entry.name.includes('.css')) return 'stylesheet';
    if (entry.name.includes('.png') || entry.name.includes('.jpg')) return 'image';
    return 'other';
  }

  private getNetworkInfo(): any {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      };
    }
    return {};
  }
}

// Export singleton instance
export const bugReportingService = BugReportingService.getInstance();

// Export convenience functions
export const createBugReport = (bugData: BugReportData) => 
  bugReportingService.createBugReport(bugData);

export default bugReportingService;