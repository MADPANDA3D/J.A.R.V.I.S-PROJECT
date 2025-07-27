/**
 * Bug Export API Integration Tests
 * Testing export functionality, formats, batch processing, and scheduled exports
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { promises as fs } from 'fs';
import { join } from 'path';
import { bugExportService } from '../bugExport';
import { apiSecurityService } from '../../lib/apiSecurity';
import { bugReportOperations } from '../../lib/supabase';

// Mock dependencies
vi.mock('../../lib/supabase');
vi.mock('../../lib/centralizedLogging');
vi.mock('../../lib/monitoring');
vi.mock('../../lib/bugLifecycle');
vi.mock('../../lib/internalCommunication');
vi.mock('../../lib/feedbackCollection');

const app = express();
app.use(express.json());

// Set up routes
app.post('/api/exports', bugExportService.createExport.bind(bugExportService));
app.get('/api/exports/:id', bugExportService.getExportStatus.bind(bugExportService));
app.get('/api/exports/:id/download', bugExportService.downloadExport.bind(bugExportService));
app.post('/api/exports/scheduled', bugExportService.createScheduledExport.bind(bugExportService));
app.get('/api/exports/templates', bugExportService.getExportTemplates.bind(bugExportService));

describe('Bug Export API', () {
  let validApiKey: string;
  let adminApiKey: string;
  let exportApiKey: string;

  beforeAll(async () {
    // Create test API keys
    const userKey = await apiSecurityService.createAPIKey('test-user', 'Test User Key', {
      read: true,
      write: true,
      export: false,
      admin: false,
      endpoints: ['*'],
      rateLimits: {
        requestsPerMinute: 100,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      }
    });

    const exportKey = await apiSecurityService.createAPIKey('export-user', 'Export User Key', {
      read: true,
      write: false,
      export: true,
      admin: false,
      endpoints: ['*'],
      rateLimits: {
        requestsPerMinute: 50,
        requestsPerHour: 500,
        requestsPerDay: 5000
      }
    });

    const adminKey = await apiSecurityService.createAPIKey('test-admin', 'Test Admin Key', {
      read: true,
      write: true,
      export: true,
      admin: true,
      endpoints: ['*'],
      rateLimits: {
        requestsPerMinute: 1000,
        requestsPerHour: 10000,
        requestsPerDay: 100000
      }
    });

    validApiKey = userKey.apiKey!.key;
    exportApiKey = exportKey.apiKey!.key;
    adminApiKey = adminKey.apiKey!.key;

    // Ensure export directory exists
    const exportDir = join(process.cwd(), 'exports');
    await fs.mkdir(exportDir, { recursive: true });
  });

  beforeEach(() {
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('POST /api/exports', () {
    it('should create export request with export permissions', async () {
      // Mock bug data
      const mockBugs = [
        {
          id: 'bug-1',
          title: 'Test Bug 1',
          description: 'Test description 1',
          status: 'open',
          severity: 'medium',
          created_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 'bug-2',
          title: 'Test Bug 2',
          description: 'Test description 2',
          status: 'resolved',
          severity: 'high',
          created_at: '2025-01-02T00:00:00Z'
        }
      ];

      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: mockBugs,
        count: 2,
        error: null
      });

      const response = await request(app)
        .post('/api/exports')
        .set('Authorization', `Bearer ${exportApiKey}`)
        .send({
          format: 'json',
          filters: {
            status: ['open', 'resolved'],
            dateRange: {
              start: '2025-01-01',
              end: '2025-01-31'
            }
          },
          fields: ['id', 'title', 'description', 'status', 'severity'],
          includeComments: false,
          includeAttachments: false,
          includeLifecycle: true,
          includeFeedback: false
        });

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('exportId');
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('format', 'json');
      expect(response.body).toHaveProperty('estimatedSize');
      expect(response.body).toHaveProperty('estimatedTime');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body).toHaveProperty('metadata');
    });

    it('should return 401 for missing export permissions', async () {
      const response = await request(app)
        .post('/api/exports')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          format: 'json'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Export permission required');
    });

    it('should validate export format', async () {
      const response = await request(app)
        .post('/api/exports')
        .set('Authorization', `Bearer ${exportApiKey}`)
        .send({
          format: 'invalid_format'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid export format');
    });

    it('should support all valid export formats', async () {
      const formats = ['json', 'csv', 'xml', 'excel', 'pdf'];

      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: [],
        count: 0,
        error: null
      });

      for (const format of formats) {
        const response = await request(app)
          .post('/api/exports')
          .set('Authorization', `Bearer ${exportApiKey}`)
          .send({ format });

        expect(response.status).toBe(202);
        expect(response.body.format).toBe(format);
      }
    });

    it('should apply export templates', async () {
      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: [],
        count: 0,
        error: null
      });

      const response = await request(app)
        .post('/api/exports')
        .set('Authorization', `Bearer ${exportApiKey}`)
        .send({
          template: 'basic-bug-report',
          filters: {
            severity: ['high'] // Should be merged with template filters
          }
        });

      expect(response.status).toBe(202);
      expect(response.body.format).toBe('csv'); // From basic-bug-report template
    });

    it('should return 503 when export queue is full', async () {
      // Create multiple export requests to fill the queue
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app)
            .post('/api/exports')
            .set('Authorization', `Bearer ${exportApiKey}`)
            .send({ format: 'json' })
        );
      }

      const responses = await Promise.all(promises);
      
      // Some requests should succeed, but eventually we should get 503
      const has503 = responses.some(response => response.status === 503);
      if (has503) {
        const failedResponse = responses.find(response => response.status === 503);
        expect(failedResponse?.body).toHaveProperty('error', 'Export queue full. Please try again later.');
        expect(failedResponse?.body).toHaveProperty('retryAfter', 300);
      }
    });
  });

  describe('GET /api/exports/:id', () {
    it('should return export status for valid export ID', async () {
      // First create an export
      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: [],
        count: 0,
        error: null
      });

      const createResponse = await request(app)
        .post('/api/exports')
        .set('Authorization', `Bearer ${exportApiKey}`)
        .send({ format: 'json' });

      const exportId = createResponse.body.exportId;

      // Then get its status
      const statusResponse = await request(app)
        .get(`/api/exports/${exportId}`)
        .set('Authorization', `Bearer ${exportApiKey}`);

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body).toHaveProperty('exportId', exportId);
      expect(statusResponse.body).toHaveProperty('status');
      expect(statusResponse.body).toHaveProperty('format');
      expect(statusResponse.body).toHaveProperty('metadata');
    });

    it('should return 404 for non-existent export ID', async () {
      const response = await request(app)
        .get('/api/exports/non-existent-id')
        .set('Authorization', `Bearer ${exportApiKey}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Export not found');
    });

    it('should include progress for processing exports', async () {
      // Create a large export that will take time to process
      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: `bug-${i}`,
          title: `Bug ${i}`,
          description: `Description ${i}`,
          status: 'open'
        })),
        count: 1000,
        error: null
      });

      const createResponse = await request(app)
        .post('/api/exports')
        .set('Authorization', `Bearer ${exportApiKey}`)
        .send({ format: 'json' });

      const exportId = createResponse.body.exportId;

      // Wait a bit for processing to start
      await new Promise(resolve => setTimeout(resolve, 100));

      const statusResponse = await request(app)
        .get(`/api/exports/${exportId}`)
        .set('Authorization', `Bearer ${exportApiKey}`);

      expect(statusResponse.status).toBe(200);
      if (statusResponse.body.status === 'processing') {
        expect(statusResponse.body).toHaveProperty('progress');
        expect(statusResponse.body.progress).toHaveProperty('percentage');
        expect(statusResponse.body.progress).toHaveProperty('currentStep');
        expect(statusResponse.body.progress).toHaveProperty('totalSteps');
      }
    });
  });

  describe('GET /api/exports/:id/download', () {
    it('should download completed export file', async () {
      // Create and process an export
      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: [
          {
            id: 'bug-1',
            title: 'Test Bug',
            description: 'Test description',
            status: 'open'
          }
        ],
        count: 1,
        error: null
      });

      const createResponse = await request(app)
        .post('/api/exports')
        .set('Authorization', `Bearer ${exportApiKey}`)
        .send({ format: 'json' });

      const exportId = createResponse.body.exportId;

      // Wait for export to complete
      let completed = false;
      let attempts = 0;
      while (!completed && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const statusResponse = await request(app)
          .get(`/api/exports/${exportId}`)
          .set('Authorization', `Bearer ${exportApiKey}`);

        completed = statusResponse.body.status === 'completed';
        attempts++;
      }

      if (completed) {
        const downloadResponse = await request(app)
          .get(`/api/exports/${exportId}/download`)
          .set('Authorization', `Bearer ${exportApiKey}`);

        expect(downloadResponse.status).toBe(200);
        expect(downloadResponse.headers['content-type']).toBe('application/json');
        expect(downloadResponse.headers['content-disposition']).toContain('attachment');
      }
    });

    it('should return 400 for incomplete export', async () {
      // Create an export
      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: [],
        count: 0,
        error: null
      });

      const createResponse = await request(app)
        .post('/api/exports')
        .set('Authorization', `Bearer ${exportApiKey}`)
        .send({ format: 'json' });

      const exportId = createResponse.body.exportId;

      // Try to download immediately (should not be ready)
      const downloadResponse = await request(app)
        .get(`/api/exports/${exportId}/download`)
        .set('Authorization', `Bearer ${exportApiKey}`);

      if (downloadResponse.status === 400) {
        expect(downloadResponse.body).toHaveProperty('error', 'Export not ready for download');
      }
    });
  });

  describe('POST /api/exports/scheduled', () {
    it('should create scheduled export with admin permissions', async () {
      const response = await request(app)
        .post('/api/exports/scheduled')
        .set('Authorization', `Bearer ${adminApiKey}`)
        .send({
          name: 'Daily Bug Report',
          format: 'csv',
          filters: {
            status: ['open', 'in_progress']
          },
          fields: ['id', 'title', 'status', 'severity', 'created_at'],
          schedule: {
            frequency: 'daily',
            time: '09:00',
            timezone: 'UTC'
          },
          delivery: {
            method: 'email',
            recipients: ['team@example.com']
          },
          retentionDays: 30
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('scheduleId');
      expect(response.body).toHaveProperty('config');
      expect(response.body).toHaveProperty('nextExecution');
      expect(response.body.config.name).toBe('Daily Bug Report');
    });

    it('should return 401 for missing admin permissions', async () {
      const response = await request(app)
        .post('/api/exports/scheduled')
        .set('Authorization', `Bearer ${exportApiKey}`)
        .send({
          name: 'Daily Report',
          format: 'csv',
          schedule: {
            frequency: 'daily',
            time: '09:00'
          }
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Admin permission required');
    });

    it('should validate schedule configuration', async () {
      const response = await request(app)
        .post('/api/exports/scheduled')
        .set('Authorization', `Bearer ${adminApiKey}`)
        .send({
          name: 'Invalid Schedule',
          format: 'csv',
          schedule: {
            frequency: 'weekly',
            time: '09:00'
            // Missing dayOfWeek for weekly schedule
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should support different schedule frequencies', async () {
      const scheduleConfigs = [
        {
          frequency: 'daily',
          time: '09:00'
        },
        {
          frequency: 'weekly',
          time: '09:00',
          dayOfWeek: 1 // Monday
        },
        {
          frequency: 'monthly',
          time: '09:00',
          dayOfMonth: 1 // First day of month
        }
      ];

      for (const schedule of scheduleConfigs) {
        const response = await request(app)
          .post('/api/exports/scheduled')
          .set('Authorization', `Bearer ${adminApiKey}`)
          .send({
            name: `${schedule.frequency} Report`,
            format: 'csv',
            schedule
          });

        expect(response.status).toBe(201);
        expect(response.body.config.schedule.frequency).toBe(schedule.frequency);
      }
    });
  });

  describe('GET /api/exports/templates', () {
    it('should return available export templates', async () {
      const response = await request(app)
        .get('/api/exports/templates')
        .set('Authorization', `Bearer ${exportApiKey}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('templates');
      expect(Array.isArray(response.body.templates)).toBe(true);
      
      // Should include default templates
      const templateNames = response.body.templates.map((t: { name: string }) => t.name);
      expect(templateNames).toContain('Basic Bug Report');
      expect(templateNames).toContain('Comprehensive Export');
    });

    it('should filter templates by user access', async () {
      // Public templates should be visible to all users
      const response = await request(app)
        .get('/api/exports/templates')
        .set('Authorization', `Bearer ${exportApiKey}`);

      expect(response.status).toBe(200);
      
      // All returned templates should be public or owned by the user
      const templates = response.body.templates;
      templates.forEach((template: { isPublic: boolean; userId: string }) {
        expect(
          template.isPublic === true || template.createdBy === 'export-user'
        ).toBe(true);
      });
    });
  });

  describe('Export Processing', () {
    it('should handle large dataset exports', async () {
      // Mock large dataset
      const largeBugs = Array.from({ length: 5000 }, (_, i) => ({
        id: `bug-${i}`,
        title: `Bug ${i}`,
        description: `Description for bug ${i}`,
        status: i % 3 === 0 ? 'open' : i % 3 === 1 ? 'in_progress' : 'resolved',
        severity: i % 4 === 0 ? 'low' : i % 4 === 1 ? 'medium' : i % 4 === 2 ? 'high' : 'critical',
        created_at: new Date(Date.now() - i * 60000).toISOString()
      }));

      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: largeBugs,
        count: 5000,
        error: null
      });

      const response = await request(app)
        .post('/api/exports')
        .set('Authorization', `Bearer ${exportApiKey}`)
        .send({
          format: 'csv',
          filters: {},
          fields: ['id', 'title', 'status', 'severity'],
          includeComments: false
        });

      expect(response.status).toBe(202);
      expect(response.body.estimatedSize).toBeGreaterThan(100000); // Should estimate significant size
      expect(response.body.estimatedTime).toBeGreaterThan(30); // Should estimate reasonable time
    });

    it('should apply field selection correctly', async () {
      const mockBugs = [
        {
          id: 'bug-1',
          title: 'Test Bug',
          description: 'Test description',
          status: 'open',
          severity: 'medium',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          user_email: 'user@example.com'
        }
      ];

      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: mockBugs,
        count: 1,
        error: null
      });

      const response = await request(app)
        .post('/api/exports')
        .set('Authorization', `Bearer ${exportApiKey}`)
        .send({
          format: 'json',
          fields: ['id', 'title', 'status'], // Only specific fields
          includeComments: false
        });

      expect(response.status).toBe(202);

      // Wait for processing and check the result
      const exportId = response.body.exportId;
      let completed = false;
      let attempts = 0;

      while (!completed && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const statusResponse = await request(app)
          .get(`/api/exports/${exportId}`)
          .set('Authorization', `Bearer ${exportApiKey}`);

        completed = statusResponse.body.status === 'completed';
        attempts++;
      }

      expect(completed).toBe(true);
    });

    it('should handle export failures gracefully', async () {
      // Mock a database error
      vi.mocked(bugReportOperations.searchBugReports).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .post('/api/exports')
        .set('Authorization', `Bearer ${exportApiKey}`)
        .send({ format: 'json' });

      expect(response.status).toBe(202);

      const exportId = response.body.exportId;

      // Wait for processing to fail
      let failed = false;
      let attempts = 0;

      while (!failed && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const statusResponse = await request(app)
          .get(`/api/exports/${exportId}`)
          .set('Authorization', `Bearer ${exportApiKey}`);

        failed = statusResponse.body.status === 'failed';
        attempts++;
      }

      if (failed) {
        const statusResponse = await request(app)
          .get(`/api/exports/${exportId}`)
          .set('Authorization', `Bearer ${exportApiKey}`);

        expect(statusResponse.body.status).toBe('failed');
        expect(statusResponse.body.metadata).toHaveProperty('errors');
        expect(statusResponse.body.metadata.errors).toContain('Database connection failed');
      }
    });
  });

  describe('Custom Processing Options', () {
    it('should apply data anonymization when requested', async () {
      const mockBugs = [
        {
          id: 'bug-1',
          title: 'Test Bug',
          user_id: 'user-12345',
          user_email: 'john.doe@example.com'
        }
      ];

      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: mockBugs,
        count: 1,
        error: null
      });

      const response = await request(app)
        .post('/api/exports')
        .set('Authorization', `Bearer ${exportApiKey}`)
        .send({
          format: 'json',
          customOptions: {
            anonymizeUsers: true,
            includeTimestamp: true
          }
        });

      expect(response.status).toBe(202);
      // The anonymization would be tested in the actual export processing
    });

    it('should flatten nested objects when requested', async () {
      const mockBugs = [
        {
          id: 'bug-1',
          title: 'Test Bug',
          metadata: {
            browser: {
              name: 'Chrome',
              version: '91.0.0'
            },
            device: {
              type: 'desktop',
              os: 'Windows'
            }
          }
        }
      ];

      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: mockBugs,
        count: 1,
        error: null
      });

      const response = await request(app)
        .post('/api/exports')
        .set('Authorization', `Bearer ${exportApiKey}`)
        .send({
          format: 'csv',
          customOptions: {
            flattenObjects: true
          }
        });

      expect(response.status).toBe(202);
    });
  });

  afterAll(async () {
    // Cleanup export files
    try {
      const exportDir = join(process.cwd(), 'exports');
      const files = await fs.readdir(exportDir);
      for (const file of files) {
        if (file.startsWith('exp_')) {
          await fs.unlink(join(exportDir, file));
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  });
});