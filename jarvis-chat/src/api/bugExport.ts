/**
 * Bug Export API
 * Structured error export system with multiple formats, batch processing, and scheduled exports
 */

import { Request, Response, NextFunction } from 'express';
import { createWriteStream, promises as fs } from 'fs';
import { join } from 'path';
import { Parser as CSVParser } from 'json2csv';
import { Builder as XMLBuilder } from 'xml2js';
import { centralizedLogging } from '@/lib/centralizedLogging';
import { bugReportOperations } from '@/lib/supabase';
import { bugLifecycleService } from '@/lib/bugLifecycle';
import { internalCommunicationService } from '@/lib/internalCommunication';
import { feedbackCollectionService } from '@/lib/feedbackCollection';
import { trackBugReportEvent } from '@/lib/monitoring';
import { validateAPIKey, checkRateLimit } from '@/lib/apiSecurity';
import type { BugFilters } from './bugDashboard';
import type { BugReport, ErrorReport, UserSessionInfo } from '@/types/bugReport';

// Additional interface definitions for export system
export interface BreadcrumbItem {
  id: string;
  timestamp: string;
  category: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

export interface APIFailure {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  timestamp: string;
  errorMessage: string;
  requestId?: string;
}

export interface AuthError {
  id: string;
  userId?: string;
  type: 'login_failed' | 'token_expired' | 'unauthorized';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserAction {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: Record<string, unknown>;
}

export interface SystemMetric {
  id: string;
  metric: string;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
}

// Export types and interfaces
export type ExportFormat = 'json' | 'csv' | 'xml' | 'excel' | 'pdf';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';

export interface ExportRequest {
  id: string;
  userId: string;
  format: ExportFormat;
  filters: BugFilters;
  fields: string[];
  includeComments: boolean;
  includeAttachments: boolean;
  includeLifecycle: boolean;
  includeFeedback: boolean;
  template?: string;
  customOptions?: Record<string, unknown>;
  createdAt: string;
  scheduledFor?: string;
}

export interface ExportResponse {
  exportId: string;
  status: ExportStatus;
  format: ExportFormat;
  estimatedSize: number;
  estimatedTime: number;
  downloadUrl?: string;
  expiresAt: string;
  progress?: ExportProgress;
  metadata: {
    requestedAt: string;
    processedAt?: string;
    completedAt?: string;
    recordCount?: number;
    fileSize?: number;
    errors?: string[];
  };
}

export interface ExportProgress {
  percentage: number;
  currentStep: string;
  totalSteps: number;
  recordsProcessed: number;
  totalRecords: number;
  estimatedTimeRemaining: number;
}

export interface ScheduledExportConfig {
  name: string;
  format: ExportFormat;
  filters: BugFilters;
  fields: string[];
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    timezone: string;
  };
  delivery: {
    method: 'download' | 'email' | 'webhook' | 'ftp';
    recipients?: string[];
    webhookUrl?: string;
    ftpConfig?: {
      host: string;
      username: string;
      path: string;
    };
  };
  retentionDays: number;
  isActive: boolean;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: ExportFormat;
  fields: string[];
  filters: BugFilters;
  customOptions: Record<string, unknown>;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  usage: {
    totalUses: number;
    lastUsed?: string;
  };
}

export interface ErrorContextExport {
  bugReport: BugReport;
  errorReports: ErrorReport[];
  breadcrumbs: BreadcrumbItem[];
  userSessions: UserSessionInfo[];
  apiFailures: APIFailure[];
  authErrors: AuthError[];
  userActions: UserAction[];
  systemMetrics: SystemMetric[];
}

class BugExportService {
  private static instance: BugExportService;
  private exportRequests: Map<string, ExportResponse> = new Map();
  private exportProgress: Map<string, ExportProgress> = new Map();
  private scheduledExports: Map<string, ScheduledExportConfig> = new Map();
  private exportTemplates: Map<string, ExportTemplate> = new Map();
  private processingQueue: Set<string> = new Set();
  private readonly MAX_CONCURRENT_EXPORTS = 5;
  private readonly EXPORT_RETENTION_HOURS = 24;

  private constructor() => {
    this.initializeDefaultTemplates();
    this.startScheduledExportProcessor();
    this.startCleanupTask();
  }

  static getInstance(): BugExportService {
    if (!BugExportService.instance) {
      BugExportService.instance = new BugExportService();
    }
    return BugExportService.instance;
  }

  /**
   * Create new export request
   */
  async createExport(req: Request, res: Response, next: NextFunction) => {
    const correlationId = this.generateCorrelationId();

    try {
      const apiKeyValidation = await validateAPIKey(req.headers.authorization);
      if (!apiKeyValidation.valid || !apiKeyValidation.permissions.export) {
        return res.status(401).json({ error: 'Export permission required' });
      }

      const rateLimitStatus = await checkRateLimit(apiKeyValidation.apiKey!, 'createExport');
      if (!rateLimitStatus.allowed) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitStatus.retryAfter 
        });
      }

      const {
        format = 'json',
        filters = {},
        fields = [],
        includeComments = false,
        includeAttachments = false,
        includeLifecycle = false,
        includeFeedback = false,
        template,
        customOptions = {}
      } = req.body;

      centralizedLogging.info(
        'bug-export',
        'system',
        'Creating export request',
        { 
          correlationId, 
          format, 
          userId: apiKeyValidation.userId,
          includeComments,
          includeAttachments
        }
      );

      // Validate format
      if (!['json', 'csv', 'xml', 'excel', 'pdf'].includes(format)) {
        return res.status(400).json({ error: 'Invalid export format' });
      }

      // Check queue capacity
      if (this.processingQueue.size >= this.MAX_CONCURRENT_EXPORTS) {
        return res.status(503).json({ 
          error: 'Export queue full. Please try again later.',
          retryAfter: 300 // 5 minutes
        });
      }

      // Apply template if specified
      let effectiveFields = fields;
      let effectiveFilters = filters;
      let effectiveOptions = customOptions;

      if (template) {
        const templateConfig = this.exportTemplates.get(template);
        if (templateConfig) {
          effectiveFields = templateConfig.fields;
          effectiveFilters = { ...templateConfig.filters, ...filters };
          effectiveOptions = { ...templateConfig.customOptions, ...customOptions };
        }
      }

      // Create export request  
      const exportRequest: ExportRequest = {
        id: this.generateExportId(),
        userId: apiKeyValidation.userId,
        format: format as ExportFormat,
        filters: effectiveFilters,
        fields: effectiveFields,
        includeComments,
        includeAttachments,
        includeLifecycle,
        includeFeedback,
        template,
        customOptions: effectiveOptions,
        createdAt: new Date().toISOString()
      };

      // Estimate size and time
      const estimation = await this.estimateExport(exportRequest);

      // Create export response
      const exportResponse: ExportResponse = {
        exportId: exportRequest.id,
        status: 'pending',
        format: exportRequest.format,
        estimatedSize: estimation.size,
        estimatedTime: estimation.time,
        expiresAt: new Date(Date.now() + this.EXPORT_RETENTION_HOURS * 60 * 60 * 1000).toISOString(),
        metadata: {
          requestedAt: exportRequest.createdAt
        }
      };

      // Store export request
      this.exportRequests.set(exportRequest.id, exportResponse);

      // Start processing asynchronously
      this.processExportAsync(exportRequest);

      // Track export request
      trackBugReportEvent('export_requested', {
        exportId: exportRequest.id,
        format,
        userId: apiKeyValidation.userId,
        estimatedSize: estimation.size,
        filters: Object.keys(effectiveFilters)
      });

      res.status(202).json(exportResponse);

    } catch {
      centralizedLogging.error(
        'bug-export',
        'system',
        'Error creating export request',
        { correlationId, error: error instanceof Error ? error.message : 'Unknown error' }
      );

      next(error);
    }
  }

  /**
   * Get export status
   */
  async getExportStatus(req: Request, res: Response, next: NextFunction) => {
    const exportId = req.params.id;
    const correlationId = this.generateCorrelationId();

    try {
      const apiKeyValidation = await validateAPIKey(req.headers.authorization);
      if (!apiKeyValidation.valid) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      const exportResponse = this.exportRequests.get(exportId);
      if (!exportResponse) {
        return res.status(404).json({ error: 'Export not found' });
      }

      // Check ownership
      // In a real implementation, you'd verify the user has access to this export

      // Add current progress if processing
      if (exportResponse.status === 'processing') {
        exportResponse.progress = this.exportProgress.get(exportId);
      }

      res.json(exportResponse);

    } catch {
      centralizedLogging.error(
        'bug-export',
        'system',
        'Error getting export status',
        { correlationId, exportId, error: error instanceof Error ? error.message : 'Unknown error' }
      );

      next(error);
    }
  }

  /**
   * Download export file
   */
  async downloadExport(req: Request, res: Response, next: NextFunction) => {
    const exportId = req.params.id;
    const correlationId = this.generateCorrelationId();

    try {
      const apiKeyValidation = await validateAPIKey(req.headers.authorization);
      if (!apiKeyValidation.valid) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      const exportResponse = this.exportRequests.get(exportId);
      if (!exportResponse) {
        return res.status(404).json({ error: 'Export not found' });
      }

      if (exportResponse.status !== 'completed') {
        return res.status(400).json({ error: 'Export not ready for download' });
      }

      if (!exportResponse.downloadUrl) {
        return res.status(500).json({ error: 'Download URL not available' });
      }

      // Check if file exists
      const filePath = this.getExportFilePath(exportId, exportResponse.format);
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ error: 'Export file not found' });
      }

      // Set appropriate headers
      const filename = `bug-export-${exportId}.${exportResponse.format}`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', this.getContentType(exportResponse.format));

      // Stream file to response
      const fileStream = createWriteStream(filePath);
      fileStream.pipe(res);

      // Track download
      trackBugReportEvent('export_downloaded', {
        exportId,
        format: exportResponse.format,
        userId: apiKeyValidation.userId,
        fileSize: exportResponse.metadata.fileSize
      });

      centralizedLogging.info(
        'bug-export',
        'system',
        'Export downloaded',
        { correlationId, exportId, userId: apiKeyValidation.userId }
      );

    } catch {
      centralizedLogging.error(
        'bug-export',
        'system',
        'Error downloading export',
        { correlationId, exportId, error: error instanceof Error ? error.message : 'Unknown error' }
      );

      next(error);
    }
  }

  /**
   * Create scheduled export
   */
  async createScheduledExport(req: Request, res: Response, next: NextFunction) => {
    const correlationId = this.generateCorrelationId();

    try {
      const apiKeyValidation = await validateAPIKey(req.headers.authorization);
      if (!apiKeyValidation.valid || !apiKeyValidation.permissions.admin) {
        return res.status(401).json({ error: 'Admin permission required' });
      }

      const config: ScheduledExportConfig = {
        ...req.body,
        isActive: true
      };

      // Validate schedule configuration
      const validation = this.validateScheduleConfig(config);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const scheduleId = this.generateScheduleId();
      this.scheduledExports.set(scheduleId, config);

      centralizedLogging.info(
        'bug-export',
        'system',
        'Scheduled export created',
        { correlationId, scheduleId, userId: apiKeyValidation.userId }
      );

      res.status(201).json({
        scheduleId,
        config,
        nextExecution: this.calculateNextExecution(config.schedule)
      });

    } catch {
      centralizedLogging.error(
        'bug-export',
        'system',
        'Error creating scheduled export',
        { correlationId, error: error instanceof Error ? error.message : 'Unknown error' }
      );

      next(error);
    }
  }

  /**
   * Get available export templates
   */
  async getExportTemplates(req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKeyValidation = await validateAPIKey(req.headers.authorization);
      if (!apiKeyValidation.valid) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      const templates = Array.from(this.exportTemplates.values())
        .filter(template => template.isPublic || template.createdBy === apiKeyValidation.userId);

      res.json({ templates });

    } catch {
      next(error);
    }
  }

  // Private methods for export processing
  private async processExportAsync(request: ExportRequest): Promise<void> {
    const exportId = request.id;
    
    try {
      // Mark as processing
      this.processingQueue.add(exportId);
      this.updateExportStatus(exportId, 'processing');

      // Initialize progress tracking
      const progress: ExportProgress = {
        percentage: 0,
        currentStep: 'Initializing export',
        totalSteps: 5,
        recordsProcessed: 0,
        totalRecords: 0,
        estimatedTimeRemaining: 0
      };
      this.exportProgress.set(exportId, progress);

      // Step 1: Query data
      progress.currentStep = 'Querying bug data';
      progress.percentage = 20;
      this.exportProgress.set(exportId, progress);

      const bugData = await this.queryExportData(request);
      progress.totalRecords = bugData.length;
      progress.percentage = 40;
      this.exportProgress.set(exportId, progress);

      // Step 2: Process data
      progress.currentStep = 'Processing records';
      const processedData = await this.processExportData(bugData, request, progress);
      progress.percentage = 60;
      this.exportProgress.set(exportId, progress);

      // Step 3: Format data
      progress.currentStep = 'Formatting output';
      progress.percentage = 80;
      this.exportProgress.set(exportId, progress);

      const formattedData = await this.formatExportData(processedData, request.format, request.customOptions);

      // Step 4: Save file
      progress.currentStep = 'Saving file';
      progress.percentage = 90;
      this.exportProgress.set(exportId, progress);

      const filePath = await this.saveExportFile(exportId, formattedData, request.format);
      const fileStats = await fs.stat(filePath);

      // Step 5: Complete
      progress.currentStep = 'Completed';
      progress.percentage = 100;
      this.exportProgress.set(exportId, progress);

      // Update export status
      this.updateExportStatus(exportId, 'completed', {
        processedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        recordCount: processedData.length,
        fileSize: fileStats.size,
        downloadUrl: `/api/exports/${exportId}/download`
      });

      centralizedLogging.info(
        'bug-export',
        'system',
        'Export completed successfully',
        { exportId, recordCount: processedData.length, fileSize: fileStats.size }
      );

    } catch {
      const errorMessage = error instanceof Error ? error.message : 'Export processing failed';
      
      this.updateExportStatus(exportId, 'failed', {
        processedAt: new Date().toISOString(),
        errors: [errorMessage]
      });

      centralizedLogging.error(
        'bug-export',
        'system',
        'Export processing failed',
        { exportId, error: errorMessage }
      );

    } finally {
      this.processingQueue.delete(exportId);
      this.exportProgress.delete(exportId);
    }
  }

  private async queryExportData(request: ExportRequest): Promise<Record<string, unknown>[]> {
    // Query bugs based on filters
    const { data: bugs } = await bugReportOperations.searchBugReports({
      ...request.filters,
      limit: 10000 // Large limit for exports
    });

    if (!bugs) return [];

    // Enrich with additional data based on request
    const enrichedData = await Promise.all(
      bugs.map(async (bug) => {
        const enriched: Record<string, unknown> = { ...bug };

        if (request.includeComments) {
          enriched.comments = internalCommunicationService.getBugComments(bug.id);
        }

        if (request.includeLifecycle) {
          enriched.lifecycle = bugLifecycleService.getStatusHistory(bug.id);
        }

        if (request.includeFeedback) {
          enriched.feedback = feedbackCollectionService.getBugFeedback(bug.id);
        }

        return enriched;
      })
    );

    return enrichedData;
  }

  private async processExportData(
    data: Record<string, unknown>[], 
    request: ExportRequest, 
    progress: ExportProgress
  ): Promise<Record<string, unknown>[]> {
    const processed = [];

    for (let i = 0; i < data.length; i++) => {
      const record = data[i];
      
      // Apply field selection if specified
      let processedRecord = record;
      if (request.fields.length > 0) {
        processedRecord = this.selectFields(record, request.fields);
      }

      // Apply any custom processing
      processedRecord = this.applyCustomProcessing(processedRecord, request.customOptions);

      processed.push(processedRecord);

      // Update progress
      progress.recordsProcessed = i + 1;
      progress.percentage = 40 + (i / data.length) * 20; // 40-60% range
      this.exportProgress.set(request.id, progress);
    }

    return processed;
  }

  private selectFields(record: Record<string, unknown>, fields: string[]): Record<string, unknown> {
    const selected: Record<string, unknown> = {};
    
    fields.forEach(field => {
      if (field.includes('.')) {
        // Handle nested fields
        const parts = field.split('.');
        let value = record;
        for (const part of parts) => {
          value = value?.[part];
        }
        this.setNestedValue(selected, field, value);
      } else {
        selected[field] = record[field];
      }
    });

    return selected;
  }

  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) => {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }

  private applyCustomProcessing(record: Record<string, unknown>, options: Record<string, unknown>): Record<string, unknown> {
    // Apply custom processing options
    if (options.anonymizeUsers) {
      record.user_id = this.anonymizeUserId(record.user_id);
      record.user_email = this.anonymizeEmail(record.user_email);
    }

    if (options.includeTimestamp) {
      record.export_timestamp = new Date().toISOString();
    }

    if (options.flattenObjects) {
      record = this.flattenObject(record);
    }

    return record;
  }

  private async formatExportData(
    data: Record<string, unknown>[], 
    format: ExportFormat, 
    options: Record<string, unknown>
  ): Promise<string | Buffer> {
    switch (format) => {
      case 'json':
        return JSON.stringify(data, null, options.prettyPrint ? 2 : 0);
      
      case 'csv':
        return this.formatAsCSV(data, options);
      
      case 'xml':
        return this.formatAsXML(data, options);
      
      case 'excel':
        return this.formatAsExcel(data, options);
      
      case 'pdf':
        return this.formatAsPDF(data, options);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private formatAsCSV(data: Record<string, unknown>[], options: Record<string, unknown>): string {
    if (data.length === 0) return '';

    const fields = options.csvFields as string[] || Object.keys(data[0]);
    const parser = new CSVParser({ fields });
    
    return parser.parse(data);
  }

  private formatAsXML(data: Record<string, unknown>[], options: Record<string, unknown>): string {
    const builder = new XMLBuilder({
      rootName: options.xmlRootName as string || 'bugs',
      headless: false
    });

    return builder.build({ bug: data });
  }

  private formatAsExcel(data: Record<string, unknown>[], options: Record<string, unknown>): Buffer {
    // This would use a library like exceljs to create Excel files
    // For now, return CSV format as a placeholder
    const csvData = this.formatAsCSV(data, options);
    return Buffer.from(csvData, 'utf8');
  }

  private formatAsPDF(data: Record<string, unknown>[]): Buffer {
    // This would use a library like puppeteer or pdfkit to create PDFs
    // For now, return a simple text representation
    const textData = JSON.stringify(data, null, 2);
    return Buffer.from(textData, 'utf8');
  }

  private async saveExportFile(exportId: string, data: string | Buffer, format: ExportFormat): Promise<string> {
    const filePath = this.getExportFilePath(exportId, format);
    
    // Ensure export directory exists
    const exportDir = join(process.cwd(), 'exports');
    await fs.mkdir(exportDir, { recursive: true });
    
    await fs.writeFile(filePath, data);
    return filePath;
  }

  private getExportFilePath(exportId: string, format: ExportFormat): string {
    return join(process.cwd(), 'exports', `${exportId}.${format}`);
  }

  private getContentType(format: ExportFormat): string {
    const contentTypes = {
      json: 'application/json',
      csv: 'text/csv',
      xml: 'application/xml',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf'
    };

    return contentTypes[format] || 'application/octet-stream';
  }

  private async estimateExport(request: ExportRequest): Promise<{ size: number; time: number }> {
    // Get approximate record count
    const { count } = await bugReportOperations.searchBugReports({
      ...request.filters,
      limit: 1
    });

    // Estimate size based on format and includes
    let estimatedSizePerRecord = 1024; // Base 1KB per record

    if (request.includeComments) estimatedSizePerRecord += 512;
    if (request.includeAttachments) estimatedSizePerRecord += 2048;
    if (request.includeLifecycle) estimatedSizePerRecord += 256;
    if (request.includeFeedback) estimatedSizePerRecord += 512;

    // Format multipliers
    const formatMultipliers = {
      json: 1.0,
      csv: 0.7,
      xml: 1.3,
      excel: 0.8,
      pdf: 2.0
    };

    const estimatedSize = (count || 0) * estimatedSizePerRecord * formatMultipliers[request.format];
    const estimatedTime = Math.max(30, Math.ceil((count || 0) / 100) * 10); // 10 seconds per 100 records, min 30s

    return { size: estimatedSize, time: estimatedTime };
  }

  private updateExportStatus(
    exportId: string, 
    status: ExportStatus, 
    additionalMetadata?: Record<string, unknown>
  ): void {
    const exportResponse = this.exportRequests.get(exportId);
    if (exportResponse) {
      exportResponse.status = status;
      if (additionalMetadata) {
        exportResponse.metadata = { ...exportResponse.metadata, ...additionalMetadata };
      }
      this.exportRequests.set(exportId, exportResponse);
    }
  }

  private validateScheduleConfig(config: ScheduledExportConfig): { valid: boolean; error?: string } {
    if (!config.name || !config.format || !config.schedule) {
      return { valid: false, error: 'Missing required configuration' };
    }

    if (!['daily', 'weekly', 'monthly'].includes(config.schedule.frequency)) {
      return { valid: false, error: 'Invalid schedule frequency' };
    }

    if (config.schedule.frequency === 'weekly' && 
        (config.schedule.dayOfWeek === undefined || config.schedule.dayOfWeek < 0 || config.schedule.dayOfWeek > 6)) {
      return { valid: false, error: 'Invalid day of week for weekly schedule' };
    }

    if (config.schedule.frequency === 'monthly' && 
        (config.schedule.dayOfMonth === undefined || config.schedule.dayOfMonth < 1 || config.schedule.dayOfMonth > 31)) {
      return { valid: false, error: 'Invalid day of month for monthly schedule' };
    }

    return { valid: true };
  }

  private calculateNextExecution(schedule: ScheduledExportConfig['schedule']): string {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);

    const nextExecution = new Date(now);
    nextExecution.setHours(hours, minutes, 0, 0);

    switch (schedule.frequency) => {
      case 'daily':
        if (nextExecution <= now) {
          nextExecution.setDate(nextExecution.getDate() + 1);
        }
        break;
      
      case 'weekly': {
        const targetDay = schedule.dayOfWeek!;
        const currentDay = nextExecution.getDay();
        let daysUntilTarget = targetDay - currentDay;
        
        if (daysUntilTarget <= 0 || (daysUntilTarget === 0 && nextExecution <= now)) {
          daysUntilTarget += 7;
        }
        
        nextExecution.setDate(nextExecution.getDate() + daysUntilTarget);
        break;
      }
      
      case 'monthly': {
        const targetDate = schedule.dayOfMonth!;
        nextExecution.setDate(targetDate);
        
        if (nextExecution <= now) {
          nextExecution.setMonth(nextExecution.getMonth() + 1);
        }
        break;
      }
    }

    return nextExecution.toISOString();
  }

  private anonymizeUserId(userId: string): string {
    if (!userId) return '';
    return `user_${userId.slice(-4)}`;
  }

  private anonymizeEmail(email: string): string {
    if (!email) return '';
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
  }

  private flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    const flattened: Record<string, unknown> = {};
    
    for (const key in obj) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(flattened, this.flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
    
    return flattened;
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: ExportTemplate[] = [
      {
        id: 'basic-bug-report',
        name: 'Basic Bug Report',
        description: 'Essential bug information without comments or attachments',
        format: 'csv',
        fields: ['id', 'title', 'description', 'status', 'severity', 'created_at', 'assigned_to'],
        filters: {},
        customOptions: {},
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        usage: { totalUses: 0 }
      },
      {
        id: 'comprehensive-export',
        name: 'Comprehensive Export',
        description: 'Complete bug data including comments, lifecycle, and feedback',
        format: 'json',
        fields: [],
        filters: {},
        customOptions: { prettyPrint: true },
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        usage: { totalUses: 0 }
      }
    ];

    defaultTemplates.forEach(template => {
      this.exportTemplates.set(template.id, template);
    });
  }

  private startScheduledExportProcessor(): void {
    // Check for scheduled exports every 5 minutes
    setInterval(() => {
      this.processScheduledExports();
    }, 5 * 60 * 1000);
  }

  private async processScheduledExports(): Promise<void> {
    const now = new Date();

    for (const [scheduleId, config] of this.scheduledExports.entries()) {
      if (!config.isActive) continue;

      const nextExecution = new Date(this.calculateNextExecution(config.schedule));
      
      if (now >= nextExecution) {
        // Execute scheduled export
        try {
          const exportRequest: ExportRequest = {
            id: this.generateExportId(),
            userId: 'scheduler',
            format: config.format,
            filters: config.filters,
            fields: config.fields,
            includeComments: false,
            includeAttachments: false,
            includeLifecycle: false,
            includeFeedback: false,
            createdAt: new Date().toISOString(),
            scheduledFor: scheduleId
          };

          await this.processExportAsync(exportRequest);

          centralizedLogging.info(
            'bug-export',
            'system',
            'Scheduled export executed',
            { scheduleId, exportId: exportRequest.id }
          );

        } catch {
          centralizedLogging.error(
            'bug-export',
            'system',
            'Scheduled export failed',
            { scheduleId, error: error instanceof Error ? error.message : 'Unknown error' }
          );
        }
      }
    }
  }

  private startCleanupTask(): void {
    // Clean up expired exports every hour
    setInterval(() => {
      this.cleanupExpiredExports();
    }, 60 * 60 * 1000);
  }

  private async cleanupExpiredExports(): Promise<void> {
    const now = Date.now();
    const expiredExports: string[] = [];

    for (const [exportId, exportResponse] of this.exportRequests.entries()) {
      if (new Date(exportResponse.expiresAt).getTime() < now) {
        expiredExports.push(exportId);
        
        // Delete file if it exists
        try {
          const filePath = this.getExportFilePath(exportId, exportResponse.format);
          await fs.unlink(filePath);
        } catch {
          // File might not exist, ignore error
        }
      }
    }

    // Remove expired exports from memory
    expiredExports.forEach(exportId => {
      this.exportRequests.delete(exportId);
    });

    if (expiredExports.length > 0) {
      centralizedLogging.info(
        'bug-export',
        'system',
        'Cleaned up expired exports',
        { count: expiredExports.length }
      );
    }
  }

  private generateCorrelationId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateExportId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateScheduleId(): string {
    return `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const bugExportService = BugExportService.getInstance();

// Export route handlers
export const createExport = (req: Request, res: Response, next: NextFunction) =>
  bugExportService.createExport(req, res, next);

export const getExportStatus = (req: Request, res: Response, next: NextFunction) =>
  bugExportService.getExportStatus(req, res, next);

export const downloadExport = (req: Request, res: Response, next: NextFunction) =>
  bugExportService.downloadExport(req, res, next);

export const createScheduledExport = (req: Request, res: Response, next: NextFunction) =>
  bugExportService.createScheduledExport(req, res, next);

export const getExportTemplates = (req: Request, res: Response, next: NextFunction) =>
  bugExportService.getExportTemplates(req, res, next);

export default bugExportService;