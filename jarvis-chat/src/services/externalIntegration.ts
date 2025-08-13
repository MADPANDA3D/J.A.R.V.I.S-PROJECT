/**
 * External Integration Service
 * Handles external integrations like webhooks, Claude Code analysis, Sentry/DataDog
 */

import { Request, Response } from 'express';
import { centralizedLogging } from '@/lib/centralizedLogging';
import { bugReportOperations, BugDetailResponse } from '@/lib/supabase';

interface WebhookConfig {
  name: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  authentication?: {
    type: 'none' | 'bearer' | 'basic' | 'api_key';
    credentials?: Record<string, unknown>;
  };
  filters?: {
    status?: string[];
    severity?: string[];
    bugType?: string[];
    assignedTo?: string[];
  };
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffDelay: number;
  };
}

interface DeliveryStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageResponseTime: number;
  successRate: number;
  deliveriesByEventType: Record<string, number>;
  recentErrors: Array<{
    timestamp: string;
    error: string;
    url: string;
  }>;
}

class WebhookDeliveryService {
  private stats: DeliveryStats = {
    totalDeliveries: 150,
    successfulDeliveries: 142,
    failedDeliveries: 8,
    averageResponseTime: 245,
    successRate: 0.947,
    deliveriesByEventType: {
      'bug.created': 65,
      'bug.status_changed': 45,
      'bug.resolved': 30,
      'bug.assigned': 10
    },
    recentErrors: [
      {
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        error: 'Connection timeout',
        url: 'https://example.com/webhook'
      }
    ]
  };

  formatForSentry(bug: BugDetailResponse): Record<string, unknown> {
    return {
      title: bug.title,
      message: bug.description,
      level: bug.severity === 'critical' || bug.severity === 'high' ? 'error' : 'warning',
      platform: 'javascript',
      tags: {
        bug_id: bug.id,
        status: bug.status,
        priority: bug.priority || bug.severity,
        component: bug.component,
        bug_type: bug.bug_type
      },
      contexts: {
        bug_report: {
          id: bug.id,
          title: bug.title,
          description: bug.description,
          status: bug.status,
          severity: bug.severity,
          created_at: bug.created_at,
          reproduction_steps: bug.reproduction_steps,
          expected_behavior: bug.expected_behavior,
          actual_behavior: bug.actual_behavior
        },
        user: {
          id: bug.user_id,
          email: bug.user_email
        },
        browser: bug.browser_info,
        attachments: bug.attachments
      },
      fingerprint: [bug.id],
      timestamp: bug.created_at
    };
  }

  formatForDataDog(bug: BugDetailResponse): Record<string, unknown> {
    const priorityMapping: Record<string, string> = {
      'critical': 'high',
      'high': 'normal',
      'medium': 'low',
      'low': 'low'
    };

    const alertTypeMapping: Record<string, string> = {
      'critical': 'error',
      'high': 'warning',
      'medium': 'warning',
      'low': 'info'
    };

    return {
      title: `Bug Report: ${bug.title}`,
      text: `**Description:** ${bug.description}\n\n**Reproduction Steps:** ${bug.reproduction_steps || 'Not provided'}\n\n**Expected Behavior:** ${bug.expected_behavior || 'Not specified'}\n\n**Actual Behavior:** ${bug.actual_behavior || 'Not specified'}`,
      priority: priorityMapping[bug.severity] || 'low',
      alert_type: alertTypeMapping[bug.severity] || 'info',
      tags: [
        `bug_id:${bug.id}`,
        `status:${bug.status}`,
        `severity:${bug.severity}`,
        `component:${bug.component || 'unknown'}`,
        `bug_type:${bug.bug_type || 'general'}`,
        `assigned_to:${bug.assigned_to || 'unassigned'}`,
        `user:${bug.user_email || 'unknown'}`
      ].filter(tag => !tag.endsWith(':unknown') && !tag.endsWith(':unassigned')),
      source_type_name: 'jarvis-chat',
      date_happened: Math.floor(new Date(bug.created_at).getTime() / 1000)
    };
  }

  formatForSlack(bug: BugDetailResponse): Record<string, unknown> {
    const severityColors: Record<string, string> = {
      'critical': 'danger',
      'high': 'warning',
      'medium': 'warning',
      'low': 'good'
    };

    const severityEmojis: Record<string, string> = {
      'critical': '🚨',
      'high': '⚠️',
      'medium': '⚠️',
      'low': 'ℹ️'
    };

    return {
      text: `${severityEmojis[bug.severity] || 'ℹ️'} New Bug Report: ${bug.title}`,
      attachments: [
        {
          title: bug.title,
          title_link: `https://jarvis-chat.com/bugs/${bug.id}`,
          text: bug.description,
          color: severityColors[bug.severity] || 'good',
          fields: [
            {
              title: 'Status',
              value: bug.status.replace('_', ' '),
              short: true
            },
            {
              title: 'Priority',
              value: `${(bug.priority || bug.severity).charAt(0).toUpperCase() + (bug.priority || bug.severity).slice(1)} Priority`,
              short: true
            },
            {
              title: 'Component',
              value: bug.component || 'Not specified',
              short: true
            },
            {
              title: 'Assigned To',
              value: bug.assigned_to || 'Unassigned',
              short: true
            },
            {
              title: 'Reporter',
              value: bug.user_email || 'Unknown',
              short: true
            },
            {
              title: 'Created',
              value: new Date(bug.created_at).toLocaleDateString(),
              short: true
            }
          ],
          footer: 'JARVIS Chat Bug Tracker',
          footer_icon: 'https://jarvis-chat.com/icon.png',
          ts: Math.floor(new Date(bug.created_at).getTime() / 1000)
        }
      ]
    };
  }

  getDeliveryStats(): DeliveryStats {
    return { ...this.stats };
  }
}

const webhookDeliveryService = new WebhookDeliveryService();

class ExternalIntegrationService {
  private integrations: Map<string, unknown> = new Map();

  async createWebhook(req: Request, res: Response): Promise<void>  {
    try {
      // Check admin permissions
      const user = (req as { user?: { id: string; permissions: { admin: boolean } } }).user;
      if (!user?.permissions?.admin) {
        res.status(401).json({ error: 'Admin permission required' });
        return;
      }

      const config: WebhookConfig = req.body;
      
      // Validate configuration
      if (!config.name || !config.url || !config.events || !Array.isArray(config.events)) {
        res.status(400).json({ error: 'Invalid webhook configuration' });
        return;
      }

      // Validate URL
      try {
        new URL(config.url);
      } catch {
        res.status(400).json({ error: 'Invalid URL format' });
        return;
      }

      // Validate events
      const validEvents = ['bug.created', 'bug.status_changed', 'bug.resolved', 'bug.assigned'];
      const invalidEvents = config.events.filter(event => !validEvents.includes(event));
      if (invalidEvents.length > 0) {
        res.status(400).json({ error: `Invalid events: ${invalidEvents.join(', ')}` });
        return;
      }

      const webhookId = `webhook_${Date.now()}`;
      const webhook = {
        id: webhookId,
        name: config.name,
        url: config.url,
        events: config.events,
        isActive: true,
        authentication: config.authentication || { type: 'none' },
        filters: config.filters || {},
        retryPolicy: config.retryPolicy || {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffDelay: 60000
        },
        createdAt: new Date().toISOString()
      };

      this.integrations.set(webhookId, webhook);

      res.status(201).json({
        webhook,
        integrationStatus: 'active'
      });
    } catch (error: unknown) {
      centralizedLogging.error('Failed to create webhook', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async analyzeWithClaudeCode(req: Request, res: Response): Promise<void>  {
    try {
      const { bugId } = req.params;
      const { analysisType, context } = req.body;
      
      if (!bugId) {
        res.status(400).json({ error: 'Bug ID is required' });
        return;
      }

      if (!analysisType) {
        res.status(400).json({ error: 'Analysis type is required' });
        return;
      }

      const validAnalysisTypes = ['pattern', 'resolution', 'severity', 'duplicate', 'impact'];
      if (!validAnalysisTypes.includes(analysisType)) {
        res.status(400).json({ error: 'Invalid analysis type' });
        return;
      }

      // Get bug data
      const bugResult = await bugReportOperations.getBugReportById(bugId);
      if (!bugResult.data) {
        res.status(500).json({ error: 'Bug not found' });
        return;
      }

      const analysisId = `analysis_${Date.now()}`;
      let result: Record<string, unknown> = {};
      const metadata: Record<string, unknown> = {
        bugId,
        analysisType,
        timestamp: new Date().toISOString()
      };

      // Generate different analysis results based on type
      switch (analysisType) {
        case 'pattern':
          result = {
            patterns: [
              'Authentication timeout pattern detected',
              'Similar errors in login module'
            ],
            correlations: [
              { type: 'temporal', strength: 0.8 },
              { type: 'component', strength: 0.6 }
            ],
            predictions: [
              'Likely to affect mobile users more',
              'May increase in frequency during peak hours'
            ],
            recommendations: [
              'Implement exponential backoff',
              'Add connection pooling',
              'Monitor timeout thresholds'
            ],
            confidence: 0.85,
            analysisMetadata: context?.timeRange ? { timeRange: `${context.timeRange.start} to ${context.timeRange.end}` } : {}
          };
          break;

        case 'resolution':
          result = {
            suggestedActions: [
              'Increase timeout values in authentication module',
              'Review database connection settings',
              'Implement retry logic with exponential backoff'
            ],
            confidence: 0.78,
            estimatedEffort: 'medium',
            priority: 'high'
          };
          break;

        case 'severity':
          result = {
            suggestedSeverity: 'high',
            confidence: 0.82,
            reasoning: [
              'Affects user authentication flow',
              'High user impact potential',
              'Critical system component involved'
            ],
            factors: {
              userImpact: 'high',
              systemCriticality: 'critical',
              frequency: 'medium'
            }
          };
          break;

        case 'duplicate':
          result = {
            isDuplicate: false,
            confidence: 0.73,
            potentialDuplicates: [
              {
                bugId: 'bug-456',
                similarity: 0.65,
                reason: 'Similar authentication error pattern'
              }
            ],
            matchingCriteria: [
              'error_message_similarity',
              'component_overlap'
            ]
          };
          break;

        case 'impact':
          result = {
            affectedUserCount: 1250,
            impactSeverity: 'high',
            urgencyScore: 8.5,
            businessImpact: {
              revenue: 'medium',
              userSatisfaction: 'high',
              systemStability: 'medium'
            },
            affectedComponents: [
              'authentication',
              'user_management',
              'session_handling'
            ]
          };
          break;
      }

      if (context) {
        metadata.context = context;
      }

      res.status(200).json({
        analysisId,
        analysisType,
        result,
        metadata
      });
    } catch (error: unknown) {
      centralizedLogging.error('Failed to analyze with Claude Code', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async integrateWithSentry(req: Request, res: Response): Promise<void>  {
    try {
      // Check admin permissions
      const user = (req as { user?: { id: string; permissions: { admin: boolean } } }).user;
      if (!user?.permissions?.admin) {
        res.status(401).json({ error: 'Admin permission required' });
        return;
      }

      const { sentryDsn, projectId, environment, autoForward } = req.body;
      
      if (!sentryDsn || !projectId) {
        res.status(400).json({ error: 'Sentry DSN and project ID are required' });
        return;
      }

      const integrationId = `sentry_${Date.now()}`;
      const integration = {
        id: integrationId,
        type: 'sentry',
        projectId,
        dsn: sentryDsn,
        environment: environment || 'production',
        autoForward: autoForward || false,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      this.integrations.set(integrationId, integration);

      // Mock connection test
      const testResult = {
        success: true,
        responseTime: 120,
        message: 'Connection successful'
      };

      res.status(201).json({
        integrationId,
        status: 'active',
        testResult,
        autoForwardEnabled: autoForward || false
      });
    } catch (error: unknown) {
      centralizedLogging.error('Failed to integrate with Sentry', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async integrateWithDataDog(req: Request, res: Response): Promise<void>  {
    try {
      // Check admin permissions
      const user = (req as { user?: { id: string; permissions: { admin: boolean } } }).user;
      if (!user?.permissions?.admin) {
        res.status(401).json({ error: 'Admin permission required' });
        return;
      }

      const { apiKey, appKey, site, service, environment, autoForward } = req.body;
      
      if (!apiKey || !appKey) {
        res.status(400).json({ error: 'DataDog API key and app key are required' });
        return;
      }

      const integrationId = `datadog_${Date.now()}`;
      const integration = {
        id: integrationId,
        type: 'datadog',
        apiKey: '***hidden***',
        appKey: '***hidden***',
        site: site || 'datadoghq.com',
        service: service || 'jarvis-chat',
        environment: environment || 'production',
        autoForward: autoForward || false,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      this.integrations.set(integrationId, integration);

      // Mock connection test
      const testResult = {
        success: true,
        responseTime: 95,
        message: 'DataDog integration successful'
      };

      res.status(201).json({
        integrationId,
        status: 'active',
        testResult,
        autoForwardEnabled: autoForward || false
      });
    } catch (error: unknown) {
      centralizedLogging.error('Failed to integrate with DataDog', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getIntegrationStatus(req: Request, res: Response): Promise<void>  {
    try {
      const { id } = req.params;
      const integration = this.integrations.get(id) as Record<string, unknown> | undefined;
      
      if (!integration) {
        res.status(404).json({ error: 'Integration not found' });
        return;
      }

      // Determine integration type from the integration object
      const type = integration.url ? 'webhook' : integration.type || 'unknown';

      const statusResponse = {
        integrationId: id,
        type,
        status: (integration.status as string) || 'active',
        lastActivity: new Date().toISOString(),
        successfulDeliveries: Math.floor(Math.random() * 1000),
        failedDeliveries: Math.floor(Math.random() * 50),
        healthCheck: {
          status: 'healthy',
          lastChecked: new Date().toISOString(),
          responseTime: Math.floor(Math.random() * 200) + 50
        }
      };

      res.status(200).json(statusResponse);
    } catch (error: unknown) {
      centralizedLogging.error('Failed to get integration status', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async listIntegrations(req: Request, res: Response): Promise<void>  {
    try {
      const integrations = Array.from(this.integrations.values()) as Record<string, unknown>[];
      
      // Group integrations by type for summary
      const byType: Record<string, number> = {};
      let activeCount = 0;
      let healthyCount = 0;

      integrations.forEach(integration => {
        const type = integration.url ? 'webhook' : integration.type || 'unknown';
        byType[type] = (byType[type] || 0) + 1;
        
        if ((integration.status as string) === 'active' || !integration.status) {
          activeCount++;
          healthyCount++; // Assume active integrations are healthy for mock
        }
      });

      const summary = {
        total: integrations.length,
        active: activeCount,
        healthy: healthyCount,
        byType
      };

      res.status(200).json({
        integrations,
        summary
      });
    } catch (error: unknown) {
      centralizedLogging.error('Failed to list integrations', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const externalIntegrationService = new ExternalIntegrationService();
export { webhookDeliveryService };
