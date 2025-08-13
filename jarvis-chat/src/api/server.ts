/**
 * Express server setup for API routes
 */

import express from 'express';
import { bugExportService } from './bugExport';
import { bugDashboardAPI } from './bugDashboard';
import { externalIntegrationService } from '../services/externalIntegration';
import { apiSecurityService } from '../lib/apiSecurity';

export const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
const authenticateAPI = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const validation = await apiSecurityService.validateAPIKey(authHeader);
    
    if (!validation.valid) {
      return res.status(401).json({ error: validation.error || 'Invalid API key' });
    }

    // Add user info to request
    (req as { user?: { id: string; permissions: { read: boolean; write: boolean; export: boolean; admin: boolean } } }).user = {
      id: validation.userId,
      permissions: validation.permissions
    };

    next();
  } catch {
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Apply authentication middleware to API routes
app.use('/api', authenticateAPI);

// Bug export routes - order matters: specific routes before parametric ones
app.get('/api/exports/templates', bugExportService.getExportTemplates.bind(bugExportService));
app.post('/api/exports/scheduled', bugExportService.createScheduledExport.bind(bugExportService));
app.post('/api/exports', bugExportService.createExport.bind(bugExportService));
app.get('/api/exports/:id', bugExportService.getExportStatus.bind(bugExportService));
app.get('/api/exports/:id/download', bugExportService.downloadExport.bind(bugExportService));

// Bug dashboard routes
app.get('/api/bugs', bugDashboardAPI.getBugs.bind(bugDashboardAPI));
app.get('/api/bugs/:id', bugDashboardAPI.getBugById.bind(bugDashboardAPI));
app.put('/api/bugs/:id/status', bugDashboardAPI.updateBugStatus.bind(bugDashboardAPI));
app.post('/api/bugs/:id/assign', bugDashboardAPI.assignBug.bind(bugDashboardAPI));
app.post('/api/bugs/search', bugDashboardAPI.searchBugs.bind(bugDashboardAPI));
app.get('/api/bugs/analytics', bugDashboardAPI.getBugAnalytics.bind(bugDashboardAPI));

// External integration routes (authentication middleware already applied above)
app.post('/api/integrations/webhooks', externalIntegrationService.createWebhook.bind(externalIntegrationService));
app.post('/api/integrations/claude-code/analyze/:bugId', externalIntegrationService.analyzeWithClaudeCode.bind(externalIntegrationService));
app.post('/api/integrations/sentry', externalIntegrationService.integrateWithSentry.bind(externalIntegrationService));
app.post('/api/integrations/datadog', externalIntegrationService.integrateWithDataDog.bind(externalIntegrationService));
app.get('/api/integrations/:id/status', externalIntegrationService.getIntegrationStatus.bind(externalIntegrationService));
app.get('/api/integrations', externalIntegrationService.listIntegrations.bind(externalIntegrationService));

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

export default app;