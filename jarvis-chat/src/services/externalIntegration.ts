/**
 * External Integration Service
 * Handles external integrations like webhooks, Claude Code analysis, Sentry/DataDog
 */

import { Request, Response } from 'express';
import { centralizedLogging } from '@/lib/centralizedLogging';

interface WebhookConfig {
  name: string;
  url: string;
  events: string[];
  authentication?: {
    type: 'none' | 'bearer' | 'basic' | 'api_key';
    credentials?: Record<string, unknown>;
  };
  filters?: {
    status?: string[];
    severity?: string[];
  };
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffDelay: number;
  };
}

class ExternalIntegrationService {
  private integrations: Map<string, unknown> = new Map();

  async createWebhook(req: Request, res: Response): Promise<void>  {
    try {
      const config: WebhookConfig = req.body;
      
      // Validate configuration
      if (!config.name || !config.url || !config.events || !Array.isArray(config.events)) {
        res.status(400).json({ error: 'Invalid webhook configuration' });
        return;
      }

      // Validate URL
      try {
        new URL(config.url);
      } catch () {
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
    } catch () {
      centralizedLogging.error('Failed to create webhook', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async analyzeWithClaudeCode(req: Request, res: Response): Promise<void>  {
    try {
      const { bugId } = req.params;
      
      if (!bugId) {
        res.status(400).json({ error: 'Bug ID is required' });
        return;
      }

      // Mock Claude Code analysis
      const analysis = {
        bugId,
        analysisId: `analysis_${Date.now()}`,
        status: 'completed',
        insights: [
          'Potential null pointer exception in line 42',
          'Consider adding input validation',
          'Memory leak detected in cleanup function'
        ],
        confidence: 0.85,
        analyzedAt: new Date().toISOString()
      };

      res.status(200).json({ analysis });
    } catch () {
      centralizedLogging.error('Failed to analyze with Claude Code', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async integrateWithSentry(req: Request, res: Response): Promise<void>  {
    try {
      const { projectId, dsn, environment } = req.body;
      
      if (!projectId || !dsn) {
        res.status(400).json({ error: 'Project ID and DSN are required' });
        return;
      }

      const integrationId = `sentry_${Date.now()}`;
      const integration = {
        id: integrationId,
        type: 'sentry',
        projectId,
        dsn,
        environment: environment || 'production',
        status: 'active',
        createdAt: new Date().toISOString()
      };

      this.integrations.set(integrationId, integration);

      res.status(201).json({ integration });
    } catch () {
      centralizedLogging.error('Failed to integrate with Sentry', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async integrateWithDataDog(req: Request, res: Response): Promise<void>  {
    try {
      const { apiKey, appKey, site } = req.body;
      
      if (!apiKey || !appKey) {
        res.status(400).json({ error: 'API key and app key are required' });
        return;
      }

      const integrationId = `datadog_${Date.now()}`;
      const integration = {
        id: integrationId,
        type: 'datadog',
        apiKey: '***hidden***',
        appKey: '***hidden***',
        site: site || 'datadoghq.com',
        status: 'active',
        createdAt: new Date().toISOString()
      };

      this.integrations.set(integrationId, integration);

      res.status(201).json({ integration });
    } catch () {
      centralizedLogging.error('Failed to integrate with DataDog', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getIntegrationStatus(req: Request, res: Response): Promise<void>  {
    try {
      const { id } = req.params;
      const integration = this.integrations.get(id);
      
      if (!integration) {
        res.status(404).json({ error: 'Integration not found' });
        return;
      }

      res.status(200).json({
        integration,
        status: integration.status,
        lastActivity: new Date().toISOString()
      });
    } catch () {
      centralizedLogging.error('Failed to get integration status', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async listIntegrations(req: Request, res: Response): Promise<void>  {
    try {
      const integrations = Array.from(this.integrations.values());
      
      res.status(200).json({
        integrations,
        total: integrations.length
      });
    } catch () {
      centralizedLogging.error('Failed to list integrations', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const externalIntegrationService = new ExternalIntegrationService();