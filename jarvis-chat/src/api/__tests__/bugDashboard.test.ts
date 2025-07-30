/**
 * Bug Dashboard API Integration Tests
 * Comprehensive testing of REST API endpoints with authentication, rate limiting, and data validation
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
// import request from 'supertest'; // Commented out - supertest not available in CI
import express from 'express';
import { bugDashboardAPI } from '../bugDashboard';
import { apiSecurityService } from '../../lib/apiSecurity';
import { bugReportOperations } from '../../lib/supabase';
import { bugLifecycleService } from '../../lib/bugLifecycle';
import { bugAssignmentSystem } from '../../lib/assignmentSystem';

// Mock dependencies
vi.mock('../../lib/supabase');
vi.mock('../../lib/bugLifecycle');
vi.mock('../../lib/assignmentSystem');
vi.mock('../../lib/centralizedLogging');
vi.mock('../../lib/monitoring');

const app = express();
app.use(express.json());

// Set up routes
app.get('/api/bugs', bugDashboardAPI.getBugs.bind(bugDashboardAPI));
app.get('/api/bugs/:id', bugDashboardAPI.getBugById.bind(bugDashboardAPI));
app.put('/api/bugs/:id/status', bugDashboardAPI.updateBugStatus.bind(bugDashboardAPI));
app.post('/api/bugs/:id/assign', bugDashboardAPI.assignBug.bind(bugDashboardAPI));
app.post('/api/bugs/search', bugDashboardAPI.searchBugs.bind(bugDashboardAPI));
app.get('/api/bugs/analytics', bugDashboardAPI.getBugAnalytics.bind(bugDashboardAPI));

describe('Bug Dashboard API', () => {
  let validApiKey: string;
  let invalidApiKey: string;

  beforeAll(async () => {
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
    adminApiKey = adminKey.apiKey!.key;
    invalidApiKey = 'invalid_key_123';
  });

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('GET /api/bugs', () => {
    it('should return paginated bugs with valid API key', async () => {
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
          status: 'in_progress',
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
        .get('/api/bugs')
        .set('Authorization', `Bearer ${validApiKey}`)
        .query({
          page: 1,
          limit: 20,
          sortBy: 'created_at',
          sortOrder: 'desc'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('filters');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(20);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should return 401 for invalid API key', async () => {
      const response = await request(app)
        .get('/api/bugs')
        .set('Authorization', `Bearer ${invalidApiKey}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid API key');
    });

    it('should return 401 for missing API key', async () => {
      const response = await request(app)
        .get('/api/bugs');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid API key');
    });

    it('should apply status filters correctly', async () => {
      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: [],
        count: 0,
        error: null
      });

      const response = await request(app)
        .get('/api/bugs')
        .set('Authorization', `Bearer ${validApiKey}`)
        .query({
          status: ['open', 'in_progress']
        });

      expect(response.status).toBe(200);
      expect(bugReportOperations.searchBugReports).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['open', 'in_progress']
        })
      );
    });

    it('should apply date range filters correctly', async () => {
      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: [],
        count: 0,
        error: null
      });

      const response = await request(app)
        .get('/api/bugs')
        .set('Authorization', `Bearer ${validApiKey}`)
        .query({
          dateStart: '2025-01-01',
          dateEnd: '2025-01-31'
        });

      expect(response.status).toBe(200);
      expect(bugReportOperations.searchBugReports).toHaveBeenCalledWith(
        expect.objectContaining({
          created_at: {
            gte: '2025-01-01',
            lte: '2025-01-31'
          }
        })
      );
    });

    it('should enforce pagination limits', async () => {
      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: [],
        count: 0,
        error: null
      });

      const response = await request(app)
        .get('/api/bugs')
        .set('Authorization', `Bearer ${validApiKey}`)
        .query({
          limit: 200 // Above the maximum
        });

      expect(response.status).toBe(200);
      expect(bugReportOperations.searchBugReports).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 100 // Should be capped at maximum
        })
      );
    });
  });

  describe('GET /api/bugs/:id', () => {
    it('should return bug details with valid ID', async () => {
      const mockBug = {
        id: 'bug-123',
        title: 'Test Bug',
        description: 'Test description',
        status: 'open',
        severity: 'medium',
        created_at: '2025-01-01T00:00:00Z'
      };

      vi.mocked(bugReportOperations.getBugReportById).mockResolvedValue({
        data: mockBug,
        error: null
      });

      const response = await request(app)
        .get('/api/bugs/bug-123')
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.data.id).toBe('bug-123');
      expect(response.body.data.title).toBe('Test Bug');
    });

    it('should return 404 for non-existent bug', async () => {
      vi.mocked(bugReportOperations.getBugReportById).mockResolvedValue({
        data: null,
        error: null
      });

      const response = await request(app)
        .get('/api/bugs/non-existent')
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Bug not found');
    });
  });

  describe('PUT /api/bugs/:id/status', () => {
    it('should update bug status with write permissions', async () => {
      vi.mocked(bugLifecycleService.changeStatus).mockResolvedValue({
        success: true,
        statusChange: {
          id: 'change-123',
          bugReportId: 'bug-123',
          fromStatus: 'open',
          toStatus: 'in_progress',
          changedBy: 'test-user',
          timestamp: '2025-01-01T00:00:00Z'
        }
      });

      const response = await request(app)
        .put('/api/bugs/bug-123/status')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          status: 'in_progress',
          reason: 'Starting work on this bug',
          notes: 'Assigned to development team'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('statusChange');
      expect(bugLifecycleService.changeStatus).toHaveBeenCalledWith(
        'bug-123',
        'in_progress',
        'test-user',
        'Starting work on this bug',
        'Assigned to development team'
      );
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put('/api/bugs/bug-123/status')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          status: 'invalid_status'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid status');
    });

    it('should return 401 for insufficient permissions', async () => {
      // Create a read-only API key
      const readOnlyKey = await apiSecurityService.createAPIKey('read-only-user', 'Read Only Key', {
        read: true,
        write: false,
        export: false,
        admin: false,
        endpoints: ['*'],
        rateLimits: {
          requestsPerMinute: 100,
          requestsPerHour: 1000,
          requestsPerDay: 10000
        }
      });

      const response = await request(app)
        .put('/api/bugs/bug-123/status')
        .set('Authorization', `Bearer ${readOnlyKey.apiKey!.key}`)
        .send({
          status: 'in_progress'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Insufficient permissions');
    });
  });

  describe('POST /api/bugs/:id/assign', () => {
    it('should assign bug with write permissions', async () => {
      vi.mocked(bugAssignmentSystem.assignBug).mockResolvedValue({
        success: true,
        assignment: {
          id: 'assignment-123',
          bugReportId: 'bug-123',
          assigneeId: 'user-456',
          assignerId: 'test-user',
          assignedAt: '2025-01-01T00:00:00Z',
          assignmentType: 'manual'
        }
      });

      const response = await request(app)
        .post('/api/bugs/bug-123/assign')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          assigneeId: 'user-456',
          reason: 'Best suited for this type of issue'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('assignment');
      expect(bugAssignmentSystem.assignBug).toHaveBeenCalledWith(
        'bug-123',
        'user-456',
        'test-user',
        'manual',
        'Best suited for this type of issue'
      );
    });

    it('should return 400 for failed assignment', async () => {
      vi.mocked(bugAssignmentSystem.assignBug).mockResolvedValue({
        success: false,
        error: 'User not found'
      });

      const response = await request(app)
        .post('/api/bugs/bug-123/assign')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          assigneeId: 'non-existent-user'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('POST /api/bugs/search', () => {
    it('should perform text search with results', async () => {
      const mockSearchResults = [
        {
          id: 'bug-1',
          title: 'Authentication Error',
          description: 'Users cannot log in',
          status: 'open',
          severity: 'high'
        }
      ];

      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: mockSearchResults,
        count: 1,
        error: null
      });

      const response = await request(app)
        .post('/api/bugs/search')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          query: 'authentication',
          searchFields: ['title', 'description'],
          fuzzy: true,
          highlight: true
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('facets');
      expect(response.body).toHaveProperty('query');
      expect(response.body).toHaveProperty('totalResults');
      expect(response.body).toHaveProperty('searchTime');
      expect(response.body.results).toHaveLength(1);
    });

    it('should return empty results for no matches', async () => {
      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: [],
        count: 0,
        error: null
      });

      const response = await request(app)
        .post('/api/bugs/search')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          query: 'nonexistentterm'
        });

      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(0);
      expect(response.body.totalResults).toBe(0);
    });
  });

  describe('GET /api/bugs/analytics', () => {
    it('should return analytics data', async () => {
      // Mock lifecycle statistics
      vi.mocked(bugLifecycleService.getLifecycleStatistics).mockReturnValue({
        totalStatusChanges: 100,
        statusDistribution: {
          open: 20,
          triaged: 15,
          in_progress: 25,
          pending_verification: 10,
          resolved: 25,
          closed: 5,
          reopened: 0
        },
        averageResolutionTime: 48.5,
        recentActivity: []
      });

      // Mock workload metrics
      vi.mocked(bugAssignmentSystem.getWorkloadMetrics).mockReturnValue([
        {
          userId: 'user-1',
          userName: 'Test User',
          totalAssigned: 5,
          workloadPercentage: 75,
          averageResolutionTime: 36,
          completionRate: 85
        }
      ]);

      const response = await request(app)
        .get('/api/bugs/analytics')
        .set('Authorization', `Bearer ${validApiKey}`)
        .query({
          start: '2025-01-01',
          end: '2025-01-31',
          groupBy: 'status',
          interval: 'day'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('trends');
      expect(response.body).toHaveProperty('groupedData');
      expect(response.body).toHaveProperty('patterns');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.summary.totalBugs).toBe(100);
      expect(response.body.summary.averageResolutionTime).toBe(48.5);
    });

    it('should use default time range when not specified', async () => {
      vi.mocked(bugLifecycleService.getLifecycleStatistics).mockReturnValue({
        totalStatusChanges: 50,
        statusDistribution: {},
        averageResolutionTime: 24,
        recentActivity: []
      });

      vi.mocked(bugAssignmentSystem.getWorkloadMetrics).mockReturnValue([]);

      const response = await request(app)
        .get('/api/bugs/analytics')
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(200);
      expect(response.body.metadata).toHaveProperty('timeRange');
      expect(response.body.metadata.timeRange.start).toBeDefined();
      expect(response.body.metadata.timeRange.end).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Create a rate-limited API key
      const rateLimitedKey = await apiSecurityService.createAPIKey('rate-limited-user', 'Rate Limited Key', {
        read: true,
        write: false,
        export: false,
        admin: false,
        endpoints: ['*'],
        rateLimits: {
          requestsPerMinute: 2,
          requestsPerHour: 10,
          requestsPerDay: 100
        }
      });

      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: [],
        count: 0,
        error: null
      });

      // First request should succeed
      const response1 = await request(app)
        .get('/api/bugs')
        .set('Authorization', `Bearer ${rateLimitedKey.apiKey!.key}`);
      expect(response1.status).toBe(200);

      // Second request should succeed
      const response2 = await request(app)
        .get('/api/bugs')
        .set('Authorization', `Bearer ${rateLimitedKey.apiKey!.key}`);
      expect(response2.status).toBe(200);

      // Third request should be rate limited
      const response3 = await request(app)
        .get('/api/bugs')
        .set('Authorization', `Bearer ${rateLimitedKey.apiKey!.key}`);
      expect(response3.status).toBe(429);
      expect(response3.body).toHaveProperty('error', 'Rate limit exceeded');
      expect(response3.body).toHaveProperty('retryAfter');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(bugReportOperations.searchBugReports).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/bugs')
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(500);
    });

    it('should handle service errors gracefully', async () => {
      vi.mocked(bugLifecycleService.changeStatus).mockRejectedValue(
        new Error('Service unavailable')
      );

      const response = await request(app)
        .put('/api/bugs/bug-123/status')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          status: 'in_progress'
        });

      expect(response.status).toBe(500);
    });
  });

  describe('Input Validation', () => {
    it('should validate required fields for status updates', async () => {
      const response = await request(app)
        .put('/api/bugs/bug-123/status')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({}); // Missing status

      expect(response.status).toBe(400);
    });

    it('should validate required fields for assignments', async () => {
      const response = await request(app)
        .post('/api/bugs/bug-123/assign')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({}); // Missing assigneeId

      expect(response.status).toBe(400);
    });

    it('should validate pagination parameters', async () => {
      vi.mocked(bugReportOperations.searchBugReports).mockResolvedValue({
        data: [],
        count: 0,
        error: null
      });

      const response = await request(app)
        .get('/api/bugs')
        .set('Authorization', `Bearer ${validApiKey}`)
        .query({
          page: 0, // Invalid page number
          limit: -1 // Invalid limit
        });

      expect(response.status).toBe(200);
      // Should use defaults
      expect(bugReportOperations.searchBugReports).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 20, // Default limit
          offset: 0 // Page 1 offset
        })
      );
    });
  });

  afterAll(async () => {
    // Cleanup test API keys
    // In a real implementation, you'd clean up the test data
  });
});