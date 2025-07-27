/**
 * Bug Report TypeScript Interfaces
 * Type definitions for the bug reporting system
 */

// Core bug report interfaces
export interface BugReport {
  id: string;
  userId?: string;
  title: string;
  description: string;
  bugType: 'ui' | 'functionality' | 'performance' | 'security' | 'accessibility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  
  // Technical information
  browserInfo?: BrowserInfo;
  errorStack?: string;
  userAgent?: string;
  url?: string;
  reproductionSteps?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  priority: number;
  
  // Error tracking integration
  errorContext?: ErrorReport[];
  monitoringData?: APMMetrics;
}

export interface BugComment {
  id: string;
  bugReportId: string;
  userId?: string;
  comment: string;
  isInternal: boolean;
  createdAt: string;
}

export interface BugAttachment {
  id: string;
  bugReportId: string;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy?: string;
  createdAt: string;
}

// Browser and environment information
export interface BrowserInfo {
  name: string;
  version: string;
  platform: string;
  isMobile: boolean;
  screenResolution: {
    width: number;
    height: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  colorDepth: number;
  language: string;
  languages: string[];
  timezone: string;
  cookieEnabled: boolean;
  javaEnabled: boolean;
  onLine: boolean;
}

// Error context from existing error tracking systems
export interface ErrorReport {
  errorId: string;
  timestamp: string;
  message: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'javascript' | 'network' | 'resource' | 'security' | 'performance';
  metadata?: Record<string, unknown>;
}

// APM monitoring data
export interface APMMetrics {
  timestamp: string;
  performanceMetrics: {
    loadTime: number;
    domReady: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint?: number;
    firstInputDelay?: number;
    cumulativeLayoutShift?: number;
  };
  resourceTiming: Array<{
    name: string;
    type: string;
    startTime: number;
    duration: number;
    size: number;
  }>;
  userSession: {
    sessionId: string;
    duration: number;
    pageViews: number;
    interactions: number;
  };
  networkInfo?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

// Form data for bug submission
export interface BugReportData {
  // User-provided information
  title: string;
  description: string;
  bugType: BugReport['bugType'];
  severity: BugReport['severity'];
  reproductionSteps?: string;
  
  // Auto-collected technical data
  errorContext?: ErrorReport[];
  runtimeErrors?: RuntimeError[];
  monitoringData?: APMMetrics;
  browserInfo: BrowserInfo;
  userAgent: string;
  currentUrl: string;
  
  // File attachments
  attachments?: File[];
}

// Runtime errors from RuntimeErrorMonitor
export interface RuntimeError {
  errorId: string;
  timestamp: string;
  type: 'javascript' | 'promise' | 'resource' | 'network';
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  componentStack?: string;
  props?: Record<string, unknown>;
  state?: Record<string, unknown>;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  browserInfo: BrowserInfo;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  metadata: Record<string, unknown>;
}

// Enhanced error context integration
export interface EnhancedErrorContext {
  recentErrors: ErrorReport[];
  errorPatterns: DetectedPattern[];
  performanceMetrics: CoreWebVitals;
  userSession: UserSessionInfo;
  componentStack?: string;
}

export interface DetectedPattern {
  patternId: string;
  type: 'frequent_error' | 'performance_degradation' | 'user_flow_issue';
  description: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  affectedUsers: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  examples: ErrorReport[];
}

export interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

export interface UserSessionInfo {
  sessionId: string;
  userId?: string;
  startTime: string;
  duration: number;
  pageViews: number;
  interactions: number;
  referrer?: string;
  utmSource?: string;
  deviceInfo: BrowserInfo;
}

// Bug report statistics and analytics
export interface BugReportStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byType: Record<BugReport['bugType'], number>;
  bySeverity: Record<BugReport['severity'], number>;
  averageResolutionTime: number; // in hours
  recentActivity: Array<{
    date: string;
    created: number;
    resolved: number;
  }>;
}

// Bug submission response
export interface BugSubmissionResult {
  success: boolean;
  bugId?: string;
  trackingNumber?: string;
  message: string;
  errors?: string[];
}

// Bug report search and filtering
export interface BugReportQuery {
  status?: BugReport['status'][];
  bugType?: BugReport['bugType'][];
  severity?: BugReport['severity'][];
  userId?: string;
  assignedTo?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  sortBy?: 'created_at' | 'updated_at' | 'severity' | 'status';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface BugReportSearchResult {
  reports: BugReport[];
  totalCount: number;
  hasMore: boolean;
  aggregations: {
    byStatus: Record<BugReport['status'], number>;
    byType: Record<BugReport['bugType'], number>;
    bySeverity: Record<BugReport['severity'], number>;
  };
}

// File upload interfaces
export interface FileUploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface AttachmentUploadResult {
  success: boolean;
  attachmentId?: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  error?: string;
}

// Form validation interfaces
export interface BugReportFormValidation {
  title: {
    isValid: boolean;
    error?: string;
  };
  description: {
    isValid: boolean;
    error?: string;
  };
  bugType: {
    isValid: boolean;
    error?: string;
  };
  severity: {
    isValid: boolean;
    error?: string;
  };
  reproductionSteps: {
    isValid: boolean;
    error?: string;
  };
  attachments: {
    isValid: boolean;
    errors: string[];
  };
}

// Bug report form state
export interface BugReportFormState {
  data: Partial<BugReportData>;
  validation: BugReportFormValidation;
  isSubmitting: boolean;
  uploadProgress: FileUploadProgress[];
  isDirty: boolean;
  autoSaveEnabled: boolean;
  lastAutoSave?: string;
}

// Bug type configurations
export interface BugTypeConfig {
  type: BugReport['bugType'];
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultSeverity: BugReport['severity'];
  requiredFields: string[];
  suggestedReproductionSteps: string[];
}

export interface SeverityConfig {
  severity: BugReport['severity'];
  label: string;
  description: string;
  color: string;
  icon: string;
  slaHours: number;
  autoEscalation: boolean;
}

// Export utility types
export type BugReportFormData = Pick<BugReportData, 'title' | 'description' | 'bugType' | 'severity' | 'reproductionSteps'>;
export type BugReportUpdate = Partial<Pick<BugReport, 'title' | 'description' | 'status' | 'assignedTo' | 'priority'>>;
export type NewBugComment = Pick<BugComment, 'bugReportId' | 'comment' | 'isInternal'>;