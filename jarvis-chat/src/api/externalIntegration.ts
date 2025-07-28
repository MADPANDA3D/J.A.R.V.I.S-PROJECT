/**
 * External Monitoring Integration API
 * Webhook-based integration system for external monitoring tools with Claude Code, Sentry, and DataDog support
 */

import { Request, Response, NextFunction } from 'express';
import { centralizedLogging } from '@/lib/centralizedLogging';
import { bugReportOperations } from '@/lib/supabase';
import { bugLifecycleService, BugStatus } from '@/lib/bugLifecycle';
import { trackBugReportEvent } from '@/lib/monitoring';
import { validateAPIKey, checkRateLimit } from '@/lib/apiSecurity';
import type { BugDetailResponse } from './bugDashboard';

// External integration types and interfaces
export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  headers: Record<string, string>;
  authentication: {
    type: 'none' | 'bearer' | 'basic' | 'api_key';
    credentials?: {
      token?: string;
      username?: string;
      password?: string;
      apiKey?: string;
      headerName?: string;
    };
  };
  filters: {
    bugStatus?: BugStatus[];
    severity?: string[];
    bugType?: string[];
    assignedTo?: string[];
  };
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffDelay: number;
  };
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
}

export type WebhookEvent = 
  | 'bug.created'
  | 'bug.updated'
  | 'bug.status_changed'
  | 'bug.assigned'
  | 'bug.resolved'
  | 'bug.reopened'
  | 'bug.commented'
  | 'bug.priority_changed';

export interface WebhookPayload {
  eventType: WebhookEvent;
  timestamp: string;
  bugId: string;
  data: {
    bug: BugDetailResponse;
    changes?: Record<string, { from: unknown; to: unknown }>;
    metadata: {
      triggeredBy: string;
      source: string;
      correlationId: string;
    };
  };
}

export interface SentryIssueData {
  title: string;
  message: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  platform: string;
  tags: Record<string, string>;
  extra: Record<string, unknown>;
  fingerprint: string[];
  contexts: {
    bug_report: {
      id: string;
      status: string;
      priority: string;
      assigned_to?: string;
    };
    user?: {
      id: string;
      email?: string;
    };
    runtime?: {
      name: string;
      version: string;
    };
  };
}

export interface DataDogEventData {
  title: string;
  text: string;
  date_happened: number;
  priority: 'normal' | 'low';
  tags: string[];
  alert_type: 'error' | 'warning' | 'info' | 'success';
  source_type_name: string;
  aggregation_key: string;
}

export interface ClaudeCodeAnalysisRequest {
  bugId: string;
  analysisType: 'pattern' | 'resolution' | 'severity' | 'duplicate' | 'impact';
  context?: {
    includeHistory: boolean;
    includeRelated: boolean;
    includeUserActions: boolean;
    timeRange?: { start: string; end: string };
  };
}

export interface PatternAnalysisResponse {
  patterns: DetectedErrorPattern[];
  correlations: PatternCorrelation[];
  predictions: ErrorPrediction[];
  recommendations: ResolutionRecommendation[];
  confidence: number;
  analysisMetadata: {
    sampledBugs: number;
    timeRange: string;
    analysisId: string;
    completedAt: string;
  };
}

export interface DetectedErrorPattern {
  id: string;
  type: 'error_type' | 'component' | 'user_flow' | 'temporal' | 'environmental';
  pattern: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedBugs: string[];
  description: string;
  suggestedActions: string[];
}

export interface PatternCorrelation {
  patternId1: string;
  patternId2: string;
  correlationStrength: number;
  relationshipType: 'causal' | 'temporal' | 'contextual' | 'user_based';
  description: string;
}

export interface ErrorPrediction {
  type: 'bug_escalation' | 'component_failure' | 'user_impact' | 'resolution_time';
  prediction: string;
  confidence: number;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  preventiveActions: string[];
}

export interface ResolutionRecommendation {
  type: 'code_change' | 'configuration' | 'process_improvement' | 'monitoring';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recommendation: string;
  rationale: string;
  estimatedEffort: string;
  expectedImpact: string;
  relatedPatterns: string[];
}

export interface IntegrationStatus {
  integrationId: string;
  type: 'webhook' | 'sentry' | 'datadog' | 'claude_code';
  status: 'active' | 'inactive' | 'error' | 'pending';
  lastActivity: string;
  successfulDeliveries: number;
  failedDeliveries: number;
  lastError?: string;
  healthCheck: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastChecked: string;
    responseTime?: number;
  };
}

class ExternalIntegrationService {
  private static instance: ExternalIntegrationService;
  private webhookConfigs: Map<string, WebhookConfig> = new Map();
  private integrationStatus: Map<string, IntegrationStatus> = new Map();
  private deliveryQueue: WebhookPayload[] = [];
  private processingQueue: Set<string> = new Set();
  private readonly MAX_CONCURRENT_DELIVERIES = 10;
  private readonly DELIVERY_TIMEOUT = 30000; // 30 seconds

  private constructor() {
    this.initializeDefaultIntegrations();
    this.startDeliveryProcessor();
    this.startHealthChecks();
  }

  static getInstance(): ExternalIntegrationService {
    if (!ExternalIntegrationService.instance) {
      ExternalIntegrationService.instance = new ExternalIntegrationService();
    }
    return ExternalIntegrationService.instance;
  }

  /**
   * Create webhook configuration
   */
  async createWebhook(req: Request, res: Response, next: NextFunction) {
    const startTime = performance.now();
    const correlationId = this.generateCorrelationId();

    try {
      const apiKeyValidation = await validateAPIKey(req.headers.authorization);
      if (!apiKeyValidation.valid || !apiKeyValidation.permissions.admin) {
        return res.status(401).json({ error: 'Admin permission required' });
      }

      const rateLimitStatus = await checkRateLimit(apiKeyValidation.apiKey!, 'createWebhook');
      if (!rateLimitStatus.allowed) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitStatus.retryAfter 
        });
      }

      const {
        name,
        url,
        events,
        headers = {},
        authentication = { type: 'none' },
        filters = {},
        retryPolicy = {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffDelay: 60000
        }
      } = req.body;

      centralizedLogging.info(
        'external-integration',
        'system',
        'Creating webhook configuration',
        { correlationId, name, url, events, userId: apiKeyValidation.userId }
      );

      // Validate webhook configuration
      const validation = this.validateWebhookConfig({ name, url, events, authentication });
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      // Create webhook configuration
      const webhookConfig: WebhookConfig = {
        id: this.generateWebhookId(),
        name,
        url,
        events,
        headers,
        authentication,
        filters,
        retryPolicy,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      // Store configuration
      this.webhookConfigs.set(webhookConfig.id, webhookConfig);

      // Initialize integration status
      const integrationStatus: IntegrationStatus = {
        integrationId: webhookConfig.id,
        type: 'webhook',
        status: 'active',
        lastActivity: new Date().toISOString(),
        successfulDeliveries: 0,
        failedDeliveries: 0,
        healthCheck: {
          status: 'healthy',
          lastChecked: new Date().toISOString()
        }
      };

      this.integrationStatus.set(webhookConfig.id, integrationStatus);

      // Test webhook connectivity
      await this.testWebhookConnectivity(webhookConfig);

      // Track integration creation
      trackBugReportEvent('webhook_created', {
        webhookId: webhookConfig.id,
        events,
        userId: apiKeyValidation.userId,
        responseTime: performance.now() - startTime
      });

      centralizedLogging.info(
        'external-integration',
        'system',
        'Webhook configuration created successfully',
        { correlationId, webhookId: webhookConfig.id, name }
      );

      res.status(201).json({
        webhook: webhookConfig,
        integrationStatus
      });

    } catch {
      centralizedLogging.error(
        'external-integration',
        'system',
        'Error creating webhook configuration',
        { correlationId, error: error instanceof Error ? error.message : 'Unknown error' }
      );

      next(error);
    }
  }

  /**
   * Claude Code AI analysis endpoint
   */
  async analyzeWithClaudeCode(req: Request, res: Response, next: NextFunction) {
    const startTime = performance.now();
    const correlationId = this.generateCorrelationId();

    try {
      const apiKeyValidation = await validateAPIKey(req.headers.authorization);
      if (!apiKeyValidation.valid) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      const rateLimitStatus = await checkRateLimit(apiKeyValidation.apiKey!, 'claudeCodeAnalysis');
      if (!rateLimitStatus.allowed) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitStatus.retryAfter 
        });
      }

      const analysisRequest: ClaudeCodeAnalysisRequest = {
        bugId: req.params.bugId || req.body.bugId,
        analysisType: req.body.analysisType || 'pattern',
        context: req.body.context || {
          includeHistory: true,
          includeRelated: true,
          includeUserActions: false
        }
      };

      centralizedLogging.info(
        'external-integration',
        'system',
        'Processing Claude Code analysis request',
        { correlationId, analysisRequest, userId: apiKeyValidation.userId }
      );

      // Gather comprehensive bug context
      const bugContext = await this.gatherBugContext(analysisRequest);

      // Perform AI analysis based on type
      let analysisResult;
      switch (analysisRequest.analysisType) {
        case 'pattern':
          analysisResult = await this.analyzeErrorPatterns(bugContext, analysisRequest.context);
          break;
        case 'resolution':
          analysisResult = await this.suggestResolutions(bugContext);
          break;
        case 'severity':
          analysisResult = await this.classifyBugSeverity(bugContext);
          break;
        case 'duplicate':
          analysisResult = await this.detectDuplicates(bugContext);
          break;
        case 'impact':
          analysisResult = await this.analyzeUserImpact(bugContext);
          break;
        default:
          return res.status(400).json({ error: 'Invalid analysis type' });
      }

      // Track analysis request
      trackBugReportEvent('claude_code_analysis', {
        bugId: analysisRequest.bugId,
        analysisType: analysisRequest.analysisType,
        userId: apiKeyValidation.userId,
        responseTime: performance.now() - startTime
      });

      res.json({
        analysisId: this.generateAnalysisId(),
        analysisType: analysisRequest.analysisType,
        result: analysisResult,
        metadata: {
          processedAt: new Date().toISOString(),
          responseTime: performance.now() - startTime,
          correlationId
        }
      });

    } catch {
      centralizedLogging.error(
        'external-integration',
        'system',
        'Error processing Claude Code analysis',
        { correlationId, error: error instanceof Error ? error.message : 'Unknown error' }
      );

      next(error);
    }
  }

  /**
   * Sentry integration endpoint
   */
  async integrateWithSentry(req: Request, res: Response, next: NextFunction) {
    const startTime = performance.now();
    const correlationId = this.generateCorrelationId();

    try {
      const apiKeyValidation = await validateAPIKey(req.headers.authorization);
      if (!apiKeyValidation.valid || !apiKeyValidation.permissions.admin) {
        return res.status(401).json({ error: 'Admin permission required' });
      }

      const { sentryDsn, projectId, environment = 'production', autoForward = true } = req.body;

      centralizedLogging.info(
        'external-integration',
        'system',
        'Setting up Sentry integration',
        { correlationId, projectId, environment, userId: apiKeyValidation.userId }
      );

      // Validate Sentry configuration
      if (!sentryDsn || !projectId) {
        return res.status(400).json({ error: 'Sentry DSN and project ID are required' });
      }

      // Test Sentry connectivity
      const testResult = await this.testSentryConnection(sentryDsn, projectId);
      if (!testResult.success) {
        return res.status(400).json({ error: `Sentry connection test failed: ${testResult.error}` });
      }

      // Create Sentry integration configuration
      const integrationId = this.generateIntegrationId();
      const integrationConfig = {
        id: integrationId,
        type: 'sentry',
        config: {
          dsn: sentryDsn,
          projectId,
          environment,
          autoForward
        },
        createdAt: new Date().toISOString(),
        isActive: true
      };

      // Initialize integration status
      const integrationStatus: IntegrationStatus = {
        integrationId,
        type: 'sentry',
        status: 'active',
        lastActivity: new Date().toISOString(),
        successfulDeliveries: 0,
        failedDeliveries: 0,
        healthCheck: {
          status: 'healthy',
          lastChecked: new Date().toISOString(),
          responseTime: testResult.responseTime
        }
      };

      this.integrationStatus.set(integrationId, integrationStatus);

      // If auto-forward is enabled, set up automatic bug forwarding
      if (autoForward) {
        await this.setupSentryAutoForwarding(integrationId, integrationConfig.config);
      }

      // Track integration setup
      trackBugReportEvent('sentry_integration_created', {
        integrationId,
        projectId,
        userId: apiKeyValidation.userId,
        responseTime: performance.now() - startTime
      });

      res.status(201).json({
        integrationId,
        status: 'active',
        testResult,
        autoForwardEnabled: autoForward
      });

    } catch {
      centralizedLogging.error(
        'external-integration',
        'system',
        'Error setting up Sentry integration',
        { correlationId, error: error instanceof Error ? error.message : 'Unknown error' }
      );

      next(error);
    }
  }

  /**
   * DataDog integration endpoint
   */
  async integrateWithDataDog(req: Request, res: Response, next: NextFunction) {
    const startTime = performance.now();
    const correlationId = this.generateCorrelationId();

    try {
      const apiKeyValidation = await validateAPIKey(req.headers.authorization);
      if (!apiKeyValidation.valid || !apiKeyValidation.permissions.admin) {
        return res.status(401).json({ error: 'Admin permission required' });
      }

      const { 
        apiKey, 
        appKey, 
        site = 'datadoghq.com',
        service = 'jarvis-chat',
        environment = 'production',
        autoForward = true 
      } = req.body;

      centralizedLogging.info(
        'external-integration',
        'system',
        'Setting up DataDog integration',
        { correlationId, site, service, environment, userId: apiKeyValidation.userId }
      );

      // Validate DataDog configuration
      if (!apiKey || !appKey) {
        return res.status(400).json({ error: 'DataDog API key and app key are required' });
      }

      // Test DataDog connectivity
      const testResult = await this.testDataDogConnection(apiKey, appKey, site);
      if (!testResult.success) {
        return res.status(400).json({ error: `DataDog connection test failed: ${testResult.error}` });
      }

      // Create DataDog integration configuration
      const integrationId = this.generateIntegrationId();
      const integrationConfig = {
        id: integrationId,
        type: 'datadog',
        config: {
          apiKey,
          appKey,
          site,
          service,
          environment,
          autoForward
        },
        createdAt: new Date().toISOString(),
        isActive: true
      };

      // Initialize integration status
      const integrationStatus: IntegrationStatus = {
        integrationId,
        type: 'datadog',
        status: 'active',
        lastActivity: new Date().toISOString(),
        successfulDeliveries: 0,
        failedDeliveries: 0,
        healthCheck: {
          status: 'healthy',
          lastChecked: new Date().toISOString(),
          responseTime: testResult.responseTime
        }
      };

      this.integrationStatus.set(integrationId, integrationStatus);

      // If auto-forward is enabled, set up automatic event forwarding
      if (autoForward) {
        await this.setupDataDogAutoForwarding(integrationId, integrationConfig.config);
      }

      // Track integration setup
      trackBugReportEvent('datadog_integration_created', {
        integrationId,
        service,
        userId: apiKeyValidation.userId,
        responseTime: performance.now() - startTime
      });

      res.status(201).json({
        integrationId,
        status: 'active',
        testResult,
        autoForwardEnabled: autoForward
      });

    } catch {
      centralizedLogging.error(
        'external-integration',
        'system',
        'Error setting up DataDog integration',
        { correlationId, error: error instanceof Error ? error.message : 'Unknown error' }
      );

      next(error);
    }
  }

  /**
   * Get integration status
   */
  async getIntegrationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const apiKeyValidation = await validateAPIKey(req.headers.authorization);
      if (!apiKeyValidation.valid) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      const integrationId = req.params.id;
      const integration = this.integrationStatus.get(integrationId);

      if (!integration) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      // Update health check if needed
      if (Date.now() - new Date(integration.healthCheck.lastChecked).getTime() > 300000) { // 5 minutes
        await this.performHealthCheck(integrationId);
      }

      res.json(this.integrationStatus.get(integrationId));

    } catch {
      next(error);
    }
  }

  /**
   * List all integrations
   */
  async listIntegrations(req: Request, res: Response, next: NextFunction) {
    try {
      const apiKeyValidation = await validateAPIKey(req.headers.authorization);
      if (!apiKeyValidation.valid) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      const integrations = Array.from(this.integrationStatus.values());
      
      res.json({
        integrations,
        summary: {
          total: integrations.length,
          active: integrations.filter(i => i.status === 'active').length,
          healthy: integrations.filter(i => i.healthCheck.status === 'healthy').length,
          byType: integrations.reduce((acc, i) => {
            acc[i.type] = (acc[i.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }
      });

    } catch {
      next(error);
    }
  }

  // Private helper methods

  private async gatherBugContext(request: ClaudeCodeAnalysisRequest) {
    const { bugId, context } = request;

    // Get basic bug data
    const { data: bug } = await bugReportOperations.getBugReportById(bugId);
    if (!bug) {
      throw new Error('Bug not found');
    }

    const bugContext: {
      bug: unknown;
      errorHistory: unknown[];
      relatedBugs: unknown[];
      userActions: unknown[];
      systemMetrics: Record<string, unknown>;
      lifecycle?: unknown;
    } = {
      bug,
      errorHistory: [],
      relatedBugs: [],
      userActions: [],
      systemMetrics: {}
    };

    if (context?.includeHistory) {
      bugContext.lifecycle = bugLifecycleService.getStatusHistory(bugId);
    }

    if (context?.includeRelated) {
      const { data: relatedBugs } = await bugReportOperations.searchBugReports({
        limit: 10,
        exclude: [bugId]
      });
      bugContext.relatedBugs = relatedBugs || [];
    }

    return bugContext;
  }

  private async analyzeErrorPatterns(bugContext: Record<string, unknown>, context?: Record<string, unknown>): Promise<PatternAnalysisResponse> {
    // Mock implementation - in real scenario, this would use AI/ML models
    const patterns: DetectedErrorPattern[] = [
      {
        id: this.generatePatternId(),
        type: 'error_type',
        pattern: 'Authentication timeout errors',
        frequency: 15,
        severity: 'high',
        affectedBugs: [bugContext.bug.id],
        description: 'Recurring authentication timeout issues affecting user login',
        suggestedActions: ['Increase timeout duration', 'Implement retry logic', 'Add circuit breaker']
      }
    ];

    const correlations: PatternCorrelation[] = [];
    const predictions: ErrorPrediction[] = [
      {
        type: 'bug_escalation',
        prediction: 'High likelihood of escalation to critical priority',
        confidence: 0.75,
        timeframe: '24-48 hours',
        riskLevel: 'high',
        preventiveActions: ['Immediate assignment to senior developer', 'Proactive user notification']
      }
    ];

    const recommendations: ResolutionRecommendation[] = [
      {
        type: 'code_change',
        priority: 'high',
        recommendation: 'Implement exponential backoff for authentication retries',
        rationale: 'Pattern shows timeout issues can be mitigated with retry logic',
        estimatedEffort: '4-6 hours',
        expectedImpact: 'Reduce authentication failures by 80%',
        relatedPatterns: [patterns[0].id]
      }
    ];

    return {
      patterns,
      correlations,
      predictions,
      recommendations,
      confidence: 0.82,
      analysisMetadata: {
        sampledBugs: 1,
        timeRange: context?.timeRange ? `${context.timeRange.start} to ${context.timeRange.end}` : 'Last 30 days',
        analysisId: this.generateAnalysisId(),
        completedAt: new Date().toISOString()
      }
    };
  }

  private async suggestResolutions() {
    // Mock resolution suggestions
    return {
      suggestedActions: [
        {
          action: 'Increase authentication timeout',
          priority: 'high',
          estimatedEffort: '2 hours',
          confidence: 0.9
        }
      ],
      similarBugResolutions: [],
      codeChangeSuggestions: [],
      testingSuggestions: [],
      confidence: 0.85
    };
  }

  private async classifyBugSeverity() {
    // Mock severity classification
    return {
      suggestedSeverity: 'high',
      confidence: 0.78,
      reasoning: 'Authentication issues affect user experience significantly',
      factors: ['User impact', 'Frequency', 'System criticality']
    };
  }

  private async detectDuplicates() {
    // Mock duplicate detection
    return {
      isDuplicate: false,
      confidence: 0.65,
      potentialDuplicates: [],
      reasoning: 'No similar bugs found in recent history'
    };
  }

  private async analyzeUserImpact() {
    // Mock user impact analysis
    return {
      affectedUserCount: 50,
      impactSeverity: 'medium',
      userJourneyDisruption: [],
      businessImpact: {
        revenue: 'low',
        reputation: 'medium',
        operations: 'low'
      },
      urgencyScore: 7.2
    };
  }

  private validateWebhookConfig(config: Record<string, unknown>): { valid: boolean; error?: string } {
    if (!config.name || !config.url || !config.events || !Array.isArray(config.events)) {
      return { valid: false, error: 'Missing required webhook configuration' };
    }

    try {
      new URL(config.url);
    } catch {
      return { valid: false, error: 'Invalid webhook URL' };
    }

    const validEvents: WebhookEvent[] = [
      'bug.created', 'bug.updated', 'bug.status_changed', 'bug.assigned',
      'bug.resolved', 'bug.reopened', 'bug.commented', 'bug.priority_changed'
    ];

    const invalidEvents = config.events.filter((event: string) => !validEvents.includes(event as WebhookEvent));
    if (invalidEvents.length > 0) {
      return { valid: false, error: `Invalid webhook events: ${invalidEvents.join(', ')}` };
    }

    return { valid: true };
  }

  private async testWebhookConnectivity(config: WebhookConfig): Promise<void> {
    // Mock webhook test - in real implementation, would send test payload
    centralizedLogging.info(
      'external-integration',
      'system',
      'Testing webhook connectivity',
      { webhookId: config.id, url: config.url }
    );
  }

  private async testSentryConnection(): Promise<{ success: boolean; error?: string; responseTime?: number }> {
    const startTime = performance.now();
    
    try {
      // Mock Sentry connection test
      const responseTime = performance.now() - startTime;
      return { success: true, responseTime };
    } catch {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  private async testDataDogConnection(): Promise<{ success: boolean; error?: string; responseTime?: number }> {
    const startTime = performance.now();
    
    try {
      // Mock DataDog connection test
      const responseTime = performance.now() - startTime;
      return { success: true, responseTime };
    } catch {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  private async setupSentryAutoForwarding(integrationId: string, config: Record<string, unknown>): Promise<void> {
    centralizedLogging.info(
      'external-integration',
      'system',
      'Setting up Sentry auto-forwarding',
      { integrationId, projectId: config.projectId }
    );
  }

  private async setupDataDogAutoForwarding(integrationId: string, config: Record<string, unknown>): Promise<void> {
    centralizedLogging.info(
      'external-integration',
      'system',
      'Setting up DataDog auto-forwarding',
      { integrationId, service: config.service }
    );
  }

  private async performHealthCheck(integrationId: string): Promise<void> {
    const integration = this.integrationStatus.get(integrationId);
    if (!integration) return;

    const startTime = performance.now();
    
    try {
      // Mock health check
      integration.healthCheck = {
        status: 'healthy',
        lastChecked: new Date().toISOString(),
        responseTime: performance.now() - startTime
      };
      
      this.integrationStatus.set(integrationId, integration);
    } catch {
      integration.healthCheck = {
        status: 'unhealthy',
        lastChecked: new Date().toISOString()
      };
      
      this.integrationStatus.set(integrationId, integration);
    }
  }

  private initializeDefaultIntegrations(): void {
    // Initialize any default integration configurations
    centralizedLogging.info(
      'external-integration',
      'system',
      'Initializing external integration service',
      {}
    );
  }

  private startDeliveryProcessor(): void {
    // Start webhook delivery processor
    setInterval(() => {
      this.processWebhookQueue();
    }, 5000); // Process every 5 seconds
  }

  private startHealthChecks(): void {
    // Start periodic health checks
    setInterval(() => {
      this.performAllHealthChecks();
    }, 300000); // Every 5 minutes
  }

  private async processWebhookQueue(): Promise<void> {
    if (this.deliveryQueue.length === 0 || this.processingQueue.size >= this.MAX_CONCURRENT_DELIVERIES) {
      return;
    }

    const payload = this.deliveryQueue.shift();
    if (!payload) return;

    this.processingQueue.add(payload.bugId);

    try {
      await this.deliverWebhookPayload(payload);
    } catch {
      centralizedLogging.error(
        'external-integration',
        'system',
        'Webhook delivery failed',
        { bugId: payload.bugId, error: error instanceof Error ? error.message : 'Unknown error' }
      );
    } finally {
      this.processingQueue.delete(payload.bugId);
    }
  }

  private async deliverWebhookPayload(payload: WebhookPayload): Promise<void> {
    // Find matching webhook configurations
    const matchingWebhooks = Array.from(this.webhookConfigs.values())
      .filter(config => 
        config.isActive && 
        config.events.includes(payload.eventType) &&
        this.matchesFilters(payload.data.bug, config.filters)
      );

    // Deliver to each matching webhook
    for (const webhook of matchingWebhooks) {
      try {
        await this.sendWebhookPayload(webhook, payload);
        
        // Update success metrics
        const status = this.integrationStatus.get(webhook.id);
        if (status) {
          status.successfulDeliveries++;
          status.lastActivity = new Date().toISOString();
          this.integrationStatus.set(webhook.id, status);
        }
      } catch {
        // Update failure metrics
        const status = this.integrationStatus.get(webhook.id);
        if (status) {
          status.failedDeliveries++;
          status.lastError = error instanceof Error ? error.message : 'Delivery failed';
          this.integrationStatus.set(webhook.id, status);
        }
      }
    }
  }

  private async sendWebhookPayload(config: WebhookConfig, payload: WebhookPayload): Promise<void> {
    // Mock webhook delivery - in real implementation, would use HTTP client
    centralizedLogging.info(
      'external-integration',
      'system',
      'Delivering webhook payload',
      { webhookId: config.id, eventType: payload.eventType, bugId: payload.bugId }
    );
  }

  private matchesFilters(bug: Record<string, unknown>, filters: WebhookConfig['filters']): boolean {
    if (filters.bugStatus && filters.bugStatus.length > 0) {
      if (!filters.bugStatus.includes(bug.status)) return false;
    }

    if (filters.severity && filters.severity.length > 0) {
      if (!filters.severity.includes(bug.severity)) return false;
    }

    if (filters.bugType && filters.bugType.length > 0) {
      if (!filters.bugType.includes(bug.bug_type)) return false;
    }

    if (filters.assignedTo && filters.assignedTo.length > 0) {
      if (!bug.assigned_to || !filters.assignedTo.includes(bug.assigned_to)) return false;
    }

    return true;
  }

  private async performAllHealthChecks(): Promise<void> {
    const integrations = Array.from(this.integrationStatus.keys());
    
    for (const integrationId of integrations) {
      await this.performHealthCheck(integrationId);
    }
  }

  // Helper methods for ID generation
  private generateCorrelationId(): string {
    return `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateWebhookId(): string {
    return `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateIntegrationId(): string {
    return `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePatternId(): string {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const externalIntegrationService = ExternalIntegrationService.getInstance();

// Export route handlers
export const createWebhook = (req: Request, res: Response, next: NextFunction) =>
  externalIntegrationService.createWebhook(req, res, next);

export const analyzeWithClaudeCode = (req: Request, res: Response, next: NextFunction) =>
  externalIntegrationService.analyzeWithClaudeCode(req, res, next);

export const integrateWithSentry = (req: Request, res: Response, next: NextFunction) =>
  externalIntegrationService.integrateWithSentry(req, res, next);

export const integrateWithDataDog = (req: Request, res: Response, next: NextFunction) =>
  externalIntegrationService.integrateWithDataDog(req, res, next);

export const getIntegrationStatus = (req: Request, res: Response, next: NextFunction) =>
  externalIntegrationService.getIntegrationStatus(req, res, next);

export const listIntegrations = (req: Request, res: Response, next: NextFunction) =>
  externalIntegrationService.listIntegrations(req, res, next);

export default externalIntegrationService;